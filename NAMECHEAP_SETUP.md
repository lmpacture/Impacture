# 🏪 Настройка домена Impacture.org в Namecheap

## 🎯 Твой домен: Impacture.org в Namecheap

Отлично! Namecheap - один из лучших регистраторов. Давайте настроим твой домен.

## 🚀 Пошаговая настройка в Namecheap

### Шаг 1: Вход в панель управления

1. Зайди на **namecheap.com**
2. Нажми **"Sign In"** (вход)
3. Введи свои данные для входа
4. Перейди в **"Domain List"** (список доменов)

### Шаг 2: Настройка DNS записей

1. Найди домен **impacture.org** в списке
2. Нажми **"Manage"** (управление)
3. Перейди во вкладку **"Advanced DNS"**
4. Нажми **"Add New Record"** (добавить новую запись)

### Шаг 3: Добавление DNS записей

#### Для Vercel (рекомендуется):

**Добавь эти записи по очереди:**

1. **A запись для основного домена:**
   ```
   Type: A Record
   Host: @
   Value: 76.76.19.19
   TTL: Automatic
   ```

2. **CNAME запись для www:**
   ```
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```

#### Для GitHub Pages:

**Добавь эти записи по очереди:**

1. **A запись 1:**
   ```
   Type: A Record
   Host: @
   Value: 185.199.108.153
   TTL: Automatic
   ```

2. **A запись 2:**
   ```
   Type: A Record
   Host: @
   Value: 185.199.109.153
   TTL: Automatic
   ```

3. **A запись 3:**
   ```
   Type: A Record
   Host: @
   Value: 185.199.110.153
   TTL: Automatic
   ```

4. **A запись 4:**
   ```
   Type: A Record
   Host: @
   Value: 185.199.111.153
   TTL: Automatic
   ```

5. **CNAME запись:**
   ```
   Type: CNAME Record
   Host: www
   Value: lmpacture.github.io
   TTL: Automatic
   ```

### Шаг 4: Настройка редиректа (опционально)

#### Настройка www → без www:

1. Перейди во вкладку **"Redirect Domain"**
2. Включи **"Domain Redirect"**
3. Выбери **"www.impacture.org"** → **"impacture.org"**
4. Нажми **"Save"**

#### Или наоборот (без www → www):

1. Перейди во вкладку **"Redirect Domain"**
2. Включи **"Domain Redirect"**
3. Выбери **"impacture.org"** → **"www.impacture.org"**
4. Нажми **"Save"**

## 🎯 Рекомендуемая настройка для твоего проекта

### Выбери Vercel (лучше для Node.js):

1. **Добавь только 2 записи:**
   ```
   A     @     76.76.19.19
   CNAME www   cname.vercel-dns.com
   ```

2. **Настрой редирект:**
   ```
   www.impacture.org → impacture.org
   ```

## 🔧 Дополнительные настройки в Namecheap

### Настройка SSL (если нужно):
1. Перейди во вкладку **"SSL"**
2. Выбери **"Let's Encrypt"** (бесплатно)
3. Нажми **"Install"**

### Настройка почты (если нужно):
1. Перейди во вкладку **"Email"**
2. Выбери **"Private Email"**
3. Настрой почтовые записи

### Настройка безопасности:
1. Перейди во вкладку **"Security"**
2. Включи **"Two-Factor Authentication"**
3. Настрой **"Domain Lock"**

## 🔍 Проверка настройки

### Через Namecheap:
1. Перейди во вкладку **"Advanced DNS"**
2. Проверь что все записи добавлены
3. Статус должен быть **"Active"**

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

## 🚨 Частые проблемы в Namecheap

### "Записи не сохраняются":
- **Подожди 5-10 минут** - Namecheap обновляет медленно
- **Проверь формат** записей
- **Очисти кэш** браузера

### "Домен не работает":
- **Проверь TTL** - должно быть Automatic
- **Проверь статус** - должно быть Active
- **Подожди 24 часа** - DNS обновляется медленно

### "SSL не работает":
- **Подожди** - SSL настраивается автоматически
- **Проверь DNS** записи
- **Обратись в поддержку** Namecheap

## 🎯 Для твоего проекта

### После настройки DNS:

1. **Настрой хостинг** (Vercel или GitHub Pages)
2. **Добавь домен** в настройках хостинга
3. **Подожди 24 часа** для обновления DNS
4. **Проверь** что все работает

### Обнови проект:
```bash
# Добавить изменения
git add .

# Создать коммит
git commit -m "Обновил домен на impacture.org"

# Загрузить на GitHub
git push
```

## 🚀 Следующие шаги

### 1. Настрой хостинг:
- **Vercel**: vercel.com → подключи GitHub → добавь домен
- **GitHub Pages**: Settings → Pages → Custom domain

### 2. Проверь настройку:
- DNS записи активны
- Сайт загружается
- SSL работает
- Редирект работает

### 3. Настрой мониторинг:
- Google Analytics
- Uptime Robot
- Google Search Console

## 🎉 Итог

После настройки в Namecheap:
- ✅ DNS записи настроены
- ✅ Редирект работает
- ✅ SSL сертификат активен
- ✅ Домен готов к использованию

**Красивый домен в надежном регистраторе! 🚀** 