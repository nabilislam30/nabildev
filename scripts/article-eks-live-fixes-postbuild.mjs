import fs from 'node:fs/promises';
import path from 'node:path';

const file = path.resolve('dist/articles/inside-amazon-eks.html');

try {
  let html = await fs.readFile(file, 'utf8');
  const version = '20260912-article-fix-1';

  html = html
    .replace('../assets/article-eks-20260912.css', `../assets/article-eks-20260912.css?v=${version}`)
    .replace('../assets/article-eks-20260912.js', `../assets/article-eks-20260912.js?v=${version}`)
    .replaceAll('eks-control-plane-vs-data-plane.webp"', `eks-control-plane-vs-data-plane.webp?v=${version}"`)
    .replaceAll('eks-identity-flow.webp"', `eks-identity-flow.webp?v=${version}"`)
    .replaceAll('eks-workload-dependencies.webp"', `eks-workload-dependencies.webp?v=${version}"`)
    .replaceAll('eks-deployment-lifecycle.webp"', `eks-deployment-lifecycle.webp?v=${version}"`);

  await fs.writeFile(file, html);
  console.log('Applied EKS article cache-busting fixes.');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
