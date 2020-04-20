const utils = require('./utils')

module.exports = {
  title: 'School',
  description: '测试、开发、读书、分享',
  base: '/school/',
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
        text: '工具',
        link: '/tools/'
      },
      {
        text: '文章',
        link: '/article/'
      },
      {
        text: '测试',
        link: '/testing/'
      },
      {
        text: '开发',
        link: '/develop/'
      },
      {
        text: '博客',
        link: '/blog/'
      },
      {
        text: '读书',
        link: '/reading/'
      }
    ],
    sidebar: utils.inferSiderbars(),
    lastUpdated: '上次更新',
    repo: 'devdiv/school',
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
