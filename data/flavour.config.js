module.exports = {
  title: 'Sample Wiki',
  lang: 'ja',
  description: 'This is sample wiki of "Flavour".',
  style: '/assets/app.css',
  dict: {
    newArticle: '記事作成',
    newArticleLabel: '作成する',
    defaultArticleTitle: '記事タイトル',
    defaultArticleBody: '*ここに本文を記述してください*',
    editArticle: '記事編集',
    editArticleLabel: '更新する',
    allArticles: 'すべての記事'
  },
  markdown: {
    breaks: true,
    gfm: true
  },
  links: [
    {
      href: "/",
      label: "トップページ"
    },
    {
      href: "/snapshot",
      label: "現在のスナップショットを取得"
    },
    {
      href: "https://github.com/mtsgi/flavour",
      label: "Flavour GitHub repo"
    },
    {
      href: "https://www.npmjs.com/package/flavour-wiki",
      label: "flavour-wiki npm package"
    }
  ]
};
