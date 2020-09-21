#!/usr/bin/env node

const fs = require('fs');

['assets', 'pages'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

[
  'README.md',
  'index.js',
  'flavour.config.js',
  '.gitignore',
  'pages/index.html',
  'pages/app.html',
  'assets/app.css'
].forEach(filename => {
  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename,
      fs.readFileSync(`node_modules/flavour/data/${filename}`)
    );
  }  
});
