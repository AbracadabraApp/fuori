import { ciudadDeMexico } from './ciudad-de-mexico';
import { oaxaca } from './oaxaca';
import { puebla } from './puebla';
import { guadalajara } from './guadalajara';
import { sanMiguelDeAllende } from './san-miguel-de-allende';
import { guanajuato } from './guanajuato';
import { veracruz } from './veracruz';
import { patzcuaro } from './patzcuaro';
import { merida } from './merida';
import { sanCristobalDeLasCasas } from './san-cristobal-de-las-casas';
import { tijuana } from './tijuana';
import { zacatecas } from './zacatecas';
import { monterrey } from './monterrey';
import { mazatlan } from './mazatlan';

// Feed order: Mexico City first, then alternating smaller and bigger cities.
// The five added 2026-11-09 are shown since 2026-11-11 (Josh: "go"; their pictures are made).
// The four northern cities added 2026-11-13 are hidden (in each file) until their pictures are made
// and Josh has seen them (docs/mexico-north-recipe.md).
export const cities = [
  ciudadDeMexico, //        big   · Ciudad de México
  oaxaca, //                town  · Oaxaca
  guadalajara, //           big   · Jalisco
  sanMiguelDeAllende, //    town  · Guanajuato
  puebla, //                big   · Puebla
  guanajuato, //            town  · Guanajuato
  veracruz, //              big   · Veracruz
  patzcuaro, //             town  · Michoacán
  merida, //                big   · Yucatán
  sanCristobalDeLasCasas, // town · Chiapas
  tijuana, //               big   · Baja California
  zacatecas, //             town  · Zacatecas
  monterrey, //             big   · Nuevo León
  mazatlan, //              big   · Sinaloa (the beach city)
];
