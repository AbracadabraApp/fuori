import { assisi } from './assisi';
import { bergamo } from './bergamo';
import { bologna } from './bologna';
import { firenze } from './firenze';
import { genova } from './genova';
import { lecce } from './lecce';
import { lucca } from './lucca';
import { mantova } from './mantova';
import { matera } from './matera';
import { milano } from './milano';
import { napoli } from './napoli';
import { orvieto } from './orvieto';
import { palermo } from './palermo';
import { roma } from './roma';
import { siena } from './siena';
import { siracusa } from './siracusa';
import { taormina } from './taormina';
import { torino } from './torino';
import { venezia } from './venezia';
import { verona } from './verona';

// Feed order: big cities first (Roma has the anchors), then smaller towns.
// The feed shows 10 at a time, so the first 10 are what people see first.
export const cities = [
  // Big cities
  roma,
  firenze,
  venezia,
  milano,
  napoli,
  bologna,
  torino,
  palermo,
  genova,
  // Smaller cities and towns
  siena,
  lucca,
  verona,
  bergamo,
  mantova,
  matera,
  lecce,
  orvieto,
  assisi,
  siracusa,
  taormina,
];
