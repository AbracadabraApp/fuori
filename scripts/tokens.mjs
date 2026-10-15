/**
 * Design tokens → Swift and CSS (npm run tokens). design/tokens.json is the
 * one source; this writes ios/FuoriKit/Sources/FuoriDesign/Tokens.swift for
 * the app and sketches/tokens.css for HTML sketches, so both use the same
 * colours and sizes (docs/12-native-app.md → HTML prototyping lane). Commit
 * both outputs. test: npm run tokens -- --check fails when they're stale.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const t = JSON.parse(fs.readFileSync(path.join(root, 'design/tokens.json'), 'utf8'));
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const rgb = (hex) => [1, 3, 5].map((i) => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(4));
const head = (c) => `${c} Generated from design/tokens.json by scripts/tokens.mjs (npm run tokens). Don't edit by hand.\n`;

const swift = `${head('//')}import SwiftUI

public enum Tokens {
    public enum Colors {
${Object.entries(t.color).map(([k, v]) => { const [r, g, b] = rgb(v); return `        public static let ${k} = Color(red: ${r}, green: ${g}, blue: ${b}) // ${v}`; }).join('\n')}
    }

    public enum FontFamily {
${Object.entries(t.font).map(([k, v]) => `        /// ${v.note}\n        public static let ${k} = "${v.family}"`).join('\n')}
    }

    public enum Size {
${Object.entries(t.size).map(([k, v]) => `        public static let ${k}: CGFloat = ${v}`).join('\n')}
    }

    public enum Space {
${Object.entries(t.space).map(([k, v]) => `        public static let ${k}: CGFloat = ${v}`).join('\n')}
    }

    public enum Radius {
${Object.entries(t.radius).map(([k, v]) => `        public static let ${k}: CGFloat = ${v}`).join('\n')}
    }

    public enum Shadow {
${Object.entries(t.shadow).map(([k, v]) => `        public static let ${k} = (x: CGFloat(${v.x}), y: CGFloat(${v.y}), radius: CGFloat(${v.blur / 2}), opacity: ${v.opacity})`).join('\n')}
    }
}
`;

const css = `${head('/*').trimEnd()} */
:root {
${Object.entries(t.color).map(([k, v]) => `  --${kebab(k)}: ${v};`).join('\n')}
${Object.entries(t.font).map(([k, v]) => `  --font-${kebab(k)}: "${v.family}", ${k === 'display' ? 'Georgia, serif' : '"Gill Sans", sans-serif'};`).join('\n')}
${Object.entries(t.size).map(([k, v]) => `  --size-${kebab(k)}: ${v}px;`).join('\n')}
${Object.entries(t.space).map(([k, v]) => `  --space-${kebab(k)}: ${v}px;`).join('\n')}
${Object.entries(t.radius).map(([k, v]) => `  --radius-${kebab(k)}: ${v}px;`).join('\n')}
${Object.entries(t.shadow).map(([k, v]) => `  --shadow-${kebab(k)}: ${v.x}px ${v.y}px ${v.blur}px rgba(0, 0, 0, ${v.opacity});`).join('\n')}
}
`;

const outputs = {
  'ios/FuoriKit/Sources/FuoriDesign/Tokens.swift': swift,
  'sketches/tokens.css': css,
};
const check = process.argv.includes('--check');
let stale = 0;
for (const [file, text] of Object.entries(outputs)) {
  const full = path.join(root, file);
  if (check) {
    if (!fs.existsSync(full) || fs.readFileSync(full, 'utf8') !== text) { console.error(`stale: ${file} (run npm run tokens)`); stale++; }
  } else {
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, text);
    console.log(`wrote ${file}`);
  }
}
if (check) { if (stale) process.exit(1); console.log('OK: Tokens.swift and tokens.css match design/tokens.json'); }
