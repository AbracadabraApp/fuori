// The leveling prototype, one command (README.md in this folder):
//   npx tsx --env-file=.env.local tests/experiments/leveling/run.mts --design=A|B|C|all --country=it|es-mx|all [--learners=improving-first,flat] [--conversations=15] [--turns=6] [--dry]
// Starts one main.mts per country (the country pack is fixed when @/content
// loads), then writes results/<date>-<design>.md covering every country.
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildReport, consoleSummary, type CountryResult } from './report';

const flag = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const DRY = process.argv.includes('--dry');
const design = (flag('design') ?? 'all').toUpperCase() === 'ALL' ? 'all' : flag('design')!.toUpperCase();
const countryArg = flag('country') ?? 'all';
const countries = countryArg === 'all' ? ['it', 'es-mx'] : countryArg.split(',');
const DIR = join(process.cwd(), 'tests', 'experiments', 'leveling', 'results');
mkdirSync(DIR, { recursive: true });
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const name = `${stamp}-${design}${DRY ? '-dry' : ''}`;

if (!DRY && !process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set: run with npx tsx --env-file=.env.local …, or add --dry for the stub.');
  process.exit(1);
}

const passOn = process.argv.slice(2).filter((a) => !a.startsWith('--country='));
const child = (country: string) => new Promise<string>((resolve, reject) => {
  const out = join(DIR, `${name}-${country}.json`);
  const p = spawn('npx', ['tsx', join('tests', 'experiments', 'leveling', 'main.mts'), ...passOn, `--out=${out}`], {
    env: { ...process.env, COUNTRY: country },
    stdio: 'inherit',
  });
  p.on('exit', (code) => (code === 0 ? resolve(out) : reject(new Error(`${country} run failed (exit ${code})`))));
});

const files = await Promise.all(countries.map(child));
const results = files.map((f) => JSON.parse(readFileSync(f, 'utf8')) as CountryResult);
const file = join(DIR, `${name}.md`);
writeFileSync(file, buildReport(design, results));
console.log(`\n${consoleSummary(results)}\n\nReport: ${file.replace(process.cwd() + '/', '')} (+ ${files.length} .json)`);
