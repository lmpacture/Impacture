# 🚀 Полный гайд по загрузке Impacture на GitHub

## Шаг 1: Инициализация Git репозитория

```bash
# Инициализируем Git в папке проекта
git init

# Проверяем статус
git status
```

## Шаг 2: Настройка Git (если еще не настроен)

```bash
# Устанавливаем ваше имя и email
git config --global user.name "Ваше Имя"
git config --global user.email "ваш-email@gmail.com"

# Проверяем настройки
git config --list
```

## Шаг 3: Добавление файлов в Git

```bash
# Добавляем все файлы (кроме тех, что в .gitignore)
git add .

# Проверяем что добавлено
git status
```

## Шаг 4: Первый коммит

```bash
# Создаем первый коммит
git commit -m "Initial commit: Impacture project"

# Проверяем коммит
git log --oneline
```

## Шаг 5: Создание репозитория на GitHub

1. **Зайдите на GitHub.com** и войдите в аккаунт
2. **Нажмите "+" в правом верхнем углу** → "New repository"
3. **Заполните форму:**
   - Repository name: `impacture`
   - Description: `Инженерная платформа для школьников`
   - **НЕ ставьте галочки** на "Add a README file", "Add .gitignore", "Choose a license"
   - Нажмите "Create repository"

## Шаг 6: Подключение к GitHub

```bash
# Добавляем удаленный репозиторий (замените YOUR_USERNAME на ваше имя пользователя)
git remote add origin https://github.com/YOUR_USERNAME/impacture.git

# Проверяем подключение
git remote -v
```

## Шаг 7: Загрузка на GitHub

```bash
# Переименовываем основную ветку в main (современный стандарт)
git branch -M main

# Загружаем код на GitHub
git push -u origin main
```

## Шаг 8: Проверка загрузки

1. **Обновите страницу** на GitHub
2. **Убедитесь**, что все файлы загружены
3. **Проверьте**, что README.md отображается корректно

## Дальнейшая работа с репозиторием

### Добавление изменений:
```bash
# Добавить изменения
git add .

# Создать коммит
git commit -m "Описание изменений"

# Загрузить на GitHub
git push
```

### Получение изменений:
```bash
# Скачать изменения с GitHub
git pull
```

### Создание новой ветки:
```bash
# Создать новую ветку
git checkout -b feature-name

# Переключиться между ветками
git checkout main
```

## 🔧 Настройки для хостинга

### Для Vercel:
1. Подключите GitHub репозиторий
2. Настройте переменные окружения
3. Деплой произойдет автоматически

### Для Heroku:
```bash
# Установите Heroku CLI
brew install heroku/brew/heroku

# Войдите в аккаунт
heroku login

# Создайте приложение
heroku create your-app-name

# Загрузите на Heroku
git push heroku main
```

### Для Railway:
1. Подключите GitHub репозиторий
2. Настройте переменные окружения
3. Деплой произойдет автоматически

## 📝 Важные моменты

### ✅ Что должно быть в репозитории:
- Все HTML файлы
- Папка `backend/` с server.js
- Папка `files/` со стилями и скриптами
- `package.json`
- `README.md`
- `.gitignore`

### ❌ Что НЕ должно быть в репозитории:
- `node_modules/` (добавлен в .gitignore)
- `.env` файлы (добавлены в .gitignore)
- Логи и временные файлы

### 🔐 Безопасность:
- **НЕ загружайте** файлы с паролями
- **НЕ загружайте** .env файлы
- Используйте переменные окружения на хостинге

## 🚨 Если что-то пошло не так

### Отменить последний коммит:
```bash
git reset --soft HEAD~1
```

### Отменить все изменения:
```bash
git checkout -- .
```

### Удалить файл из Git:
```bash
git rm filename
git commit -m "Remove filename"
```

### Изменить последний коммит:
```bash
git commit --amend -m "Новое сообщение"
```

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте статус: `git status`
2. Проверьте логи: `git log --oneline`
3. Проверьте подключение: `git remote -v`
4. Убедитесь, что все файлы добавлены: `git add .`

Удачи с загрузкой проекта! 🎉 