import fs from 'node:fs/promises';
import path from 'node:path';

const file = path.resolve('dist/articles/inside-amazon-eks.html');

try {
  let html = await fs.readFile(file, 'utf8');
  const version = '20260912-article-fix-5';

  html = html
    .replace(/\.\.\/assets\/article-eks-20260912\.css(?:\?[^\"]*)?/, `../assets/article-eks-20260912.css?v=${version}`)
    .replace(/\.\.\/assets\/article-eks-20260912\.js(?:\?[^\"]*)?/, `../assets/article-eks-20260912.js?v=${version}`)
    .replace(/<link rel="stylesheet" href="\.\.\/assets\/article-eks-fixes-20260912\.css[^>]*>\s*/g, '')
    .replace(/<script src="\.\.\/assets\/article-eks-fixes-20260912\.js[^>]*><\/script>\s*/g, '')
    .replace(/<figure class="[^"]*article-figure[^"]*">\s*<div class="network-path-card">[\s\S]*?<\/figure>/, '');

  await fs.writeFile(file, html);
  console.log('Applied EKS article cache-busting and removed the obsolete network placeholder.');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
