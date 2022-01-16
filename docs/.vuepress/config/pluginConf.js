const path = require('path');
require('dotenv').config();

module.exports = [
  ['@vuepress/plugin-pwa'],
  ['@vuepress/plugin-pwa-popup', {
    locales: {
      '/': {
        message: '发现新内容可用',
        buttonText: '刷新',
      },
    },
  }],
  ['@vuepress/plugin-google-analytics', {
    id: 'UA-109340118-1'
  }],
  ["vuepress-plugin-auto-sidebar", {
    output: {
      filename: 'config/sidebarConf'
    },
    title: {
      // 更多选项: 
        // `default`、`lowercase`、`uppercase`、`capitalize`、`camelcase`、`kebabcase`、`titlecase`
      mode: "uppercase",
    },
    git: {
      trackStatus: 'all'
    }
  }],
  ['@vuepress/plugin-search', {
    locales: {
      '/': {
        placeholder: '搜索',
      }
    },
    maxSuggestions: 10,
    // 排除首页
    isSearchable: (page) => page.path !== '/',
    // 允许搜索 Frontmatter 中的 `tags`
    getExtraFields: (page) => page.frontmatter.tags ?? [],
  }],
  ['@vuepress/register-components', {
    componentsDir: path.resolve(__dirname, '../components'),
  }],
];