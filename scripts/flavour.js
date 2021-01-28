#!/usr/bin/env node
"use strict";

var _express = _interopRequireDefault(require("express"));

var _fs = _interopRequireDefault(require("fs"));

var _mustache = _interopRequireDefault(require("mustache"));

var _marked = _interopRequireDefault(require("marked"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _moment = _interopRequireDefault(require("moment"));

var _twemoji = _interopRequireDefault(require("twemoji"));

var _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

module.exports = (_temp = _class = /*#__PURE__*/function () {
  function Flavour(config) {
    var _this = this;

    _classCallCheck(this, Flavour);

    this.app = (0, _express.default)();
    this.config = config;
    this.server = this.app.listen(process.env.PORT || 3000, function () {
      console.log('Flavour is listening to PORT:' + _this.server.address().port);
      console.log("http://localhost:".concat(_this.server.address().port, "/"));
    });
    var vars = this;
    this.app.use('/assets', _express.default.static('assets'));
    this.app.use(_bodyParser.default.urlencoded({
      extended: true
    }));
    this.app.get('/', function (req, res) {
      var template = Flavour.getTemplate('home', {
        config: _this.config
      });
      Flavour.render(res, template, _objectSpread(_objectSpread({}, vars), req));
    });
    this.app.get('/list', function (req, res) {
      var indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      var articleList = Object.entries(indexObject).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            val = _ref2[1];

        return _objectSpread(_objectSpread({}, val), {}, {
          key: key
        });
      });

      var listTemplate = _fs.default.readFileSync('pages/list.html');

      var template = _mustache.default.render(listTemplate.toString(), {
        pageTitle: _this.config.dict.allArticles || 'List of all articles',
        articleList: articleList,
        Flavour: Flavour
      });

      Flavour.render(res, template, _objectSpread(_objectSpread({}, vars), req));
    });
    this.app.get('/tag', function (req, res) {
      var tagName = req.query.q;
      var indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      var articleList = Object.entries(indexObject).filter(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            key = _ref4[0],
            val = _ref4[1];

        return val.tags.includes(tagName);
      }).map(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            key = _ref6[0],
            val = _ref6[1];

        return _objectSpread(_objectSpread({}, val), {}, {
          key: key
        });
      });

      var listTemplate = _fs.default.readFileSync('pages/list.html');

      var template = _mustache.default.render(listTemplate.toString(), {
        pageTitle: "Tag: ".concat(tagName),
        tagName: tagName,
        articleList: articleList
      });

      Flavour.render(res, template, _objectSpread(_objectSpread({}, vars), req));
    });
    this.app.get('/new', function (req, res) {
      var formTemplate = _fs.default.readFileSync('pages/form.html');

      var template = _mustache.default.render(formTemplate.toString(), {
        title: _this.config.dict.newArticle || 'New article',
        buttonLabel: _this.config.dict.newArticleLabel || 'Create',
        action: '/new',
        article: {
          key: req.query.key || 'key',
          title: _this.config.dict.defaultArticleTitle || 'Article Title',
          body: _this.config.dict.defaultArticleBody || '*Write here body of the article*',
          tags: ''
        }
      });

      Flavour.render(res, template, _objectSpread(_objectSpread({}, vars), req), {
        rerender: false
      });
    });
    this.app.post('/new', function (req, res) {
      res.setHeader('Content-Type', 'text/plain');
      var params = req.body;
      var indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));

      if (Flavour.reservedKeys.includes(params.key)) {
        Flavour.renderError(res, "You cannot create ".concat(params.key, "."));
      } else if (indexObject[params.key]) {
        Flavour.renderError(res, "".concat(params.key, " already exists."));
      } else {
        var time = (0, _moment.default)().unix();
        indexObject[params.key] = {
          title: params.title,
          lastModified: time,
          revisions: [{
            title: params.title,
            time: time,
            ipaddr: req.ip
          }],
          tags: params.tags.split(',').map(function (t) {
            return t.trim();
          })
        };
        if (!_fs.default.existsSync("contents/".concat(params.key))) _fs.default.mkdirSync("contents/".concat(params.key));

        _fs.default.writeFileSync("contents/".concat(params.key, "/").concat(time, ".md"), params.body);

        _fs.default.writeFileSync("contents/index.json", JSON.stringify(indexObject, null, 2));

        res.redirect("/".concat(req.body.key));
      }
    });
    this.app.get('/edit/:key', function (req, res) {
      var key = req.params.key;
      var indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      var articleInfo = indexObject[key];
      if (!articleInfo) Flavour.renderError(res, "".concat(params.key, " is not found."));

      var formTemplate = _fs.default.readFileSync('pages/form.html');

      var template = _mustache.default.render(formTemplate.toString(), {
        title: _this.config.dict.editArticle || 'Edit article',
        buttonLabel: _this.config.dict.editArticleLabel || 'Update',
        action: '/edit',
        editMode: true,
        article: {
          key: key,
          title: articleInfo.title,
          body: _fs.default.readFileSync("contents/".concat(key, "/").concat(articleInfo['lastModified'], ".md")),
          tags: articleInfo.tags.join(', ')
        }
      });

      Flavour.render(res, template, _objectSpread(_objectSpread({}, vars), req), {
        rerender: false
      });
    });
    this.app.post('/edit', function (req, res) {
      res.setHeader('Content-Type', 'text/plain');
      var params = req.body;
      var indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));

      if (!indexObject[params.key]) {
        Flavour.renderError(res, "".concat(params.key, " is not found."));
      } else {
        var time = (0, _moment.default)().unix();
        indexObject[params.key] = _objectSpread(_objectSpread({}, indexObject[params.key]), {}, {
          title: params.title,
          lastModified: time,
          tags: params.tags.split(',').map(function (t) {
            return t.trim();
          })
        });
        indexObject[params.key].revisions.push({
          title: params.title,
          time: time,
          ipaddr: req.ip
        });

        _fs.default.writeFileSync("contents/".concat(params.key, "/").concat(time, ".md"), params.body);

        _fs.default.writeFileSync("contents/index.json", JSON.stringify(indexObject, null, 2));

        res.redirect("/".concat(req.body.key));
      }
    });
    this.app.get('/revision/:key', function (req, res) {
      var key = req.params.key;
      var indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      var articleInfo = indexObject[key];
      if (!articleInfo) Flavour.renderError(res, "".concat(params.key, " is not found."));

      var pageTemplate = _fs.default.readFileSync('pages/revision.html');

      var template = _mustache.default.render(pageTemplate.toString(), _objectSpread({
        key: key
      }, articleInfo));

      Flavour.render(res, template, _objectSpread(_objectSpread({}, vars), req));
    });
    this.app.get('/revision/:key/:timestamp', function (req, res) {
      var key = req.params.key;
      var timestamp = req.params.timestamp;
      var indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      var articleInfo = indexObject[key];
      if (!articleInfo) Flavour.renderError(res, "".concat(params.key, " is not found."));
      var template = Flavour.getTemplate(req.params.key, {
        config: _this.config,
        revision: timestamp
      });
      Flavour.render(res, template, _objectSpread(_objectSpread({}, vars), req));
    });
    this.app.get('/:key', function (req, res) {
      var template = Flavour.getTemplate(req.params.key, {
        config: _this.config
      });
      Flavour.render(res, template, _objectSpread(_objectSpread({}, vars), req));
    });
  }

  _createClass(Flavour, null, [{
    key: "getTemplate",
    value: function getTemplate(key) {
      var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        config: {},
        revision: null
      };
      var indexObject = JSON.parse(_fs.default.readFileSync('contents/index.json'));
      var articleInfo = indexObject[key];
      if (!articleInfo) return _fs.default.readFileSync('pages/notfound.html');
      var timestamp = option.revision || articleInfo['lastModified'];
      var revisionInfo = articleInfo.revisions.find(function (r) {
        return String(r.time) === String(timestamp);
      });

      var markdown = _fs.default.readFileSync("contents/".concat(key, "/").concat(timestamp, ".md"));

      var articleTemplate = _fs.default.readFileSync('pages/article.html');

      return _twemoji.default.parse(_mustache.default.render(articleTemplate.toString(), {
        key: key,
        info: revisionInfo,
        article: articleInfo,
        formattedTime: Flavour.formatTime(timestamp),
        body: (0, _marked.default)(String(markdown), option.config.markdown),
        revision: option.revision || false
      }));
    }
  }, {
    key: "render",
    value: function render(res, tmp, vars) {
      var option = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
        rerender: true
      };
      var pageTemplate = option.rerender ? _mustache.default.render(tmp.toString(), _objectSpread(_objectSpread({}, res), vars)) : tmp.toString();

      var appTemplate = _fs.default.readFileSync('pages/app.html');

      var renderTemplate = _mustache.default.render(appTemplate.toString(), _objectSpread(_objectSpread(_objectSpread({}, res), vars), {}, {
        main: pageTemplate
      }));

      res.send(renderTemplate);
    }
  }, {
    key: "renderError",
    value: function renderError(res, message) {
      res.send(message);
    }
  }, {
    key: "formatTime",
    value: function formatTime(time) {
      return _moment.default.unix(time).format("YYYY-MM-DD HH:mm:ss Z");
    }
  }]);

  return Flavour;
}(), _defineProperty(_class, "reservedKeys", ['new', 'edit', 'list', 'revision']), _temp);
