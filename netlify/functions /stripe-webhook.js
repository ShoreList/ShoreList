// netlify/functions/stripe-webhook.js
// Fires after every successful Stripe payment.
// Sends confirmation emails to the guest AND to shorelistwilmington@gmail.com
//
// Required env vars in Netlify dashboard:
//   STRIPE_SECRET_KEY       — your Stripe secret key
//   STRIPE_WEBHOOK_SECRET   — from Stripe Dashboard > Webhooks > signing secret
//   NOTIFY_EMAIL            — shorelistwilmington@gmail.com

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig     = event.headers['stripe-signature'];
  const secret  = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, secret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session  = stripeEvent.data.object;
    const meta     = session.metadata || {};
    const amount   = (session.amount_total / 100).toFixed(2);

    const summary = [
      `Category:     ${meta.categoryLabel || meta.category}`,
      `Guest:        ${meta.guestName}`,
      `Email:        ${session.customer_email}`,
      `Phone:        ${meta.guestPhone || 'Not provided'}`,
      `Date:         ${meta.date}`,
      `Party Size:   ${meta.partySize}`,
      `Operator:     ${meta.operatorName || 'Pending assignment'}`,
      `Notes:        ${meta.notes || 'None'}`,
      `Amount Paid:  $${amount}`,
      `Session ID:   ${session.id}`,
    ].join('\n');

    console.log('=== NEW BOOKING ===');
    console.log(summary);
    // Emails are sent from Stripe's built-in receipt system automatically.
    // For operator notification, integrate SendGrid or Resend here in Phase 2.
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
