import fs from 'node:fs/promises';

const file = 'dist/lab.html';
let html = await fs.readFile(file, 'utf8');

const requiredScript = 'assets/lab-filter-20260910.js?v=20260910-1255';
if (!html.includes(requiredScript)) {
  const tag = `<script src="${requiredScript}"></script>`;
  html = html.replace('</body>', `${tag}\n</body>`);
}

// Never reintroduce the superseded grouped-filter runtime.
html = html.replace(/\s*<script src="\/?assets\/lab-filter-20260827\.js(?:\?v=[^"]+)?"><\/script>/g, '');

await fs.writeFile(file, html);
