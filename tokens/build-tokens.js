/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

const colour = JSON.parse(fs.readFileSync('token-colour.json', 'utf8'));
const typography = JSON.parse(fs.readFileSync('token-typography.json', 'utf8'));

// Flatten all palette + key colours into a dot-path lookup
const flat = {};

function flatten(obj, prefix) {
  for (const [key, value] of Object.entries(obj)) {
    const path = `${prefix}.${key}`;
    if (typeof value === 'string' && /^hsl\(/.test(value)) {
      flat[path] = value;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, path);
    }
  }
}

flatten(colour.color.key, 'color.key');
flatten(colour.color.palette, 'color.palette');

function resolve(ref) {
  const key = ref.replace(/[{}]/g, '');
  if (flat[key]) return flat[key];
  // Try nearest tone for palette references
  const parts = key.split('.');
  if (parts.length === 4 && parts[0] === 'color' && parts[1] === 'palette') {
    const paletteName = parts[2];
    const requestedTone = Number(parts[3]);
    const palette = colour.color.palette[paletteName];
    if (palette) {
      const tones = Object.keys(palette).map(Number).sort((a, b) => a - b);
      const nearest = tones.reduce((prev, curr) =>
        Math.abs(curr - requestedTone) < Math.abs(prev - requestedTone) ? curr : prev
      );
      if (nearest !== requestedTone) {
        process.stderr.write(`WARNING: Tone ${requestedTone} not found in ${paletteName} palette, using nearest ${nearest}\n`);
      }
      return flat[`color.palette.${paletteName}.${nearest}`];
    }
  }
  process.stderr.write(`WARNING: Unresolvable reference ${ref}\n`);
  return null;
}

// Properties to exclude from CSS output (non-standard or no visual effect)
const skipTypographyVars = new Set(['text-case', 'text-decoration', 'paragraph-indent', 'paragraph-spacing']);

let css = `/* ========================================
   CareFlow — Design Tokens
   Auto-generated from token-colour.json
   and token-typography.json
   ======================================== */

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap');

/* ---- Colour System — Light Roles ---- */

:root {\n`;

for (const [role, ref] of Object.entries(colour.color.role.light)) {
  const varName = `--color-${role.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
  const value = resolve(ref);
  if (value) {
    css += `  ${varName}: ${value};\n`;
  } else {
    css += `  /* ${varName}: UNRESOLVED — ${ref} */\n`;
  }
}

css += `}\n\n/* ---- Colour System — Dark Roles ---- */\n\n@media (prefers-color-scheme: dark) {\n  :root {\n`;

for (const [role, ref] of Object.entries(colour.color.role.dark)) {
  const varName = `--color-${role.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
  const value = resolve(ref);
  if (value) {
    css += `    ${varName}: ${value};\n`;
  } else {
    css += `    /* ${varName}: UNRESOLVED — ${ref} */\n`;
  }
}

css += `  }\n}\n\n/* ---- Typography System ---- */\n\n:root {\n`;

for (const [level, props] of Object.entries(typography.typography)) {
  const prefix = `--${level.replace(/ /g, '-')}`;

  for (const [prop, def] of Object.entries(props)) {
    if (prop === 'description') continue;
    const propKebab = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    if (skipTypographyVars.has(propKebab)) continue;
    const varName = `${prefix}-${propKebab}`;
    let value = def.value;

    if (def.type === 'dimension' && typeof value === 'number') {
      value = `${value}px`;
    }

    if (prop === 'fontFamily') {
      value = `'${value}'`;
    }

    css += `  ${varName}: ${value};\n`;
  }
  css += '\n';
}

css += '}\n';

fs.writeFileSync('tokens.css', css, 'utf8');
console.log('✓ tokens.css generated');
