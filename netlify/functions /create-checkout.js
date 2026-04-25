// netlify/functions/create-checkout.js
// Creates a Stripe Checkout Session for a booking request.
// Required env vars in Netlify dashboard:
//   STRIPE_SECRET_KEY  — your Stripe secret key (starts with sk_live_ or sk_test_)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const {
    category,
    categoryLabel,
    guestName,
    guestEmail,
    guestPhone,
    date,
    partySize,
    notes,
    priceInCents,    // e.g. 2500 = $25.00 deposit
    operatorName,    // e.g. "Cape Fear Ghost Tours"
  } = body;

  // Validate required fields
  if (!category || !guestName || !guestEmail || !date || !partySize) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required booking fields.' })
    };
  }

  const displayPrice = (priceInCents / 100).toFixed(2);
  const siteDomain = process.env.URL || 'https://shorelist.net';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: guestEmail,

      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: operatorName
              ? `${categoryLabel} — ${operatorName}`
              : `${categoryLabel} — Booking Request`,
            description: `Date: ${date}  |  Party of ${partySize}  |  Booked via Shorelist.net`,
            metadata: { category, operatorName: operatorName || 'TBD' }
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      }],

      metadata: {
        category,
        categoryLabel,
        guestName,
        guestPhone: guestPhone || '',
        date,
        partySize: String(partySize),
        notes: notes || '',
        operatorName: operatorName || '',
      },

      success_url: `${siteDomain}/success?session_id={CHECKOUT_SESSION_ID}&category=${encodeURIComponent(categoryLabel)}&name=${encodeURIComponent(guestName)}&date=${encodeURIComponent(date)}&party=${partySize}`,
      cancel_url:  `${siteDomain}/?canceled=1`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url, sessionId: session.id }),
    };

  } catch (err) {
    console.error('Stripe error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Payment session could not be created. Please try again.' })
    };
  }
};
