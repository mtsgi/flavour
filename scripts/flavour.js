#!/usr/bin/env node

const express = require('express');
const fs = require('fs');
const mustache = require('mustache');
const marked = require('marked');

module.exports = class Flavour {
  constructor(config) {
    this.app = express();
    this.config = config;
    // eslint-disable-next-line no-undef
    this.server = this.app.listen(process.env.PORT || 3000, function () {
      console.log('Flavour is listening to PORT:' + this.address().port);
    });
    const vars = this;

    this.app.use('/assets', express.static('assets'));
    this.app.get('/', function (req, res) {
      const template = Flavour.getTemplate('home', { config: vars.config });
      Flavour.render(res, template, { ...vars, ...req });
    });
    this.app.get('/:title', function (req, res) {
      const template = Flavour.getTemplate(req.params.title, { config: vars.config });
      Flavour.render(res, template, { ...vars, ...req });
    });
  }

  static getTemplate(key, option = {}) {
    const indexObject = JSON.parse(fs.readFileSync('contents/index.json'));
    const articleInfo = indexObject[key];
    if (!articleInfo) return fs.readFileSync('pages/notfound.html');
    articleInfo.key = key;
    const markdown = fs.readFileSync(`contents/${key}/${articleInfo['lastModified']}.md`);

    const articleTemplate = fs.readFileSync('pages/article.html');
    return mustache.render(articleTemplate.toString(), {
      info: articleInfo,
      body: marked(String(markdown), option.config?.markdown)
    });
  }

  static render(res, tmp, vars) {
    const pageTemplate = mustache.render(tmp.toString(), { ...res, ...vars });
    const appTemplate = fs.readFileSync('pages/app.html');
    const renderTemplate = mustache.render(appTemplate.toString(), { ...res, ...vars, main: pageTemplate });
    res.send(renderTemplate);
  }
};
