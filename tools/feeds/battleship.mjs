// Battleship North Carolina (NC DNCR Localist). Calendar page: https://events.dncr.nc.gov/battleship-north-carolina/calendar
// Feed URL follows the same Localist pattern as Fort Fisher (/calendar/ics); the first Actions run reports whether it resolves in feed-health.json.
import { normalizeIcs } from './lib.mjs';
export const parse = (text, feed, ctx = {}) => normalizeIcs(text, feed, {
  ...ctx,
  include: (e) => !/commission|committee|\bis open\b|open on new year|closed/i.test(e.title), // meetings and "we are open" notices are not visitor events
  venue: () => feed.venue, cat: () => feed.cat,
});
