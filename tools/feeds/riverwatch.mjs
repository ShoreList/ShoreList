// Cape Fear River Watch: The Events Calendar (Tribe) iCal feed advertised on its calendar pages:
// https://capefearriverwatch.org/?post_type=tribe_events&ical=1&eventDisplay=list
// Basin-wide nonprofit, so only events located in or naming the Wilmington/beach towns are kept; virtual events are dropped.
import { normalizeIcs, guessCat } from './lib.mjs';
const PLACE = /wilmington|wrightsville|carolina beach|kure|fort fisher|pleasure island|greenfield lake|cape fear river|eagles island|hugh macrae|airlie|masonboro|snow'?s cut/i;
const area = (e, loc) => { const t = loc + ' ' + e.title; return /wrightsville/i.test(t) ? 'Wrightsville Beach' : /kure|fort fisher/i.test(t) ? 'Kure Beach' : /carolina beach|pleasure island/i.test(t) ? 'Carolina Beach' : 'Greater Wilmington'; };
export const parse = (text, feed, ctx = {}) => normalizeIcs(text, feed, {
  ...ctx,
  include: (e) => !/virtual|webinar|zoom|online|board meeting/i.test(e.title + ' ' + e.loc) && PLACE.test(e.loc + ' ' + e.title),
  area, cat: (t) => guessCat(t, feed.cat),
});
