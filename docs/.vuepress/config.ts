import { viteBundler } from '@vuepress/bundler-vite';
import { defaultTheme } from '@vuepress/theme-default';
import { searchPlugin } from '@vuepress/plugin-search';

export default {
  bundler: viteBundler(),
  theme: defaultTheme({
    logo: '/images/hero.png',
    themePlugins: {
      prismjs: { lineNumbers: true },
    },
    lastUpdatedText: '上次更新',
    contributorsText: '贡献者',
    tip: '提示',
    warning: '注意',
    danger: '警告',
    notFound: ['这里什么都没有', '我们怎么到这来了？', '这是一个 404 页面', '看起来我们进入了错误的链接'],
    backToHome: '返回首页',
    openInNewWindow: '在新窗口打开',
    toggleDarkMode: '切换夜间模式',
    toggleSidebar: '切换侧边栏',
    docsRepo: 'devdiv/school',
    editLinks: true,
    editLinkText: '在线编辑文档',
    docsDir: 'docs',
    docsBranch: 'master',
    navbar: [
      { text: '首页', link: '/' },
      { text: 'AI测试体系', children: [
        { text: 'AI驱动测试', link: '/ai-testing/' },
        { text: 'LLM/VLM工程化', link: '/llm-vlm/' }
      ]},
      { text: '测试框架', children: [
        { text: 'AI原生框架', link: '/frameworks/ai-native/' },
        { text: 'UI自动化', link: '/frameworks/ui/' },
        { text: 'API测试', link: '/frameworks/api/' },
        { text: '性能测试', link: '/frameworks/performance/' },
        { text: '云原生测试', link: '/frameworks/cloud-native/' },
        { text: '混沌工程', link: '/frameworks/chaos/' },
        { text: '安全测试', link: '/frameworks/security/' },
        { text: '移动端测试', link: '/frameworks/mobile/' }
      ]},
      { text: '技术能力', children: [
        { text: '视觉融合', link: '/vision-physical/' },
        { text: '稳定性测试', link: '/stability/' },
        { text: '服务端技术', link: '/server-platform/' },
        { text: '系统架构', link: '/architecture/' }
      ]},
      { text: '前沿视野', children: [
        { text: '前沿探索', link: '/frontier/' },
        { text: '软技能', link: '/soft-skills/' }
      ]}
    ],
    sidebar: {
      '/ai-testing/': [{ text: '', collapsable: false, children: ['', 'platform/', 'agentic/', 'agent-evaluation/', 'shift-left/'] }],
      '/llm-vlm/': [{ text: '', collapsable: false, children: ['', 'llm-app/', 'vlm/', 'model-evaluation/', 'self-healing/'] }],
      '/frameworks/': [{ text: '', collapsable: false, children: ['', 'ai-native/', 'ui/', 'api/', 'performance/', 'cloud-native/', 'chaos/', 'security/', 'mobile/', 'mobile-specialized/'] }],
      '/vision-physical/': [{ text: '', collapsable: false, children: ['', 'cv/', 'detection/', 'robotic/'] }],
      '/stability/': [{ text: '', collapsable: false, children: ['', 'performance/', 'log-analysis/', 'diagnosis/'] }],
      '/server-platform/': [{ text: '', collapsable: false, children: ['', 'programming/', 'cloud-infra/', 'data/'] }],
      '/architecture/': [{ text: '', collapsable: false, children: ['', 'distributed/', 'platform-evolution/', 'metrics/', 'quality-platform/', 'cicd-integration/'] }],
      '/frontier/': [{ text: '', collapsable: false, children: ['', 'web3/', 'embodied-ai/', 'compliance/'] }],
      '/soft-skills/': [{ text: '', collapsable: false, children: ['', 'leadership/', 'problem-solving/', 'communication/'] }],
    }
  }),
  lang: 'zh-CN',
  title: 'AI测试架构知识库',
  description: '构建AI原生测试平台，实现智能化测试全流程',
  base: '/school/',
  head: [
    ['link', { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' }],
    ['link', { rel: 'icon', href: 'images/favicon.ico' }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#ffffff' }],
  ],
  plugins: [
    ['@vuepress/plugin-pwa'],
    ['@vuepress/plugin-google-analytics', { id: 'UA-109340118-1' }],
    searchPlugin({
      locales: { '/': { placeholder: '搜索' } },
      maxSuggestions: 10,
      isSearchable: (page) => page.path !== '/',
      getExtraFields: (page) => page.frontmatter.tags ?? [],
    }),
  ],
};
