/**
 * The mix in a fixed shape (docs/mix.md; Josh, 2026-11-13: "I bigger issue is the runs of spanish without English
 * support"). At Beginner step 1 the character writes each piece of the language in braces with its English after a
 * bar, `{pase, pase | come in}`, and this puts the spoken line together: the piece, then its English. Prompt wording
 * alone left a run with no English in 41% of replayed turns; the shape, 15% (2026-11-13). Works in any language: it
 * reads only braces and bars.
 *
 * `partial`: the line is still being written (the voice starts on its first sentence), so an open brace and what
 * follows it are held back until the brace closes. On a whole line a stray brace is dropped instead.
 */
export function assemblePieces(text: string, partial = false): string {
  let t = text;
  const open = t.lastIndexOf('{');
  if (open > t.lastIndexOf('}')) t = partial ? t.slice(0, open) : t.slice(0, open) + t.slice(open + 1);
  t = t.replace(/\{([^{}]*)\}/g, (_m, inner: string) => {
    const bar = inner.indexOf('|');
    const piece = (bar < 0 ? inner : inner.slice(0, bar)).trim();
    const en = (bar < 0 ? '' : inner.slice(bar + 1)).trim();
    // No English, or English that only repeats the piece (a name, a dish): the piece alone
    if (!en || fold(en) === fold(piece)) return piece;
    return /[.!?…]["'»”’)]*$/.test(piece) ? `${piece} ${en}` : `${piece}, ${en}`;
  });
  return partial ? t : t.replace(/[{}]/g, '');
}

const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase();
