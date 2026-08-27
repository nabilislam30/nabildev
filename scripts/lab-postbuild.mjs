import fs from 'node:fs/promises';

const file = 'dist/lab.html';
let html = await fs.readFile(file, 'utf8');
const tag = '<' + 'script src="/assets/lab-filter-20260827.js?v=20260827-1940"></' + 'script>';
if (!html.includes('lab-filter-20260827.js')) html = html.replace('</body>', tag + '\n</body>');
await fs.writeFile(file, html);
