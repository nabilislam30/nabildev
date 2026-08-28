import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

async function update(file, transform) {
  const full = path.join(root, 'dist', file);
  let html = await fs.readFile(full, 'utf8');
  html = transform(html);
  await fs.writeFile(full, html);
}

await update('index.html', (html) =>
  html.replace(/\s*<link rel="stylesheet" href="\/assets\/home-project-number-20260828\.css(?:\?v=[^"]+)?">\n?/g, '\n')
);

await update('projects.html', (html) =>
  html.replace(/\s*<link rel="stylesheet" href="assets\/projects-number-20260828\.css(?:\?v=[^"]+)?">\n?/g, '\n')
);

await update('experience.html', (html) =>
  html.replace(
    /assets\/experience-page-20260828\.css(?:\?v=[^"]+)?/g,
    'assets/experience-page-20260828.css?v=20260828-1738'
  )
);

console.log('Restored original Home/Projects numbering and scoped number hover styling to Experience only.');
