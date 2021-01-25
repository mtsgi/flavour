![Flavour](resources/banner.png "Flavour | The Easiest Wiki System")

![npm](https://img.shields.io/npm/v/flavour-wiki?style=flat-square)
![GitHub top language](https://img.shields.io/github/languages/top/mtsgi/flavour?style=flat-square)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/flavour-wiki?style=flat-square)
![npm](https://img.shields.io/npm/dt/flavour-wiki?style=flat-square)
![GitHub](https://img.shields.io/github/license/mtsgi/flavour?style=flat-square)

Flavourは、Node.js向けのモダンで拡張性に富んだオープンソースのWikiフレームワークです。

## Getting Started

パッケージをインストール後、 `flavour-init` スクリプトを実行することで、ディレクトリに必要なファイルが展開されます。

```sh
yarn add flavour-wiki
# npm または yarn でインストール

yarn run flavour-init
# 初期化が実行されます

yarn run flavour-serve
# => http://localhost:3000
```

## Customize

初期化コマンドを実行後、以下のようなディレクトリおよびファイルが生成されます。

`/pages` 以下にはWikiアプリケーションとしてのページのテンプレート、 `/contents` 以下に各Wiki記事のデータが保存されています。

`/assets` ディレクトリ以下の内容は静的ファイルとしてアプリケーションの `/assets` 以下にホスティングされます。

```
/(root)
　├ flavour.config.js
　├ Procfile
　├ pages/
　│　├ app.html
　│　├ article.html
　│　├ form.html
　│　︙
　├ contents/
　│　├ home/
　│　├ about/
　│　├ practice/
　│　└ index.json
　└ assets/
```

Wikiの情報をカスタマイズするには、ディレクトリに生成される `flavour.config.js` を編集します。

```js
module.exports = {
  title, // Wikiのタイトル
  lang, // 言語
  description, // 説明文
  style, // スタイルシートのパス
  dict: {}, // i18n用の辞書
  markdown: {} // Markdown変換オプション
};
```

## Transpile

```
yarn build
```
