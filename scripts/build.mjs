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

const ogPages = {
  'projects/terraform-wordpress.html': {
    file: 'terraform-wordpress.png',
    type: 'PROJECT',
    lines: ['Automating a WordPress', 'infrastructure deployment'],
    tech: 'Terraform · AWS · VPC · EC2'
  },
  'projects/redis-counter.html': {
    file: 'redis-counter.png',
    type: 'PROJECT',
    lines: ['Building a multi-container', 'counter application'],
    tech: 'Docker · NGINX · Redis · Flask'
  },
  'projects/kubernetes-eks.html': {
    file: 'kubernetes-eks.png',
    type: 'PROJECT',
    lines: ['From local Kubernetes', 'to Amazon EKS'],
    tech: 'Kubernetes · Amazon EKS · kubectl · IAM'
  },
  'projects/ci-cd-pipeline.html': {
    file: 'ci-cd-pipeline.png',
    type: 'PROJECT',
    lines: ['Hardening a Terraform', 'delivery pipeline'],
    tech: 'Terraform · Azure DevOps · S3 · DynamoDB'
  },
  'articles.html': {
    file: 'articles.png',
    type: 'ARTICLES',
    lines: ['What I’m learning,', 'written down.'],
    tech: 'Terraform · Containers · CI/CD · Observability'
  }
};

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

const ogDir = path.join(dist, 'assets', 'og');
await fs.mkdir(ogDir, { recursive: true });

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const makeOgSvg = ({ type, lines, tech }) => {
  const title = lines.map((line, index) =>
    `<text x="104" y="${286 + index * 74}" fill="#FBF6ED" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700">${escapeXml(line)}</text>`
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

for (const config of Object.values(ogPages)) {
  await sharp(Buffer.from(makeOgSvg(config)))
    .png({ compressionLevel: 9 })
    .toFile(path.join(ogDir, config.file));
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

const featureCss = '<link rel="stylesheet" href="/assets/features.css?v=20260820-01">';
const featureJs = '<script src="/assets/features.js?v=20260820-01" defer></script>';

for (const file of htmlFiles) {
  const rel = path.relative(dist, file).split(path.sep).join('/');
  let html = await fs.readFile(file, 'utf8');

  if (!html.includes('/assets/features.css')) {
    html = html.replace('</head>', `${featureCss}\n</head>`);
  }
  if (!html.includes('/assets/features.js')) {
    html = html.replace('</body>', `${featureJs}\n</body>`);
  }

  const og = ogPages[rel];
  if (og) {
    const imageUrl = `https://nabildev.com/assets/og/${og.file}`;
    html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${imageUrl}">`);
    html = html.replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${imageUrl}">`);
  }

  await fs.writeFile(file, html);
}

console.log(`Prepared ${htmlFiles.length} HTML pages in dist/ and generated ${Object.keys(ogPages).length} Open Graph images.`);
