// Fort Fisher State Historic Site (NC Dept. of Natural and Cultural Resources): Localist place calendar, "Save to iCal" feed
// https://events.dncr.nc.gov/fort-fisher-historic-site/calendar/ics. Localist feeds are published for syndication. Not the NC Aquarium (closed).
import { normalizeIcs } from './lib.mjs';
export const parse = (text, feed, ctx = {}) => normalizeIcs(text, feed, { ...ctx, include: (e) => !/commission|advisory (board|council)|staff|closed/i.test(e.title), venue: () => feed.venue, cat: () => feed.cat });
