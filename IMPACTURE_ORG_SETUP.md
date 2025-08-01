# 🌐 Настройка домена Impacture.org для GitHub

## 🎯 Твой домен: Impacture.org

Отлично! У тебя есть красивый домен. Давайте настроим его для GitHub.

## 🚀 Пошаговая настройка

### Шаг 1: Настройка DNS записей

Зайди в панель управления твоего домена (где покупал) и добавь DNS записи:

#### Для GitHub Pages:
```
Тип: A
Имя: @
Значение: 185.199.108.153

Тип: A
Имя: @
Значение: 185.199.109.153

Тип: A
Имя: @
Значение: 185.199.110.153

Тип: A
Имя: @
Значение: 185.199.111.153

Тип: CNAME
Имя: www
Значение: lmpacture.github.io
```

#### Для Vercel (рекомендуется):
```
Тип: A
Имя: @
Значение: 76.76.19.19

Тип: CNAME
Имя: www
Значение: cname.vercel-dns.com
```

#### Для Railway:
```
Тип: CNAME
Имя: @
Значение: your-app.railway.app

Тип: CNAME
Имя: www
Значение: your-app.railway.app
```

### Шаг 2: Настройка в GitHub

#### Для GitHub Pages:
1. Зайди в репозиторий `https://github.com/lmpacture/Impacture`
2. Перейди в **Settings** → **Pages**
3. В **Source** выбери **"Deploy from a branch"**
4. Выбери ветку **main**
5. В **Custom domain** введи: `impacture.org`
6. Поставь галочку **"Enforce HTTPS"**
7. Нажми **Save**

#### Для Vercel:
1. Зайди в **Vercel Dashboard**
2. Выбери проект **Impacture**
3. Перейди в **Settings** → **Domains**
4. Добавь домен: `impacture.org`
5. Добавь домен: `www.impacture.org`
6. Настрой DNS записи (см. выше)

### Шаг 3: Создание файла CNAME

Создай файл `CNAME` в корне репозитория:

```bash
# Создать файл CNAME
echo "impacture.org" > CNAME
```

Или создай файл `CNAME` с содержимым:
```
impacture.org
```

### Шаг 4: Обновить проект

```bash
# Добавить файл CNAME
git add CNAME

# Создать коммит
git commit -m "Добавлен домен impacture.org"

# Загрузить на GitHub
git push
```

## 🔧 Настройка редиректа

### Настройка www → без www:
В панели управления доменом добавь редирект:
```
www.impacture.org → impacture.org
```

### Или наоборот (без www → www):
```
impacture.org → www.impacture.org
```

## 🎯 Рекомендуемая настройка

### Для твоего проекта рекомендую Vercel:

1. **Зарегистрируйся** на vercel.com
2. **Подключи GitHub** репозиторий
3. **Добавь домен** в настройках
4. **Настрой DNS** записи
5. **Подожди 24 часа** для обновления

### DNS записи для Vercel:
```
A     @     76.76.19.19
CNAME www   cname.vercel-dns.com
```

## 🔍 Проверка настройки

### Через терминал:
```bash
# Проверить DNS записи
nslookup impacture.org

# Проверить редирект
curl -I http://www.impacture.org

# Проверить SSL
curl -I https://impacture.org
```

### Через браузер:
1. Открой `https://impacture.org`
2. Проверь что сайт загружается
3. Проверь что SSL работает (замочек)
4. Проверь что `www.impacture.org` редиректит

## 🚨 Возможные проблемы

### "DNS не обновился":
- **Подожди 24-48 часов** - DNS обновляется медленно
- **Проверь записи** в панели управления доменом
- **Очисти кэш** браузера

### "SSL не работает":
- **Подожди** - SSL настраивается автоматически
- **Проверь DNS** записи
- **Обратись в поддержку** хостинга

### "Сайт не загружается":
- **Проверь DNS** записи
- **Проверь настройки** в панели хостинга
- **Проверь логи** приложения

## 🎯 Для твоего проекта

### Обнови README.md:
```markdown
# Impacture - Инженерная платформа

🌐 **Сайт**: https://impacture.org

🚀 **GitHub**: https://github.com/lmpacture/Impacture

📧 **Контакты**: contact@impacture.org
```

### Обнови package.json:
```json
{
  "name": "impacture",
  "version": "1.0.0",
  "description": "Инженерная платформа для школьников",
  "homepage": "https://impacture.org",
  "repository": {
    "type": "git",
    "url": "https://github.com/lmpacture/Impacture.git"
  }
}
```

## 🚀 После настройки

### Обнови проект:
```bash
# Добавить изменения
git add .

# Создать коммит
git commit -m "Обновил домен на impacture.org"

# Загрузить на GitHub
git push
```

### Проверь все функции:
- ✅ Главная страница
- ✅ Регистрация/вход
- ✅ Команды
- ✅ Маркетплейс
- ✅ Турниры
- ✅ Чат

### Настрой мониторинг:
- Google Analytics
- Uptime Robot (проверка доступности)
- Google Search Console

## 🎉 Итог

После настройки:
- ✅ Твой сайт будет доступен по адресу: `https://impacture.org`
- ✅ SSL сертификат будет работать
- ✅ Сайт будет выглядеть профессионально
- ✅ Легче будет продвигать

**Красивый домен для красивого проекта! 🚀** 