# 🔧 Исправление DNSSEC ошибки для Vercel

## 🚨 Проблема
```
We could not generate a cert for impacture.org because the required http-01 challenge failed. 
DNS problem: looking up A for impacture.org: DNSSEC: DNSKEY Missing
```

## 🔍 Диагностика
```bash
# Проверяем текущие DNS записи
dig impacture.org A

# Результат показывает неправильный IP
impacture.org.          1687    IN      A       216.198.79.1
```

## ✅ Решение

### Шаг 1: Отключить DNSSEC в Namecheap
1. Зайди в **Namecheap** → **Domain List**
2. Найди домен **impacture.org**
3. Нажми **"Manage"**
4. Перейди в **"Advanced DNS"**
5. Найди секцию **"DNSSEC"**
6. **Отключи DNSSEC** (переключи в OFF)

### Шаг 2: Настроить правильные DNS записи
В **"Advanced DNS"**:

1. **Удали** старую A запись с `216.198.79.1`
2. **Добавь** новую A запись:
   ```
   Type: A
   Host: @
   Value: 76.76.19.34
   TTL: Automatic
   ```

### Шаг 3: Сохранить изменения
- Нажми **"Save"**
- Подожди **10-15 минут** для распространения DNS

### Шаг 4: Проверить результат
```bash
# Проверяем DNS
dig impacture.org A

# Должно показывать:
impacture.org.          IN      A       76.76.19.34

# Проверяем сайт
curl -s -I https://impacture.org
```

## ⏰ Время ожидания
- **DNS изменения**: 5-15 минут
- **SSL сертификат**: 10-30 минут
- **Полная настройка**: до 1 часа

## 🎯 Ожидаемый результат
После правильной настройки:
- DNS указывает на Vercel (`76.76.19.34`)
- SSL сертификат автоматически генерируется
- Сайт работает на Vercel, а не на GitHub Pages

## 🔧 Альтернативное решение
Если DNSSEC нельзя отключить:
1. Используй **Cloudflare** как DNS провайдер
2. Или настрой **правильные DNSSEC записи** в Namecheap
3. Или используй **другой домен** без DNSSEC

## 📝 Примечания
- DNSSEC может конфликтовать с автоматическими SSL сертификатами
- Vercel требует простой DNS без сложных DNSSEC настроек
- После отключения DNSSEC SSL сертификат должен генерироваться автоматически 