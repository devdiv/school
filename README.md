<p align="center">
  <img width="320" src="">
</p>

在线地址：https://devdiv.github.io/school

**本项目为测试开发技术收藏笔记**

- [文章](#%E6%96%87%E7%AB%A0)
- [开发](#%E5%BC%80%E5%8F%91)
  - [前端常用](#%E5%89%8D%E7%AB%AF%E5%B8%B8%E7%94%A8)
  - [Css && 动画](#css--%E5%8A%A8%E7%94%BB)
  - [Vue](#vue)
  - [文档](#%E6%96%87%E6%A1%A3)
  - [工具库](#%E5%B7%A5%E5%85%B7%E5%BA%93)
  - [Node](#node)
    - [工具库](#%E5%B7%A5%E5%85%B7%E5%BA%93-1)
    - [命令行](#%E5%91%BD%E4%BB%A4%E8%A1%8C)
    - [文件处理](#%E6%96%87%E4%BB%B6%E5%A4%84%E7%90%86)
    - [调试](#%E8%B0%83%E8%AF%95)
  - [工具](#%E5%B7%A5%E5%85%B7)
  - [Webpack](#webpack)
  - [工程](#%E5%B7%A5%E7%A8%8B)
  - [Mac](#mac)
  - [VS Code](#vs-code)
    - [主题](#%E4%B8%BB%E9%A2%98)
    - [字体](#%E5%AD%97%E4%BD%93)
  - [编辑器和 Terminal](#%E7%BC%96%E8%BE%91%E5%99%A8%E5%92%8C-terminal)
    - [插件](#%E6%8F%92%E4%BB%B6)
  - [开发常用软件](#%E5%BC%80%E5%8F%91%E5%B8%B8%E7%94%A8%E8%BD%AF%E4%BB%B6)
- [测试](#%E6%B5%8B%E8%AF%95)

# 文章

# 开发

## 前端常用

- [**sweetalert2**](https://github.com/sweetalert2/sweetalert2) 一个自适应，且自定义性强的弹出框（零依赖）
- [**tippy.js**](https://github.com/atomiks/tippyjs) 最著名的 tooltip/popover library
- [**text-mask**](https://github.com/text-mask/text-mask) 可以让 input 按照规则输入(如电话,email,日期,信用卡等)，特殊格式 input
- [**dinero.js**](https://github.com/sarahdayan/dinero.js) 用来创建、计算和格式化货币价值的不可变的框架，支持国际化
- [**lerna**](https://github.com/lerna/lerna) 大项目版本控制工具，项目中可以有多个 package.json 文件
- [**img-2**](https://github.com/RevillWeb/img-2) 一个提高图片加载性能和体验的库，懒加载使用 web worker 模糊预览
- [**fingerprintjs**](https://github.com/Valve/fingerprintjs2) 是一个快速的浏览器指纹库，通浏览环境的一系列配置生成 id
- [**ajv**](https://github.com/epoberezkin/ajv) 一个 json schema 验证的库
- [**dayjs**](https://github.com/xx45/dayjs) 一个轻量级类 moment.js API 时间库
- [**primjs**](https://github.com/PrismJS/prism) 让页面支持代码高亮
- [**ReLaXed**](https://github.com/RelaxedJS/ReLaXed) 一个将 document html 转成 PDF 的工具
- [**uppy**](https://github.com/transloadit/uppy) 一个很好看的也很好用的 前端上传库
- [**Filepond**](https://github.com/pqina/filepond) 一个小巧的文件上传库
- [**tui-calendar**](http://ui.toast.com/tui-calendar/) 功能全面的日程安排日历控件，还支持拖拽
- [**tui.editor**](https://github.com/nhnent/tui.editor) markdown 所见即所得编辑器
- [**tabler**](https://github.com/tabler/tabler) 基于 Bootstrap 4 的 Dashboard UI Kit 和美观 高颜值 ui 模板
- [**pulltorefresh.js**](https://github.com/BoxFactura/pulltorefresh.js) 下个下拉刷新插件
- [**lulu**](https://github.com/yued-fe/lulu) 腾讯阅文基于 jQuery，针对 PC 网站 IE8+（peak 主题）的前端 UI 框架
- [**chancejs**](https://github.com/chancejs/chancejs) 生成随机数据的库
- [**spritejs**](https://github.com/spritejs/spritejs) 360 奇舞团出的跨平台绘图对象模型
- [**tui.image-editor**](https://github.com/nhnent/tui.image-editor) 一个功能齐全的在线图片编辑，基于 canvas
- [**nanoid**](https://github.com/ai/nanoid) 前端轻量 unique string ID 生成库
- [**rxdb**](https://github.com/pubkey/rxdb) 一款开源的快速、灵活的客户端数据库，支持各种浏览器以及 NodeJS，Electron、React 等等，是 PouthDB 之上的一个封装库
- [**percollate**](https://github.com/danburzo/percollate) 命令行工具 能将网页转换成 pdf
- [**rawact**](https://github.com/sokra/rawact) 一个 babel 插件，把 react 组件转为原生 dom
- [**irondb**](https://github.com/gruns/irondb) 是一个浏览器 key-value 储存的封装库，把 Cookies、IndexedDB、LocalStorage、SessionStorage 统一成一个接口。它的最大特色就是数据冗余机制，即使某种底层储存机制失效，它可以从其他机制恢复数据。
- [**big.js**](https://github.com/MikeMcl/big.js) 解决 js 浮点数问题。 主要就是 Big Number 或者小数点温柔
- [**bignumber.js**](https://github.com/MikeMcl/bignumber.js) 同上
- [**stickybits**](https://github.com/dollarshaveclub/stickybits) CSS 的 position: sticky 是一个很有用的设置，但是老的浏览器不支持。这个 JS 库是该功能的垫片库。
- [**react-jsonschema-form**](https://github.com/mozilla-services/react-jsonschema-form) Mozilla service 开源了一个通过 JSON 直接生成表单的 React 组件
- [**cleave.js**](https://github.com/nosir/cleave.js) 用于在输入时格式化输入内容（信用卡格式、日期等）
- [**shiny**](https://github.com/rikschennink/shiny) 在手机设备上模拟光的反射效果。 支持 DeviceMotion 事件
- [**cloudquery**](https://github.com/cloudfetch/cloudquery) Turn any website to serverless API
- [**A-Programmers-Guide-to-English**](https://github.com/yujiangshui/A-Programmers-Guide-to-English) 专为程序员编写的英语学习指南。
- [**rrweb**](https://github.com/rrweb-io/rrweb) 一个可以记录你页面中所有操作的库
- [**nodeppt**](https://github.com/ksky521/nodeppt) markdown 写 ppt
- [**flexsearch**](https://github.com/nextapps-de/flexsearch) 能让你更加高效和快速的检索文本内容
- [**public-apis**](https://github.com/toddmotto/public-apis) 汇集了市面上一些对外免费开放的 api，做一些自己练手 app 的时候很好用。
- [**scroll-hint**](https://github.com/appleple/scroll-hint) 用于提示用户页面可以左右滑动的一个提示库
- [**fuse.js**](https://github.com/krisk/fuse) 轻量级前端模糊查询库 非常的好用
- [**FileSaver.js**](https://github.com/eligrey/FileSaver.js) 文件下载插件 很多时候下载会有兼容性问题，它能帮你解决这些问题
- [**instant.page**](https://github.com/instantpage/instant.page) 一个判断用户行为 预测提前加载页面的库
- [**screenfull.js**](https://github.com/sindresorhus/screenfull.js) 浏览器全屏插件 解决了不少兼容性问题
- [**VuePress**](https://github.com/vuejs/vuepress) 本网站就是基于它实现的，简单方便的静态网站生成器
- [**selection**](https://github.com/Simonwep/selection) 可视化选择页面元素的库
- [**scroll-out**](https://github.com/scroll-out/scroll-out) 滚动效果（滚动视差）的框架，框架大小不到 1KB,使用回调的方式将相关动画元素的属性进行实时分配
- [**gpu.js**](https://github.com/gpujs/gpu.js) 通过将 js 转为特定的 language，利用 GPU 来执行，大大提高了执行性能和速度
- [**pressure**](https://github.com/stuyam/pressure) 前端实现 3D Touch
- [**hammer**](https://github.com/hammerjs/hammer.js) 移动端手势库
- [**AlloyFinger**](https://github.com/AlloyTeam/AlloyFinger) 腾讯出的手势库
- [**lowdb**](https://github.com/typicode/lowdb) LowDB 是一个本地 JSON 数据库，基于 Lodash 开发的
- [**JSON-server**](https://github.com/typicode/json-server) 可以配合 LowDB 使用 快速搭建一个 REST API
- [**lunr.js**](https://github.com/olivernn/lunr.js) 是个用于浏览器的轻量级 JavaScript 全文搜索引擎,对于一些小型的博客、开发者文档或 Wiki 网站来说,完全可以通过它实现站内离线搜索
- [**he**](https://github.com/mathiasbynens/he) 一个前端 encoder/decoder 库
- [**grade**](https://github.com/benhowdle89/grade) 一个可以根据你的 图片 调整底色的插件
- [**pretty-bytes**](https://github.com/sindresorhus/pretty-bytes) 将字节转换成可以读的字符串，比如 1337 个字节，会显示成 1.34 KB
- [**runkit**](https://runkit.com) 一个基于 node 的在线 playground
- [**chart.xkcd**](https://github.com/timqian/chart.xkcd) 手绘风格的图表库
- [**sketchviz**](https://sketchviz.com/new) 手绘风格流程图
- [**pagemap**](https://github.com/lrsjng/pagemap) Mini map for web pages 页面导航图
- [**commonmark.js**](https://github.com/commonmark/commonmark.js) parser and renderer markdown
- [**body-scroll-lock**](https://github.com/willmcpo/body-scroll-lock) 解决滚动穿透问题
- [**lodash**](https://github.com/lodash/lodash) 前端工具函数集合
- [**dayjs**](https://github.com/iamkun/dayjs) 时间处理库，不过大部分情况下我还是用自己的封装的函数
- [**lightgallery**](https://github.com/sachinchoolur/lightgallery.js) 图片预览组件
- [**photoswipe**](https://github.com/dimsemenov/photoswipe) 图片预览组件，支持移动端
- [**darken**](https://github.com/ColinEspinas/darken) 页面黑夜模式切换

## Css && 动画

- [**animate.css**](https://github.com/daneden/animate.css) 最有名的动画效果库
- [**magic.css**](https://github.com/miniMAC/magic) css 动画效果库 类似 animate.css
- [**popmotion**](https://github.com/Popmotion/popmotion) 一个函数式声明前端动画库
- [**NES.css**](https://github.com/BcRikko/NES.css) 任天堂主题风格 css 库
- [**particles.js**](https://github.com/VincentGarreau/particles.js) 前端实现颗粒粒子的动画效果库，比较炫酷，但相对的也比较吃性能
- [**PaperCSS**](https://www.getpapercss.com/docs/) 手绘风格感觉 css 库
- [**rough**](https://github.com/pshihn/rough) 基于 Canvas 的手绘风格图形库
- [**wired-elements**](https://github.com/wiredjs/wired-elements) 基于 rough.js 分装 button input radio 等组件。它的底层是 Web components
- [**roughViz**](https://github.com/jwilber/roughViz) rough 风格的图表库 手绘风格的图表库
- [**matter-js**](https://github.com/liabru/matter-js) web 物理引擎
- [**micron**](https://github.com/webkul/micron) 通过在元素上绑定属性从而实现动画效果的库
- [**direction-reveal**](https://github.com/NigelOToole/direction-reveal) 根据鼠标进入位置，展现从不同方向 展现 hover 效果
- [**laxxx**](https://github.com/alexfoxy/laxxx) 滚动特效库 轻量级 压缩完 2kb
- [**cssfx**](https://cssfx.dev/) 优雅的 CSS 动画效果，开箱即用
- [**zdog**](https://github.com/metafizzy/zdog) 3D engine 引擎
- [**leonsans**](https://github.com/cmiscm/leonsans) 酷炫的 字体 动画 geometric sans-serif typeface made with code
- [**css-doodle**](https://github.com/css-doodle/css-doodle) A web component for drawing patterns with CSS 一个用于使用 CSS 绘制图案的 Web 组件

## Vue

- [**vue-multiselect**](https://github.com/shentao/vue-multiselect) select 组件 目前 vue 里面用过最好用的
- [**Vue.Draggable**](https://github.com/SortableJS/Vue.Draggable) DnD 拖拽组件 基于 Sortable.js 的 vue 版本
- [**vue-sauce**](https://github.com/Botre/vue-sauce) 一个可以展示 vue 源码的指令
- [**vue-smooth-dnd**](https://github.com/kutlugsahin/vue-smooth-dnd) Vue wrappers components for smooth-dnd
- [**vuegg**](https://github.com/vuegg/vuegg) 一个 vue 可视化拖拽界面生成器
- [**vee-validate**](https://github.com/baianat/vee-validate) 基于 vue 的验证，能验证的内容比较全
- [**vuesax**](https://github.com/lusaxweb/vuesax) 一个很漂亮的基于 vue 的 ui 框架
- [**vue-analytics**](https://github.com/MatteoGabriele/vue-analytics) 基于 vue 的 谷歌统计封装
- [**vue-virtual-scroller**](https://github.com/Akryum/vue-virtual-scroller) 基于 vue 的虚拟列表无限滚动
- [**vue-content-placeholders**](https://github.com/michalsnik/vue-content-placeholders) 页面龙骨 skeleton
- [**buefy**](https://github.com/buefy/buefy) 适配移动端的 vue 组件库 看着还挺舒服的
- [**vxe-table**](https://github.com/xuliangzhan/vxe-table)vue 表格解决方案，还没具体用过看着的确解决了其它 table 组件的一些问题

## 文档

- [**vuepress**](https://github.com/vuejs/vuepress) vue 官方出品的文档工具
- [**docsify**](https://github.com/docsifyjs/docsify) 轻量级文档工具，但其是运行时编译的，所以 seo 不好
- [**GitBook**](https://www.gitbook.com/) 除了编译慢没啥毛病
- [**mdx**](https://github.com/mdx-js/mdx) jsx + markdown
- [**docz**](https://github.com/pedronauck/docz)
- [**storybook**](https://github.com/storybooks/storybook)

## 工具库

- [**live-server**](https://github.com/tapio/live-server) 可以快速启一个本地 dev 服务 并且支持自动刷新的 http server
- [**serve**](https://github.com/zeit/serve) 快速起本地静态服务
- [**picojs**](https://github.com/tehnokv/picojs) js 人脸识别库
- [**es-checker**](https://github.com/ruanyf/es-checker) 检查当前环境对 ES6 支持的情况。支持浏览器和 node.js
- [**merge-images**](https://github.com/lukechilds/merge-images) 图片合成，利用`canvas`能将几张图片合成一张
- [**fabric.js**](https://github.com/fabricjs/fabric.js) 基于 canvas 创建交互式的图片编辑界面非常适合用来做图片合成类工作。
- [**phaser**](https://github.com/photonstorm/phaser) 这是一个为桌面和移动浏览器开发 HTML5 游戏的快速开源框架。
  你可以为 iOS、 Android 和不同的本地应用程序创建游戏。
- [**purifycss**](https://github.com/purifycss/purifycss) 移除没使用到的 css
- [**dropcss**](https://github.com/leeoniya/dropcss) 同上
- [**fast-cli**](https://github.com/sindresorhus/fast-cli) 命令行测试下载上传速度
- [**@pika/web**](https://github.com/pikapkg/web) 让你不需要在本地 webpack 中 import，直接在游览器里面运行 npm 包
- [**pinyin**](https://github.com/hotoo/pinyin) 汉字拼音转换工具
- [**JavaScript Obfuscator Tool**](https://obfuscator.io/) js 代码混淆工具
- [**tesseract**](https://github.com/naptha/tesseract.js) 图像识别，它能识别图片中的文字，支持中文
- [**gka**](https://github.com/gkajs/gka) 一款高效、高性能的帧动画生成工具。只需一行命令，快速图片优化、生成动画文件，支持效果预览。
- [**recast**](https://github.com/benjamn/recast) 前端 ast 库
- [**jscodeshift**](https://github.com/facebook/jscodeshift) 将 js 内容解析成 AST 语法树，然后提供一些便利的操作接口，方便我们对各个节点进行更改
- [**stats.js**](https://github.com/mrdoob/stats.js/) 前端性能监控 如 FPS、内存使用情况等
- [**PapaParse**](https://github.com/mholt/PapaParse) 解析 csv excel
- [**mddir**](https://github.com/JohnByrneRepo/mddir) 生成 markdown file/folder structure 目录结构 tree
- [**imagemin**](https://github.com/imagemin/imagemin) 图片压缩库
- [**inline-css**](https://github.com/jonkemp/inline-css#readme) css covert to inline style 在生成 email 格式 html 的时候特别有用
- [**babel-plugin-try-catch-error-report**](https://github.com/mcuking/babel-plugin-try-catch-error-report) 全局自动 catch 错误进行数据上报
- [**StreamSaver.js**](https://github.com/jimmywarting/StreamSaver.js) 大文件下载，不用像 saveAs 那样先读到内存中再下载
- [**mammoth.js**](https://github.com/mwilliamson/mammoth.js) Convert Word documents (.docx files) to HTML
- [**npkill**](https://github.com/voidcosmos/npkill) 列出所有 node_modules，并支持删除
- [**strapi**](https://github.com/strapi/strapi/) 开源的解决方案来创建、部署和管理自己的 API，通过图形化界面进行操作

## Node

### 工具库

- [**cheerio**](https://github.com/cheeriojs/cheerio) 用类 jQuery 语法处理 HTML
- [**node-semver**](https://github.com/npm/node-semver) node 版本验证库
- [**live-server**](https://github.com/tapio/live-server) 一个简单的 http server 带有 reload 功能
- [**node-portfinder**](https://github.com/indexzero/node-portfinder) 一个端口嗅探工具
- [**update-notifier**](https://github.com/yeoman/update-notifier)node 依赖升级提醒工具
- [**fastscan**](https://github.com/pyloque/fastscan) node 敏感词库
- [**hygen**](https://github.com/jondot/hygen) 快速方便的创建代码 可以命令行创建预设的 template
- [**plop**](https://github.com/plopjs/plop) 同上，代码生成工具
- [**ink**](https://github.com/vadimdemedes/ink) 是一个 React 的命令行渲染器，命令行界面可以像写页面那么写了
- [**dotenv**](https://github.com/motdotla/dotenv) 通过.env 设置环境部变量 vue-cli 也依赖它
- [**patch-package**](https://github.com/ds300/patch-package) 优雅的修改 node_modules 中的依赖库
- [**Playwright**](https://github.com/microsoft/playwright) 同 Puppeteer 团队出品，但区别是它支持 Chrome、Safari、Firefox、Edge
- [**tree-cli**](https://github.com/MrRaindrop/tree-cli) node 根据目录结构生成 tree
- [**tree-node-cli**](https://github.com/yangshun/tree-node-cli) node 根据目录结构生成 tree

### 命令行

- [**signale**](https://github.com/klauscfhq/signale) 一个 Node 的日志格式库，自带 16 个级别，可以定制颜色和 Emoji，可扩展的日志记录器
- [**consola**](https://github.com/nuxt/consola) 优雅的命令行 console logger `vuepress` 也使用了它
- [**chalk**](https://github.com/chalk/chalk) 命令行着色美化库
- [**progress-estimator**](https://github.com/bvaughn/progress-estimator) 命令行 progress bar 进度条模拟库
- [**ora**](https://github.com/sindresorhus/ora) Elegant terminal spinner 命令行 loading
- [**listr**](https://github.com/SamVerschueren/listr) Terminal task 命令行任务列表
- [**yargs**](https://github.com/yargs/yargs) 命令行参数解析
- [**y18n**](https://github.com/yargs/y18n) yargs 基于 i18n 的一个包
- [**commander.js**](https://github.com/tj/commander.js) 自动的解析命令和参数，合并多选项，处理短参，等等，功能强大，上手简单
- [**Inquirer.js**](https://github.com/SBoudrias/Inquirer.js) A collection of common interactive command line user interfaces. 命令行询问库
- [**enquirer**](https://github.com/nasa/openmct) 命令行 prompt 询问库，写 cli 的时候很有用
- [**Qoa**](https://github.com/klaussinani/qoa) 同上
- [**cli-progress**](https://github.com/AndiDittrich/Node.CLI-Progress) Terminal Progress Bar
- [**cli-table**](https://github.com/Automattic/cli-table) tables for the CLI
- [**node-notifier**](https://github.com/mikaelbr/node-notifier) 在 NodeJS 环境中，可以很方便的唤起 notifier 通知

### 文件处理

- [**rimraf**](https://github.com/isaacs/rimraf) 删除文件
- [**globby**](https://github.com/sindresorhus/globby) 用于模式匹配目录文件
- [**glob**](https://github.com/isaacs/node-glob) 文件查找
- [**tiny-glob**](https://github.com/terkelg/tiny-glob) 文件查找
- [**chokidar**](https://github.com/paulmillr/chokidar) node 监听文件变化的库
- [**fs-extra**](https://github.com/jprichardson/node-fs-extra) fs-extra 模块是系统 fs 模块的扩展，提供了更多便利的 API，并继承了 fs 模块的 API
- [**execa**](https://github.com/sindresorhus/execa) 比 child_process 好用，返回 Promise
- [**npm-run-all**](https://github.com/mysticatea/npm-run-all) 一个 CLI 工具可以并行或者串行执行 script 指令
- [**memfs**](https://github.com/streamich/memfs) memory-fs 的替代品，将文件放在内存中优化读写，webpack 依赖

### 调试

- [**fx**](https://github.com/antonmedv/fx) 命令行优化 JSON 输出
- [**dumper.js**](https://github.com/zeeshanu/dumper.js) 能让你的 node console 更加的规整，方便调试
- [**ndb**](https://github.com/GoogleChromeLabs/ndb) node 调试
- [**why-is-node-running**](https://github.com/mafintosh/why-is-node-running) 查看 node 为什么在运行
- [**siege**](https://www.joedog.org/siege-home/) 压测工具
- [**node-in-debugging**](https://github.com/nswbmw/node-in-debugging) node.js 调试指南
- [**node-best-practices**](https://github.com/i0natan/nodebestpractices) node 最佳实践
- [**Node.js 最佳实践**](https://github.com/i0natan/nodebestpractices/blob/master/README.chinese.md)

## 工具

- [**high-speed-downloader**](https://github.com/high-speed-downloader/high-speed-downloader) 百度网盘不限速下载 支持 Windows 和 Mac
- [**hyper**](https://github.com/zeit/hyper) 前端命令行
- [**yapi**](https://github.com/ymfe/yapi) 是一个可本地部署的、打通前后端及 QA 的、可视化的接口管理平台
- [**sway**](https://sway.com/) 一个微软自己出的在线 ppt 很强大
- [**Ascii Art Generator**](https://asciiartgen.now.sh) 在线生成 Ascii 图案
- [**Winds**](https://github.com/GetStream/Winds) 开源 RSS
- [**JSUI**](https://github.com/kitze/JSUI) 一个用来控制管理前端项目的客户端
- [**docz**](https://github.com/pedronauck/docz) 让你能快速写文档的一个库
- [**hiper**](https://github.com/pod4g/hiper) 性能统计分析工具
- [**verdaccio**](https://github.com/verdaccio/verdaccio) 私有 npm
- [**git-guide**](http://rogerdudler.github.io/git-guide/index.zh.html) git 入门指南
- [**git-tips**](https://github.com/521xueweihan/git-tips) git 进阶
- [**bit**](https://github.com/teambit/bit) 实现了项目之间的代码共享 可以自建私有
- [**simpread**](https://github.com/Kenshin/simpread) 简悦 ( SimpRead ) 让你瞬间进入沉浸式阅读的扩展
- [**mkcert**](https://github.com/FiloSottile/mkcert) 一键命令 让本地也支持 https
- [**termtosvg**](https://github.com/nbedos/termtosvg) 录制 命令操作转成 svg 基于 python
- [**gh-polls**](https://github.com/apex/gh-polls) 可以在 github issue 中添加投票
- [**eruda**](https://github.com/liriliri/eruda) 移动端调试工具
- [**vConsole**](https://github.com/Tencent/vConsole) 也是一个移动端调试工具 腾讯出品
- [**terminalizer**](https://github.com/faressoft/terminalizer) 命令行录制工具 基于 node
- [**badgen**](https://github.com/amio/badgen-service) 快速构建和 shields 一样的 svg badge 但速度更快
- [**readability**](https://github.com/luin/readability) 移除页面非正文部分 基于 jsdom
- [**WeChatPlugin-MacOS**](https://github.com/TKkk-iOSer/WeChatPlugin-MacOS) 一款功能强大的 macOS 版微信小助手
- [**puppeteer-recorder**](https://github.com/checkly/puppeteer-recorder) 一个 chrome 插件 能够根据你的操作 自动生成 puppeteer 相关代码
- [**mdx-deck**](https://github.com/jxnblk/mdx-deck) 用 markdown 编写演示文稿
- [**code-surfer**](https://github.com/pomber/code-surfer) 基于 mdx-deck 的一个插件
  让你更好的在文稿中展示 code
- [**Progressive Tooling**](https://progressivetooling.com/) 前端性能优化工具集合
- [**https://github.com/artf/grapesjs**](https://github.com/artf/grapesjs) 可视化建站工具 不需要写代码就能写一个页面，前端再次再次要下岗了
- [**image-charts**](https://www.image-charts.com/) 该服务通过 URL 接受参数，然后生成图表，以图片形式返回
- [**eagle.js**](https://github.com/Zulko/eagle.js) 一个用 vue 来制作 PPT 的库
- [**Optimizely**](https://www.optimizely.com/) A/B Test
- [**appadhoc**](http://www.appadhoc.com/) 一个国内的 A/B Test 服务
- [**glorious-demo**](https://github.com/glorious-codes/glorious-demo) 通过编写代码的方式构建一个命令行的演示例子
- [**nginxconfig**](https://github.com/valentinxxx/nginxconfig.io/) 可视化配置 nginx 提供了多个基础模板
- [**bundlephobia**](https://bundlephobia.com/) 一个可以查看某个库的大小，并且分析它的依赖
- [**jsperf**](https://jsperf.com/popular) 一个提供在线 test case 的网站，主要用来比较性能。可以比较如： forEach vs for 的性能
- [**perflink**](https://github.com/lukejacksonn/perflink) 与 jsperf 类似的一个比较 js 性能的网站
- [**algorithm-visualizer**](https://github.com/algorithm-visualizer/algorithm-visualizer) 算法代码可视化
- [**An-English-Guide-for-Programmers**](https://github.com/yujiangshui/An-English-Guide-for-Programmers) 专为程序员编写的英语学习指南
- [**Webhint**](https://webhint.io/) 用于检查代码的可访问性、性能和安全的开源检查（Linting）工具
- [**airtap**](https://github.com/airtap/airtap) 测试浏览器兼容性，可覆盖 800 多种浏览器
- [**jsonstore**](https://github.com/bluzi/jsonstore) 供免费，安全且基于 JSON 的云数据存储，自己玩的小项目神器
- [**git-history**](https://github.com/pomber/git-history) 可视化查看一个文件的历史变化
- [**x-spreadsheet**](https://github.com/myliang/x-spreadsheet) 一个基于 Canvas 的 JS 电子表格库 excel
- [**imgcook**](https://imgcook.taobao.org/) 阿里出品，一键通过设计稿生成代码
- [**majestic**](https://github.com/Raathigesh/majestic) jest 可视化
- [**leon**](https://github.com/leon-ai/leon) 你开源项目的 ai 个人助手
- [**js-code-to-svg-flowchart**](https://github.com/Bogdan-Lyashenko/js-code-to-svg-flowchart) 将代码逻辑用流程图的方式展现出来
- [**xterm.js**](https://github.com/xtermjs/xterm.js) 一个 web terminal
- [**pixelmatch**](https://github.com/mapbox/pixelmatch) diff 两张图片不一样的地方
- [**readme-md-generator**](https://github.com/kefranabg/readme-md-generator) 一个命令行脚本帮你快速的创建一个 README
- [**build-tracker**](https://github.com/paularmstrong/build-tracker) 构建大小追踪 记录你多个版本构建后文件大小的变化
- [**zan-proxy**](https://github.com/youzan/zan-proxy/blob/master/README.zh-CN.md) 本地调试线上环境的工具
- [**mjml**](https://github.com/mjmlio/mjml) 一个让发 email 更简单的框架。定义了一套自己的语法，你用这套语法写邮件，然后编译成 HTML。
- [**any-rule**](https://any86.github.io/any-rule/) 正则大全
- [**outline**](https://github.com/outline/outline) 一个免费开源的库，能让你快速搭建自己的 wiki

## Webpack

- [**webpackbar**](https://github.com/nuxt/webpackbar) webpack 打包进度条
- [**jarvis**](https://github.com/zouhir/jarvis) webpack dashboard
- [**webpack-chain**](https://github.com/neutrinojs/webpack-chain) 通过 chain 风格 api 的方式修改 webpack 配置
- [**speed-measure-webpack-plugin**](https://github.com/stephencookdev/speed-measure-webpack-plugin) 统计 webpack 各阶段的耗时
- [**obsolete-webpack-plugin**](https://github.com/ElemeFE/obsolete-webpack-plugin) 基于 browserslist 做浏览器升级提示
- [**mini-css-extract-plugin**](https://github.com/webpack-contrib/mini-css-extract-plugin) 提取 CSS 为单独文件
- [**copy-webpack-plugin**](https://github.com/webpack-contrib/copy-webpack-plugin) 复制额外的文件到输出目录
- [**duplicate-package-checker-webpack-plugin**](https://github.com/darrenscerri/duplicate-package-checker-webpack-plugin) 检查是否存在重复依赖
- [**cssnano**](https://github.com/cssnano/cssnano) CSS 压缩
- [**bundle-buddy**](https://github.com/samccone/bundle-buddy) webpack bundle 依赖分析

## 工程

- [**lerna**](https://github.com/lerna/lerna) monorepo 管理
- [**lerna-changelog**](https://github.com/lerna/lerna-changelog) 为 lerna 项目自动生成 changelog
- [**eslint**](https://github.com/eslint/eslint) JS 风格约束
- [**eslint-config-airbnb**](https://github.com/airbnb/javascript) airbnb 约束风格
- [**xo**](https://github.com/xojs/xo) 封装自 eslint
- [**prettier**](https://github.com/prettier/prettier) 更主观的风格自动修改
- [**yeoman-generator**](https://github.com/yeoman/generator) 脚手架工具
- [**serve**](https://github.com/zeit/serve) 本地静态服务器
- [**np**](https://github.com/sindresorhus/np) npm publish 辅助，自动 push、打 tag、升版本等
- [**lint-staged**](https://github.com/okonet/lint-staged) eslint 提速，只 lint 提交的代码
- [**coveralls**](https://github.com/marketplace/coveralls) 覆盖率
- [**husky**](https://github.com/typicode/husky) 添加 git hooks
- [**cross-env**](https://github.com/kentcdodds/cross-env) 跨平台的环境变量声明
- [**nvm**](https://github.com/creationix/nvm) 管理 node 版本
- [**concurrently**](https://github.com/kimmobrunfeldt/concurrently) 在 npm scripts 里并行执行命令
- [**@zeit/ncc**](https://github.com/zeit/ncc) 打包为 npm 包为一个文件
- [**npm-check**](https://github.com/dylang/npm-check) 检测依赖升级情况，我会和 `yarn upgrade-interactive` 配合着用，主要用来检测冗余依赖
- [**cpx**](https://github.com/mysticatea/cpx) 复制，支持 glob，并且可以 watch
- [**onchange**](https://github.com/Qard/onchange) 监听文件变动然后做一些事
- [**tasksfile**](https://github.com/pawelgalazka/tasksfile) 在 node 中执行 script 脚本

## Mac

- [**get-plain-text**](https://itunes.apple.com/cn/app/get-plain-text/) 能清除剪贴板里的格式 很实用
- [**IINA**](https://github.com/lhc70000/iina) mac 平台感觉免费最好的播放器 强推
- [**magnet**](https://itunes.apple.com/cn/app/magnet/id441258766?mt=12&ign-mpt=uo%3D4) 分屏管理
- [**Xnip**](https://zh.xnipapp.com/) 方便好用的截图工具-支持截长图
- [**Spectacle**](https://www.spectacleapp.com/) 窗口管理工具
- [**vanilla**](https://matthewpalmer.net/vanilla/) 顶栏图标管理工具
- [**Dozer**](https://github.com/Mortennn/Dozer) 一个开源的顶栏管理
- [**腾讯电脑管家**](https://mac.guanjia.qq.com/index_o.html) 反正我用下来好觉得蛮好用的
- [**mos**](https://mos.caldis.me/) 鼠标平滑滚动软件，很好用。免费开源
- [**sequel pro**](https://www.sequelpro.com/) mysql 客户端 好用
- [**Microsoft Remote Desktop Beta**](https://itunes.apple.com/us/app/microsoft-remote-desktop/id715768417?mt=12#) Mac 远程登录 Windows 调试神器
- [**pap.er**](http://paper.meiyuan.in/) 专为 Mac 设计的壁纸应用
- [**The Unarchive**](https://theunarchiver.com/) Mac 目前感觉最好用的免费解压软件
- [**Tickeys**](https://github.com/yingDev/Tickeys) 让你用 Mac 键盘也能打出机械键盘的感觉
- [**Beaker Browser**](https://github.com/beakerbrowser/beaker) P2P 开源浏览器 支持点对点发布文件，成为了文件传输工具，支持 DAT 对等协议
- [**Gifski**](https://github.com/sindresorhus/gifski-app) 视频转 gif 工具
- [**more**](https://github.com/serhii-londar/open-source-mac-os-apps) 更多优秀的 mac app 介绍
- [**Motrix**](https://github.com/agalwood/Motrix) 支持 HTTP、FTP、BT、磁力链、百度网盘的下载工具
- [**iPic**](https://apps.apple.com/cn/app/ipic-markdown-%E5%9B%BE%E5%BA%8A-%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0%E5%B7%A5%E5%85%B7/id1101244278?mt=12)这个应用可以让你方便地上传图片到各种图床
- [**Image2Icon**](http://www.img2icnsapp.com/)
- [**hidden**](https://github.com/dwarvesf/hidden) 是用来帮助你隐藏 macOS 菜单栏上那些不常用的应用图标

## VS Code

- [**Import Cost**](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost) 查看你引入的依赖模块大小
- [**Auto Close Tag**](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag) 自动补全 html 标签，如输入`<a>`将自动补全`</a>`
- [**Auto Rename Tag**](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag) 自动重命名 html 标签，如修改`<a>为<b>`，将自动修改结尾标签`</a>为</b>`
- [**polacode**](https://github.com/octref/polacode) 生产代码图片快照插件
- [**vscode-leetcode**](https://github.com/jdneo/vscode-leetcode) 一个能让你在 vscode 中刷 LeetCode 的插件 算一个划水神器吧
- [**vscode-icons**](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons) VS Code 必备吧，为文件添加炫图标
- [**CodeSnap**](https://marketplace.visualstudio.com/items?itemName=adpyke.codesnap) 生产代码截图

### 主题

[**官方主题页**](https://marketplace.visualstudio.com/search?target=VSCode&category=Themes&sortBy=Installs) 可以选择自己喜欢的主题

### 字体

- [**FiraCode**](https://github.com/tonsky/firacode)
- [**Dank Mono**](https://dank.sh/)
- [**Operator Mono**](https://www.typography.com/blog/introducing-operator)

## 编辑器和 Terminal

- [**Go2shell**](https://zipzapmac.com/Go2Shell) 在当前文件夹打开 shell
- Terminal 用 [**iTerm2**](https://www.iterm2.com/) + [**zsh**](https://en.wikipedia.org/wiki/Z_shell) + [**oh-my-zsh**](https://github.com/robbyrussell/oh-my-zsh) 的组合，主题是 [robbyrussell](https://github.com/robbyrussell/oh-my-zsh/blob/master/themes/robbyrussell.zsh-theme)

### 插件

- [**Homebrew**](https://brew.sh/index_zh-cn) 必装
- [**autojump**](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/autojump) 实现目录间快速跳转，想去哪个目录直接 j + 目录名，不用在频繁的 cd 了
- [**zsh-autosuggestions**](https://github.com/zsh-users/zsh-autosuggestions) 命令自动建议和补全
- [**zsh-syntax-highlighting**](https://github.com/zsh-users/zsh-syntax-highlighting) 命令行语法高亮
- [**history**](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/history) 命令行记录
- [**zsh-git-prompt**](https://github.com/olivierverdier/zsh-git-prompt) git 分支信息提示

## 开发常用软件

- [**Github Desktop**](https://github.com/desktop/desktop)管理 github 仓库的变更和 PR
- [**runjs**](https://runjs.dev/) js 运行沙盒，写 test case 或者面试当场写代码的时候很有用
- [**Charles**](https://www.charlesproxy.com/) 抓包用，支持 https
- [**Google Chrome**](https://www.google.com/chrome/) 前端必备没啥好说的
- [**ColorSnapper2**](https://colorsnapper.com/) 取色工具
- [**postman**](https://www.getpostman.com/) api 调试工具
- [**Sequel Pro**](https://www.sequelpro.com/) MySQL 界面管理工具
- [**KeepingYouAwake**](https://github.com/newmarcel/KeepingYouAwake) 可保证系统不自动休眠，挂机跑脚本很有用

# 测试
