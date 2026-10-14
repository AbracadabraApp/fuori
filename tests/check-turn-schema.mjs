// Checks the /api/turn output schema against structured-output rules.
// Catches the bug where a missing additionalProperties: false made every turn return 400.
import { turnOutputJsonSchema } from '../lib/prompts/turn-output-schema.ts';
import { memoryOutputJsonSchema } from '../lib/prompts/memory-output-schema.ts';
import { qualityOutputJsonSchema } from '../lib/prompts/quality-output-schema.ts';

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
    // Required names must be defined, and fields must sit inside "properties": a field
    // placed beside it makes the API reject the schema (memory broke this way, 2026-10-14)
    const undefinedRequired = (node.required ?? []).filter((k) => !(k in node.properties));
    if (undefinedRequired.length) problems.push(`${path}: required but not in properties: ${undefinedRequired.join(', ')}`);
    const allowed = ['type', 'properties', 'required', 'additionalProperties', 'description'];
    const stray = Object.keys(node).filter((k) => !allowed.includes(k));
    if (stray.length) problems.push(`${path}: unexpected keys on an object (fields belong inside properties): ${stray.join(', ')}`);
  }
  if (types.length > 1) problems.push(`${path}: use anyOf instead of a type array`);
  for (const key of UNSUPPORTED) if (key in node) problems.push(`${path}: unsupported keyword ${key}`);
  for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
}

walk(turnOutputJsonSchema, 'turn schema');
walk(memoryOutputJsonSchema, 'memory schema');
walk(qualityOutputJsonSchema, 'quality schema');
if (problems.length) {
  console.error('Turn output schema problems:\n' + problems.join('\n'));
  process.exit(1);
}
console.log('OK: turn, memory and quality output schemas follow structured-output rules');
