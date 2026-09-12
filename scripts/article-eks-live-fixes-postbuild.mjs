import fs from 'node:fs/promises';
import path from 'node:path';

const file = path.resolve('dist/articles/inside-amazon-eks.html');

try {
  let html = await fs.readFile(file, 'utf8');
  const version = '20260912-article-fix-3';

  if (!html.includes('article-eks-fixes-20260912.css')) {
    html = html.replace(
      '</head>',
      `<link rel="stylesheet" href="../assets/article-eks-fixes-20260912.css?v=${version}">\n</head>`
    );
  }

  html = html
    .replace('../assets/article-eks-20260912.css', `../assets/article-eks-20260912.css?v=${version}`)
    .replace(/<script src="\.\.\/assets\/article-eks-20260912\.js(?:\?[^\"]*)?"><\/script>/, `<script src="../assets/article-eks-fixes-20260912.js?v=${version}"></script>`)
    .replace(/<figure class="article-figure reveal"><div class="network-path-card">[\s\S]*?<\/figure>/, '')
    .replaceAll('eks-control-plane-vs-data-plane.webp"', `eks-control-plane-vs-data-plane.svg?v=${version}"`)
    .replaceAll('eks-identity-flow.webp"', `eks-identity-flow.svg?v=${version}"`)
    .replaceAll('eks-workload-dependencies.webp"', `eks-workload-dependencies.svg?v=${version}"`)
    .replaceAll('eks-deployment-lifecycle.webp"', `eks-deployment-lifecycle.svg?v=${version}"`)
    .replace(/<strong>Figure ([345])\.<\/strong>/g, (_, number) => {
      const mapped = { '3': '2', '4': '3', '5': '4' }[number];
      return `<strong>Figure ${mapped}.</strong>`;
    });

  await fs.writeFile(file, html);
  console.log('Applied EKS article behaviour fixes and supplied-diagram vector assets.');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
