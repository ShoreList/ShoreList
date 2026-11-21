// Registry: feed id -> parser module. Config (URLs, labels) lives in tools/event-sources.json.
import * as cameron from './cameron.mjs';
import * as wrightsvilleTown from './wrightsville-town.mjs';
import * as fortFisher from './fort-fisher.mjs';
import * as battleship from './battleship.mjs';
import * as riverwatch from './riverwatch.mjs';
export const parsers = { cameron, 'wrightsville-town': wrightsvilleTown, 'fort-fisher': fortFisher, battleship, riverwatch };
