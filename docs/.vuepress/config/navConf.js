module.exports = [
  { text: '首页', link: '/' },
  { text: '基础', children: [
    { text: '网络', children: [
      { text: 'TCP/IP', link: '/base/net/tcpip/' },
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
    { text: '前端', children: [
      { text: 'JavaScript', link: '/dev/frontend/javascript/' },
      { text: 'TypeScript', link: '/dev/frontend/typescript/' },
      { text: 'CSS', link: '/dev/frontend/css/' },
      { text: 'Vue', link: '/dev/frontend/vue/' },
      { text: 'Vite', link: '/dev/frontend/vite/' },
      { text: 'Webpack', link: '/dev/frontend/webpack/' },
      { text: 'WeApp', link: '/dev/frontend/weapp/' },
      { text: 'Utils', link: '/dev/frontend/utils/' },
    ]},
    { text: '后端', children: [
      { text: 'Python', link: '/dev/backend/python/' },
      { text: 'Ruby', link: '/dev/backend/ruby/' },
      { text: 'CS', link: '/dev/backend/csharp/' },
      { text: 'JS', link: '/dev/backend/javascript/' },
      { text: 'Nodejs', link: '/dev/backend/nodejs/' },
      { text: 'Nestjs', link: '/dev/backend/nestjs/' },
      { text: 'Golang', link: '/dev/backend/golang/' },
      { text: 'Nginx', link: '/dev/backend/nginx/' },
      { text: 'Traefik', link: '/dev/backend/traefik/' },
      { text: 'Docker', link: '/dev/backend/docker/' },
    ]},
  ]}, 
  { text: '工具', children: [
    { text: 'Git', link: '/tools/git/' },
    { text: 'Github', link: '/tools/github/' },
    { text: 'VSCode', link: '/tools/vscode/' },
    { text: 'Chrome', link: '/tools/chrome/' },
    { text: 'Google', link: '/tools/google/' },
    { text: 'Bookmark scripts', link: '/tools/bookmark-scripts/' },
  ]},
  { text: '更多', children: [
    { text: '收藏', link: '/more/website.html' },
    { text: '旅行', link: 'https://travellings.link' },
  ]},
];