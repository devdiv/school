const path = require('path');
const pluginConf = require('./config/pluginConf.js');
const navConf = require('./config/navConf.js');
const sidebarConf = require('./config/sidebarConf.js');
const headConf = require('./config/headConf.js');

module.exports = {
  bundler: '@vuepress/vite',
  bundlerConfig: {
    vuePluginOptions: {
      template: {
        compilerOptions: {
          isCustomElement: tag => ['mi', 'msup', 'mo', 'mrow', 'annotation', 'semantics', 'math', 'msub'].includes(tag)
        }
      }
    }
  },
  lang: 'zh-CN',
  title: 'School',
  description: '不抛弃，不放弃',
  base: '/school/',
  head: headConf,
  plugins: pluginConf,
  themeConfig: {
    logo: '/images/hero.png',
    lastUpdatedText: '上次更新',
    contributorsText: '贡献者',
    // custom containers
    tip: '提示',
    warning: '注意',
    danger: '警告',

    // 404 page
    notFound: [
      '这里什么都没有',
      '我们怎么到这来了？',
      '这是一个 404 页面',
      '看起来我们进入了错误的链接',
    ],
    backToHome: '返回首页',

    // a11y
    openInNewWindow: '在新窗口打开',
    toggleDarkMode: '切换夜间模式',
    toggleSidebar: '切换侧边栏',
    docsRepo: 'devdiv/school',
    editLinks: true,
    editLinkText: '在线编辑文档',
    docsDir: 'docs',
    docsBranch: 'master',
    navbar: navConf,
    sidebar: sidebarConf
  },
  markdown: {
    importCode: {
      handleImportPath: str => str.replace(/^@components/, path.resolve(__dirname, './components'))
    },
    code: {
      lineNumbers: false
    }
  },
}