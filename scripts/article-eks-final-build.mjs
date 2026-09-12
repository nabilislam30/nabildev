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

const diagrams = {
  control: 'eks-control-plane-vs-data-plane.webp',
  identity: 'eks-identity-flow.webp',
  workload: 'eks-workload-dependencies.webp',
  deploy: 'eks-deployment-lifecycle.webp'
};

const diagramDir = path.join(dist, 'assets', 'articles');
await fs.mkdir(diagramDir, { recursive: true });

for (const [prefix, filename] of Object.entries(diagrams)) {
  const encoded = await readParts(prefix, '.b64');
  const bytes = Buffer.from(encoded, 'base64');
  if (!bytes.length) throw new Error(`Decoded diagram ${filename} is empty`);
  await fs.writeFile(path.join(diagramDir, filename), bytes);
}

console.log('Built final EKS article and exact supplied diagram assets.');
