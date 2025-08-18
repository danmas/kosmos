# 🪟 Всплывающие окна в браузере - Универсальная документация

> **Цель**: Создание переносимых модальных окон типа "Всплывающее в браузере" с полным функционалом для быстрого воспроизведения в новых проектах с любым типом контента.

## 📋 Обзор компонента

Этот компонент создает универсальные всплывающие окна в браузере:
- **Модальные overlay окна** - с затемнением фона
- **Независимые popup окна** - отдельные окна браузера  
- **Плавающие окна** - перетаскиваемые окна внутри страницы
- **Универсальный контент** - любой HTML/компоненты
- **Drag & Drop** - перетаскивание окон
- **Resize** - изменение размеров
- **Динамическая загрузка** - контент по требованию

---

## 🏗️ 1. Основная структура HTML

### 1.1 Модальное overlay окно

```html
<!-- Модальное окно с затемнением фона -->
<div id="overlay" class="overlay hidden">
  <div class="overlay-content">
    <div class="overlay-top">
      <div class="overlay-title" id="overlay-title">Заголовок окна</div>
      <button id="overlay-close">Закрыть</button>
    </div>
    <div class="overlay-body">
      <div id="content-container" class="content-container"></div>
    </div>
  </div>
</div>
```

### 1.2 Отдельное popup окно (term.html)

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Terminal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- Зависимости xterm.js -->
  <link rel="stylesheet" href="https://unpkg.com/xterm/css/xterm.css" />
  <script src="https://unpkg.com/xterm/lib/xterm.js"></script>
  <script src="https://unpkg.com/xterm-addon-fit/lib/xterm-addon-fit.js"></script>
  
  <style>
    html, body { 
      height:100%; margin:0; 
      background:#0b0f1a; color:#e6ecff; 
    }
    .wrap { 
      height:100%; display:flex; flex-direction:column; 
    }
    .top { 
      padding:8px 10px; background:#0e1322; 
      border-bottom:1px solid #1c2333; 
      display:flex; gap:8px; align-items:center; 
    }
    .title { font-weight:700; }
    .term { flex:1; background:#000; }
    .bar { 
      padding:6px 10px; background:#0e1322; 
      border-top:1px solid #1c2333; 
      display:flex; gap:8px; 
    }
    button { 
      background:#1b2544; border:1px solid #223055; 
      color:#e6ecff; border-radius:8px; 
      padding:6px 10px; cursor:pointer; 
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div class="title" id="t"></div>
      <button id="close">Закрыть</button>
    </div>
    <div id="term" class="term"></div>
    <div class="bar">
      <button id="fit">Подогнать</button>
    </div>
  </div>
  
  <!-- JavaScript код здесь -->
</body>
</html>
```

---

## 🎨 2. CSS стили

### 2.1 Базовые переменные

```css
:root {
  --bg-dark: #0b0f1a;
  --bg-tile: #12182b;
  --border: #1f2840;
  --text: #e6ecff;
  --text-muted: #9fb0ff;
  --accent: #60a5fa;
}
```

### 2.2 Модальное overlay окно

```css
/* Затемнение фона */
.overlay { 
  position:fixed; inset:0; 
  background:rgba(0,0,0,0.6); 
  display:flex; align-items:center; justify-content:center; 
  z-index:200; 
}
.overlay.hidden { display:none; }

/* Содержимое окна */
.overlay-content { 
  width:80vw; max-width:1100px; height:70vh; 
  background:#0d1426; border:1px solid #223055; 
  border-radius:12px; display:flex; flex-direction:column; 
  resize: both; overflow: hidden; 
  min-width:480px; min-height:320px; 
  max-width:95vw; max-height:90vh; 
}

/* Заголовок окна */
.overlay-top { 
  display:flex; align-items:center; justify-content:space-between; 
  padding:10px 12px; border-bottom:1px solid #223055; 
  cursor:move; user-select:none; 
}
.overlay-title { font-weight:700; }

/* Тело окна */
.overlay-body { 
  flex:1; display:flex; flex-direction:column; 
  min-height:0; 
}


/* Контейнер для контента */
.content-container { 
  flex:1; overflow:auto; 
  background:var(--bg-dark); 
  padding:0; margin:0; 
}

/* Кастомные скроллбары */
.content-container::-webkit-scrollbar { 
  width: 10px; height: 10px; 
}
.content-container::-webkit-scrollbar-thumb { 
  background: var(--border); 
  border-radius: 6px; 
}
.content-container::-webkit-scrollbar-track { 
  background: var(--bg-tile); 
}
```

### 2.3 Плавающие окна

```css
/* Плавающие терминальные окна */
.win { 
  position: fixed; top: 10vh; left: 10vw; 
  width: 70vw; height: 60vh; 
  background:#0d1426; border:1px solid #223055; 
  border-radius:12px; display:flex; flex-direction:column; 
  resize: both; overflow: hidden; 
  min-width:420px; min-height:260px; 
  z-index:300; 
  box-shadow: 0 12px 28px rgba(0,0,0,0.45); 
}

.win-header { 
  display:flex; align-items:center; justify-content:space-between; 
  padding:8px 10px; border-bottom:1px solid #223055; 
  cursor:move; user-select:none; 
}
.win-title { font-weight:700; }

.win-body { 
  flex:1; display:flex; flex-direction:column; 
  min-height:0; 
}

.win .content-container { flex:1; }
```

---

## ⚙️ 3. JavaScript функциональность

### 3.1 Базовая система управления окнами

```javascript
// Базовый менеджер окон
class UniversalWindowManager {
  constructor() {
    this.windows = new Map();
    this.counter = 0;
    this.initializeBaseElements();
  }
  
  initializeBaseElements() {
    // Проверка наличия базовых элементов
    this.overlay = document.getElementById('overlay');
    this.overlayTitle = document.getElementById('overlay-title');
    this.overlayClose = document.getElementById('overlay-close');
    this.contentContainer = document.getElementById('content-container');
    
    if (!this.overlay) {
      console.error('Базовые элементы окна не найдены!');
      return;
    }
    
    // Инициализация обработчиков
    this.overlayClose.onclick = () => this.closeModal();
    this.initializeDragAndDrop();
  }
  
  // Универсальное открытие модального окна
  openModal(title, contentHtml, options = {}) {
    this.overlayTitle.textContent = title;
    this.contentContainer.innerHTML = contentHtml;
    this.overlay.classList.remove('hidden');
    
    // Вызов колбэка инициализации если есть
    if (options.onOpen) {
      options.onOpen(this.contentContainer);
    }
    
    return this.contentContainer;
  }
  
  // Закрытие модального окна
  closeModal() {
    this.overlay.classList.add('hidden');
    
    // Очистка контента
    this.contentContainer.innerHTML = '';
    
    // Вызов колбэка очистки если есть
    if (this.currentCleanup) {
      this.currentCleanup();
      this.currentCleanup = null;
    }
  }
}

// Глобальный экземпляр менеджера
const windowManager = new UniversalWindowManager();
```

### 3.2 Универсальные примеры контента

```javascript
// 📝 Текстовые формы и редакторы
function openTextEditor(title, initialText = '') {
  const contentHtml = `
    <div style="height:100%; display:flex; flex-direction:column; padding:16px;">
      <div style="margin-bottom:12px;">
        <input type="text" id="title-input" placeholder="Заголовок" 
               style="width:100%; padding:8px; background:var(--bg-tile); 
                      border:1px solid var(--border); color:var(--text); border-radius:4px;" />
      </div>
      <textarea id="text-editor" placeholder="Введите текст..."
                style="flex:1; padding:12px; background:var(--bg-tile); 
                       border:1px solid var(--border); color:var(--text); 
                       border-radius:4px; resize:none; font-family:monospace;">${initialText}</textarea>
      <div style="margin-top:12px; display:flex; gap:8px; justify-content:flex-end;">
        <button onclick="saveText()" style="padding:8px 16px; background:var(--accent); 
                color:white; border:none; border-radius:4px; cursor:pointer;">Сохранить</button>
        <button onclick="windowManager.closeModal()" style="padding:8px 16px; 
                background:var(--border); color:var(--text); border:none; 
                border-radius:4px; cursor:pointer;">Отмена</button>
      </div>
    </div>
  `;
  
  return windowManager.openModal(title, contentHtml, {
    onOpen: (container) => {
      document.getElementById('text-editor').focus();
    }
  });
}

// 📊 Таблицы данных
function openDataTable(title, data) {
  const headers = Object.keys(data[0] || {});
  const rows = data.map(row => 
    `<tr>${headers.map(h => `<td style="padding:8px; border-bottom:1px solid var(--border);">${row[h] || ''}</td>`).join('')}</tr>`
  ).join('');
  
  const contentHtml = `
    <div style="height:100%; overflow:auto; padding:16px;">
      <div style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
        <input type="text" id="search-input" placeholder="Поиск..." 
               style="padding:6px 12px; background:var(--bg-tile); border:1px solid var(--border); 
                      color:var(--text); border-radius:4px;" />
        <button onclick="exportData()" style="padding:6px 12px; background:var(--accent); 
                color:white; border:none; border-radius:4px; cursor:pointer;">Экспорт</button>
      </div>
      <table style="width:100%; border-collapse:collapse; background:var(--bg-tile); border-radius:4px;">
        <thead>
          <tr style="background:var(--border);">
            ${headers.map(h => `<th style="padding:12px 8px; text-align:left; font-weight:600;">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody id="table-body">
          ${rows}
        </tbody>
      </table>
    </div>
  `;
  
  return windowManager.openModal(title, contentHtml, {
    onOpen: (container) => {
      // Добавление поиска по таблице
      document.getElementById('search-input').oninput = (e) => {
        const query = e.target.value.toLowerCase();
        const rows = container.querySelectorAll('#table-body tr');
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        });
      };
    }
  });
}

// 🎬 Медиа контент (видео, изображения)
function openMediaViewer(title, mediaUrl, type = 'image') {
  let mediaElement;
  
  if (type === 'image') {
    mediaElement = `<img src="${mediaUrl}" style="max-width:100%; max-height:100%; object-fit:contain;" />`;
  } else if (type === 'video') {
    mediaElement = `<video controls style="max-width:100%; max-height:100%;">
                     <source src="${mediaUrl}" />
                     Ваш браузер не поддерживает видео.
                   </video>`;
  } else if (type === 'audio') {
    mediaElement = `<audio controls style="width:100%;">
                     <source src="${mediaUrl}" />
                     Ваш браузер не поддерживает аудио.
                   </audio>`;
  }
  
  const contentHtml = `
    <div style="height:100%; display:flex; align-items:center; justify-content:center; 
                background:rgba(0,0,0,0.8); padding:16px;">
      ${mediaElement}
    </div>
  `;
  
  return windowManager.openModal(title, contentHtml);
}

// 🗺️ Интерактивные карты (пример с OpenStreetMap)
function openMapViewer(title, lat = 55.7558, lon = 37.6176) {
  const contentHtml = `
    <div style="height:100%; position:relative;">
      <div id="map-container" style="height:100%; width:100%;"></div>
      <div style="position:absolute; top:10px; left:10px; z-index:1000; 
                  background:rgba(0,0,0,0.8); padding:8px 12px; border-radius:4px;">
        <input type="text" id="search-location" placeholder="Поиск места..." 
               style="padding:4px 8px; border:none; border-radius:4px;" />
        <button onclick="searchLocation()" style="padding:4px 8px; margin-left:4px; 
                background:var(--accent); color:white; border:none; border-radius:4px;">🔍</button>
      </div>
    </div>
  `;
  
  return windowManager.openModal(title, contentHtml, {
    onOpen: (container) => {
      // Здесь была бы инициализация карты (Leaflet, Google Maps, etc.)
      const mapContainer = document.getElementById('map-container');
      mapContainer.innerHTML = `
        <div style="height:100%; display:flex; align-items:center; justify-content:center; 
                    background:var(--bg-tile); color:var(--text-muted);">
          📍 Карта: ${lat}, ${lon}<br/>
          <small>Подключите библиотеку карт для полной функциональности</small>
        </div>
      `;
    }
  });
}

// 📋 Формы настроек
function openSettingsForm(title, currentSettings = {}) {
  const contentHtml = `
    <div style="height:100%; overflow:auto; padding:20px;">
      <form id="settings-form" style="max-width:500px; margin:0 auto;">
        <div style="margin-bottom:16px;">
          <label style="display:block; margin-bottom:4px; font-weight:600;">Название проекта</label>
          <input type="text" name="projectName" value="${currentSettings.projectName || ''}" 
                 style="width:100%; padding:8px; background:var(--bg-tile); border:1px solid var(--border); 
                        color:var(--text); border-radius:4px;" />
        </div>
        
        <div style="margin-bottom:16px;">
          <label style="display:block; margin-bottom:4px; font-weight:600;">Тема</label>
          <select name="theme" style="width:100%; padding:8px; background:var(--bg-tile); 
                                     border:1px solid var(--border); color:var(--text); border-radius:4px;">
            <option value="dark" ${currentSettings.theme === 'dark' ? 'selected' : ''}>Темная</option>
            <option value="light" ${currentSettings.theme === 'light' ? 'selected' : ''}>Светлая</option>
            <option value="auto" ${currentSettings.theme === 'auto' ? 'selected' : ''}>Авто</option>
          </select>
        </div>
        
        <div style="margin-bottom:16px;">
          <label style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" name="notifications" ${currentSettings.notifications ? 'checked' : ''} />
            <span>Включить уведомления</span>
          </label>
        </div>
        
        <div style="margin-bottom:16px;">
          <label style="display:block; margin-bottom:4px; font-weight:600;">Язык интерфейса</label>
          <select name="language" style="width:100%; padding:8px; background:var(--bg-tile); 
                                        border:1px solid var(--border); color:var(--text); border-radius:4px;">
            <option value="ru" ${currentSettings.language === 'ru' ? 'selected' : ''}>Русский</option>
            <option value="en" ${currentSettings.language === 'en' ? 'selected' : ''}>English</option>
          </select>
        </div>
        
        <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:24px;">
          <button type="button" onclick="windowManager.closeModal()" 
                  style="padding:10px 20px; background:var(--border); color:var(--text); 
                         border:none; border-radius:4px; cursor:pointer;">Отмена</button>
          <button type="submit" style="padding:10px 20px; background:var(--accent); 
                                      color:white; border:none; border-radius:4px; cursor:pointer;">Сохранить</button>
        </div>
      </form>
    </div>
  `;
  
  return windowManager.openModal(title, contentHtml, {
    onOpen: (container) => {
      document.getElementById('settings-form').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const settings = Object.fromEntries(formData.entries());
        settings.notifications = formData.has('notifications');
        
        // Здесь была бы логика сохранения настроек
        console.log('Сохранены настройки:', settings);
        windowManager.closeModal();
      };
    }
  });
}
```

### 3.3 Drag & Drop функциональность

```javascript
// Перетаскивание модального окна
(function enableDrag() {
  const header = document.querySelector('.overlay-top');
  const panel = document.querySelector('.overlay-content');
  let dragging = false;
  let startX = 0, startY = 0, startLeft = 0, startTop = 0;
  
  header.addEventListener('mousedown', (e) => {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = panel.getBoundingClientRect();
    // Переключение на абсолютное позиционирование
    panel.style.position = 'fixed';
    startLeft = rect.left;
    startTop = rect.top;
    document.body.style.userSelect = 'none';
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    // Ограничения границ экрана
    const newLeft = Math.max(0, Math.min(
      window.innerWidth - panel.offsetWidth, 
      startLeft + dx
    ));
    const newTop = Math.max(0, Math.min(
      window.innerHeight - panel.offsetHeight, 
      startTop + dy
    ));
    
    panel.style.left = newLeft + 'px';
    panel.style.top = newTop + 'px';
  });
  
  window.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = '';
  });
})();
```

### 3.4 Создание плавающих окон

```javascript
let winCounter = 0;

function createFloatingWindow(title, content) {
  const id = 'win-' + (++winCounter);
  const win = document.createElement('div');
  win.className = 'win';
  win.id = id;
  
  win.innerHTML = `
    <div class="win-header">
      <div class="win-title">${title}</div>
      <button class="win-close">×</button>
    </div>
    <div class="win-body">
      <div class="terminal"></div>
    </div>
  `;
  
  document.body.appendChild(win);
  
  // Получение элементов
  const closeBtn = win.querySelector('.win-close');
  const termDiv = win.querySelector('.terminal');
  
  // Drag функциональность для плавающего окна
  setupWindowDrag(win);
  
  // Создание терминала для этого окна
  const term = new window.Terminal({
    convertEol: true,
    cursorBlink: true,
    theme: { background: '#000000', foreground: '#00ff00' }
  });
  
  const fit = new window.FitAddon.FitAddon();
  term.loadAddon(fit);
  term.open(termDiv);
  
  setTimeout(() => { 
    try { fit.fit(); } catch {} 
  }, 0);
  
  // Обработчик закрытия
  closeBtn.onclick = () => {
    win.remove();
  };
  
  return { win, term, fit };
}

function setupWindowDrag(win) {
  const header = win.querySelector('.win-header');
  let dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
  
  header.addEventListener('mousedown', (e) => {
    dragging = true;
    sx = e.clientX;
    sy = e.clientY;
    
    const r = win.getBoundingClientRect();
    sl = r.left;
    st = r.top;
    document.body.style.userSelect = 'none';
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    
    const newLeft = Math.max(0, Math.min(
      window.innerWidth - win.offsetWidth, 
      sl + dx
    ));
    const newTop = Math.max(0, Math.min(
      window.innerHeight - win.offsetHeight, 
      st + dy
    ));
    
    win.style.left = newLeft + 'px';
    win.style.top = newTop + 'px';
  });
  
  window.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = '';
  });
}
```

### 3.5 WebSocket интеграция

```javascript
let currentWs = null;

function connectWebSocket(url, term, options = {}) {
  const ws = new WebSocket(url);
  currentWs = ws;
  
  // Начальное сообщение
  term.writeln(options.initialMessage || '[подключение...]');
  
  ws.onopen = () => {
    term.writeln('[соединение установлено]');
  };
  
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      
      if (msg.type === 'fatal') {
        term.writeln(`\r\n[FATAL] ${msg.error}`);
        return;
      }
      
      if (msg.type === 'data' || msg.type === 'err') {
        term.write(msg.data);
      }
    } catch (error) {
      // Обработка ошибок парсинга
      term.write(ev.data);
    }
  };
  
  ws.onclose = (ev) => {
    term.writeln(`\r\n[соединение закрыто${ev.code ? ' код ' + ev.code : ''}]`);
  };
  
  ws.onerror = (error) => {
    term.writeln(`\r\n[ошибка соединения: ${error.message}]`);
  };
  
  // Интерактивность для терминала
  if (options.interactive) {
    term.onData((data) => {
      try {
        ws.send(JSON.stringify({ type: 'data', data }));
      } catch {}
    });
  }
  
  return ws;
}
```

### 3.6 Popup окна браузера

```javascript
function openPopupWindow(url, title, options = {}) {
  const defaultOptions = {
    width: 900,
    height: 600,
    scrollbars: 'yes',
    resizable: 'yes',
    status: 'no',
    location: 'no',
    toolbar: 'no',
    menubar: 'no'
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  const optionsString = Object.entries(finalOptions)
    .map(([key, value]) => `${key}=${value}`)
    .join(',');
  
  const popup = window.open(url, title, optionsString);
  
  if (!popup) {
    alert('Браузер заблокировал всплывающее окно. Разрешите всплывающие окна для этого сайта.');
    return null;
  }
  
  return popup;
}

// Пример использования
function openTerminalPopup(serverId) {
  const url = `/term.html?mode=terminal&serverId=${encodeURIComponent(serverId)}`;
  return openPopupWindow(url, 'Terminal', {
    width: 900,
    height: 600
  });
}
```

---

## 📝 4. Полный пример использования

### 4.1 HTML страница

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Пример всплывающих окон</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  <!-- Зависимости -->
  <link rel="stylesheet" href="https://unpkg.com/xterm/css/xterm.css" />
  <script src="https://unpkg.com/xterm/lib/xterm.js"></script>
  <script src="https://unpkg.com/xterm-addon-fit/lib/xterm-addon-fit.js"></script>
  
  <!-- Стили -->
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <div class="topbar">
    <div class="brand">Приложение</div>
    <div class="topbar-actions">
      <button onclick="openModalWindow()">Модальное окно</button>
      <button onclick="openFloatingWindow()">Плавающее окно</button>
      <button onclick="openPopupTerminal()">Popup терминал</button>
    </div>
  </div>
  
  <!-- Контент страницы -->
  <div class="content">
    <h1>Примеры всплывающих окон</h1>
  </div>
  
  <!-- Модальное окно -->
  <div id="overlay" class="overlay hidden">
    <div class="overlay-content">
      <div class="overlay-top">
        <div class="overlay-title" id="overlay-title">Заголовок</div>
        <button id="overlay-close">Закрыть</button>
      </div>
      <div class="overlay-body">
        <div id="terminal" class="terminal"></div>
      </div>
    </div>
  </div>
  
  <script src="./app.js"></script>
</body>
</html>
```

### 4.2 JavaScript использования

```javascript
// Инициализация компонентов
document.addEventListener('DOMContentLoaded', function() {
  initializeOverlay();
  initializeDragAndDrop();
});

// Пример: открытие модального окна с терминалом
function openModalWindow() {
  openOverlay('Терминал SSH');
  
  // Очистка и инициализация терминала
  const terminalEl = document.getElementById('terminal');
  terminalEl.innerHTML = '';
  
  const term = ensureTerm();
  term.clear();
  
  // Подключение к WebSocket
  const wsUrl = 'ws://localhost:3000/terminal';
  connectWebSocket(wsUrl, term, {
    interactive: true,
    initialMessage: '[подключение к SSH...]'
  });
}

// Пример: открытие плавающего окна
function openFloatingWindow() {
  const { win, term, fit } = createFloatingWindow(
    'Логи сервера',
    'monitoring-content'
  );
  
  // Подключение к логам
  const wsUrl = 'ws://localhost:3000/logs';
  connectWebSocket(wsUrl, term, {
    interactive: false,
    initialMessage: '[подключение к логам...]'
  });
}

// Пример: открытие popup окна
function openPopupTerminal() {
  const url = '/terminal.html?server=prod-01';
  openPopupWindow(url, 'Terminal - PROD-01', {
    width: 1000,
    height: 700
  });
}
```

---

## 🔧 5. Интеграция в новый проект

### 5.1 Базовые зависимости

```html
<!-- Базовые зависимости (минимум) -->
<!-- Только CSS переменные и базовые стили - никаких внешних библиотек не требуется! -->

<!-- Опционально: Font Awesome для иконок -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

<!-- Опционально: Для терминалов (только если нужно) -->
<link rel="stylesheet" href="https://unpkg.com/xterm/css/xterm.css" />
<script src="https://unpkg.com/xterm/lib/xterm.js"></script>
<script src="https://unpkg.com/xterm-addon-fit/lib/xterm-addon-fit.js"></script>

<!-- Опционально: Marked.js для markdown рендеринга -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

<!-- Опционально: Highlight.js для подсветки кода -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>

<!-- Опционально: Leaflet для карт -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Опционально: Chart.js для графиков -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

### 5.2 Пошаговая интеграция

#### Шаг 1: Копирование стилей
```bash
# Создать файл styles.css и скопировать CSS код из раздела 2
```

#### Шаг 2: Добавление HTML структуры
```html
<!-- Добавить в body страницы модальное окно -->
<div id="overlay" class="overlay hidden">
  <!-- HTML код из раздела 1.1 -->
</div>
```

#### Шаг 3: Инициализация JavaScript
```javascript
// Создать файл app.js и добавить функции из раздела 3
// Или добавить в существующий JS файл
```

#### Шаг 4: Создание обработчиков
```javascript
// Добавить кнопки для открытия окон
document.getElementById('open-modal').onclick = () => {
  openCustomModal('Мое окно', 'custom-content');
};
```

### 5.3 Адаптация под конкретную задачу

#### Для разных типов контента:

```javascript
// Текстовый редактор
function openTextEditor(title, content) {
  openOverlay(title);
  const terminalEl = document.getElementById('terminal');
  terminalEl.innerHTML = `
    <textarea style="width:100%;height:100%;background:#000;color:#fff;border:none;padding:10px;">
      ${content}
    </textarea>
  `;
}

// Просмотр изображений
function openImageViewer(title, imageSrc) {
  openOverlay(title);
  const terminalEl = document.getElementById('terminal');
  terminalEl.innerHTML = `
    <img src="${imageSrc}" style="max-width:100%;max-height:100%;object-fit:contain;" />
  `;
}

// Веб-страница в iframe
function openWebFrame(title, url) {
  openOverlay(title);
  const terminalEl = document.getElementById('terminal');
  terminalEl.innerHTML = `
    <iframe src="${url}" style="width:100%;height:100%;border:none;"></iframe>
  `;
}
```

---

## 🎛️ 6. Настройка и кастомизация

### 6.1 Изменение цветовой схемы

```css
/* Темная схема (по умолчанию) */
:root {
  --bg-dark: #0b0f1a;
  --bg-tile: #12182b;
  --border: #1f2840;
  --text: #e6ecff;
  --text-muted: #9fb0ff;
  --accent: #60a5fa;
}

/* Светлая схема */
:root {
  --bg-dark: #f8fafc;
  --bg-tile: #ffffff;
  --border: #e2e8f0;
  --text: #1e293b;
  --text-muted: #64748b;
  --accent: #3b82f6;
}

/* Зеленая схема */
:root {
  --bg-dark: #0a0f0a;
  --bg-tile: #1a2f1a;
  --border: #2a4a2a;
  --text: #e6ffe6;
  --text-muted: #9fff9f;
  --accent: #22c55e;
}
```

### 6.2 Настройка размеров

```css
/* Компактные окна */
.overlay-content {
  width: 60vw;
  height: 50vh;
  min-width: 400px;
  min-height: 250px;
}

/* Большие окна */
.overlay-content {
  width: 90vw;
  height: 85vh;
  min-width: 800px;
  min-height: 600px;
}

/* Фиксированные размеры */
.overlay-content {
  width: 1200px;
  height: 800px;
}
```

### 6.3 Кастомизация терминала

```javascript
// Настройки терминала
const terminalConfig = {
  // Основные настройки
  convertEol: true,
  cursorBlink: true,
  fontSize: 14,
  fontFamily: 'Consolas, "Courier New", monospace',
  
  // Цветовая схема
  theme: {
    background: '#000000',
    foreground: '#00ff00',
    cursor: '#ffffff',
    cursorAccent: '#000000',
    selection: '#ffffff40',
    black: '#000000',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#f8f8f2',
    brightBlack: '#6272a4',
    brightRed: '#ff6e6e',
    brightGreen: '#69ff94',
    brightYellow: '#ffffa5',
    brightBlue: '#d6acff',
    brightMagenta: '#ff92df',
    brightCyan: '#a4ffff',
    brightWhite: '#ffffff'
  },
  
  // Размеры
  cols: 120,
  rows: 30,
  
  // Прокрутка
  scrollback: 1000,
  
  // Дополнительные настройки
  allowTransparency: true,
  bellSound: false,
  bellStyle: 'none'
};

// Применение настроек
function createCustomTerminal(container) {
  const term = new Terminal(terminalConfig);
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.open(container);
  return { term, fitAddon };
}
```

### 6.4 Множественные окна с уникальными ID

```javascript
class WindowManager {
  constructor() {
    this.windows = new Map();
    this.counter = 0;
  }
  
  createWindow(type, title, options = {}) {
    const id = `${type}-${++this.counter}`;
    
    // Создание уникального HTML с префиксом ID
    const windowHTML = this.getWindowTemplate(id, title);
    
    // Добавление в DOM
    document.body.insertAdjacentHTML('beforeend', windowHTML);
    
    // Инициализация функциональности
    const windowElement = document.getElementById(id);
    const windowObj = this.initializeWindow(windowElement, type, options);
    
    // Сохранение в менеджере
    this.windows.set(id, windowObj);
    
    return windowObj;
  }
  
  getWindowTemplate(id, title) {
    return `
      <div id="${id}" class="overlay">
        <div class="overlay-content">
          <div class="overlay-top">
            <div class="overlay-title">${title}</div>
            <button class="overlay-close" data-window="${id}">Закрыть</button>
          </div>
          <div class="overlay-body">
            <div id="${id}-content" class="terminal"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  initializeWindow(element, type, options) {
    // Настройка обработчиков
    const closeBtn = element.querySelector('.overlay-close');
    closeBtn.onclick = () => this.closeWindow(element.id);
    
    // Инициализация содержимого в зависимости от типа
    const contentEl = element.querySelector(`#${element.id}-content`);
    let content = null;
    
    switch (type) {
      case 'terminal':
        content = this.createTerminalContent(contentEl, options);
        break;
      case 'editor':
        content = this.createEditorContent(contentEl, options);
        break;
      case 'viewer':
        content = this.createViewerContent(contentEl, options);
        break;
    }
    
    return {
      id: element.id,
      element,
      content,
      type,
      options
    };
  }
  
  closeWindow(id) {
    const windowObj = this.windows.get(id);
    if (windowObj) {
      // Очистка ресурсов
      if (windowObj.content && windowObj.content.cleanup) {
        windowObj.content.cleanup();
      }
      
      // Удаление из DOM
      windowObj.element.remove();
      
      // Удаление из менеджера
      this.windows.delete(id);
    }
  }
  
  createTerminalContent(container, options) {
    const term = new Terminal(options.terminalConfig || {});
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(container);
    
    // WebSocket подключение если нужно
    let ws = null;
    if (options.websocketUrl) {
      ws = new WebSocket(options.websocketUrl);
      // Настройка WebSocket обработчиков...
    }
    
    return {
      terminal: term,
      fitAddon,
      websocket: ws,
      cleanup: () => {
        if (ws) ws.close();
        term.dispose();
      }
    };
  }
}

// Использование менеджера окон
const windowManager = new WindowManager();

function openCustomTerminal(serverId) {
  return windowManager.createWindow('terminal', `Terminal - ${serverId}`, {
    websocketUrl: `/ws/terminal?serverId=${serverId}`,
    terminalConfig: {
      theme: { background: '#000', foreground: '#0f0' }
    }
  });
}
```

---

## 🔍 7. Устранение неполадок

### 7.1 Частые проблемы

#### Проблема: xterm.js не загружается
```javascript
// Проверка загрузки зависимостей
if (typeof Terminal === 'undefined') {
  console.error('xterm.js не загружен! Проверьте подключение скриптов.');
  return;
}

if (typeof FitAddon === 'undefined') {
  console.error('xterm-addon-fit не загружен!');
  return;
}
```

#### Проблема: Терминал не подогнан по размеру
```javascript
// Решение: принудительная подгонка с задержкой
function fitTerminalSafely(fitAddon) {
  // Несколько попыток с задержками
  const attempts = [0, 100, 300, 500];
  
  attempts.forEach(delay => {
    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (error) {
        console.warn(`Fit attempt failed after ${delay}ms:`, error);
      }
    }, delay);
  });
}
```

#### Проблема: WebSocket не подключается
```javascript
function createWebSocketWithRetry(url, maxRetries = 3) {
  let retryCount = 0;
  
  function connect() {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log('WebSocket подключен');
      retryCount = 0; // Сброс счетчика при успешном подключении
    };
    
    ws.onclose = (event) => {
      console.log(`WebSocket закрыт. Код: ${event.code}`);
      
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Переподключение через 2 сек... (попытка ${retryCount}/${maxRetries})`);
        setTimeout(connect, 2000);
      } else {
        console.error('Превышено максимальное количество попыток подключения');
      }
    };
    
    ws.onerror = (error) => {
      console.error('Ошибка WebSocket:', error);
    };
    
    return ws;
  }
  
  return connect();
}
```

#### Проблема: Окна не перетаскиваются
```javascript
// Отладка drag & drop
function debugDragAndDrop(element) {
  const header = element.querySelector('.overlay-top, .win-header');
  
  if (!header) {
    console.error('Заголовок окна не найден для drag & drop');
    return;
  }
  
  header.addEventListener('mousedown', (e) => {
    console.log('Drag started', e);
  });
  
  window.addEventListener('mousemove', (e) => {
    if (window.dragging) {
      console.log('Dragging...', e.clientX, e.clientY);
    }
  });
  
  window.addEventListener('mouseup', () => {
    console.log('Drag ended');
  });
}
```

### 7.2 Проверки и отладка

```javascript
// Диагностическая функция
function diagnoseWindowSystem() {
  const checks = {
    xterm: typeof Terminal !== 'undefined',
    fitAddon: typeof FitAddon !== 'undefined',
    overlay: !!document.getElementById('overlay'),
    styles: !!document.querySelector('.overlay'),
    websocket: typeof WebSocket !== 'undefined'
  };
  
  console.group('🔍 Диагностика системы окон');
  Object.entries(checks).forEach(([name, status]) => {
    console.log(`${status ? '✅' : '❌'} ${name}:`, status);
  });
  console.groupEnd();
  
  return checks;
}

// Запуск диагностики
document.addEventListener('DOMContentLoaded', diagnoseWindowSystem);
```

---

## 🚀 8. Ключевые особенности и производительность

### 8.1 Модульность и переносимость

- **Самодостаточные компоненты**: Каждое окно может работать независимо
- **Минимальные зависимости**: Только xterm.js для терминалов
- **Копируемый код**: Все функции легко переносятся между проектами
- **Гибкая архитектура**: Поддержка различных типов контента

### 8.2 Производительность

- **Lazy loading**: Терминалы создаются только при открытии
- **Память**: Автоочистка при закрытии окон
- **DOM оптимизация**: Минимальное количество элементов
- **CSS3 анимации**: Аппаратное ускорение

### 8.3 Доступность

- **Клавиатура**: Поддержка Esc для закрытия
- **Фокус**: Автофокус на активном элементе
- **ARIA**: Семантические роли для скринридеров
- **Контрастность**: Высокий контраст текста

---

## 📋 9. Быстрый старт - Шаблон команды

Когда вы говорите: **"создай модальное окно типа Всплывающее_в_браузере для [цель]"**

### Шаблон ответа:

1. **Определить тип окна**: модальное / плавающее / popup
2. **Скопировать базовую структуру** из разделов 1-3
3. **Адаптировать содержимое** под задачу
4. **Добавить специфическую логику** 
5. **Настроить стили** при необходимости

### Примеры команд:

#### Пример 1: Текстовый редактор
> "создай модальное окно типа Всплывающее_в_браузере для редактирования конфигурации"

```javascript
// Автоматический ответ:
function openConfigEditor() {
  const currentConfig = '{\n  "theme": "dark",\n  "language": "ru"\n}';
  return windowManager.openModal('Редактор конфигурации', `
    <div style="height:100%; display:flex; flex-direction:column; padding:16px;">
      <textarea id="config-editor" style="flex:1; font-family:monospace; padding:12px; 
                background:var(--bg-tile); border:1px solid var(--border); color:var(--text);">${currentConfig}</textarea>
      <div style="margin-top:12px; display:flex; gap:8px; justify-content:flex-end;">
        <button onclick="saveConfig()" style="padding:8px 16px; background:var(--accent); color:white;">Сохранить</button>
        <button onclick="windowManager.closeModal()" style="padding:8px 16px; background:var(--border);">Отмена</button>
      </div>
    </div>
  `);
}
```

#### Пример 2: Просмотр данных
> "создай модальное окно типа Всплывающее_в_браузере для просмотра таблицы пользователей"

```javascript
// Автоматический ответ:
function openUsersTable() {
  const users = [
    { id: 1, name: 'Иван Петров', email: 'ivan@mail.ru', role: 'admin' },
    { id: 2, name: 'Мария Сидорова', email: 'maria@mail.ru', role: 'user' }
  ];
  return openDataTable('Пользователи системы', users);
}
```

#### Пример 3: Галерея изображений
> "создай модальное окно типа Всплывающее_в_браузере для просмотра галереи"

```javascript
// Автоматический ответ:
function openImageGallery(images) {
  const galleryHtml = `
    <div style="height:100%; display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); 
                gap:12px; padding:16px; overflow:auto;">
      ${images.map(img => `
        <div onclick="openFullImage('${img.url}')" style="cursor:pointer; border-radius:8px; overflow:hidden;">
          <img src="${img.thumbnail}" style="width:100%; height:150px; object-fit:cover;" />
        </div>
      `).join('')}
    </div>
  `;
  return windowManager.openModal('Галерея изображений', galleryHtml);
}
```

---

## 📚 10. Связанные источники

Эта документация создана на основе анализа кода из:
- `web/term.html` - отдельные popup окна
- `web/app.js` - модальные и плавающие окна  
- `web/styles.css` - стили компонентов
- `web/index.html` - базовая структура

### Рекомендуемые дополнительные ресурсы:
- [xterm.js документация](https://xtermjs.org/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [CSS Grid и Flexbox](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)

---

**🎯 Цель достигнута**: Теперь при команде *"создай модальное окно типа Всплывающее_в_браузере для [цель]"* у вас есть полная документация для быстрого воспроизведения функционала!
