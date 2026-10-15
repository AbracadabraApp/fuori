/**
 * Downloads Apple's Human Interface Guidelines as Markdown, for reading while
 * designing the iPhone app (npm run hig). Apple serves each page as DocC JSON
 * at developer.apple.com/tutorials/data/design/human-interface-guidelines/….
 *
 * Output: docs/reference/hig/<page>.md plus INDEX.md, with the date fetched.
 * The folder is git-ignored: the text is Apple's and this repo is public.
 * Our own rules, in our words, are in docs/13-ios-conventions.md; re-run
 * this to check them against the latest guide.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'docs/reference/hig');
const SITE = 'https://developer.apple.com';
const DATA = `${SITE}/tutorials/data`;
const START = '/design/human-interface-guidelines';

const seen = new Set();
const pages = [];

function inline(items = [], refs = {}) {
  return items
    .map((i) => {
      switch (i.type) {
        case 'text': return i.text;
        case 'codeVoice': return `\`${i.code}\``;
        case 'emphasis': return `*${inline(i.inlineContent, refs)}*`;
        case 'strong': return `**${inline(i.inlineContent, refs)}**`;
        case 'reference': {
          const r = refs[i.identifier];
          if (!r) return '';
          const url = r.url?.startsWith('/') ? SITE + r.url : r.url;
          return `[${r.title ?? inline(r.titleInlineContent, refs) ?? url}](${url})`;
        }
        case 'link': return `[${i.title ?? i.destination}](${i.destination})`;
        case 'image': return '';
        default: return i.inlineContent ? inline(i.inlineContent, refs) : '';
      }
    })
    .join('');
}

function blocks(items = [], refs = {}, depth = 0) {
  const out = [];
  for (const b of items) {
    switch (b.type) {
      case 'heading': out.push(`${'#'.repeat(Math.min(b.level + 1, 6))} ${b.text}`); break;
      case 'paragraph': out.push(inline(b.inlineContent, refs)); break;
      case 'aside': out.push(blocks(b.content, refs, depth).split('\n').map((l) => `> ${l}`).join('\n')); break;
      case 'unorderedList':
      case 'orderedList':
        out.push(b.items.map((it, n) => `${'  '.repeat(depth)}${b.type === 'orderedList' ? `${n + 1}.` : '-'} ${blocks(it.content, refs, depth + 1).trim()}`).join('\n'));
        break;
      case 'table':
        out.push(b.rows.map((row, n) => {
          const line = `| ${row.map((cell) => blocks(cell, refs).replace(/\n+/g, ' ')).join(' | ')} |`;
          return n === 0 ? `${line}\n|${row.map(() => '---').join('|')}|` : line;
        }).join('\n'));
        break;
      case 'row': out.push((b.columns ?? []).map((c) => blocks(c.content, refs, depth)).join('\n\n')); break;
      case 'tabNavigator': for (const t of b.tabs ?? []) out.push(`**${t.title}**\n\n${blocks(t.content, refs, depth)}`); break;
      case 'links': out.push((b.items ?? []).map((id) => `- ${inline([{ type: 'reference', identifier: id }], refs)}`).join('\n')); break;
      case 'codeListing': out.push('```\n' + (b.code ?? []).join('\n') + '\n```'); break;
      default:
        if (b.content) out.push(blocks(b.content, refs, depth));
        else if (b.inlineContent) out.push(inline(b.inlineContent, refs));
    }
  }
  return out.filter(Boolean).join('\n\n');
}

async function fetchPage(url) {
  if (seen.has(url)) return;
  seen.add(url);
  const res = await fetch(`${DATA}${url}.json`);
  if (!res.ok) { console.error(`skip ${url}: ${res.status}`); return; }
  const d = await res.json();
  const refs = d.references ?? {};
  const title = d.metadata?.title ?? url;
  const body = [
    `# ${title}`,
    `Source: ${SITE}${url}`,
    d.abstract ? inline(d.abstract, refs) : '',
    ...(d.primaryContentSections ?? []).map((s) => blocks(s.content, refs)),
  ].filter(Boolean).join('\n\n');

  const name = url === START ? 'index' : url.slice(START.length + 1).replace(/\//g, '--');
  pages.push({ name, title, url });
  fs.writeFileSync(path.join(OUT, `${name}.md`), body + '\n');

  // Follow every guideline page this one points to
  const next = Object.values(refs)
    .map((r) => r.url)
    .filter((u) => typeof u === 'string' && u.startsWith(START) && !u.includes('#'));
  for (const u of next) await fetchPage(u);
}

fs.mkdirSync(OUT, { recursive: true });
await fetchPage(START);
const date = new Date().toISOString().slice(0, 10);
pages.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(
  path.join(OUT, 'INDEX.md'),
  `# Apple Human Interface Guidelines (fetched ${date})\n\nLocal copy for reference; not committed. Re-fetch: npm run hig\n\n${pages.map((p) => `- [${p.title}](${p.name}.md): ${SITE}${p.url}`).join('\n')}\n`
);
console.log(`${pages.length} pages → ${path.relative(root, OUT)} (fetched ${date})`);
