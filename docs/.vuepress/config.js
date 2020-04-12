const utils = require('./utils')

module.exports = {
  title: 'notes',
  description: '个人收藏夹',
  base: '/notes/',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/favicon.ico'
      }
    ]
  ],
  themeConfig: {
    nav: [
      {
        text: '首页',
        link: '/'
      },
      {
        text: '测试',
        link: '/test/'
      },
      {
        text: '开发',
        link: '/dev/'
      },
      {
        text: '网站',
        link: '/website/'
      },
      {
        text: '阅读',
        link: '/diary/read'
      },
      {
        text: '文章',
        link: '/article/'
      },
      {
        text: '博客',
        link: '/blog/'
      },
      {
        text: '面试',
        link: '/interview/'
      }
  
    ],
    sidebar: utils.inferSiderbars(),
    lastUpdated: '上次更新',
    repo: 'devdiv/notes',
    editLinks: true,
    docsDir: 'docs',
    editLinkText: '在 GitHub 上编辑此页',
    sidebarDepth: 3
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@public': './public'
      }
    }
  },
  ga: 'UA-109340118-1',
  markdown: {
    config: md => {
      // use more markdown-it plugins!
      md.use(require('markdown-it-include'))
    }
  }
}
