// Cameron Art Museum: The Events Calendar (Tribe) iCal export. Existing source, moved into the module layout.
import { normalizeIcs } from './lib.mjs';
export const parse = (text, feed, ctx = {}) => normalizeIcs(text, feed, { ...ctx, cat: () => feed.cat });
