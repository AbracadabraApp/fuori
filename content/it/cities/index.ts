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

// Feed order: alternating big city / smaller town, spread across regions,
// Roma first (it has the anchors). The feed shows 10 at a time.
// There are 9 big cities and 11 towns, so the list ends with three towns.
export const cities = [
  roma, //     big   · Lazio
  matera, //   town  · Basilicata
  firenze, //  big   · Toscana
  taormina, // town  · Sicilia
  venezia, //  big   · Veneto
  lecce, //    town  · Puglia
  milano, //   big   · Lombardia
  siena, //    town  · Toscana
  napoli, //   big   · Campania
  verona, //   town  · Veneto
  bologna, //  big   · Emilia-Romagna
  assisi, //   town  · Umbria
  palermo, //  big   · Sicilia
  bergamo, //  town  · Lombardia
  torino, //   big   · Piemonte
  siracusa, // town  · Sicilia
  genova, //   big   · Liguria
  lucca, //    town  · Toscana
  orvieto, //  town  · Umbria
  mantova, //  town  · Lombardia
];
