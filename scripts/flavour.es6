#!/usr/bin/env node

import express from 'express';
import fs from 'fs';
import mustache from 'mustache';
import marked from 'marked';

module.exports = class Flavour {
  constructor(config) {
    this.app = express();
    this.config = config;
    // eslint-disable-next-line no-undef
    this.server = this.app.listen(process.env.PORT || 3000, () => {
      console.log('Flavour is listening to PORT:' + this.server.address().port);
    });
    const vars = this;

    this.app.use('/assets', express.static('assets'));

    this.app.get('/', (req, res) => {
      const template = Flavour.getTemplate('home', { config: this.config });
      Flavour.render(res, template, { ...vars, ...req });
    });

    this.app.get('/list', (req, res) => {
      const indexObject = JSON.parse(fs.readFileSync('contents/index.json'));
      const articleList = Object.entries(indexObject).map(c => {
        return { ...c[1], key: c[0] };
      });
      const listTemplate = fs.readFileSync('pages/list.html');
      const template = mustache.render(listTemplate.toString(), {
        articleList
      });
      Flavour.render(res, template, { ...vars, ...req });
    });

    this.app.get('/new', (req, res) => {
      const formTemplate = fs.readFileSync('pages/form.html');
      const template = mustache.render(formTemplate.toString(), {
        title: this.config.dict.newArticle || 'New article',
        buttonLabel: this.config.dict.newArticleLabel || 'Create',
        action: './new',
        article: {
          key: req.query.key || 'key',
          title: this.config.dict.defaultArticleTitle || 'Article Title',
          body: this.config.dict.defaultArticleBody || '*Write here body of the article*'
        }
      });
      Flavour.render(res, template, { ...vars, ...req });
    });

    this.app.get('/edit', (req, res) => {
      const key = req.query.key;
      const indexObject = JSON.parse(fs.readFileSync('contents/index.json'));
      const articleInfo = indexObject[key];
      if (!articleInfo) Flavour.render(res, 'ERROR', { ...vars });

      const formTemplate = fs.readFileSync('pages/form.html');
      const template = mustache.render(formTemplate.toString(), {
        title: this.config.dict.editArticle || 'Edit article',
        buttonLabel: this.config.dict.editArticleLabel || 'Update',
        action: './edit',
        editMode: true,
        article: {
          key,
          title: articleInfo.title,
          body: fs.readFileSync(`contents/${key}/${articleInfo['lastModified']}.md`)
        }
      });
      Flavour.render(res, template, { ...vars, ...req });
    });

    this.app.get('/:key', function (req, res) {
      const template = Flavour.getTemplate(req.params.key, { config: vars.config });
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
