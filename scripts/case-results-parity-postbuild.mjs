import fs from 'node:fs';
import path from 'node:path';

const pages = [
  'projects/ecs-threat-composer.html',
  'projects/immutable-aws-infrastructure.html',
  'projects/terraform-wordpress.html',
  'projects/redis-counter.html',
];

const distRoot = path.resolve('dist');

function sectionContaining(html, marker) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) return null;
  const start = html.lastIndexOf('<section', markerIndex);
  if (start === -1) return null;
  const endTag = '</section>';
  const endIndex = html.indexOf(endTag, markerIndex);
  if (endIndex === -1) return null;
  const end = endIndex + endTag.length;
  return { start, end, full: html.slice(start, end) };
}

function innerContainer(sectionHtml) {
  const open = sectionHtml.indexOf('<div class="container">');
  const close = sectionHtml.lastIndexOf('</div></section>');
  if (open === -1 || close === -1) return null;
  return sectionHtml.slice(open + '<div class="container">'.length, close);
}

for (const relativePath of pages) {
  const filePath = path.join(distRoot, relativePath);
  if (!fs.existsSync(filePath)) continue;

  let html = fs.readFileSync(filePath, 'utf8');

  const troubleshooting = sectionContaining(html, '04 — Troubleshooting');
  const outcome = sectionContaining(html, '05 — Outcome');
  const production = sectionContaining(html, '06 — Production considerations');

  if (!troubleshooting || !outcome) continue;

  let outcomeInner = innerContainer(outcome.full);
  if (!outcomeInner) continue;

  outcomeInner = outcomeInner
    .replace('<span class="kicker">05 — Outcome</span>', '')
    .replace('<h2>What worked.</h2>', '<h2>Outcome.</h2>');

  const troubleshootingInner = innerContainer(troubleshooting.full);
  if (!troubleshootingInner) continue;

  const merged = `<section class="case-section alt case-results-section"><div class="container">${troubleshootingInner}\n${outcomeInner}\n</div></section>`;

  html = html.replace(troubleshooting.full, merged);
  html = html.replace(outcome.full, '');
  if (production) html = html.replace(production.full, '');

  // Force the latest EKS-parity CSS so the merged final section cannot reuse
  // the previously cached architecture/hero stylesheet response.
  html = html.replaceAll(
    'case-architecture-parity-20260911.css?v=20260911-1426',
    'case-architecture-parity-20260911.css?v=20260911-1505'
  );

  fs.writeFileSync(filePath, html);
  console.log(`Aligned final case-study section: ${relativePath}`);
}
