// The country choice and Settings in the app show each country as a card,
// all of it from /v1/content (nothing country-specific in Swift): the country's
// name, a line in English, a greeting in the language, and the card picture in
// R2. Run for each country: npm run test:country-card, COUNTRY=es-mx …
import { buildContent } from '@/lib/content-api';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const content = buildContent();
const { card } = content;
check(!!card.country && !!card.learn && !!card.greeting, `card needs a country, a line and a greeting (got ${JSON.stringify(card)})`);
check(!!card.image && /^https:\/\/.+\.webp$/.test(card.image), `card picture should be a WebP in R2 (got ${card.image}); run npm run images:upload`);
check(card.learn.includes(content.language.name), `"${card.learn}" should name the language (${content.language.name})`);

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`OK: ${content.country} card: ${card.country}, "${card.learn}", "${card.greeting}", picture in R2`);
