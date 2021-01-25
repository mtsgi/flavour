#!/usr/bin/env node

const fs = require('fs');

['assets', 'pages', 'contents', 'contents/home'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

[
  'README.md',
  'index.js',
  'Procfile',
  'flavour.config.js',
  'pages/app.html',
  'pages/article.html',
  'pages/notfound.html',
  'assets/app.css',
  'contents/index.json',
  'contents/home/1.md'
].forEach(filename => {
  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename,
      fs.readFileSync(`node_modules/flavour-wiki/data/${filename}`)
    );
  }  
});
