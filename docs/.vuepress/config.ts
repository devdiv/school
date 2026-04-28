import { viteBundler } from '@vuepress/bundler-vite';
import { defaultTheme } from '@vuepress/theme-default';
import { searchPlugin } from '@vuepress/plugin-search';
import { markdownChartPlugin } from '@vuepress/plugin-markdown-chart';

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
      { text: 'AI测试理论', children: [
        { text: '方法论体系', link: '/ai-testing-theory/methodology/' },
        { text: '评估体系', link: '/ai-testing-theory/evaluation-system/' },
        { text: '对比分析', link: '/ai-testing-theory/comparison/' },
        { text: '最佳实践', link: '/ai-testing-theory/best-practices/' }
      ]},
      { text: 'AI测试技术', children: [
        { text: 'LLM技术', link: '/ai-testing-tech/llm-tech/' },
        { text: 'VLM技术', link: '/ai-testing-tech/vlm-tech/' },
        { text: 'Agent技术', link: '/ai-testing-tech/agent-tech/' },
        { text: 'RAG技术', link: '/ai-testing-tech/rag-tech/' },
        { text: '模型评估', link: '/ai-testing-tech/model-evaluation/' },
        { text: '自愈测试', link: '/ai-testing-tech/self-healing'}
      ]},
      { text: 'AI测试场景', children: [
        { text: 'UI测试场景', link: '/ai-testing-scenarios/ui-testing/' },
        { text: 'API测试场景', link: '/ai-testing-scenarios/api-testing/' },
        { text: '性能测试场景', link: '/ai-testing-scenarios/performance-testing/' },
        { text: '安全测试场景', link: '/ai-testing-scenarios/security-testing/' },
        { text: '移动测试场景', link: '/ai-testing-scenarios/mobile-testing/' }
      ]},
      { text: 'AI测试工程', children: [
        { text: '数据工程', link: '/ai-testing-engineering/data-engineering/' },
        { text: 'MLOps实践', link: '/ai-testing-engineering/mlops/' },
        { text: '平台建设', link: '/ai-testing-engineering/platform/' },
        { text: 'DevOps集成', link: '/ai-testing-engineering/devops/' }
      ]},
      { text: 'AI测试质量', children: [
        { text: '质量评估', link: '/ai-testing-quality/quality-evaluation/' },
        { text: '效果度量', link: '/ai-testing-quality/effectiveness-metrics/' },
        { text: '风险控制', link: '/ai-testing-quality/risk-control/' },
        { text: '合规审计', link: '/ai-testing-quality/compliance/' }
      ]},
      { text: 'AI深度探索', children: [
        { text: '视觉融合', link: '/ai-deep-seek/07-vision-physical/' },
        { text: '稳定性测试', link: '/ai-deep-seek/06-stability/' },
        { text: '服务端技术', link: '/ai-deep-seek/05-server-platform/' },
        { text: '系统架构', link: '/ai-deep-seek/03-architecture/' }
      ]},
      { text: '其他', children: [
        { text: '前沿探索', link: '/others/frontier/' },
        { text: '软技能', link: '/others/soft-skills/' }
      ]}
    ],
    layouts: {
      Layout: '@/layouts/Layout.vue'
    },
    sidebar: {
      '/ai-testing-theory/': [{ text: 'AI测试理论', collapsable: true, children: ['', 'methodology/', 'evaluation-system/', 'comparison/', 'best-practices/'] }],
      '/ai-testing-tech/': [{ text: 'AI测试技术', collapsable: true, children: ['', 'llm-tech/', 'vlm-tech/', 'agent-tech/', 'rag-tech/', 'model-evaluation/', 'self-healing'] }],
      '/ai-testing-scenarios/': [{ text: 'AI测试场景', collapsable: true, children: ['', 'ui-testing/', 'api-testing/', 'performance-testing/', 'security-testing/', 'mobile-testing/'] }],
      '/ai-testing-engineering/': [{ text: 'AI测试工程', collapsable: true, children: ['', 'data-engineering/', 'mlops/', 'platform/', 'devops/'] }],
      '/ai-testing-quality/': [{ text: 'AI测试质量', collapsable: true, children: ['', 'quality-evaluation/', 'effectiveness-metrics/', 'risk-control/', 'compliance/'] }],
      '/ai-deep-seek/': [{ text: 'AI深度探索', collapsable: true, children: ['', 'CHEATSHEET', '01-agent-arch/', '02-ai-security/', '03-architecture/', '04-model-training/', '05-server-platform/', '06-stability/', '07-vision-physical/'] }],
      '/ai-deep-seek/07-vision-physical/': [{ text: '视觉融合', collapsable: true, children: ['', 'computer-vision/', 'detection/', 'robotic/'] }],
      '/ai-deep-seek/06-stability/': [{ text: '稳定性测试', collapsable: true, children: ['', 'performance/', 'log-analysis/', 'diagnosis/'] }],
      '/ai-deep-seek/05-server-platform/': [{ text: '服务端技术', collapsable: true, children: ['', 'programming/', 'cloud-infra/', 'data/'] }],
      '/ai-deep-seek/03-architecture/': [{ text: '系统架构', collapsable: true, children: ['', 'distributed/', 'platform-evolution/', 'metrics/', 'quality-platform/', 'cicd-integration/'] }],
      '/ai-deep-seek/01-agent-arch/': [{ text: '智能体架构', collapsable: true, children: ['', 'memory/', 'cognitive/', 'multi-agent/', 'tool-use/'] }],
      '/ai-deep-seek/02-ai-security/': [{ text: 'AI安全', collapsable: true, children: ['', 'alignment-eval/', 'content-safety/', 'privacy/', 'red-team/'] }],
      '/ai-deep-seek/04-model-training/': [{ text: '模型训练', collapsable: true, children: ['', 'pretraining/', 'finetuning/', 'compression/', 'alignment/'] }],
      '/others/frontier/': [{ text: '前沿探索', collapsable: true, children: ['', 'web3/', 'embodied-ai/', 'compliance/', 'aitest/'] }],
      '/others/soft-skills/': [{ text: '软技能', collapsable: true, children: ['', 'leadership/', 'problem-solving/', 'communication/'] }],
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
    markdownChartPlugin({
      mermaid: true,
      markmap: true,
    }),
  ],
};
