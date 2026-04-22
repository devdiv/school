# UI自动化测试框架

主流UI自动化测试框架对比与实践。

## Playwright

新一代端到端测试框架。

- 全浏览器支持（Chromium、Firefox、WebKit）
- 自动等待机制
- MCP服务器集成
- AI增强特性
- 强大的调试能力
- 并行测试支持

### 核心使用模式

```python
from playwright.sync_api import sync_playwright, Page, expect
import pytest

class PlaywrightTestBase:
    """
    Playwright测试基类
    提供通用的UI测试能力封装
    """
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
    
    def setup(self, browser_type: str = "chromium", headless: bool = True):
        """
        初始化测试环境
        
        Args:
            browser_type: 浏览器类型
            headless: 是否无头模式
        """
        self.playwright = sync_playwright().start()
        browser_launcher = getattr(self.playwright, browser_type)
        self.browser = browser_launcher.launch(headless=headless)
        self.context = self.browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir="./videos/"
        )
        self.page = self.context.new_page()
    
    def teardown(self):
        """清理测试环境"""
        if self.context:
            self.context.close()
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()
    
    def navigate(self, url: str):
        """
        导航到指定页面
        
        Args:
            url: 目标URL
        """
        self.page.goto(url, wait_until="networkidle")
    
    def click_element(self, selector: str, timeout: int = 5000):
        """
        点击元素
        
        Args:
            selector: 元素选择器
            timeout: 超时时间（毫秒）
        """
        self.page.click(selector, timeout=timeout)
    
    def fill_input(self, selector: str, value: str):
        """
        填充输入框
        
        Args:
            selector: 输入框选择器
            value: 填充值
        """
        self.page.fill(selector, value)
    
    def assert_visible(self, selector: str):
        """
        断言元素可见
        
        Args:
            selector: 元素选择器
        """
        expect(self.page.locator(selector)).to_be_visible()
    
    def assert_text_contains(self, selector: str, text: str):
        """
        断言元素包含指定文本
        
        Args:
            selector: 元素选择器
            text: 期望文本
        """
        expect(self.page.locator(selector)).to_contain_text(text)

# pytest fixture示例
@pytest.fixture
def page():
    """Playwright page fixture"""
    base = PlaywrightTestBase()
    base.setup()
    yield base.page
    base.teardown()

def test_login_flow(page: Page):
    """测试登录流程"""
    page.goto("https://example.com/login")
    page.fill("[data-testid='username']", "testuser")
    page.fill("[data-testid='password']", "testpass")
    page.click("[data-testid='submit']")
    
    expect(page.locator(".dashboard")).to_be_visible()
    expect(page.locator(".user-name")).to_contain_text("testuser")
```

### AI增强测试

```python
from typing import Dict, Optional
from playwright.sync_api import Page

class AIEnhancedTester:
    """
    AI增强的UI测试器
    结合LLM实现智能元素识别和测试生成
    """
    def __init__(self, page: Page, llm_client=None):
        self.page = page
        self.llm = llm_client
    
    def smart_find(self, description: str) -> Optional[str]:
        """
        智能查找元素
        
        Args:
            description: 元素的自然语言描述
            
        Returns:
            str: 元素选择器，未找到返回None
        """
        # 获取页面所有元素的语义信息
        elements = self.page.evaluate("""
            () => {
                const all = document.querySelectorAll('*');
                return Array.from(all).map(el => ({
                    tag: el.tagName,
                    text: el.textContent?.trim(),
                    placeholder: el.placeholder,
                    ariaLabel: el.getAttribute('aria-label'),
                    className: el.className,
                    id: el.id
                })).filter(e => e.text || e.placeholder || e.ariaLabel);
            }
        """)
        
        if self.llm:
            # 使用LLM匹配最可能的元素
            selector = self._llm_match_element(description, elements)
            return selector
        
        # 降级到关键词匹配
        return self._keyword_match(description, elements)
    
    def _llm_match_element(self, description: str, elements: list) -> Optional[str]:
        """
        使用LLM匹配元素
        
        Args:
            description: 元素描述
            elements: 页面元素列表
            
        Returns:
            str: 匹配的选择器
        """
        # 简化实现：返回基于文本的选择器
        for el in elements:
            text = el.get("text", "")
            if description.lower() in text.lower():
                if el.get("id"):
                    return f"#{el['id']}"
                return f"text={text[:30]}"
        return None
    
    def _keyword_match(self, description: str, elements: list) -> Optional[str]:
        """
        关键词匹配元素
        
        Args:
            description: 元素描述
            elements: 页面元素列表
            
        Returns:
            str: 匹配的选择器
        """
        keywords = description.lower().split()
        for el in elements:
            text = (el.get("text", "") + " " + 
                   el.get("placeholder", "") + " " + 
                   el.get("ariaLabel", "")).lower()
            if any(kw in text for kw in keywords):
                if el.get("id"):
                    return f"#{el['id']}"
        return None
```

## Selenium WebDriver

业界最成熟的UI自动化框架。

- 生态最广、社区活跃
- 多语言支持（Java、Python、JavaScript等）
- MCP集成支持
- 丰富的第三方工具
- 企业级应用广泛

### 核心封装模式

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

class SeleniumTestBase:
    """
    Selenium测试基类
    提供稳定的UI测试封装
    """
    def __init__(self):
        self.driver = None
        self.wait = None
    
    def setup(self, headless: bool = True, implicit_wait: int = 10):
        """
        初始化WebDriver
        
        Args:
            headless: 是否无头模式
            implicit_wait: 隐式等待时间
        """
        options = Options()
        if headless:
            options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")
        
        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(implicit_wait)
        self.wait = WebDriverWait(self.driver, implicit_wait)
    
    def teardown(self):
        """清理资源"""
        if self.driver:
            self.driver.quit()
    
    def find_element(self, by: By, value: str, timeout: int = 10):
        """
        显式等待查找元素
        
        Args:
            by: 定位策略
            value: 定位值
            timeout: 超时时间
            
        Returns:
            WebElement: 找到的元素
        """
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )
    
    def safe_click(self, by: By, value: str, timeout: int = 10):
        """
        安全点击（等待元素可点击）
        
        Args:
            by: 定位策略
            value: 定位值
            timeout: 超时时间
        """
        element = WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )
        element.click()
    
    def safe_send_keys(self, by: By, value: str, text: str, timeout: int = 10):
        """
        安全输入（清空后输入）
        
        Args:
            by: 定位策略
            value: 定位值
            text: 输入文本
            timeout: 超时时间
        """
        element = self.find_element(by, value, timeout)
        element.clear()
        element.send_keys(text)
    
    def wait_for_page_load(self, timeout: int = 30):
        """
        等待页面加载完成
        
        Args:
            timeout: 超时时间
        """
        WebDriverWait(self.driver, timeout).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
```

## Cypress

开发者友好的前端测试框架。

- 实时重载
- 时间回溯调试
- 开发者友好
- 网络流量控制
- 视频录制

### Cypress测试模式

```javascript
// Cypress测试示例
// cypress/e2e/login.cy.js

describe('登录功能测试', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('成功登录', () => {
    cy.get('[data-testid="username"]').type('testuser');
    cy.get('[data-testid="password"]').type('testpass');
    cy.get('[data-testid="submit"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('.user-profile').should('contain', 'testuser');
  });

  it('登录失败显示错误', () => {
    cy.get('[data-testid="username"]').type('wrong');
    cy.get('[data-testid="password"]').type('wrong');
    cy.get('[data-testid="submit"]').click();
    
    cy.get('.error-message').should('be.visible');
    cy.get('.error-message').should('contain', '用户名或密码错误');
  });

  it('网络请求拦截与Mock', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: { token: 'mock-token', user: { name: 'testuser' } }
    }).as('loginRequest');
    
    cy.get('[data-testid="username"]').type('testuser');
    cy.get('[data-testid="password"]').type('testpass');
    cy.get('[data-testid="submit"]').click();
    
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
  });
});
```

## Appium

移动端自动化测试标准。

- 跨平台移动测试
- iOS/Android支持
- 原生/Hybrid/Web应用
- 多语言客户端
- 云设备集成

### Appium测试封装

```python
from appium import webdriver as appium_driver
from appium.options.android import UiAutomator2Options
from appium.options.ios import XCUITestOptions

class MobileTestBase:
    """
    移动端测试基类
    支持Android和iOS双平台
    """
    def __init__(self):
        self.driver = None
    
    def setup_android(self, app_path: str, device_name: str = None):
        """
        初始化Android测试环境
        
        Args:
            app_path: APK文件路径
            device_name: 设备名称
        """
        options = UiAutomator2Options()
        options.platform_name = "Android"
        options.app = app_path
        if device_name:
            options.device_name = device_name
        options.automation_name = "UiAutomator2"
        
        self.driver = appium_driver.Remote(
            command_executor="http://localhost:4723",
            options=options
        )
    
    def setup_ios(self, app_path: str, device_name: str = None):
        """
        初始化iOS测试环境
        
        Args:
            app_path: APP文件路径
            device_name: 设备名称
        """
        options = XCUITestOptions()
        options.platform_name = "iOS"
        options.app = app_path
        if device_name:
            options.device_name = device_name
        options.automation_name = "XCUITest"
        
        self.driver = appium_driver.Remote(
            command_executor="http://localhost:4723",
            options=options
        )
    
    def find_by_accessibility(self, accessibility_id: str):
        """
        通过Accessibility ID查找元素
        
        Args:
            accessibility_id: 可访问性ID
            
        Returns:
            WebElement: 找到的元素
        """
        return self.driver.find_element("accessibility id", accessibility_id)
    
    def tap(self, x: int, y: int):
        """
        点击屏幕坐标
        
        Args:
            x: X坐标
            y: Y坐标
        """
        self.driver.tap([(x, y)])
    
    def swipe(self, start_x: int, start_y: int, end_x: int, end_y: int, duration: int = 800):
        """
        滑动操作
        
        Args:
            start_x: 起始X坐标
            start_y: 起始Y坐标
            end_x: 结束X坐标
            end_y: 结束Y坐标
            duration: 滑动持续时间（毫秒）
        """
        self.driver.swipe(start_x, start_y, end_x, end_y, duration)
    
    def teardown(self):
        """清理资源"""
        if self.driver:
            self.driver.quit()
```

## 框架选型指南

| 维度 | Playwright | Selenium | Cypress | Appium |
|------|-----------|----------|---------|--------|
| 浏览器支持 | Chromium/Firefox/WebKit | 全浏览器 | Chromium系 | 移动端 |
| 执行速度 | 快 | 中等 | 快 | 中等 |
| 并行执行 | 原生支持 | 需Grid | 商业版 | 需Grid |
| 调试能力 | Trace Viewer | 一般 | 时间回溯 | 一般 |
| CI/CD集成 | 优秀 | 良好 | 良好 | 良好 |
| 学习曲线 | 中等 | 平缓 | 平缓 | 中等 |
| 移动端 | 不支持 | 需Appium | 不支持 | 原生支持 |

## 最佳实践

1. **优先使用data-testid**：避免依赖CSS类名或文本内容
2. **显式等待优于隐式等待**：提高测试稳定性
3. **Page Object模式**：封装页面元素和操作
4. **测试数据独立**：每个测试用例自包含数据
5. **失败截图/录屏**：便于问题定位
6. **并行执行**：缩短测试反馈时间
