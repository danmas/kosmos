# Kosmos Panel — памятка для LLM/агентов

Цель: быстро ввести модель в контекст проекта для безопасных правок и расширений.

## Архитектура
- Backend (Node.js/Express) — `server/`:
  - `index.js`: HTTP‑сервер, статика `web/`, API: `/api/servers`, `/api/inventory`, `/api/reload`, `/api/test-ssh`, запуск scheduler’а.
  - `monitor.js`: загрузка/горячий reload `inventory.json`, кеш кредов, проверки: http, httpJson(JSONPath via jsonpath-plus), tcp, tls(сертификат), systemd, sshCommand, dockerContainer; агрегирование статуса (цвет).
  - `ws.js`: WS `/ws/terminal` (pty shell по ssh2) и `/ws/tail` (`tail -F` по ssh2). Сообщения JSON: `{type:"data"|"err"|"fatal", data?, error?}`.
- Frontend (ванильный JS) — `web/`:
  - `index.html`, `styles.css`, `app.js`: сетка плиток, тултипы, меню действий, xterm.js терминал, плавающие окна терминала/tail, открытие отдельного окна `/term.html`.
  - `term.html`: автономная вкладка/окно с xterm.
- Конфиг:
  - `inventory.json`: список серверов, сервисов и привязок к кредам.
    - `credentials`: `privateKeyPath?`, `passphrase?`, `useAgent?`, `password?`
    - `servers[].ssh { host, port, user, credentialId }`
    - `servers[].services[]` со `type`: http|httpJson|tcp|tls|systemd|sshCommand|dockerContainer
  - `.env`: **(Новое)** Файл для хранения секретов (пароли, пути к ключам). Не должен быть в git.

## Контракты
- `/api/servers` ⇒ `{ ts, servers:[{ id,name,env,color,ssh,services:[{id,name,type,ok,detail}] }] }`
- Цвет: `green|yellow|red|gray` по всем сервисам.
- WS вход клиента:
  - terminal: `{type:"data",data}` | `{type:"resize",cols,rows}` | `{type:"close"}`
  - tail: клиент ничего не шлёт (кроме закрытия сокета).

## Инварианты и безопасность
- `inventory.json` перечитывается in‑place; кеш приватных ключей очищается.
- Не логировать содержимое ключей; в API допустимы только пути.
- Терминал/tail — только по SSH. Ошибки показывать как `[FATAL]`.
- Front без сборки/фреймворков; xterm.js — через CDN.
- SSH-агент: на Windows используется путь `\\\\.\\pipe\\openssh-ssh-agent`.
- `.env` файл используется для подстановки переменных в `inventory.json` (например, `${SSH_PASSWORD}`).

## Как расширять
- Новый тип проверки: добавить `checkX(...)` и подключить в `runServiceCheck()` (`server/monitor.js`).
- Новое действие UI: дописать пункт в `openActions()` (`web/app.js`) и обработчик.
- Новые источники статуса: расширить `pollOnce()` параллельным сбором.
- WS‑протокол: добавлять новые `type` без lomки существующих.

## Известные места/долги
- Нет auth в веб‑панели (при необходимости — JWT + роли).
- Нужен whitelist/confirm для опасных экшенов.

## Примеры
- Терминал во вкладке: `/term.html?mode=terminal&serverId=usa`
- Tail во вкладке: `/term.html?mode=tail&serverId=usa&path=/var/log/syslog`

## Локальный запуск
```bash
npm install
npm start
```

## Где смотреть при сбоях
- SSH/WS: `server/ws.js` (логи `[ws] ...`) и `[FATAL]` в UI.
- Reload конфига: `server/monitor.js` (fs.watchFile), `/api/reload`.
- Вёрстка/fit xterm: `web/styles.css`, `web/app.js`.