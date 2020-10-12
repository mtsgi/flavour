#!/usr/bin/env node

const fs = require('fs');

['assets', 'pages', 'config', 'migrations'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

[
  'README.md',
  'index.js',
  'Procfile',
  '.gitignore',
  '.env',
  'docker-compose.yml',
  'flavour.config.js',
  'pages/index.html',
  'pages/app.html',
  'assets/app.css',
  'config/config.json',
  'migrations/0-create-article.js'
].forEach(filename => {
  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename,
      fs.readFileSync(`node_modules/flavour-wiki/data/${filename}`)
    );
  }  
});

