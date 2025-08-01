# 🚨 Исправление проблемы с Node.js на хостинге

## 🎯 Проблема: Node.js не работает на GitHub Pages

**GitHub Pages** = статический хостинг (только HTML, CSS, JS)
**Node.js** = серверный язык (нужен специальный хостинг)

## 🚀 Решение: Переходим на Vercel

### Почему Vercel лучше для Node.js:

✅ **Поддерживает Node.js** - может запускать server.js  
✅ **Автоматический деплой** - из GitHub  
✅ **Бесплатный** - для небольших проектов  
✅ **Простая настройка** - всего несколько кликов  

## 📋 Пошаговая настройка Vercel

### Шаг 1: Регистрация на Vercel

1. Зайди на **vercel.com**
2. Нажми **"Sign Up"**
3. Выбери **"Continue with GitHub"**
4. Разреши доступ к твоему аккаунту

### Шаг 2: Подключение проекта

1. Нажми **"New Project"**
2. Найди репозиторий **"Impacture"**
3. Нажми **"Import"**
4. Настройки оставь по умолчанию
5. Нажми **"Deploy"**

### Шаг 3: Настройка домена

1. После деплоя перейди в **Settings**
2. Выбери вкладку **"Domains"**
3. Добавь домен: `impacture.org`
4. Добавь домен: `www.impacture.org`

### Шаг 4: Настройка DNS в Namecheap

**Удали старые записи и добавь новые:**

1. **Удали все старые записи** в Namecheap
2. **Добавь только эти 2 записи:**

```
A     @     76.76.19.19
CNAME www   cname.vercel-dns.com
```

## 🔧 Настройка переменных окружения

### В Vercel Dashboard:

1. Перейди в **Settings** → **Environment Variables**
2. Добавь переменные:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🎯 Альтернативные хостинги

### Railway (рекомендуется):
1. Зайди на **railway.app**
2. Подключи GitHub
3. Выбери репозиторий
4. Настрой домен

### Heroku:
1. Зайди на **heroku.com**
2. Создай приложение
3. Подключи GitHub
4. Настрой домен

### DigitalOcean App Platform:
1. Зайди на **digitalocean.com**
2. Создай App
3. Подключи GitHub
4. Настрой домен

## 🔍 Проверка работы

### После настройки Vercel:

```bash
# Проверить что сайт работает
curl -I https://impacture.org

# Проверить API
curl https://impacture.org/api/teams

# Проверить турниры
curl https://impacture.org/api/tournaments
```

### Ожидаемый результат:
- ✅ Сайт загружается
- ✅ API работает
- ✅ Турниры загружаются
- ✅ Команды загружаются
- ✅ Чат работает

## 🚨 Если что-то не работает

### Проверь package.json:
```json
{
  "name": "impacture",
  "version": "1.0.0",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js",
    "dev": "nodemon backend/server.js"
  }
}
```

### Проверь структуру проекта:
```
impacture/
├── backend/
│   ├── server.js
│   └── *.json
├── files/
├── *.html
└── package.json
```

### Проверь server.js:
- Порт должен быть `process.env.PORT || 3000`
- Статические файлы должны раздаваться
- API endpoints должны работать

## 🎯 Быстрая настройка Vercel

### 1. Создай файл vercel.json:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/backend/server.js"
    }
  ]
}
```

### 2. Добавь в Git:
```bash
git add vercel.json
git commit -m "Добавлена конфигурация для Vercel"
git push
```

### 3. Деплой на Vercel:
- Подключи GitHub репозиторий
- Vercel автоматически определит настройки
- Нажми "Deploy"

## 🎉 Итог

После настройки Vercel:
- ✅ Node.js сервер работает
- ✅ API endpoints работают
- ✅ Турниры загружаются
- ✅ Команды загружаются
- ✅ Чат работает
- ✅ Домен работает

**Vercel = лучший выбор для Node.js проектов! 🚀** 