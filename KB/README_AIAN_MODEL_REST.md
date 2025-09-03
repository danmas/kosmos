# REST API сервера AIAN-MODEL

Документация по REST API для управления промптами и историей ответов.

## 🗂️ Управление моделями

С последним обновлением управление списками моделей для **GROQ** и **OpenRouter** было вынесено во внешние конфигурационные файлы для удобства и гибкости.

-   **Модели GROQ**: настраиваются в файле `groq-models.json`
-   **Модели OpenRouter**: настраиваются в файле `openrouter-models.json`

Для добавления, удаления или изменения модели достаточно отредактировать соответствующий JSON-файл. Сервер автоматически подхватит изменения при следующем запуске.

### Формат данных в `*.json` файлах

Каждая модель описывается объектом со следующими полями:

-   `name` (string, обязательное): Уникальное имя модели, используемое в API.
-   `visible_name` (string): Отображаемое имя в интерфейсе.
-   `provider` (string, обязательное): `"groq"` или `"openroute"`.
-   `showInApi` (boolean): Показывать ли модель в списке `/api/available-models`.
-   `use_in_ui` (boolean): Доступна ли модель для выбора в UI.
-   `context` (number): Максимальный размер контекста в токенах.
-   `fast` (boolean): Является ли модель высокопроизводительной (для UI).

**Пример (`groq-models.json`):**

```json
{
  "models": [
    { 
      "name": "llama-3.3-70b-versatile", 
      "visible_name": "Llama 3.3 70B (Versatile)", 
      "provider": "groq",
      "context": 8192,
      "fast": true
    }
  ]
}
```

## 🚀 Мультипровайдерная архитектура

Сервер поддерживает работу с двумя провайдерами AI моделей:

### GROQ API (рекомендуется для скорости)
- ⚡ **В 5-10 раз быстрее** традиционных API
- 🤖 **Модели**: Llama 3.3 70B, Llama 3 8B/70B, Mixtral 8x7B, Gemma 2 9B
- 🆓 **Щедрые бесплатные лимиты**
- 🔧 **Настройка**: Требует переменную `GROQ_API_KEY` в `.env`

### OpenRouter API (разнообразие моделей)
- 🌐 **20+ различных моделей** от Google, DeepSeek, Qwen и др.
- 🆓 **Много free-tier моделей**
- 🔧 **Настройка**: Требует переменную `OPENROUTER_API_KEY` в `.env`

### Автоматический выбор провайдера

Система автоматически определяет провайдера по имени модели:
- Модели с именами вида `llama-3.3-70b-versatile` → GROQ
- Модели с именами вида `google/gemini-2.0-flash-exp:free` → OpenRouter

Можно принудительно указать провайдера через параметр `provider`:

**Возможные значения параметра `provider`:**
- `"groq"` - Принудительно использовать GROQ API (быстрый inference)
- `"openroute"` - Принудительно использовать OpenRouter API (разнообразие моделей)
- Не указан (null/undefined) - Автоматическое определение по имени модели

### Унифицированные ответы

Все ответы содержат поле `provider` для идентификации использованного сервиса:

```json
{
  "success": true,
  "content": "Ответ модели",
  "model": "llama-3.3-70b-versatile",
  "provider": "groq",
  "usage": {...}
}
```

## 🔧 Параметр `provider` - Подробное описание

Параметр `provider` позволяет управлять выбором AI провайдера для обработки запроса.

### Возможные значения

| Значение | Описание | Характеристики |
|----------|----------|----------------|
| `"groq"` | GROQ API | ⚡ Быстрый inference, 🆓 Щедрые лимиты, 🤖 Llama/Mixtral модели |
| `"openroute"` | OpenRouter API | 🌐 Большой выбор моделей, 🔄 Разные провайдеры, 💰 Разные тарифы |
| не указан (null) | Автоматическое определение | 🎯 Определяется по `provider` в конфигурации модели |

### Логика автоматического определения

Когда параметр `provider` в запросе не указан, система автоматически определяет провайдера на основе поля `provider` в конфигурационном файле модели (`groq-models.json` или `openrouter-models.json`).

**Примеры использования**

```javascript
// GROQ модели (паттерн: простое имя без слэшей)
"llama-3.3-70b-versatile"     → groq
"mixtral-8x7b-32768"          → groq  
"gemma2-9b-it"                → groq

// OpenRouter модели (паттерн: организация/модель)
"google/gemini-2.0-flash:free"    → openroute
"deepseek/deepseek-chat:free"     → openroute
"anthropic/claude-3-sonnet"       → openroute
```

### Примеры использования

**1. Автоматическое определение (рекомендуется):**
```json
{
  "model": "llama-3.3-70b-versatile",
  // provider не указан → автоматически выберется groq
  "prompt": "Ты помощник",
  "inputText": "Привет!"
}
```

**2. Принудительный выбор GROQ:**
```json
{
  "model": "llama-3.3-70b-versatile",
  "provider": "groq", // принудительно GROQ
  "prompt": "Ты помощник",
  "inputText": "Привет!"
}
```

**3. Принудительный выбор OpenRouter:**
```json
{
  "model": "deepseek/deepseek-chat:free",
  "provider": "openroute", // принудительно OpenRouter
  "prompt": "Ты помощник",
  "inputText": "Привет!"
}
```

**4. Переопределение автоматического выбора:**
```json
{
  "model": "llama-3.3-70b-versatile", // обычно GROQ
  "provider": "openroute", // но принудительно через OpenRouter
  "prompt": "Ты помощник",
  "inputText": "Привет!"
}
```

### Обработка ошибок

- ❌ **Неверное значение**: `"provider": "invalid"` → ошибка валидации
- ❌ **Недоступный провайдер**: `"provider": "groq"` без `GROQ_API_KEY` → ошибка конфигурации
- ❌ **Несовместимая модель**: GROQ модель через OpenRouter → ошибка API

### Поле `provider` в ответе

Все успешные ответы содержат поле `provider`, указывающее какой провайдер фактически использовался:

```json
{
  "success": true,
  "content": "Ответ модели",
  "model": "llama-3.3-70b-versatile",
  "provider": "groq", // ← фактически использованный провайдер
  "usage": {...}
}
```

## API для отправки запросов к AI моделям

### Отправка запроса к AI модели через сервер

```
POST /api/send-request
```

**Тело запроса:**
```json
{
  "model": "llama-3.3-70b-versatile",
  "prompt": "Текст системного промпта",
  "inputText": "Текст пользовательского запроса",
  "provider": "groq",
  "saveResponse": false,
  "useRag": false,
  "contextCode": "code1"
}
```

**Ответ (успешный):**
```json
{
  "success": true,
  "content": "Ответ от AI модели",
  "model": "llama-3.3-70b-versatile",
  "provider": "groq",
  "usage": {
    "prompt_tokens": 42,
    "completion_tokens": 128,
    "total_tokens": 170
  },
  "rag": null
}
```

**Ответ (ошибка):**
```json
{
  "error": "Описание ошибки"
}
```

**Ответ (ошибка) с расширенной информацией:**
```json
{
  "error": "Описание ошибки",
  "data": {
    // Содержит полные данные ответа от API при некорректной структуре ответа
  }
}
```

или

```json
{
  "error": "Описание ошибки",
  "details": {
    // Содержит дополнительную информацию об ошибке, например:
    // - данные ответа от API при ошибке API
    // - информация о запросе при сетевых ошибках
    // - стек ошибки при общих ошибках выполнения
  }
}
```

**Параметры запроса:**
- `model` (обязательный) - идентификатор модели AI для использования
- `prompt` (обязательный) - системный промпт для модели
- `inputText` (обязательный) - запрос пользователя
- `provider` (необязательный) - принудительный выбор провайдера. **Возможные значения:**
  - `"groq"` - использовать GROQ API (рекомендуется для скорости)
  - `"openroute"` - использовать OpenRouter API (больше моделей)
  - Не указан - автоматическое определение по имени модели
- `saveResponse` (необязательный, по умолчанию `false`) - флаг для автоматического сохранения ответа в историю
- `useRag` (необязательный, по умолчанию `false`) - флаг для использования RAG
- `contextCode` (необязательный) - код контекста для RAG, если useRag=true

### Проверка доступности API-ключа

```
GET /api/check-api-key
```

**Ответ:**
```json
{
  "isAvailable": true,
  "serviceProvider": "OpenRouter"
}
```

## Преимущества отправки запросов через сервер

1. **Безопасность** - API-ключи не передаются на клиентскую сторону
2. **Мониторинг** - все запросы логируются на сервере
3. **Централизованный контроль** - легко внедрить ограничения, квоты или проверки
4. **Кэширование** - возможность реализовать кэширование ответов на стороне сервера
5. **Надежность** - лучшая обработка ошибок и повторных попыток

## Использование в интерфейсе

В пользовательском интерфейсе добавлены две кнопки для отправки запросов:

- **Send Request (Client)** - отправляет запрос напрямую к API из браузера
- **Send Request (Server)** - отправляет запрос через серверный эндпоинт

Рекомендуется использовать серверный метод для большинства случаев, особенно в продакшн-окружении.


## Конфигурация

### Получение текущей конфигурации сервера

```
GET /api/config
```

**Ответ:**
```json
{
  "server": {
    "port": "3000",
    "nodeEnv": "development",
    "isTestMode": false
  },
  "n8n": {
    "webhookUrl": "https://example.com/webhook"
  },
  "apiKey": "your-openrouter-api-key",
  "logging": {
    "level": "info",
    "filename": "combined.log",
    "errorFilename": "error.log"
  }
}
```

## Управление промптами

### Получение списка всех промптов

```
GET /api/prompts
```

**Ответ:**
```json
[
  {
    "name": "Анализ текста",
    "text": "Проанализируй следующий текст: {{text}}"
  },
  {
    "name": "Генерация идей",
    "text": "Предложи 5 идей для: {{topic}}"
  }
]
```

### Добавление нового промпта

```
POST /api/prompts
```

**Тело запроса:**
```json
{
  "name": "Новый промпт",
  "text": "Содержание промпта"
}
```

**Ответ:**
```json
{
  "message": "Prompt added successfully"
}
```

### Обновление существующего промпта

```
PUT /api/prompts/:name
```

**Параметры пути:**
- `name` - имя промпта для обновления

**Тело запроса:**
```json
{
  "text": "Новое содержание промпта"
}
```

**Ответ:**
```json
{
  "message": "Prompt updated successfully"
}
```

### Удаление промпта

```
DELETE /api/prompts/:name
```

**Параметры пути:**
- `name` - имя промпта для удаления

**Ответ:**
```json
{
  "message": "Prompt deleted successfully"
}
```

## Управление историей ответов

### Получение истории ответов

```
GET /api/responses
```

**Параметры запроса:**
- `sortBy` - поле для сортировки (необязательно)
- `sortOrder` - порядок сортировки: `asc` или `desc` (необязательно)
- `model` - фильтр по модели (необязательно)
- `prompt` - фильтр по имени промпта (необязательно)
- `dateFrom` - фильтр по начальной дате (необязательно)
- `dateTo` - фильтр по конечной дате (необязательно)
- `limit` - ограничение количества результатов (необязательно)

**Ответ:**
```json
[
  {
    "id": "1615293487123",
    "timestamp": "2023-03-09T12:31:27.123Z",
    "model": "gpt-3.5-turbo",
    "promptName": "Анализ текста",
    "prompt": "Проанализируй следующий текст: {{text}}",
    "inputText": "Пример текста для анализа",
    "response": "Ответ модели на запрос"
  }
]
```

### Сохранение нового ответа

```
POST /api/responses
```

**Тело запроса:**
```json
{
  "model": "gpt-3.5-turbo",
  "promptName": "Анализ текста",
  "prompt": "Проанализируй следующий текст: {{text}}",
  "inputText": "Пример текста для анализа",
  "response": "Ответ модели на запрос"
}
```

**Ответ:**
```json
{
  "message": "Response saved successfully",
  "id": "1615293487123"
}
```

### Удаление записи из истории

```
DELETE /api/responses/:id
```

**Параметры пути:**
- `id` - идентификатор записи для удаления

**Ответ:**
```json
{
  "message": "Response deleted successfully"
}
```

## Структура файлов хранения данных

Данные хранятся в JSON-файлах:

- **Промпты:** `../../MYDATA/ai-analytics/prompts.json`
- **История ответов:** `../../MYDATA/ai-analytics/responses.json`

## Конфигурация сервера

Конфигурация сервера загружается из файла `props.env` и доступна через объект `config`:

- `port` - порт сервера (по умолчанию 3000)
- `n8nWebhookUrl` - URL для вебхука n8n
- `isTestMode` - флаг тестового режима
- `openRouterKey` - ключ API для OpenRouter
- `logging` - настройки логирования



---
---

### Отправка запроса к AI модели с выбором промпта по имени

```
POST /api/send-request-sys
```

**Тело запроса:**
```json
{
  "model": "llama-3.3-70b-versatile",
  "prompt_name": "Имя системного промпта",
  "inputText": "Текст пользовательского запроса",
  "provider": "groq",
  "saveResponse": true
}
```

**Параметры запроса:**
- `model` (обязательный) - идентификатор модели AI для использования
- `prompt_name` (обязательный) - имя системного промпта, хранящегося в базе промптов
- `inputText` (обязательный) - запрос пользователя
- `provider` (необязательный) - принудительный выбор провайдера. **Возможные значения:**
  - `"groq"` - использовать GROQ API (рекомендуется для скорости)
  - `"openroute"` - использовать OpenRouter API (больше моделей)
  - Не указан - автоматическое определение по имени модели
- `saveResponse` (необязательный, по умолчанию `true`) - флаг для автоматического сохранения ответа в историю

**Ответ (успешный):**
```json
{
  "success": true,
  "content": "Ответ от AI модели",
  "model": "llama-3.3-70b-versatile",
  "provider": "groq",
  "usage": {
    "prompt_tokens": 42,
    "completion_tokens": 128,
    "total_tokens": 170
  },
  "prompt_used": {
    "name": "Имя системного промпта",
    "text": "Текст системного промпта"
  }
}
```

**Ответ (ошибка):**
```json
{
  "error": "Описание ошибки"
}
```

**Ответ (ошибка) с расширенной информацией:**
```json
{
  "error": "Описание ошибки",
  "data": {
    // Содержит полные данные ответа от API при некорректной структуре ответа
  }
}
```

или

```json
{
  "error": "Описание ошибки",
  "details": {
    // Содержит дополнительную информацию об ошибке, например:
    // - данные ответа от API при ошибке API
    // - информация о запросе при сетевых ошибках
    // - стек ошибки при общих ошибках выполнения
  }
}
```

**Особенности:**
- Промпт выбирается по имени из хранилища промптов
- Ответ автоматически сохраняется в историю (если параметр `saveResponse` не установлен в `false`)
- В ответе возвращается информация об использованном промпте

### Получение списка доступных промптов

```
GET /api/available-prompts
```

**Ответ:**
```json
[
  {
    "name": "Анализ текста",
    "text": "Проанализируй следующий текст: {{text}}"
  },
  {
    "name": "Генерация идей",
    "text": "Предложи 5 идей для: {{topic}}"
  }
]
```

## Тройной интерфейс отправки запросов

В пользовательском интерфейсе теперь доступны три кнопки для отправки запросов:

1. **Send (Client)** - отправляет запрос напрямую к API из браузера
2. **Send (Server)** - отправляет запрос через серверный эндпоинт с указанным в форме промптом
3. **Send (Using Prompt)** - отправляет запрос, используя промпт, выбранный по имени из хранилища

**Рекомендации по использованию:**

- **Send (Using Prompt)** - рекомендуется для большинства случаев, так как обеспечивает стандартизацию запросов и автоматическое сохранение
- **Send (Server)** - полезен для экспериментов с промптами без их сохранения в хранилище
- **Send (Client)** - для отладки и тестирования API на стороне клиента

**Технические преимущества маршрута `/api/send-request-sys`:**

1. **Стандартизация промптов** - все пользователи используют одни и те же проверенные промпты
2. **Автоматическое сохранение** - каждый запрос и ответ по умолчанию сохраняются в историю (с возможностью отключения через параметр saveResponse)
3. **Упрощенный интерфейс** - пользователю достаточно выбрать имя промпта, а не вводить весь текст
4. **Версионирование промптов** - промпты можно изменять центрально без изменения клиентского кода

## API для работы с Retrieval-Augmented Generation (RAG)

### Получение списка контекстных кодов

```
GET /api/rag/context-codes
```

**Ответ:**
```json
[
  "code1",
  "code2",
  "code3"
]
```

### Получение списка документов

```
GET /api/rag/documents
```

**Ответ:**
```json
[
  {
    "id": "1",
    "filename": "document1.txt",
    "contextCode": "code1",
    "source": "source1"
  }
]
```

### Запрос к RAG с использованием контекстного кода

```
POST /api/rag/ask
```

**Тело запроса:**
```json
{
  "question": "Вопрос пользователя",
  "contextCode": "code1",
  "showDetails": true
}
```

**Параметры запроса:**
- `question` (обязательный) - вопрос для запроса к базе знаний
- `contextCode` (необязательный) - фильтр по коду контекста для поиска документов
- `showDetails` (необязательный, по умолчанию `false`) - показывать детальную информацию о найденных документах

**Ответ:**
```json
{
  "answer": "Ответ, основанный на документах",
  "documents": [
    {
      "pageContent": "Содержимое документа",
      "metadata": {
        "filename": "document1.txt",
        "source": "source1",
        "contextCode": "code1"
      }
    }
  ],
  "contextCode": "code1"
}
```

### Получение отладочной информации RAG

```
GET /api/rag/debug-info
```

**Ответ:**
```json
{
  "ragEnabled": true,
  "finalInputText": "Контекст из базы знаний: ... Вопрос пользователя: ...",
  "ragInfo": {
    "used": true,
    "contextCode": "code1",
    "documentsCount": 3,
    "sources": [
      {
        "filename": "document1.txt",
        "source": "source1",
        "contextCode": "code1"
      }
    ]
  },
  "timestamp": "2023-03-09T12:31:27.123Z"
}
```

## API для работы с файлами

### Сохранение файла markdown

```
POST /api/save-markdown
```

**Тело запроса:**
```json
{
  "content": "# Markdown содержимое\n\nТекст документа",
  "filename": "document.md",
  "directory": "path/to/directory"
}
```

**Параметры запроса:**
- `content` (обязательный) - содержимое markdown файла для сохранения
- `filename` (необязательный) - имя файла (если не указано, генерируется автоматически)
- `directory` (необязательный) - директория для сохранения (если не указана, используется OUTPUT_DOCS_DIR)

**Ответ:**
```json
{
  "success": true,
  "filePath": "path/to/directory/document.md",
  "message": "Файл успешно сохранен: path/to/directory/document.md"
}
```

### Получение информации о директории документов

```
GET /api/output-dir-info
```

**Ответ:**
```json
{
  "outputDir": "output_docs",
  "exists": true,
  "files": [
    {
      "name": "document1.md",
      "path": "output_docs/document1.md",
      "size": 1024
    }
  ]
}
```

## Дополнительные API маршруты

### Альтернативный маршрут для отправки запросов к AI моделям

```
POST /analyze
```

**Тело запроса:**
```json
{
  "model": "llama-3.3-70b-versatile",
  "prompt": "Текст системного промпта",
  "inputText": "Текст пользовательского запроса",
  "provider": "groq",
  "useRag": true,
  "contextCode": "code1"
}
```

**Параметры запроса:**
- `model` (обязательный) - идентификатор модели AI для использования
- `prompt` (обязательный) - системный промпт для модели
- `inputText` (обязательный) - запрос пользователя
- `provider` (необязательный) - принудительный выбор провайдера. **Возможные значения:**
  - `"groq"` - использовать GROQ API (рекомендуется для скорости)
  - `"openroute"` - использовать OpenRouter API (больше моделей)
  - Не указан - автоматическое определение по имени модели
- `useRag` (необязательный, по умолчанию `false`) - флаг для использования RAG
- `contextCode` (необязательный) - код контекста для RAG, если useRag=true

**Ответ (успешный):**
```json
{
  "success": true,
  "content": "Ответ от AI модели",
  "model": "llama-3.3-70b-versatile",
  "provider": "groq",
  "usage": {
    "prompt_tokens": 42,
    "completion_tokens": 128,
    "total_tokens": 170
  },
  "rag": {
    "used": true,
    "contextCode": "code1",
    "documentsCount": 3,
    "sources": [
      {
        "filename": "document1.txt",
        "source": "source1",
        "contextCode": "code1"
      }
    ]
  }
}
```

**Ответ (ошибка) с расширенной информацией:**
```json
{
  "error": "Описание ошибки",
  "data": {
    // Содержит полные данные ответа от API при некорректной структуре ответа
  }
}
```

или

```json
{
  "error": "Описание ошибки",
  "details": {
    // Содержит дополнительную информацию об ошибке, например:
    // - данные ответа от API при ошибке API
    // - информация о запросе при сетевых ошибках
    // - стек ошибки при общих ошибках выполнения
  }
}
```

### Получение списка доступных моделей

#### Только имена моделей

```
GET /api/available-models
```

**Описание:** Возвращает массив строк с именами всех доступных моделей, которые отмечены как `showInApi: true`.

**Ответ:**
```json
[
  "llama-3.3-70b-versatile",
  "llama3-8b-8192", 
  "llama3-70b-8192",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "google/gemma-3-27b-it:free",
  "google/gemini-2.0-flash-exp:free",
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "deepseek/deepseek-chat:free",
  "qwen/qwen2.5-vl-72b-instruct:free"
]
```

*Первые 5 моделей - это GROQ модели, отличающиеся высокой скоростью работы*

#### Полная информация о моделях

```
GET /api/all-models
```

**Описание:** Возвращает массив объектов с полной информацией о всех доступных моделях, включая провайдера, настройки и метаданные.

**Ответ:**
```json
[
  {
    "name": "llama-3.3-70b-versatile",
    "visible_name": "🚀 GROQ: Llama 3.3 70B (Versatile)",
    "provider": "groq",
    "context": 8192,
    "fast": true,
    "showInApi": true,
    "use_in_ui": true
  },
  {
    "name": "mixtral-8x7b-32768",
    "visible_name": "🚀 GROQ: Mixtral 8x7B",
    "provider": "groq", 
    "context": 32768,
    "fast": true,
    "showInApi": true,
    "use_in_ui": true
  },
  {
    "name": "deepseek/deepseek-chat:free",
    "visible_name": "Ok! deepseek/deepseek-chat:free",
    "provider": "openroute",
    "showInApi": true,
    "use_in_ui": true
  }
]
```

**Поля ответа:**
- `name` - Внутреннее имя модели для API запросов
- `visible_name` - Отображаемое имя в пользовательском интерфейсе
- `provider` - Провайдер API (`"groq"` или `"openroute"`)
- `context` - Размер контекстного окна (только для GROQ моделей)
- `fast` - Флаг быстрой модели (только для GROQ)
- `showInApi` - Доступность модели через API
- `use_in_ui` - Отображение в пользовательском интерфейсе

**Использование в клиентских приложениях:**

```javascript
// Получение только имен для простых списков
fetch('/api/available-models')
  .then(response => response.json())
  .then(models => console.log('Модели:', models));

// Получение полной информации для группировки и фильтрации
fetch('/api/all-models')
  .then(response => response.json())
  .then(models => {
    const groqModels = models.filter(m => m.provider === 'groq');
    const openrouteModels = models.filter(m => m.provider === 'openroute');
    console.log('GROQ модели:', groqModels);
    console.log('OpenRoute модели:', openrouteModels);
  });
```

## 📋 Практические примеры использования

### Пример 1: Быстрый запрос к GROQ модели

```bash
curl -X POST http://localhost:3002/api/send-request \
-H "Content-Type: application/json" \
-d '{
  "model": "llama-3.3-70b-versatile",
  "prompt": "Ты полезный помощник AI. Отвечай кратко и по делу.",
  "inputText": "Объясни что такое машинное обучение",
  "provider": "groq"
}'
```

### Пример 2: Автоматический выбор провайдера

```bash
# GROQ модель (автоматически определится по имени)
curl -X POST http://localhost:3002/api/send-request \
-H "Content-Type: application/json" \
-d '{
  "model": "mixtral-8x7b-32768",
  "prompt": "Ты эксперт по программированию",
  "inputText": "Напиши функцию сортировки на Python"
}'

# OpenRouter модель (автоматически определится по имени)
curl -X POST http://localhost:3002/api/send-request \
-H "Content-Type: application/json" \
-d '{
  "model": "deepseek/deepseek-chat:free",
  "prompt": "Ты помощник по анализу данных",
  "inputText": "Как очистить данные от выбросов?"
}'
```

### Пример 3: Использование с RAG

```bash
curl -X POST http://localhost:3002/api/send-request \
-H "Content-Type: application/json" \
-d '{
  "model": "llama-3.3-70b-versatile",
  "prompt": "Отвечай на основе предоставленного контекста",
  "inputText": "Как настроить GROQ API?",
  "useRag": true,
  "contextCode": "documentation",
  "saveResponse": true
}'
```

### Пример 4: Использование сохраненного промпта

```bash
curl -X POST http://localhost:3002/api/send-request-sys \
-H "Content-Type: application/json" \
-d '{
  "model": "llama-3.3-70b-versatile",
  "prompt_name": "Анализ кода",
  "inputText": "function add(a, b) { return a + b; }",
  "provider": "groq"
}'
```

### Пример 5: Группировка моделей по провайдерам в JavaScript

```javascript
// Получаем все модели и группируем по провайдерам
fetch('/api/all-models')
  .then(response => response.json())
  .then(models => {
    const groqModels = models.filter(m => m.provider === 'groq');
    const openrouteModels = models.filter(m => m.provider === 'openroute');
    
    console.log('🚀 GROQ модели (быстрые):');
    groqModels.forEach(model => {
      console.log(`  - ${model.visible_name} (контекст: ${model.context || 'N/A'})`);
    });
    
    console.log('🌐 OpenRouter модели (разнообразие):');
    openrouteModels.forEach(model => {
      console.log(`  - ${model.visible_name}`);
    });
  });
```

### Получение информации о сервере

```
GET /server-info
```

**Ответ:**
```json
{
  "hostname": "server-name",
  "platform": "win32",
  "arch": "x64",
  "nodeVersion": "v18.16.0",
  "uptime": 3600,
  "baseUrl": "http://localhost:3002",
  "port": "3002",
  "appName": "AI Analytics Interface",
  "timestamp": "2023-03-09T12:31:27.123Z"
}
```