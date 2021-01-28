#!/usr/bin/env node

import express from 'express';
import fs from 'fs';
import mustache from 'mustache';
import marked from 'marked';
import bodyParser from 'body-parser';
import moment from 'moment';
import twemoji from 'twemoji';

module.exports = class Flavour {
  constructor(config) {
    this.app = express();
    this.config = config;
    this.server = this.app.listen(process.env.PORT || 3000, () => {
      console.log('Flavour is listening to PORT:' + this.server.address().port);
      console.log(`http://localhost:${this.server.address().port}/`);
    });
    const vars = this;

    this.app.use('/assets', express.static('assets'));
    this.app.use(bodyParser.urlencoded({extended: true}));

    this.app.get('/', (req, res) => {
      const template = Flavour.getTemplate('home', { config: this.config });
      Flavour.render(res, template, { ...vars, ...req });
    });

    this.app.get('/list', (req, res) => {
      const indexObject = JSON.parse(fs.readFileSync('contents/index.json'));
      const articleList = Object.entries(indexObject).map(([key, val]) => {
        return { ...val, key }
      });
      const listTemplate = fs.readFileSync('pages/list.html');
      const template = mustache.render(listTemplate.toString(), {
        pageTitle: this.config.dict.allArticles || 'List of all articles',
        articleList,
        Flavour
      });
      Flavour.render(res, template, { ...vars, ...req });
    });

    this.app.get('/tag', (req, res) => {
      const tagName = req.query.q;
      const indexObject = JSON.parse(fs.readFileSync('contents/index.json'));
      const articleList = Object.entries(indexObject).filter(([key, val]) => {
        return val.tags.includes(tagName)
      }).map(([key, val]) => {
        return { ...val, key };
      });
      const listTemplate = fs.readFileSync('pages/list.html');
      const template = mustache.render(listTemplate.toString(), {
        pageTitle: `Tag: ${tagName}`,
        tagName,
        articleList
      });
      Flavour.render(res, template, { ...vars, ...req });
    });

    this.app.get('/new', (req, res) => {
      const formTemplate = fs.readFileSync('pages/form.html');
      const template = mustache.render(formTemplate.toString(), {
        title: this.config.dict.newArticle || 'New article',
        buttonLabel: this.config.dict.newArticleLabel || 'Create',
        action: '/new',
        article: {
          key: req.query.key || 'key',
          title: this.config.dict.defaultArticleTitle || 'Article Title',
          body: this.config.dict.defaultArticleBody || '*Write here body of the article*',
          tags: ''
        }
      });
      Flavour.render(res, template, { ...vars, ...req }, { rerender: false });
    });

    this.app.post('/new', (req, res) => {
      res.setHeader('Content-Type', 'text/plain');
      const params = req.body;
      const indexObject = JSON.parse(fs.readFileSync('contents/index.json'));
      if (Flavour.reservedKeys.includes(params.key)) {
        Flavour.renderError(res, `You cannot create ${params.key}.`);
      }
      else if (indexObject[params.key]) {
        Flavour.renderError(res, `${params.key} already exists.`);
      }
      else {
        const time = moment().unix();
        indexObject[params.key] = {
          title: params.title,
          lastModified: time,
          revisions: [
            {
              title: params.title,
              time,
              ipaddr: req.ip
            }
          ],
          tags: params.tags.split(',').map(t => t.trim())
        };
        if (!fs.existsSync(`contents/${params.key}`)) fs.mkdirSync(`contents/${params.key}`);
        fs.writeFileSync(`contents/${params.key}/${time}.md`, params.body);
        fs.writeFileSync("contents/index.json", JSON.stringify(indexObject, null, 2));
        res.redirect(`/${req.body.key}`);
      }
    });

    this.app.get('/edit/:key', (req, res) => {
      const key = req.params.key;
      const indexObject = JSON.parse(fs.readFileSync('contents/index.json'));
      const articleInfo = indexObject[key];
      if (!articleInfo) Flavour.renderError(res, `${params.key} is not found.`);

      const formTemplate = fs.readFileSync('pages/form.html');
      const template = mustache.render(formTemplate.toString(), {
        title: this.config.dict.editArticle || 'Edit article',
        buttonLabel: this.config.dict.editArticleLabel || 'Update',
        action: '/edit',
        editMode: true,
        article: {
          key,
          title: articleInfo.title,
          body: fs.readFileSync(`contents/${key}/${articleInfo['lastModified']}.md`),
          tags: articleInfo.tags.join(', ')
        }
      });
      Flavour.render(res, template, { ...vars, ...req }, { rerender: false });
    });

    this.app.post('/edit', (req, res) => {
      res.setHeader('Content-Type', 'text/plain');
      const params = req.body;
      const indexObject = JSON.parse(fs.readFileSync('contents/index.json'));
      if (!indexObject[params.key]) {
        Flavour.renderError(res, `${params.key} is not found.`);
      }
      else {
        const time = moment().unix();
        indexObject[params.key] = {
          ...indexObject[params.key],
          title: params.title,
          lastModified: time,
          tags: params.tags.split(',').map(t => t.trim())
        };
        indexObject[params.key].revisions.push({
          title: params.title,
          time,
          ipaddr: req.ip
        })
        fs.writeFileSync(`contents/${params.key}/${time}.md`, params.body);
        fs.writeFileSync("contents/index.json", JSON.stringify(indexObject, null, 2));
        res.redirect(`/${req.body.key}`);
      }
    });

    this.app.get('/revision/:key', (req, res) => {
      const key = req.params.key;
      const indexObject = JSON.parse(fs.readFileSync('contents/index.json'));
      const articleInfo = indexObject[key];
      if (!articleInfo) Flavour.renderError(res, `${params.key} is not found.`);
      const pageTemplate = fs.readFileSync('pages/revision.html');
      const template = mustache.render(pageTemplate.toString(), {
        key,
        ...articleInfo
      });
      Flavour.render(res, template, { ...vars, ...req });
    });

    this.app.get('/revision/:key/:timestamp', (req, res) => {
      const key = req.params.key;
      const timestamp = req.params.timestamp;
      const indexObject = JSON.parse(fs.readFileSync('contents/index.json'));
      const articleInfo = indexObject[key];
      if (!articleInfo) Flavour.renderError(res, `${params.key} is not found.`);
      
      const template = Flavour.getTemplate(req.params.key, {
        config: this.config,
        revision: timestamp
      });
      Flavour.render(res, template, { ...vars, ...req });
    });

    this.app.get('/:key', (req, res) => {
      const template = Flavour.getTemplate(req.params.key, { config: this.config });
      Flavour.render(res, template, { ...vars, ...req });
    });
  }

  static getTemplate(key, option = {
    config: {},
    revision: null
  }) {
    const indexObject = JSON.parse(fs.readFileSync('contents/index.json'));
    const articleInfo = indexObject[key];
    if (!articleInfo) return fs.readFileSync('pages/notfound.html');
    const timestamp = option.revision || articleInfo['lastModified'];
    const revisionInfo = articleInfo.revisions.find(r => String(r.time) === String(timestamp));

    const markdown = fs.readFileSync(`contents/${key}/${timestamp}.md`);
    const articleTemplate = fs.readFileSync('pages/article.html');
    return twemoji.parse(
        mustache.render(articleTemplate.toString(), {
        key,
        info: revisionInfo,
        article: articleInfo,
        formattedTime: Flavour.formatTime(timestamp),
        body: marked(String(markdown), option.config.markdown),
        revision: option.revision || false
      })
    );
  }

  static render(res, tmp, vars, option = {
    rerender: true
  }) {
    const pageTemplate = option.rerender ? mustache.render(tmp.toString(), { ...res, ...vars }) : tmp.toString();
    const appTemplate = fs.readFileSync('pages/app.html');
    const renderTemplate = mustache.render(appTemplate.toString(), { ...res, ...vars, main: pageTemplate });
    res.send(renderTemplate);
  }

  static renderError(res, message) {
    res.send(message);
  }

  static formatTime(time) {
    return moment.unix(time).format("YYYY-MM-DD HH:mm:ss Z");
  }

  static reservedKeys = [
    'new', 'edit', 'list', 'revision'
  ]
};
