#!/usr/bin/env node

const fs = require('fs');

['assets', 'pages'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

[
  'README.md',
  'index.js',
  'Procfile',
  'flavour.config.js',
  'pages/index.html',
  'pages/app.html',
  'assets/app.css'
].forEach(filename => {
  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename,
      fs.readFileSync(`node_modules/flavour-wiki/data/${filename}`)
    );
  }  
});
