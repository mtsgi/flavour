#!/usr/bin/env node

const fs = require('fs');
const force = false;

[
  'assets',
  'pages',
  'contents',
  'contents/home',
  'contents/about',
  'contents/practice'
].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

[
  'README.md',
  'index.js',
  'Procfile',
  'flavour.config.js',
  'pages/app.html',
  'pages/article.html',
  'pages/error.html',
  'pages/notfound.html',
  'pages/list.html',
  'pages/form.html',
  'pages/revision.html',
  'assets/app.css',
  'contents/index.json',
  'contents/home/1.md',
  'contents/about/1.md',
  'contents/practice/1.md'
].forEach(filename => {
  if (force || !fs.existsSync(filename)) {
    fs.writeFileSync(filename,
      fs.readFileSync(`node_modules/flavour-wiki/data/${filename}`)
    );
  }
});

if (force || !fs.existsSync('.gitignore')) {
  fs.writeFileSync('.gitignore',
    fs.readFileSync('node_modules/flavour-wiki/data/gitignore.txt')
  );
}
