const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 8081; // 代理服务器端口

const server = http.createServer((clientReq, clientRes) => {
  const reqUrl = url.parse(clientReq.url);
  
  // 简单的路径处理： /proxy?url=TARGET_URL
  const query = new URLSearchParams(reqUrl.query);
  let targetUrlStr = query.get('url');

  // 如果没有 url 参数，但路径不是 /proxy，可能是重定向后的路径
  // 例如 /auth/login，我们需要尝试恢复它 (但这需要我们知道上一次的 host，这里做不到完美)
  // 所以更好的办法是在重定向时重写 Location 头
  
  if (!targetUrlStr && reqUrl.pathname === '/') {
    clientRes.writeHead(200, { 'Content-Type': 'text/plain' });
    clientRes.end('Usage: /proxy?url=https://example.com');
    return;
  }

  if (!targetUrlStr) {
    // 尝试处理相对路径的资源请求 (css, js, auth redirects)
    // 这只是一个极其简陋的尝试，实际上很难完美代理像 ChatGPT 这样复杂的单页应用
    clientRes.writeHead(404);
    clientRes.end('Proxy Error: Missing url parameter. Complex sites with redirects (like ChatGPT) break simple proxies.');
    return;
  }

  console.log(`Proxying: ${targetUrlStr}`);

  try {
    const targetUrl = new URL(targetUrlStr);
    const protocol = targetUrl.protocol === 'https:' ? https : http;

    const proxyReq = protocol.request(targetUrl, {
      method: clientReq.method,
      headers: {
        ...clientReq.headers,
        host: targetUrl.host,
        // 伪造 Referer 和 Origin 以绕过防盗链
        referer: targetUrl.origin,
        origin: targetUrl.origin
      }
    }, (proxyRes) => {
      // 复制 Header
      const headers = { ...proxyRes.headers };

      // 删除安全头
      delete headers['x-frame-options'];
      delete headers['content-security-policy'];
      delete headers['content-security-policy-report-only'];
      
      // 允许跨域
      headers['access-control-allow-origin'] = '*';

      // 修复 Cookie：移除 Domain 和 Secure 属性，防止 Cookie 在 localhost 写入失败
      if (headers['set-cookie']) {
        headers['set-cookie'] = headers['set-cookie'].map(cookie => {
          return cookie
            .replace(/Domain=[^;]+;/gi, '')
            .replace(/Secure;/gi, '')
            .replace(/SameSite=None/gi, 'SameSite=Lax'); // 降级 SameSite
        });
      }

      // 关键：重写重定向 Location
      if (headers['location']) {
        const originalLocation = headers['location'];
        let newLocation = originalLocation;
        
        // 如果是相对路径，补全为绝对路径
        if (originalLocation.startsWith('/')) {
          newLocation = `${targetUrl.origin}${originalLocation}`;
        }
        
        // 再次包装进代理
        headers['location'] = `http://localhost:${PORT}/proxy?url=${encodeURIComponent(newLocation)}`;
        console.log(`Rewriting redirect: ${originalLocation} -> ${headers['location']}`);
      }

      clientRes.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(clientRes);
    });

    proxyReq.on('error', (e) => {
      console.error(e);
      clientRes.writeHead(500);
      clientRes.end('Proxy error: ' + e.message);
    });

    clientReq.pipe(proxyReq);

  } catch (e) {
    clientRes.writeHead(400);
    clientRes.end('Invalid URL');
  }
});

console.log(`CORS Proxy running on http://localhost:${PORT}`);
server.listen(PORT);
