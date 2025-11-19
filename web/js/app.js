// 代理配置
const USE_PROXY = false;
const PROXY_BASE = 'http://localhost:8081/proxy?url=';

// 配置列表
const PROVIDERS = {
    chatgpt: {
        label: 'ChatGPT',
        icon: 'images/providers/chatgpt.svg',
        url: 'https://chatgpt.com/chat',
        noIframe: true
    },
    claude: {
        label: 'Claude',
        icon: 'images/providers/claude.png',
        url: 'https://claude.ai',
        noIframe: true
    },
    gemini: {
        label: 'Gemini',
        icon: 'images/providers/gemini.png',
        url: 'https://gemini.google.com/app',
        noIframe: true
    },
    deepseek: {
        label: 'DeepSeek',
        icon: 'images/providers/deepseek.png',
        url: 'https://chat.deepseek.com',
        noIframe: true
    },
    perplexity: {
        label: 'Perplexity',
        icon: 'images/providers/perplexity.png',
        url: 'https://www.perplexity.ai',
        noIframe: true
    },
    grok: {
        label: 'Grok',
        icon: 'images/providers/grok.png',
        url: 'https://grok.com',
        noIframe: true
    },
    doubao: {
        label: '豆包',
        icon: 'images/providers/doubao.png',
        url: 'https://www.doubao.com',
        noIframe: true
    },
    tongyi: {
        label: '通义千问',
        icon: 'images/providers/tongyi.png',
        url: 'https://tongyi.aliyun.com',
        noIframe: true
    },
    google: {
        label: 'Google',
        icon: 'images/providers/google.png',
        url: 'https://www.google.com',
        noIframe: true
    },
    notebooklm: {
        label: 'NotebookLM',
        icon: 'images/providers/notebooklm.png',
        url: 'https://notebooklm.google.com',
        noIframe: true
    },
    ima: {
        label: 'IMA',
        icon: 'images/providers/ima.jpeg',
        url: 'https://ima.qq.com',
        noIframe: true
    },
    attention_local: {
        label: 'Attention',
        icon: 'images/时间管道.JPG',
        url: '../AI-Aplication/vendor/attention/index.html',
        noIframe: false
    },
    excalidraw: {
        label: 'Excalidraw',
        icon: 'images/providers/excalidraw.svg',
        url: 'https://excalidraw.com',
        noIframe: false
    }
};

// 状态管理
let currentProviderKey = null;
let appOrder = JSON.parse(localStorage.getItem('appOrder')) || Object.keys(PROVIDERS);

// 确保新添加的 provider 也在列表中
Object.keys(PROVIDERS).forEach(key => {
    if (!appOrder.includes(key)) {
        appOrder.push(key);
    }
});

// DOM 元素
const launcherView = document.getElementById('launcher-view');
const appView = document.getElementById('app-view');
const appGrid = document.getElementById('app-grid');
const iframe = document.getElementById('ai-frame');
const fallbackOverlay = document.getElementById('iframe-fallback');
const headerTitle = document.getElementById('current-provider-name');
const openExternalBtn = document.getElementById('open-external');
const homeBtn = document.getElementById('home-btn');
const fallbackIcon = document.getElementById('fallback-icon');
const fallbackProviderName = document.getElementById('fallback-provider');
const fallbackLink = document.getElementById('fallback-link');
const clockTime = document.getElementById('clock-time');
const clockDate = document.getElementById('clock-date');

// 初始化
function init() {
    renderAppGrid();
    updateClock();
    setInterval(updateClock, 1000);
    
    // 监听事件
    openExternalBtn.addEventListener('click', () => {
        if (currentProviderKey) {
            const p = PROVIDERS[currentProviderKey];
            if (p) window.open(p.url, '_blank');
        }
    });

    homeBtn.addEventListener('click', showLauncher);
}

// 更新时钟
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockTime.textContent = `${hours}:${minutes}`;
    
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = days[now.getDay()];
    clockDate.textContent = `${month}月${date}日 ${day}`;
}

// 渲染应用网格
function renderAppGrid() {
    appGrid.innerHTML = '';
    appOrder.forEach(key => {
        const p = PROVIDERS[key];
        if (!p) return;

        const appIcon = document.createElement('div');
        appIcon.className = 'app-icon';
        appIcon.dataset.key = key;
        appIcon.draggable = true; // 启用拖拽

        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'app-icon-img-wrapper';
        
        const img = document.createElement('img');
        img.src = p.icon;
        img.alt = p.label;
        
        const label = document.createElement('span');
        label.textContent = p.label;

        imgWrapper.appendChild(img);
        appIcon.appendChild(imgWrapper);
        appIcon.appendChild(label);

        // 点击事件
        appIcon.addEventListener('click', (e) => {
            // 如果正在拖拽，不触发点击
            if (appIcon.classList.contains('dragging')) return;
            openApp(key);
        });

        // 拖拽事件
        addDragEvents(appIcon);

        appGrid.appendChild(appIcon);
    });
}

// 拖拽逻辑
let draggedItem = null;

function addDragEvents(item) {
    item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        item.classList.add('dragging');
        // 设置拖拽效果
        e.dataTransfer.effectAllowed = 'move';
        // 延迟一点，让原元素可见，但半透明
        setTimeout(() => item.style.opacity = '0.5', 0);
    });

    item.addEventListener('dragend', () => {
        draggedItem = null;
        item.classList.remove('dragging');
        item.style.opacity = '1';
        saveOrder();
    });

    item.addEventListener('dragover', (e) => {
        e.preventDefault(); // 允许放置
        const target = e.target.closest('.app-icon');
        if (target && target !== draggedItem) {
            const rect = target.getBoundingClientRect();
            const next = (e.clientX - rect.left) / (rect.right - rect.left) > 0.5;
            appGrid.insertBefore(draggedItem, next ? target.nextSibling : target);
        }
    });
    
    // 移动端触摸拖拽支持
    let touchTimeout;
    let touchStartX, touchStartY;
    let ghostEl = null;
    let isDragging = false;

    // 触摸开始
    item.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) return;
        
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        
        touchTimeout = setTimeout(() => {
            startDrag(e.touches[0]);
        }, 500); // 长按 500ms 开始拖拽
    }, {passive: false});

    // 监听 item 上的移动，用于取消长按
    item.addEventListener('touchmove', (e) => {
        if (!isDragging) {
            const dx = Math.abs(e.touches[0].clientX - touchStartX);
            const dy = Math.abs(e.touches[0].clientY - touchStartY);
            if (dx > 10 || dy > 10) {
                clearTimeout(touchTimeout);
            }
        }
    }, {passive: false});

    // 监听 item 上的结束，用于取消长按
    item.addEventListener('touchend', () => {
        if (!isDragging) {
            clearTimeout(touchTimeout);
        }
    });

    function startDrag(touch) {
        isDragging = true;
        item.classList.add('dragging');
        if (navigator.vibrate) navigator.vibrate(50);
        
        // 创建幽灵元素
        ghostEl = item.cloneNode(true);
        ghostEl.style.position = 'fixed';
        ghostEl.style.zIndex = '1000';
        ghostEl.style.opacity = '0.8';
        ghostEl.style.pointerEvents = 'none';
        ghostEl.style.transform = 'scale(1.1)';
        ghostEl.style.width = item.offsetWidth + 'px';
        ghostEl.style.height = item.offsetHeight + 'px';
        
        updateGhostPosition(touch);
        document.body.appendChild(ghostEl);
        item.style.opacity = '0.3';

        // 添加全局监听器
        document.addEventListener('touchmove', onGlobalTouchMove, {passive: false});
        document.addEventListener('touchend', onGlobalTouchEnd);
        document.addEventListener('touchcancel', onGlobalTouchEnd);
    }

    function onGlobalTouchMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        updateGhostPosition(touch);
        
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetItem = target ? target.closest('.app-icon') : null;
        
        if (targetItem && targetItem !== item && appGrid.contains(targetItem)) {
            const rect = targetItem.getBoundingClientRect();
            const next = (touch.clientX - rect.left) / (rect.right - rect.left) > 0.5;
            
            if (next) {
                appGrid.insertBefore(item, targetItem.nextSibling);
            } else {
                appGrid.insertBefore(item, targetItem);
            }
        }
    }

    function onGlobalTouchEnd(e) {
        if (isDragging) {
            isDragging = false;
            item.classList.remove('dragging');
            item.style.opacity = '1';
            
            if (ghostEl) {
                ghostEl.remove();
                ghostEl = null;
            }
            
            saveOrder();
            
            // 移除全局监听器
            document.removeEventListener('touchmove', onGlobalTouchMove);
            document.removeEventListener('touchend', onGlobalTouchEnd);
            document.removeEventListener('touchcancel', onGlobalTouchEnd);
        }
    }

    function updateGhostPosition(touch) {
        if (!ghostEl) return;
        ghostEl.style.left = (touch.clientX - ghostEl.offsetWidth / 2) + 'px';
        ghostEl.style.top = (touch.clientY - ghostEl.offsetHeight / 2) + 'px';
    }
}

// 保存顺序
function saveOrder() {
    const newOrder = Array.from(appGrid.children).map(item => item.dataset.key);
    appOrder = newOrder;
    localStorage.setItem('appOrder', JSON.stringify(appOrder));
}

// 打开应用
function openApp(key) {
    const p = PROVIDERS[key];
    if (!p) return;

    // 所有应用都在新标签页打开
    window.open(p.url, '_blank');
}

// 返回桌面
function showLauncher() {
    appView.style.display = 'none';
    launcherView.style.display = 'flex';
    iframe.src = 'about:blank'; // 清理资源
    currentProviderKey = null;
    document.title = 'AI 全家桶 - 桌面版';
}

// 加载 Provider 内容
function loadProvider(key) {
    const p = PROVIDERS[key];
    if (!p) return;

    document.title = `${p.label} - AI 全家桶`;

    const isLocal = p.url.startsWith('../') || p.url.startsWith('./');
    const useProxyForThis = USE_PROXY && !isLocal && !p.noIframe;
    
    if (p.noIframe) {
        // 理论上 openApp 已经拦截了，但为了保险
        showFallback(p);
        iframe.src = 'about:blank';
    } else {
        hideFallback();
        if (useProxyForThis) {
            iframe.src = PROXY_BASE + encodeURIComponent(p.url);
        } else {
            iframe.src = p.url;
        }
    }
}

function showFallback(p) {
    fallbackOverlay.style.display = 'flex';
    fallbackIcon.src = p.icon;
    fallbackProviderName.textContent = p.label;
    fallbackLink.href = p.url;
    iframe.style.opacity = '0';
}

function hideFallback() {
    fallbackOverlay.style.display = 'none';
    iframe.style.opacity = '1';
}

// 启动
init();
