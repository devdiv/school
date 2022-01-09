module.exports = [
  { text: '首页', link: '/' },
  { text: '基础', children: [
    { text: '网络', children: [
      { text: '基础', link: '/base/net/basic/' },
      { text: '协议', link: '/base/net/proto/' },
    ]},
    { text: '系统', children: [
      { text: 'Linux', link: '/base/os/linux/' },
    ]},  
    { text: '数据库', children: [
      { text: 'MySQL', link: '/base/db/mysql/' },
      { text: 'MongoDB', link: '/base/db/mongodb/' },
      { text: 'Redis', link: '/base/db/redis/' },
    ]},
  ]},
  { text: '测试', children: [

  ]},
  { text: '开发', children: [
    { text: '后端', children: [
      { text: 'Python模块', link: '/dev/backend/python/' },
      { text: 'Ruby基础', link: '/dev/backend/ruby/' },
    ]},
  ]}, 
  { text: '工具', children: [
    { text: 'Git', link: '/tools/git/' },
    { text: 'Yum', link: '/tools/yum/' },
    { text: 'Github', link: '/tools/github/' },
    { text: 'VSCode', link: '/tools/vscode/' },
    { text: 'Chrome', link: '/tools/chrome/' },
    { text: 'Google', link: '/tools/google/' },
    { text: 'Bookmark scripts', link: '/tools/bookmark-scripts/' },
  ]},
  { text: '更多', children: [
    { text: '收藏', link: '/more/website.html' },
    { text: '读书', link: '/more/reading/' },
  ]},
];