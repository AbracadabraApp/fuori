// Checks the /api/turn output schema against structured-output rules.
// Catches the bug where a missing additionalProperties: false made every turn return 400.
import { turnOutputJsonSchema } from '../lib/prompts/turn-output-schema.ts';

const UNSUPPORTED = ['maxLength', 'minLength', 'maxItems', 'minimum', 'maximum', 'pattern'];
const problems = [];

function walk(node, path) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${path}[${i}]`));
  const types = [].concat(node.type ?? []);
  if (types.includes('object') && node.additionalProperties !== false) {
    problems.push(`${path}: object without additionalProperties: false`);
  }
  if (types.includes('object') && node.properties) {
    const missing = Object.keys(node.properties).filter((k) => !(node.required ?? []).includes(k));
    if (missing.length) problems.push(`${path}: properties not in required: ${missing.join(', ')}`);
  }
  if (types.length > 1) problems.push(`${path}: use anyOf instead of a type array`);
  for (const key of UNSUPPORTED) if (key in node) problems.push(`${path}: unsupported keyword ${key}`);
  for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
}

walk(turnOutputJsonSchema, 'schema');
if (problems.length) {
  console.error('Turn output schema problems:\n' + problems.join('\n'));
  process.exit(1);
}
console.log('OK: turn output schema follows structured-output rules');
