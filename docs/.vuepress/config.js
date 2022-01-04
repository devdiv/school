const utils = require('./utils')

module.exports = {
  title: 'tschool',
  description: '测试知识共享平台',
  base: '/tschool/',
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
        text: '收藏',
        link: '/website/'
      },
      {
        text: '基础',
        link: '/base/'
      },
      {
        text: '工具',
        link: '/tool/'
      },
      {
        text: '测试',
        link: '/test/'
      },
      {
        text: '开发',
        link: '/dev/'
      }
    ],
    sidebar: utils.inferSiderbars(),
    lastUpdated: '上次更新',
    repo: 'devdiv/tschool',
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
