// ShoreList — Stripe Webhook Handler
// Fires on successful payment → sends operator email notification

const crypto = require('crypto');
const { escapeHtml, header } = require('./_shared.js');

async function sendOperatorEmail(meta, amount) {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) {
    console.log('No RESEND_API_KEY set — skipping email');
    return;
  }

  const amountFormatted = Number.isFinite(amount) ? `$${(amount / 100).toFixed(2)}` : 'See Stripe';
  // Every value below came from a form: escape it before it goes into the HTML.
  const e = (v) => escapeHtml(String(v == null ? '' : v).slice(0, 500));
  const oneLine = (v) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 120);

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
    <p style="margin:0 0 28px;font-size:15px;color:rgba(245,232,203,0.65);line-height:1.6;">A guest has booked and paid. Here are the details:</p>
    <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.04);border-radius:10px;overflow:hidden;">
      <tr><td style="${tdLabel}">Experience</td><td style="${tdVal}">${e(meta.categoryLabel)}</td></tr>
      <tr><td style="${tdLabel}">Operator</td><td style="${tdVal}">${e(meta.operatorName)}</td></tr>
      <tr><td style="${tdLabel}">Guest Name</td><td style="${tdVal}">${e(meta.guestName)}</td></tr>
      <tr><td style="${tdLabel}">Guest Email</td><td style="${tdVal}">${e(meta.guestEmail)}</td></tr>
      <tr><td style="${tdLabel}">Phone</td><td style="${tdVal}">${e(meta.guestPhone) || 'Not provided'}</td></tr>
      <tr><td style="${tdLabel}">Date</td><td style="${tdVal}">${e(meta.date)}</td></tr>
      <tr><td style="${tdLabel}">Time</td><td style="${tdVal}">${e(meta.timeSlot)}</td></tr>
      <tr><td style="${tdLabel}">Party Size</td><td style="${tdVal}">${e(meta.partySize) || '1'} guest(s)</td></tr>
      ${meta.notes ? `<tr><td style="${tdLabel}">Notes</td><td style="${tdVal}">${e(meta.notes)}</td></tr>` : ''}
    </table>
    <div style="margin-top:20px;padding:16px 20px;background:rgba(233,102,69,0.12);border:1px solid rgba(233,102,69,0.3);border-radius:10px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <p style="margin:0;font-size:13px;font-weight:700;color:#E96645;">Payment Collected</p>
        <p style="margin:3px 0 0;font-size:12px;color:rgba(245,232,203,0.5);">Paid in full via Stripe · Free cancellation 24+ hrs before</p>
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
        subject: `🎉 New Booking: ${oneLine(meta.categoryLabel) || 'Experience'} — ${oneLine(meta.guestName) || 'Guest'}`,
        html,
      }),
    });
    const emailData = await emailRes.json();
    if (!emailRes.ok) console.error('Resend error:', emailRes.status, emailData && emailData.name);
    else console.log('Notification email sent:', emailData.id);
  } catch (e) {
    console.error('Email send failed:', e.message);
  }
}

// Guide (PDF) orders have no date, party or operator: send a short sale notice instead of the booking email.
async function sendGuideSaleEmail(meta, amount) {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) { console.log('No RESEND_API_KEY set, skipping email'); return; }
  const amountFormatted = Number.isFinite(amount) ? `$${(amount / 100).toFixed(2)}` : 'see Stripe';
  const e = (v) => escapeHtml(String(v == null ? '' : v).slice(0, 200));
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ShoreList Bookings <onboarding@resend.dev>',
        to: ['shorelistwilmington@gmail.com'],
        subject: 'Guide sold: ' + String(meta.product || 'guide').replace(/[^a-z0-9-]/gi, '').slice(0, 60),
        html: `<p>A guide was bought and paid: <strong>${e(meta.product)}</strong> (${e(amountFormatted)}). Buyer details are in Stripe.</p>`,
      }),
    });
    if (!r.ok) console.error('Resend error (guide):', r.status);
  } catch (err) { console.error('Email send failed (guide):', err.message); }
}

const TOLERANCE_SECONDS = 300; // Stripe's standard replay window

// Stripe-Signature: t=<unix seconds>,v1=<hex hmac>[,v1=<hex hmac>...]
// Signed payload is `${t}.${rawBody}`, HMAC-SHA256 with the endpoint secret.
function verifyStripeSignature(rawBody, signatureHeader, secret) {
  try {
    let timestamp = '';
    const candidates = [];
    String(signatureHeader).split(',').forEach(p => {
      const i = p.indexOf('=');
      if (i < 0) return;
      const k = p.slice(0, i).trim(), v = p.slice(i + 1).trim();
      if (k === 't') timestamp = v;
      if (k === 'v1') candidates.push(v);
    });
    if (!/^\d{1,12}$/.test(timestamp) || !candidates.length) return false;
    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > TOLERANCE_SECONDS) return false;
    const expected = crypto.createHmac('sha256', secret).update(timestamp + '.').update(rawBody).digest();
    // Stripe may send several v1 values while a secret is being rolled: any match passes.
    return candidates.some(sig => {
      if (!/^[0-9a-f]{64}$/i.test(sig)) return false;
      return crypto.timingSafeEqual(expected, Buffer.from(sig, 'hex'));
    });
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

  // Fail closed: without the signing secret nothing can be trusted, so nothing is processed.
  if (!WEBHOOK_SECRET) {
    console.error('stripe-webhook: STRIPE_WEBHOOK_SECRET is not set. Every webhook is being rejected until it is added in Netlify.');
    return { statusCode: 500, body: JSON.stringify({ error: 'Webhook not configured' }) };
  }

  // The signature covers the exact bytes Stripe sent, so decode but never re-serialise.
  const raw = Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8');
  const sig = header(event, 'stripe-signature');
  if (!sig || !verifyStripeSignature(raw, sig, WEBHOOK_SECRET)) {
    console.error('stripe-webhook: missing or invalid Stripe signature');
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid signature' }) };
  }

  let webhookEvent;
  try {
    webhookEvent = JSON.parse(raw.toString('utf8'));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }
  if (!webhookEvent || typeof webhookEvent !== 'object') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  console.log('Webhook event:', String(webhookEvent.type).slice(0, 60));

  if (webhookEvent.type === 'checkout.session.completed') {
    const session = webhookEvent.data?.object;
    if (!session) return { statusCode: 200, body: JSON.stringify({ received: true }) };
    // The email says "paid in full", so only send it when Stripe says so.
    if (session.payment_status !== 'paid') {
      console.log('Session completed but not paid, no email sent:', session.id);
      return { statusCode: 200, body: JSON.stringify({ received: true }) };
    }
    const meta   = session.metadata || {};
    const amount = session.amount_total;
    if (meta.kind === 'guide') {
      console.log('Guide order completed:', session.id, meta.product);
      await sendGuideSaleEmail(meta, amount);
      return { statusCode: 200, body: JSON.stringify({ received: true }) };
    }
    console.log('Booking completed:', session.id, meta.operatorId, meta.date, meta.timeSlot);
    await sendOperatorEmail(meta, amount);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
