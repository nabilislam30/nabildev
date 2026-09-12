import fs from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const dataDir = path.join(root, 'scripts', 'article-data', 'eks');
const dist = path.join(root, 'dist');

const readParts = async (prefix, suffix) => {
  const names = (await fs.readdir(dataDir))
    .filter((name) => name.startsWith(`${prefix}.`) && name.endsWith(suffix))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  if (!names.length) throw new Error(`No article data parts found for ${prefix}`);
  const parts = await Promise.all(names.map((name) => fs.readFile(path.join(dataDir, name), 'utf8')));
  return parts.join('').replace(/\s+/g, '');
};

const articleEncoded = await readParts('article', '.gz.b64');
const articleHtml = gunzipSync(Buffer.from(articleEncoded, 'base64')).toString('utf8');

const articleTarget = path.join(dist, 'articles', 'inside-amazon-eks.html');
await fs.mkdir(path.dirname(articleTarget), { recursive: true });
await fs.writeFile(articleTarget, articleHtml);

console.log('Built final EKS article with the supplied AWS-style diagrams embedded directly in the page.');
