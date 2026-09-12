import fs from 'node:fs/promises';
import path from 'node:path';

const file = path.resolve('dist/articles/inside-amazon-eks.html');

try {
  let html = await fs.readFile(file, 'utf8');
  const version = '20260912-article-fix-2';

  if (!html.includes('article-eks-fixes-20260912.css')) {
    html = html.replace(
      '</head>',
      `<link rel="stylesheet" href="../assets/article-eks-fixes-20260912.css?v=${version}">\n</head>`
    );
  }

  html = html
    .replace('../assets/article-eks-20260912.css', `../assets/article-eks-20260912.css?v=${version}`)
    .replace(/<script src="\.\.\/assets\/article-eks-20260912\.js(?:\?[^\"]*)?"><\/script>/, `<script src="../assets/article-eks-fixes-20260912.js?v=${version}"></script>`)
    .replaceAll('eks-control-plane-vs-data-plane.webp"', `eks-control-plane-vs-data-plane.webp?v=${version}"`)
    .replaceAll('eks-identity-flow.webp"', `eks-identity-flow.webp?v=${version}"`)
    .replaceAll('eks-workload-dependencies.webp"', `eks-workload-dependencies.webp?v=${version}"`)
    .replaceAll('eks-deployment-lifecycle.webp"', `eks-deployment-lifecycle.webp?v=${version}"`);

  await fs.writeFile(file, html);
  console.log('Applied EKS article behaviour, styling and diagram cache fixes.');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
