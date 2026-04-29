// ShoreList — Stripe Webhook Handler
// Fires on successful payment → sends operator email notification

const crypto = require('crypto');

async function sendOperatorEmail(meta, amount) {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) {
    console.log('No RESEND_API_KEY set — skipping email');
    return;
  }

  const amountFormatted = `$${((amount || 2500) / 100).toFixed(2)}`;

  const tdLabel = 'padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(245,232,203,0.45);white-space:nowrap;';
  const tdVal   = 'padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);font-weight:600;color:#FEFCF7;';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f2f4f3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:#0A4D5C;border-radius:16px;overflow:hidden;">
  <div style="background:#E96645;padding:8px 28px;">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:white;">ShoreList · New Booking Confirmed</p>
  </div>
  <div style="padding:36px 28px 28px;">
    <h1 style="margin:0 0 6px;font-size:32px;font-weight:900;color:#E96645;">New Booking! 🎉</h1>
    <p style="margin:0 0 28px;font-size:15px;color:rgba(245,232,203,0.65);line-height:1.6;">A guest has paid their deposit. Here are the details:</p>
    <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.04);border-radius:10px;overflow:hidden;">
      <tr><td style="${tdLabel}">Experience</td><td style="${tdVal}">${meta.categoryLabel || ''}</td></tr>
      <tr><td style="${tdLabel}">Operator</td><td style="${tdVal}">${meta.operatorName || ''}</td></tr>
      <tr><td style="${tdLabel}">Guest Name</td><td style="${tdVal}">${meta.guestName || ''}</td></tr>
      <tr><td style="${tdLabel}">Guest Email</td><td style="${tdVal}">${meta.guestEmail || ''}</td></tr>
      <tr><td style="${tdLabel}">Phone</td><td style="${tdVal}">${meta.guestPhone || 'Not provided'}</td></tr>
      <tr><td style="${tdLabel}">Date</td><td style="${tdVal}">${meta.date || ''}</td></tr>
      <tr><td style="${tdLabel}">Time</td><td style="${tdVal}">${meta.timeSlot || ''}</td></tr>
      <tr><td style="${tdLabel}">Party Size</td><td style="${tdVal}">${meta.partySize || '1'} guest(s)</td></tr>
      ${meta.notes ? `<tr><td style="${tdLabel}">Notes</td><td style="${tdVal}">${meta.notes}</td></tr>` : ''}
    </table>
    <div style="margin-top:20px;padding:16px 20px;background:rgba(233,102,69,0.12);border:1px solid rgba(233,102,69,0.3);border-radius:10px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <p style="margin:0;font-size:13px;font-weight:700;color:#E96645;">Deposit Collected</p>
        <p style="margin:3px 0 0;font-size:12px;color:rgba(245,232,203,0.5);">Refundable · Balance due at experience</p>
      </div>
      <p style="margin:0;font-size:22px;font-weight:900;color:#E96645;">${amountFormatted}</p>
    </div>
    <p style="margin-top:24px;font-size:13px;color:rgba(245,232,203,0.4);line-height:1.7;">
      View all bookings at <a href="https://shorelist.net/dashboard" style="color:#E96645;">shorelist.net/dashboard</a>
    </p>
  </div>
  <div style="background:rgba(0,0,0,0.2);padding:16px 28px;text-align:center;">
    <p style="margin:0;font-size:11px;color:rgba(245,232,203,0.25);">ShoreList LLC · Wilmington, NC · shorelist.net</p>
  </div>
</div>
</body>
</html>`;

  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'ShoreList Bookings <onboarding@resend.dev>',
        to:      ['shorelistwilmington@gmail.com'],
        subject: `🎉 New Booking: ${meta.categoryLabel || 'Experience'} — ${meta.guestName || 'Guest'}`,
        html,
      }),
    });
    const emailData = await emailRes.json();
    if (!emailRes.ok) console.error('Resend error:', emailData);
    else console.log('Notification email sent:', emailData.id);
  } catch (e) {
    console.error('Email send failed:', e);
  }
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
  try {
    const parts = {};
    signatureHeader.split(',').forEach(p => {
      const [k, v] = p.split('=');
      parts[k] = v;
    });
    const timestamp = parts['t'];
    const receivedSig = parts['v1'];
    if (!timestamp || !receivedSig) return false;
    const payload  = `${timestamp}.${rawBody}`;
    const expected = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
    const a = Buffer.from(expected,    'hex');
    const b = Buffer.from(receivedSig, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const STRIPE_KEY     = process.env.STRIPE_SECRET_KEY;
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!STRIPE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe not configured' }) };
  }

  const sig = event.headers['stripe-signature'];
  if (WEBHOOK_SECRET && sig) {
    const valid = verifyStripeSignature(event.body, sig, WEBHOOK_SECRET);
    if (!valid) {
      console.error('Invalid Stripe signature');
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid signature' }) };
    }
  }

  let webhookEvent;
  try {
    webhookEvent = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  console.log('Webhook event:', webhookEvent.type);

  if (webhookEvent.type === 'checkout.session.completed') {
    const session = webhookEvent.data?.object;
    if (!session) return { statusCode: 200, body: JSON.stringify({ received: true }) };
    const meta   = session.metadata || {};
    const amount = session.amount_total;
    console.log('Booking completed:', meta.guestName, meta.date, meta.timeSlot);
    await sendOperatorEmail(meta, amount);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
