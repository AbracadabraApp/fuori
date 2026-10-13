import { ciudadDeMexico } from './ciudad-de-mexico';
import { oaxaca } from './oaxaca';
import { puebla } from './puebla';
import { guadalajara } from './guadalajara';
import { sanMiguelDeAllende } from './san-miguel-de-allende';

// Feed order: Mexico City first, then alternating smaller and bigger cities.
export const cities = [
  ciudadDeMexico, //      big   · Ciudad de México
  oaxaca, //              town  · Oaxaca
  guadalajara, //         big   · Jalisco
  sanMiguelDeAllende, //  town  · Guanajuato
  puebla, //              big   · Puebla
];
