# Kosmos Panel — панель мониторинга и управления серверами (Node.js + ванильный JS)

Агент‑less панель в стиле «космической приборки»: опрашивает сервера по SSH/HTTP/TCP, показывает статусы, даёт быстрый доступ к терминалу (xterm.js) и хвостам логов. Фронт — чистый JavaScript, бэк — Node.js.

## Возможности
- Мониторинг без агентов:
  - HTTP, HTTP JSON (JSONPath), TCP порт, TLS срок сертификата
  - systemd unit, произвольная SSH‑команда (regex‑паттерн успешности)
  - Docker контейнер (через `docker ps` по SSH)
- Плитки серверов (цвет: green/yellow/red/gray), тултипы со сводкой
- Быстрые действия: терминал SSH (xterm.js), tail логов, ssh:// и копирование команды
- Плавающие окна терминала/tail (несколько одновременно) и отдельная вкладка `/term.html`
- Горячая перезагрузка `inventory.json` (без рестартов)

## Быстрый старт (Windows)
Требования: Node.js 18+.
```powershell
npm install
npm start
```
Откройте `http://localhost:3000`. Сразу поправьте `inventory.json` (хосты/пользователь/креды) — файл перечитывается автоматически.

## Конфигурация — `inventory.json`
Минимальный пример:
```json
{
  "credentials": [
    {
      "id": "cred-sample",
      "type": "ssh-key",
      "privateKeyPath": "C:/Users/you/.ssh/id_ed25519",
      "passphrase": null,
      "useAgent": false
    }
  ],
  "servers": [
    {
      "id": "usa",
      "name": "usa",
      "env": "prod",
      "ssh": { "host": "usa", "port": 22, "user": "root", "credentialId": "cred-sample" },
      "services": [
        { "id": "web", "type": "http", "name": "Web", "url": "http://usa:3002", "expectStatus": 200 }
      ]
    }
  ],
  "poll": { "intervalSec": 15, "concurrency": 6 }
}
```
Поддерживаемые сервисы: `http`, `httpJson`, `tcp`, `tls`, `systemd`, `sshCommand`, `dockerContainer`. Подробно про SSH/креды/отладку — `README_AUTH.md`.

## Интерфейс
- Плитки → hover: тултип; click: меню действий
- Меню: терминал/tail во встроенном окне, в плавающих окнах и в отдельной вкладке (`/term.html`)
- Терминал — xterm.js: цвета, UTF‑8, прокрутка; ввод идёт прямо в терминал

## API/WS
- REST: `GET /api/servers`, `GET /api/inventory`, `POST /api/reload`, `GET /api/test-ssh?serverId=...`
- WS: `/ws/terminal?serverId=...`, `/ws/tail?serverId=...&path=/var/log/syslog&lines=200`
- Сообщения WS: `{ "type": "data"|"err"|"fatal", "data"?: "...", "error"?: "..." }`

## Структура проекта