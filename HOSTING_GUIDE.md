# 🚀 Инструкция по хостингу Impacture

## 📋 Что включено в репозиторий

### ✅ Основные файлы
- **backend/server.js** - основной сервер Node.js
- **backend/*.json** - файлы данных (очищены)
- **package.json** - зависимости проекта
- **.env** - переменные окружения
- **Все HTML страницы** - готовы к работе
- **Все CSS и JS файлы** - обновлены и исправлены

### ✅ Структура проекта
```
impacture/
├── backend/
│   ├── server.js          # Основной сервер
│   ├── *.json            # Файлы данных
│   └── users.json        # Пользователи
├── files/
│   ├── images/           # Изображения
│   ├── scripts/          # JavaScript файлы
│   └── styles/           # CSS файлы
├── *.html               # Все HTML страницы
├── package.json          # Зависимости
└── .env                 # Переменные окружения
```

## 🛠️ Настройка хостинга

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
Файл `.env` уже настроен:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreplyimpacture@gmail.com
SMTP_PASS=xhoc eqru wtzn osuo
SMTP_FROM="Impacture <noreplyimpacture@gmail.com>"
JWT_SECRET=M503R8yrfrv4DbKlfeC9BA0gQlI6ctcR
```

### 3. Запуск сервера
```bash
# Локально
npm start

# Или напрямую
cd backend
node server.js
```

Сервер запустится на `http://localhost:3000`

## 🌐 Деплой на хостинг

### Для Vercel:
1. Подключите репозиторий к Vercel
2. Укажите корневую папку как `backend`
3. Команда сборки: `node server.js`
4. Порт: `3000`

### Для Railway:
1. Подключите GitHub репозиторий
2. Укажите корневую папку как `backend`
3. Команда запуска: `node server.js`

### Для Heroku:
1. Создайте `Procfile` в корне:
```
web: node backend/server.js
```
2. Подключите репозиторий
3. Настройте переменные окружения

## 🔧 Проверка функциональности

### ✅ Что работает:
- ✅ Регистрация и авторизация
- ✅ Email подтверждение
- ✅ Сброс пароля
- ✅ Создание товаров
- ✅ Создание команд
- ✅ Создание турниров
- ✅ Чат между пользователями
- ✅ Мобильная версия
- ✅ Все страницы загружаются

### 📱 Мобильная версия:
- ✅ Бургер меню работает на всех страницах
- ✅ Адаптивный дизайн
- ✅ Все функции доступны на мобильных

## 🗂️ Файлы данных

Все файлы данных очищены и готовы к использованию:
- `backend/products.json` - `[]`
- `backend/teams.json` - `[]`
- `backend/tournaments.json` - `[]`
- `backend/chats.json` - `{}`
- `backend/users.json` - содержит тестовых пользователей

## 🔐 Безопасность

- JWT токены настроены
- Пароли хешируются с bcrypt
- CORS настроен
- Валидация данных включена

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь, что все зависимости установлены
3. Проверьте переменные окружения
4. Убедитесь, что порт 3000 свободен

## 🎉 Готово к запуску!

Сайт полностью готов к хостингу на нестатичном сервере! 🚀 