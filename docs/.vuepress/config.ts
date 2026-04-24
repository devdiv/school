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
        { text: '视觉融合', link: '/ai-deep-seek/vision-physical/' },
        { text: '稳定性测试', link: '/ai-deep-seek/stability/' },
        { text: '服务端技术', link: '/ai-deep-seek/server-platform/' },
        { text: '系统架构', link: '/ai-deep-seek/architecture/' }
      ]},
      { text: '其他', children: [
        { text: '前沿探索', link: '/others/frontier/' },
        { text: '软技能', link: '/others/soft-skills/' }
      ]}
    ],
    sidebar: {
      '/ai-testing-theory/': [{ text: '', collapsable: false, children: ['', 'methodology/', 'evaluation-system/', 'comparison/', 'best-practices/'] }],
      '/ai-testing-tech/': [{ text: '', collapsable: false, children: ['', 'llm-tech/', 'vlm-tech/', 'agent-tech/', 'rag-tech/', 'model-evaluation/'] }],
      '/ai-testing-scenarios/': [{ text: '', collapsable: false, children: ['', 'ui-testing/', 'api-testing/', 'performance-testing/', 'security-testing/', 'mobile-testing/'] }],
      '/ai-testing-engineering/': [{ text: '', collapsable: false, children: ['', 'data-engineering/', 'mlops/', 'platform/', 'devops/'] }],
      '/ai-testing-quality/': [{ text: '', collapsable: false, children: ['', 'quality-evaluation/', 'effectiveness-metrics/', 'risk-control/', 'compliance/'] }],
      '/ai-deep-seek/vision-physical/': [{ text: '', collapsable: false, children: ['', 'cv/', 'detection/', 'robotic/'] }],
      '/ai-deep-seek/stability/': [{ text: '', collapsable: false, children: ['', 'performance/', 'log-analysis/', 'diagnosis/'] }],
      '/ai-deep-seek/server-platform/': [{ text: '', collapsable: false, children: ['', 'programming/', 'cloud-infra/', 'data/'] }],
      '/ai-deep-seek/architecture/': [{ text: '', collapsable: false, children: ['', 'distributed/', 'platform-evolution/', 'metrics/', 'quality-platform/', 'cicd-integration/'] }],
      '/others/frontier/': [{ text: '', collapsable: false, children: ['', 'web3/', 'embodied-ai/', 'compliance/','aitest/'] }],
      '/others/soft-skills/': [{ text: '', collapsable: false, children: ['', 'leadership/', 'problem-solving/', 'communication/'] }],
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
