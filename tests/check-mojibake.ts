// Double-encoded replies are repaired (lib/mojibake.ts), and ordinary text in
// any of our languages is left alone. No API calls.
import { fixMojibake } from '@/lib/mojibake';
const problems: string[] = [];
const eq = (got: string, want: string) => { if (got !== want) problems.push(`${JSON.stringify(got)} should be ${JSON.stringify(want)}`); };
// Seen from Claude (windows-1250): Mexico station sellers and Doña Concha
eq(fixMojibake('Buenas tardes, bienvenido. ÂżA dĂłnde viaja hoy?'), 'Buenas tardes, bienvenido. ¿A dónde viaja hoy?');
eq(fixMojibake('ÂżĂ‰n quĂ© le puedo ayudar?'), '¿Én qué le puedo ayudar?');
eq(fixMojibake('ÂżViene a conocer la iglesia?'), '¿Viene a conocer la iglesia?');
// windows-874 (Thai), seen at Termini: "c'รจ"
eq(fixMojibake("Allora, c'รจ il Frecciarossa"), "Allora, c'è il Frecciarossa");
// windows-1252
eq(fixMojibake('Aspetti â€¦ un attimo'), 'Aspetti … un attimo');
eq(fixMojibake('cafÃ© e perchÃ©'), 'café e perché');
eq(fixMojibake('Aspetti â€¦ un attimo'), 'Aspetti … un attimo');
// Ordinary text stays as it is
for (const s of ['Buongiorno! Perché non prendi un caffè?', '¿A dónde viaja hoy? Señor, niño, pingüino', 'Città, più, così — «virgolette»', 'Él está aquí. ¡Qué bien!', 'Dove va? Ah, Napoli… binario 5.', 'Ça va, garçon, à bientôt', 'Grüße, Straße']) eq(fixMojibake(s), s);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('OK: double-encoded text is repaired; ordinary text in any of the languages is left alone');
