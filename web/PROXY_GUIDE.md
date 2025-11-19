# 绕过限制指南：使用反向代理

既然你想在同一个网页内打开多个 AI 网页，你需要绕过浏览器的 `X-Frame-Options` 限制。
我们为你准备了一个代理服务器脚本。

## 第一步：启动代理服务器
1. 确保你安装了 Node.js。
2. 在项目根目录打开终端，运行：
   ```bash
   node cors-proxy.js
   ```
   成功后会显示：`CORS Proxy running on http://localhost:8081`

## 第二步：配置网页使用代理
1. 打开文件 `web/js/app.js`。
2. 找到第 4 行：
   ```javascript
   const USE_PROXY = false; 
   ```
   将其改为 `true`：
   ```javascript
   const USE_PROXY = true;
   ```
3. **关键**：如果你在手机上使用，需要把下一行的 `localhost` 改成你的电脑 IP：
   ```javascript
   // 例如你的电脑 IP 是 192.168.1.5
   const PROXY_BASE = 'http://192.168.1.5:8081/proxy?url=';
   ```

## 第三步：刷新网页
刷新你的网页版。现在当你点击 ChatGPT 或 Claude 时，网页会尝试通过你的电脑代理加载页面。

**⚠️ 注意事项**
- **ChatGPT/Claude 可能仍然无法使用**：因为这些网站有强大的 Cloudflare 防护，会检测到你是通过代理访问的，从而显示验证码或白屏。这是技术上的硬伤。
- **Google/Gemini/普通网站**：通常可以通过这种方式正常嵌入。
- **最佳手机方案**：如果你在 Android 手机上，强烈建议下载 **Kiwi Browser**，然后直接安装原本的 Chrome 插件版，那是唯一完美无缺的方案。


