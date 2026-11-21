// Town of Wrightsville Beach: CivicPlus "Subscribe to iCalendar" feed (the calendar page links https://townofwrightsvillebeach.com/iCalendar.aspx).
// The town calendar mixes public events with office closures, board meetings and tennis lesson blocks; only public events are kept.
import { normalizeIcs, guessCat } from './lib.mjs';
const SKIP = /closed|closure|meeting|board of|committee|commission|public hearing|work session|budget|lessons?\b|usta|tennis|agenda|chat with the chief|coffee with a cop/i;
export const parse = (text, feed, ctx = {}) => normalizeIcs(text, feed, {
  ...ctx,
  include: (e) => !SKIP.test(e.title),
  venue: (e, loc) => loc.split(',')[0].trim() || feed.venue,
  cat: (t) => guessCat(t, feed.cat),
});
