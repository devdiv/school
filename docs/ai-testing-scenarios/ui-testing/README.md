# UI测试

> AI应用的UI测试覆盖Web界面、桌面应用、移动端界面等，验证AI功能的用户交互体验。

---

## 1. UI测试框架

### 1.1 测试金字塔

```
       / \
      / E2E \           端到端测试 (少量)
     /───────\
    / 集成测试  \         组件集成测试
   /───────────\
  /  组件测试    \       组件级测试 (中等)
 /────────────────\
/  单元测试        \     单元测试 (大量)
```

### 1.2 测试类型

| 类型 | 测试粒度 | 维护成本 | 执行速度 | 推荐占比 |
|------|---------|---------|---------|---------|
| 单元 | 组件/函数 | 低 | 快 | 60% |
| 集成 | 模块交互 | 中 | 中 | 30% |
| E2E | 完整流程 | 高 | 慢 | 10% |

---

## 2. Web UI测试

### 2.1 测试实现

```python
class WebUITester:
    """Web UI测试"""
    
    def __init__(self, driver: WebDriver):
        self.driver = driver
    
    def test_chat_interface(self):
        """聊天界面测试"""
        # 打开页面
        self.driver.get("https://app.example.com")
        
        # 输入消息
        input_box = self.driver.find_element(By.ID, "chat-input")
        input_box.send_keys("你好，请介绍一下自己")
        
        # 发送
        send_btn = self.driver.find_element(By.ID, "send-btn")
        send_btn.click()
        
        # 等待响应
        wait = WebDriverWait(self.driver, 10)
        response = wait.until(
            EC.presence_of_element_located((By.ID, "chat-response"))
        )
        
        # 验证响应不为空
        assert len(response.text) > 0
        
        # 验证加载动画消失
        loader = self.driver.find_element(By.CLASS_NAME, "loading")
        assert not loader.is_displayed()
    
    def test_streaming_display(self):
        """流式显示测试"""
        self.driver.get("https://app.example.com")
        
        input_box = self.driver.find_element(By.ID, "chat-input")
        input_box.send_keys("请写一首诗")
        self.driver.find_element(By.ID, "send-btn").click()
        
        # 验证逐字显示效果
        response_area = self.driver.find_element(By.ID, "chat-response")
        initial_text = response_area.text
        
        time.sleep(2)
        updated_text = response_area.text
        
        assert len(updated_text) > len(initial_text)
```

### 2.2 关键测试场景

| 场景 | 测试内容 | 优先级 |
|------|---------|--------|
| 对话界面 | 消息输入、发送、显示 | P0 |
| 流式输出 | 打字效果、中断、恢复 | P1 |
| 错误处理 | 网络错误、超时提示 | P1 |
| 多模态输入 | 图片上传、文件拖拽 | P2 |
| 复制分享 | 内容复制、链接分享 | P2 |
| 历史记录 | 历史对话加载、删除 | P1 |

---

## 3. 移动端UI测试

### 3.1 测试策略

```python
class MobileUITester:
    """移动端UI测试"""
    
    def test_app_launch(self):
        """应用启动测试"""
        # 冷启动时间
        start_time = time.time()
        self.app.launch()
        elapsed = time.time() - start_time
        assert elapsed < 3.0  # 冷启动不超过3秒
    
    def test_voice_input(self):
        """语音输入测试"""
        # 点击语音按钮
        self.driver.find_element(By.ID, "voice-btn").click()
        
        # 等待语音识别中状态
        wait = WebDriverWait(self.driver, 10)
        wait.until(EC.presence_of_element_located(
            (By.CLASS_NAME, "listening")
        ))
        
        # 模拟语音输入
        self.simulate_voice("你好")
        
        # 验证识别结果
        result = self.driver.find_element(By.ID, "voice-result")
        assert result.text == "你好"
```

### 3.2 兼容性测试矩阵

| 平台 | 版本范围 | 设备数 |
|------|---------|--------|
| iOS | 14-17 | 5+ |
| Android | 10-14 | 8+ |
| Web | Chrome/Safari/Firefox/Edge | 全覆盖 |

---

## 4. 视觉回归测试

### 4.1 实现

```python
class VisualRegressionTester:
    """视觉回归测试"""
    
    def compare(self, current_screenshot: Image,
                baseline_screenshot: Image) -> DiffResult:
        """
        截图对比测试
        
        方法:
        1. 像素级对比
        2. 感知哈希对比
        3. 结构相似性(SSIM)
        """
        # 像素级差异
        pixel_diff = self._pixel_compare(
            current_screenshot, baseline_screenshot
        )
        
        # SSIM对比
        ssim = self._structural_similarity(
            current_screenshot, baseline_screenshot
        )
        
        # 判断是否通过
        threshold = 0.95  # SSIM阈值
        pixel_diff_pct = pixel_diff / (
            current_screenshot.width * current_screenshot.height
        )
        
        return DiffResult(
            ssim_score=ssim,
            pixel_diff_pct=pixel_diff_pct,
            passed=ssim >= threshold and pixel_diff_pct < 0.01,
            diff_image=self._generate_diff_image(
                current_screenshot, baseline_screenshot
            ),
        )
```

---

## 5. 无障碍测试

| 测试项 | 工具 | 标准 |
|--------|------|------|
| 颜色对比 | axe | WCAG 2.1 AA |
| 屏幕阅读器 | NVDA/VoiceOver | WCAG 2.1 |
| 键盘导航 | 手动测试 | WCAG 2.1 |
| ARIA标签 | axe | WAI-ARIA规范 |
| 焦点管理 | 手动测试 | WCAG 2.1 |

---

## 6. 工具链

| 工具 | 用途 | 特点 |
|------|------|------|
| **Playwright** | Web E2E测试 | 跨浏览器、自动等待 |
| **Cypress** | Web E2E测试 | 开发体验好 |
| **Appium** | 移动测试 | 跨平台 |
| **Maestro** | 移动测试 | 声明式YAML |
| **Percy** | 视觉回归 | 云端对比 |
| **axe** | 无障碍测试 | 自动化扫描 |

---

*最后更新：2025-01-15 | 维护团队：UI测试组*
