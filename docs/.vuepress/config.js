const utils = require('./utils')

module.exports = {
  title: "School",
  description: '测试开发技术栈',
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
        text: '测试',
        link: '/testing/'
      },
      {
        text: '开发',
        link: '/develop/'
      },
      {
        text: '网站',
        link: '/website/'
      },
      {
        text: '读书',
        link: '/reading/'
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
