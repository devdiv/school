module.exports = [{
    text: '首页',
    link: '/'
  },
  {
    text: '网络',
    children: [{
        text: '数据通信',
        children: [{
          text: '基础',
          link: '/net/dc/basic/'
        }, {
          text: '数据传输',
          link: '/net/dc/trans/'
        }, ]
      },
      {
        text: 'TCP/IP',
        children: [{
            text: '基础',
            link: '/net/tcpip/basic/'
          },
          {
            text: '网络层',
            link: '/net/tcpip/netlayer/'
          },
          {
            text: '传输层',
            link: '/net/tcpip/translayer/'
          },
        ]
      },
      {
        text: '网络技术',
        children: [{
            text: '局域网',
            link: '/net/tech/lan/'
          },
          {
            text: '以太网交换技术',
            link: '/net/tech/eth/'
          },
        ]
      },
      {
        text: '网络安全',
        children: [{
          text: '防火墙',
          link: '/net/sec/firewall/'
        }, ]
      },
    ]
  },
  {
    text: '研发',
    children: [{
      text: '测试',
      children: [{
          text: '基础',
          link: '/dev/test/basic/'
        },

      ]
    }, {
      text: 'Python',
      children: [{
          text: '基础',
          link: '/dev/python/basic/'
        },
        {
          text: '模块',
          link: '/dev/python/module/'
        },
      ]
    }, ]
  },
  {
    text: '管理',
    children: [{
      text: '理论域',
      children: [{
          text: '五大过程',
          link: '/manage/theory/process/'
        },
        {
          text: '十大领域',
          link: '/manage/theory/field/'
        },
      ]
    }, {
      text: '实践域',
      children: [{
        text: '人员管理',
        link: '/manage/practice/people/'
      }, ]
    }, ]
  },
  {
    text: '工具',
    children: [{
        text: '网络',
        children: [{
            text: 'NetWox',
            link: '/tools/net/netwox/'
          },
          {
            text: 'WireShark',
            link: '/tools/net/wireshark/'
          },
        ]
      },
      {
        text: '研发',
        children: [{
            text: 'Git',
            link: '/tools/dev/git/'
          },
          {
            text: 'Yum',
            link: '/tools/dev/yum/'
          },
          {
            text: 'Github',
            link: '/tools/dev/github/'
          },
          {
            text: 'VSCode',
            link: '/tools/dev/vscode/'
          },
        ],
      },

    ]
  },
  {
    text: '更多',
    children: [{
        text: '收藏',
        link: '/more/website.html'
      },
      {
        text: '读书',
        link: '/more/reading/'
      },
    ]
  },
];