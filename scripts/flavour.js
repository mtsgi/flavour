#!/usr/bin/env node
// Flavour | The Easiest Wiki System
// MIT License
// Copyright (c) 2021 mtsgi
"use strict";

var _express = _interopRequireDefault(require("express"));

var _fs = _interopRequireDefault(require("fs"));

var _mustache = _interopRequireDefault(require("mustache"));

var _marked = _interopRequireDefault(require("marked"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _moment = _interopRequireDefault(require("moment"));

var _twemoji = _interopRequireDefault(require("twemoji"));

var _archiver = _interopRequireDefault(require("archiver"));

var _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

module.exports = (_temp = _class = class Flavour {
  constructor(config) {
    this.app = (0, _express.default)();
    this.config = config;
    this.server = this.app.listen(process.env.PORT || 3000, () => {
      console.log('Flavour is listening to PORT:' + this.server.address().port);
      console.log(`http://localhost:${this.server.address().port}/`);
    });
    const vars = this;
    this.app.use('/assets', _express.default.static('assets'));
    this.app.use(_bodyParser.default.urlencoded({
      extended: true
    }));
    this.app.get('/', (req, res) => {
      const template = Flavour.getTemplate('home', {
        config: this.config
      });
      Flavour.render(res, template, { ...vars,
        ...req
      });
    });
    this.app.get('/list', (req, res) => {
      const indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      const articleList = Object.entries(indexObject).map(([key, val]) => {
        return { ...val,
          key
        };
      });

      const listTemplate = _fs.default.readFileSync('pages/list.html');

      const template = _mustache.default.render(listTemplate.toString(), {
        pageTitle: this.config.dict.allArticles || 'List of all articles',
        articleList,
        Flavour
      });

      Flavour.render(res, template, { ...vars,
        ...req
      });
    });
    this.app.get('/snapshot', async (req, res) => {
      const time = String((0, _moment.default)().unix());
      await Flavour.snapshot(time);
      await res.download(`${time}.zip`, null, () => {
        _fs.default.unlinkSync(`${time}.zip`);
      });
    });
    this.app.get('/tag', (req, res) => {
      const tagName = req.query.q;
      const indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      const articleList = Object.entries(indexObject).filter(([key, val]) => {
        return val.tags.includes(tagName);
      }).map(([key, val]) => {
        return { ...val,
          key
        };
      });

      const listTemplate = _fs.default.readFileSync('pages/list.html');

      const template = _mustache.default.render(listTemplate.toString(), {
        pageTitle: `Tag: ${tagName}`,
        tagName,
        articleList
      });

      Flavour.render(res, template, { ...vars,
        ...req
      });
    });
    this.app.get('/new', (req, res) => {
      const formTemplate = _fs.default.readFileSync('pages/form.html');

      const template = _mustache.default.render(formTemplate.toString(), {
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

      Flavour.render(res, template, { ...vars,
        ...req
      }, {
        rerender: false
      });
    });
    this.app.post('/new', (req, res) => {
      res.setHeader('Content-Type', 'text/plain');
      const params = req.body;
      const indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));

      if (Flavour.reservedKeys.includes(params.key)) {
        Flavour.renderError(res, `You cannot create ${params.key}.`);
      } else if (indexObject[params.key]) {
        Flavour.renderError(res, `${params.key} already exists.`);
      } else {
        const time = (0, _moment.default)().unix();
        indexObject[params.key] = {
          title: params.title,
          lastModified: time,
          revisions: [{
            title: params.title,
            time,
            ipaddr: req.ip
          }],
          tags: params.tags.split(',').map(t => t.trim())
        };
        if (!_fs.default.existsSync(`contents/${params.key}`)) _fs.default.mkdirSync(`contents/${params.key}`);

        _fs.default.writeFileSync(`contents/${params.key}/${time}.md`, params.body);

        _fs.default.writeFileSync("contents/index.json", JSON.stringify(indexObject, null, 2));

        res.redirect(`/${req.body.key}`);
      }
    });
    this.app.get('/edit/:key', (req, res) => {
      const key = req.params.key;
      const indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      const articleInfo = indexObject[key];
      if (!articleInfo) Flavour.renderError(res, `${params.key} is not found.`);

      const formTemplate = _fs.default.readFileSync('pages/form.html');

      const template = _mustache.default.render(formTemplate.toString(), {
        title: this.config.dict.editArticle || 'Edit article',
        buttonLabel: this.config.dict.editArticleLabel || 'Update',
        action: '/edit',
        editMode: true,
        article: {
          key,
          title: articleInfo.title,
          body: _fs.default.readFileSync(`contents/${key}/${articleInfo['lastModified']}.md`),
          tags: articleInfo.tags.join(', ')
        }
      });

      Flavour.render(res, template, { ...vars,
        ...req
      }, {
        rerender: false
      });
    });
    this.app.post('/edit', (req, res) => {
      res.setHeader('Content-Type', 'text/plain');
      const params = req.body;
      const indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));

      if (!indexObject[params.key]) {
        Flavour.renderError(res, `${params.key} is not found.`);
      } else {
        const time = (0, _moment.default)().unix();
        indexObject[params.key] = { ...indexObject[params.key],
          title: params.title,
          lastModified: time,
          tags: params.tags.split(',').map(t => t.trim())
        };
        indexObject[params.key].revisions.push({
          title: params.title,
          time,
          ipaddr: req.ip
        });

        _fs.default.writeFileSync(`contents/${params.key}/${time}.md`, params.body);

        _fs.default.writeFileSync("contents/index.json", JSON.stringify(indexObject, null, 2));

        res.redirect(`/${req.body.key}`);
      }
    });
    this.app.get('/revision/:key', (req, res) => {
      const key = req.params.key;
      const indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      const articleInfo = indexObject[key];
      if (!articleInfo) Flavour.renderError(res, `${params.key} is not found.`);

      const pageTemplate = _fs.default.readFileSync('pages/revision.html');

      const template = _mustache.default.render(pageTemplate.toString(), {
        key,
        ...articleInfo
      });

      Flavour.render(res, template, { ...vars,
        ...req
      });
    });
    this.app.get('/revision/:key/:timestamp', (req, res) => {
      const key = req.params.key;
      const timestamp = req.params.timestamp;
      const indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      const articleInfo = indexObject[key];
      if (!articleInfo) Flavour.renderError(res, `${params.key} is not found.`);
      const template = Flavour.getTemplate(req.params.key, {
        config: this.config,
        revision: timestamp
      });
      Flavour.render(res, template, { ...vars,
        ...req
      });
    });
    this.app.get('/:key', (req, res) => {
      const template = Flavour.getTemplate(req.params.key, {
        config: this.config
      });
      Flavour.render(res, template, { ...vars,
        ...req
      });
    }); // Flavour APIs

    this.app.get('/api/index', (req, res) => {
      const indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      const articleList = Object.entries(indexObject).map(([key, val]) => {
        return { ...val,
          key
        };
      });
      res.json({ ...articleList,
        status: 200
      });
    });
    this.app.get('/api/:key', (req, res) => {
      const key = req.params.key;
      const indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      const articleInfo = indexObject[key];
      if (!articleInfo) res.json({
        status: 404
      });else {
        const timestamp = articleInfo['lastModified'];

        const body = _fs.default.readFileSync(`contents/${key}/${timestamp}.md`);

        res.json({ ...articleInfo,
          body: String(body),
          status: 200
        });
      }
    });
  }

  static async snapshot(time) {
    const filename = `${time}.zip`;

    const archive = _archiver.default.create('zip', {
      zlib: {
        level: 9
      }
    });

    const output = _fs.default.createWriteStream(filename);

    archive.pipe(output);
    archive.glob('contents/**/*');
    await archive.finalize();
    return;
  }

  static getTemplate(key, option = {
    config: {},
    revision: null
  }) {
    const indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
    const articleInfo = indexObject[key];
    if (!articleInfo) return _fs.default.readFileSync('pages/notfound.html');
    const timestamp = option.revision || articleInfo['lastModified'];
    const revisionInfo = articleInfo.revisions.find(r => String(r.time) === String(timestamp));

    const markdown = _fs.default.readFileSync(`contents/${key}/${timestamp}.md`);

    const articleTemplate = _fs.default.readFileSync('pages/article.html');

    return _twemoji.default.parse(_mustache.default.render(articleTemplate.toString(), {
      key,
      info: revisionInfo,
      article: articleInfo,
      formattedTime: Flavour.formatTime(timestamp),
      body: (0, _marked.default)(String(markdown), option.config.markdown),
      revision: option.revision || false
    }));
  }

  static render(res, tmp, vars, option = {
    rerender: true
  }) {
    const pageTemplate = option.rerender ? _mustache.default.render(tmp.toString(), { ...res,
      ...vars
    }) : tmp.toString();

    const appTemplate = _fs.default.readFileSync('pages/app.html');

    const renderTemplate = _mustache.default.render(appTemplate.toString(), { ...res,
      ...vars,
      main: pageTemplate
    });

    res.send(renderTemplate);
  }

  static renderError(res, message) {
    res.send(message);
  }

  static formatTime(time) {
    return _moment.default.unix(time).format("YYYY-MM-DD HH:mm:ss Z");
  }

}, _defineProperty(_class, "reservedKeys", ['', 'new', 'edit', 'list', 'revision']), _temp);
