/**
 * Repairs text Claude sometimes returns double-encoded: UTF-8 bytes read back as
 * a Windows code page, so "¿A dónde" arrives as "ÂżA dĂłnde" (Mexico station
 * sellers, 2026-11-05: 11 of 24 replies with the JSON-schema output, 0 of 24
 * without; also seen in the conversation reports). Any language: it reverses the
 * encoding, it doesn't look for words. A run of characters is replaced only when
 * its code-page bytes form valid multi-byte UTF-8, which ordinary accented text
 * doesn't ("café", "perché", "niño" stay as they are).
 */
// The single-byte pages it has come back through: Central European ("Ăł"), Western ("Ã©"), Thai ("รจ" for è); the rest for safety
const PAGES = ['windows-1250', 'windows-1252', 'windows-874', 'windows-1251', 'windows-1253', 'windows-1254', 'windows-1257'] as const;

// Each code page's character → byte, for the bytes 0x80–0xFF
const reverse = PAGES.map((page) => {
  const chars = new TextDecoder(page).decode(Uint8Array.from({ length: 128 }, (_, i) => 0x80 + i));
  const map = new Map<string, number>();
  [...chars].forEach((ch, i) => { if (ch !== '�' && !map.has(ch)) map.set(ch, 0x80 + i); });
  return map;
});
const utf8 = new TextDecoder('utf-8', { fatal: true });

function repairRun(run: string): string {
  for (const map of reverse) {
    const bytes: number[] = [];
    let ok = true;
    for (const ch of run) {
      const b = ch.charCodeAt(0) < 0x80 ? ch.charCodeAt(0) : map.get(ch);
      if (b === undefined) { ok = false; break; }
      bytes.push(b);
    }
    // Must start with a UTF-8 lead byte (C2–F4) to be a mis-read multi-byte character
    if (!ok || bytes[0] < 0xc2 || bytes[0] > 0xf4) continue;
    try { return utf8.decode(Uint8Array.from(bytes)); } catch { /* not this page */ }
  }
  return run;
}

/** The text with any double-encoded runs put back; unchanged when there are none */
export function fixMojibake(text: string): string {
  // A run of two or more non-ASCII characters; repairRun keeps it unless it decodes as UTF-8
  return text.replace(/[^\x00-\x7F]{2,}/g, repairRun);
}
