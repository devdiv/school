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
  title: '软件测试知识库',
  description: '软件测试知识学习笔记',
  base: '/tschool/',
  head: headConf,
  plugins: pluginConf,
  themeConfig: {
    logo: '/hero.png',
    lastUpdatedText: '上次更新',
    contributorsText: '贡献者',
    docsRepo: 'devdiv/tschool',
    editLinks: true,
    editLinkText: '编辑文档！',
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