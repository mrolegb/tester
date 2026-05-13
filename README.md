# tester (agentic testing demo)

Супер-простой Node.js проект:
- API для пользователей (`create`, `list`, `get by id`)
- SQLite база (`better-sqlite3`)
- Jest + Supertest тесты
- Agentic workflow: запуск тестов + оценка качества тестов через OpenAI

## 1) Установка

```bash
npm install
```

## 2) Запуск API

```bash
npm start
```

API:
- `GET /health`
- `GET /users`
- `POST /users` body: `{ "name": "Alice", "email": "alice@example.com" }`
- `GET /users/:id`

## 3) Тесты

```bash
npm test
```

## 4) Agentic тестирование (OpenAI)

1. Создай `.env` на базе `.env.example`
2. Укажи `OPENAI_API_KEY`
3. Запусти:

```bash
npm run agent:test
```

Что делает `agent:test`:
1. Гоняет Jest и сохраняет `jest-results.json`
2. Отправляет отчёт в OpenAI модель
3. Получает QA-анализ:
   - summary
   - оценка глубины тестов
   - дополнительные тест-кейсы
   - риски/слепые зоны
4. Сохраняет отчёт в `reports/agentic-test-review.md`

---

Это демо-паттерн "AI как тест-ревьюер". Можно расширить до:
- автогенерации PR-комментариев
- fail build при плохой оценке качества тестов
- сравнения качества тестов между коммитами
