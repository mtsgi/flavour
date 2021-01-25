#!/usr/bin/env node
"use strict";

var _express = _interopRequireDefault(require("express"));

var _fs = _interopRequireDefault(require("fs"));

var _mustache = _interopRequireDefault(require("mustache"));

var _marked = _interopRequireDefault(require("marked"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

module.exports = /*#__PURE__*/function () {
  function Flavour(config) {
    var _this = this;

    _classCallCheck(this, Flavour);

    this.app = (0, _express.default)();
    this.config = config; // eslint-disable-next-line no-undef

    this.server = this.app.listen(process.env.PORT || 3000, function () {
      console.log('Flavour is listening to PORT:' + _this.server.address().port);
    });
    var vars = this;
    this.app.use('/assets', _express.default.static('assets'));
    this.app.get('/', function (req, res) {
      var template = Flavour.getTemplate('home', {
        config: _this.config
      });
      Flavour.render(res, template, _objectSpread(_objectSpread({}, vars), req));
    });
    this.app.get('/list', function (req, res) {
      var indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      var articleList = Object.entries(indexObject).map(function (c) {
        return _objectSpread(_objectSpread({}, c[1]), {}, {
          key: c[0]
        });
      });

      var listTemplate = _fs.default.readFileSync('pages/list.html');

      var template = _mustache.default.render(listTemplate.toString(), {
        articleList: articleList
      });

      Flavour.render(res, template, _objectSpread(_objectSpread({}, vars), req));
    });
    this.app.get('/new', function (req, res) {
      var formTemplate = _fs.default.readFileSync('pages/form.html');

      var template = _mustache.default.render(formTemplate.toString(), {
        title: _this.config.dict.newArticle || 'New article',
        buttonLabel: _this.config.dict.newArticleLabel || 'Create',
        action: './new',
        article: {
          key: req.query.key || 'key',
          title: _this.config.dict.defaultArticleTitle || 'Article Title',
          body: _this.config.dict.defaultArticleBody || '*Write here body of the article*'
        }
      });

      Flavour.render(res, template, _objectSpread(_objectSpread({}, vars), req));
    });
    this.app.get('/edit', function (req, res) {
      var key = req.query.key;
      var indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      var articleInfo = indexObject[key];
      if (!articleInfo) Flavour.render(res, 'ERROR', _objectSpread({}, vars));

      var formTemplate = _fs.default.readFileSync('pages/form.html');

      var template = _mustache.default.render(formTemplate.toString(), {
        title: _this.config.dict.editArticle || 'Edit article',
        buttonLabel: _this.config.dict.editArticleLabel || 'Update',
        action: './edit',
        editMode: true,
        article: {
          key: key,
          title: articleInfo.title,
          body: _fs.default.readFileSync("contents/".concat(key, "/").concat(articleInfo['lastModified'], ".md"))
        }
      });

      Flavour.render(res, template, _objectSpread(_objectSpread({}, vars), req));
    });
    this.app.get('/:key', function (req, res) {
      var template = Flavour.getTemplate(req.params.key, {
        config: vars.config
      });
      Flavour.render(res, template, _objectSpread(_objectSpread({}, vars), req));
    });
  }

  _createClass(Flavour, null, [{
    key: "getTemplate",
    value: function getTemplate(key) {
      var _option$config;

      var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      var articleInfo = indexObject[key];
      if (!articleInfo) return _fs.default.readFileSync('pages/notfound.html');
      articleInfo.key = key;

      var markdown = _fs.default.readFileSync("contents/".concat(key, "/").concat(articleInfo['lastModified'], ".md"));

      var articleTemplate = _fs.default.readFileSync('pages/article.html');

      return _mustache.default.render(articleTemplate.toString(), {
        info: articleInfo,
        body: (0, _marked.default)(String(markdown), (_option$config = option.config) === null || _option$config === void 0 ? void 0 : _option$config.markdown)
      });
    }
  }, {
    key: "render",
    value: function render(res, tmp, vars) {
      var pageTemplate = _mustache.default.render(tmp.toString(), _objectSpread(_objectSpread({}, res), vars));

      var appTemplate = _fs.default.readFileSync('pages/app.html');

      var renderTemplate = _mustache.default.render(appTemplate.toString(), _objectSpread(_objectSpread(_objectSpread({}, res), vars), {}, {
        main: pageTemplate
      }));

      res.send(renderTemplate);
    }
  }]);

  return Flavour;
}();
