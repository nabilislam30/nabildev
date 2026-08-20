import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.join(root, 'dist');

const copyEntries = [
  '404.html',
  'about.html',
  'articles.html',
  'contact.html',
  'experience.html',
  'index.html',
  'lab.html',
  'projects.html',
  'assets',
  'projects',
  '_headers',
  'robots.txt',
  'sitemap.xml'
];

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });

for (const entry of copyEntries) {
  const source = path.join(root, entry);
  const target = path.join(dist, entry);
  const stat = await fs.stat(source);
  if (stat.isDirectory()) {
    await fs.cp(source, target, { recursive: true });
  } else {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target);
  }
}

// Future individual article pages can live under /articles without any build
// change. If the directory exists, include it automatically.
try {
  await fs.cp(path.join(root, 'articles'), path.join(dist, 'articles'), { recursive: true });
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const htmlFiles = [];
const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
  }
};
await walk(dist);

const ogDir = path.join(dist, 'assets', 'og');
await fs.mkdir(ogDir, { recursive: true });

const decodeText = (value = '') => value
  .replace(/<[^>]*>/g, ' ')
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&gt;', '>')
  .replaceAll('&lt;', '<')
  .replace(/\s+/g, ' ')
  .trim();

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const wrapTitle = (title, target = 31) => {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length < 2) return [title];

  let best = [title];
  let bestScore = Number.POSITIVE_INFINITY;
  for (let split = 1; split < words.length; split += 1) {
    const first = words.slice(0, split).join(' ');
    const second = words.slice(split).join(' ');
    const overflow = Math.max(0, first.length - 38) + Math.max(0, second.length - 38);
    const balance = Math.abs(first.length - second.length);
    const targetPenalty = Math.abs(first.length - target) * 0.2;
    const score = overflow * 20 + balance + targetPenalty;
    if (score < bestScore) {
      bestScore = score;
      best = [first, second];
    }
  }
  return best;
};

const extractOgConfig = (rel, html) => {
  const isProject = /^projects\/[^/]+\.html$/.test(rel);
  const isArticle = /^articles\/[^/]+\.html$/.test(rel);
  const isArticlesIndex = rel === 'articles.html';
  if (!isProject && !isArticle && !isArticlesIndex) return null;

  const h1 = decodeText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
  const titleTag = decodeText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+[—-]\s+Nabil Islam.*$/i, '');
  const title = h1 || titleTag || 'Nabil Islam';

  let tech = decodeText(html.match(/<span class="kicker">([\s\S]*?)<\/span>/i)?.[1] || '');
  if (isArticlesIndex) tech = 'Terraform · Containers · CI/CD · Observability';
  if (!tech) tech = isProject ? 'Cloud · Infrastructure · Automation' : 'Engineering notes · DevOps learning';

  const slug = rel
    .replace(/\.html$/i, '')
    .replaceAll('/', '-')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

  return {
    file: `${slug}.png`,
    type: isProject ? 'PROJECT' : isArticlesIndex ? 'ARTICLES' : 'ARTICLE',
    lines: wrapTitle(title),
    tech
  };
};

const makeOgSvg = ({ type, lines, tech }) => {
  const fontSize = lines.some((line) => line.length > 38) ? 50 : 58;
  const title = lines.slice(0, 2).map((line, index) =>
    `<text x="104" y="${286 + index * 74}" fill="#FBF6ED" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700">${escapeXml(line)}</text>`
  ).join('\n');

  return `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#052426"/>
    <g opacity="0.18" stroke="#2A5556" stroke-width="1">
      ${Array.from({ length: 27 }, (_, i) => `<line x1="${i * 46}" y1="0" x2="${i * 46}" y2="630"/>`).join('')}
      ${Array.from({ length: 15 }, (_, i) => `<line x1="0" y1="${i * 46}" x2="1200" y2="${i * 46}"/>`).join('')}
    </g>
    <rect x="58" y="54" width="1084" height="522" rx="30" fill="#0E3F41" stroke="#2A5556" stroke-width="2"/>
    <rect x="58" y="54" width="14" height="522" rx="7" fill="#EA9239"/>
    <rect x="102" y="94" width="50" height="50" rx="12" fill="#145052" stroke="#2A5556"/>
    <text x="127" y="127" text-anchor="middle" fill="#FBF6ED" font-family="monospace" font-size="18" font-weight="700">&gt;_</text>
    <text x="171" y="127" fill="#FBF6ED" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">Nabil Islam</text>
    <rect x="935" y="94" width="163" height="48" rx="24" fill="#093133" stroke="#2A5556"/>
    <text x="1016.5" y="124" text-anchor="middle" fill="#EA9239" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700">${escapeXml(type)}</text>
    ${title}
    <text x="104" y="500" fill="#C7D6D3" font-family="Arial, Helvetica, sans-serif" font-size="18">${escapeXml(tech)}</text>
    <text x="1098" y="500" text-anchor="end" fill="#8FAEAA" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700">nabildev.com</text>
    <text x="104" y="548" fill="#76D6C0" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700">Engineering work, explained.</text>
  </svg>`;
};

const featureCss = '<link rel="stylesheet" href="/assets/features.css?v=20260820-01">';
const featureJs = '<script src="/assets/features.js?v=20260820-01" defer></script>';
let ogCount = 0;

for (const file of htmlFiles) {
  const rel = path.relative(dist, file).split(path.sep).join('/');
  let html = await fs.readFile(file, 'utf8');

  if (!html.includes('/assets/features.css')) {
    html = html.replace('</head>', `${featureCss}\n</head>`);
  }
  if (!html.includes('/assets/features.js')) {
    html = html.replace('</body>', `${featureJs}\n</body>`);
  }

  const og = extractOgConfig(rel, html);
  if (og) {
    await sharp(Buffer.from(makeOgSvg(og)))
      .png({ compressionLevel: 9 })
      .toFile(path.join(ogDir, og.file));

    const imageUrl = `https://nabildev.com/assets/og/${og.file}`;
    html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${imageUrl}">`);
    html = html.replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${imageUrl}">`);
    ogCount += 1;
  }

  await fs.writeFile(file, html);
}

console.log(`Prepared ${htmlFiles.length} HTML pages in dist/ and generated ${ogCount} Open Graph images.`);
