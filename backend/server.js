const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Берем из .env или используем дефолтный
const TEAMS_DIR = path.join(__dirname, 'teams'); // Директория для хранения HTML-файлов команд
const TEAMS_FILE = path.join(__dirname, 'teams.json');
const TOURNAMENTS_FILE = path.join(__dirname, 'tournaments.json');

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const CART_FILE = path.join(__dirname, 'cart.json');
const HISTORY_FILE = path.join(__dirname, 'history.json');
const CHATS_FILE = path.join(__dirname, 'chats.json');
const APPLICATIONS_FILE = path.join(__dirname, 'applications.json');

app.use(cors());
app.use(bodyParser.json());

// Раздача статики (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, '..')));

// Явно указываем раздачу статики для директории турниров
app.use('/tournaments', express.static(path.join(__dirname, '..', 'tournaments'), {
    setHeaders: (res, path) => {
        // Устанавливаем правильный Content-Type для HTML файлов
        if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
    }
}));

// Явно указываем раздачу статики для директории товаров
app.use('/products', express.static(path.join(__dirname, '..', 'products'), {
    setHeaders: (res, path) => {
        // Устанавливаем правильный Content-Type для HTML файлов
        if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
    }
}));

// Явно указываем раздачу статики для изображений
app.use('/files/images', express.static(path.join(__dirname, '..', 'files', 'images'), {
    setHeaders: (res, path) => {
        // Устанавливаем правильный Content-Type для изображений
        if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (path.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (path.endsWith('.gif')) {
            res.setHeader('Content-Type', 'image/gif');
        } else if (path.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
        }
    }
}));

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'files', 'images', 'tournaments');
    // Создаем папку если её нет
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'tournament-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    // Проверяем тип файла
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  }
});

// Настройка multer для загрузки изображений товаров
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'files', 'images', 'products');
    // Создаем папку если её нет
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const productUpload = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    // Проверяем тип файла
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  }
});



// Настройка multer для загрузки изображений чата
const chatStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'files', 'images', 'chat');
    // Создаем папку если её нет
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'chat-' + uniqueSuffix + ext);
  }
});

const chatUpload = multer({
  storage: chatStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    // Проверяем тип файла
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  }
});

// Настройка multer для загрузки изображений команд
const teamStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'files', 'images', 'teams');
    // Создаем папку если её нет
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'team-' + uniqueSuffix + ext);
  }
});

const teamUpload = multer({
  storage: teamStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    // Проверяем тип файла
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  }
});

// Шаблон страницы команды
function teamHtmlTemplate({ name, city, description, logo, photo, achievements, status, maxMembers, currentMembers, applications, teamId, id }) {
  const logoPath = logo ? `../${logo.replace(/\\/g, '/')}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY2N2VlYSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9nbzwvdGV4dD48L3N2Zz4=';
  
  // Собираем все изображения команды (логотип + фотографии)
  let teamImages = [];
  
  // Добавляем логотип, если есть
  if (logo) {
    teamImages.push({
      src: `../${logo.replace(/\\/g, '/')}`,
      alt: 'Логотип команды',
      type: 'logo'
    });
  }
  
  // Находим все фотографии команды
  if (photo) {
    const photoDir = path.dirname(photo);
    const photoBase = path.basename(photo, path.extname(photo));
    
    // Ищем все файлы с похожими именами (фото1.jpg, фото2.jpg, etc.)
    const fullPhotoDir = path.join(__dirname, '..', photoDir);
    if (fs.existsSync(fullPhotoDir)) {
      const files = fs.readdirSync(fullPhotoDir);
      const photos = files
        .filter(file => {
          const fileBase = path.basename(file, path.extname(file));
          return fileBase.startsWith(photoBase.replace(/\d+$/, '')) && 
                 /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
        })
        .map(file => `../${photoDir}/${file}`)
        .sort();
      
      photos.forEach((photoPath, index) => {
        teamImages.push({
          src: photoPath,
          alt: `Фото команды ${index + 1}`,
          type: 'photo'
        });
      });
    }
    
    // Если не нашли дополнительные фото, используем основное
    if (teamImages.filter(img => img.type === 'photo').length === 0) {
      teamImages.push({
        src: `../${photo.replace(/\\/g, '/')}`,
        alt: 'Фото команды',
        type: 'photo'
      });
    }
  }
  
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} - Impacture</title>
    <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="files/styles/home.css" />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
    />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
    />
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-WGGJDNZHJC"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    </script>
    
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <style>
      body {
        font-family: "Manrope", "Noto Sans", sans-serif;
      }
    </style>
</head>
  <body class="home-container">
    <div
      class="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden"
    >
      <header
        class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f2f2f2] px-10 py-3"
      >
        <div class="flex items-center gap-8">
          <div class="flex items-center gap-4 text-[#141414]">
            <div class="size-6">
              <img src="files/images/impacture.png" alt="Impacture Logo" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <h2
              class="text-[#141414] text-lg font-bold leading-tight tracking-[-0.015em]"
            >
              Impacture
            </h2>
  </div>
          <div class="flex items-center gap-9">
            <a
              class="text-[#141414] text-sm font-medium leading-normal"
              href="index.html"
              >Главная</a
            >
            <a
              class="text-[#141414] text-sm font-medium leading-normal active"
              href="student-page.html"
              >Команды</a
            >
          </div>
        </div>
      </header>
      <div class="flex-1">
        <div class="layout-container">
          <div class="px-40 flex flex-1 justify-center py-5">
            <div
              class="layout-content-container flex flex-col max-w-[960px] flex-1"
            >
              <div class="flex flex-wrap justify-between gap-3 p-4">
                <p
                  class="text-[#141414] tracking-light text-[32px] font-bold leading-tight min-w-72"
                >
                  ${name}
                </p>
              </div>
              <div class="p-4 grid grid-cols-[20%_1fr] gap-x-6">
                <div
                  class="col-span-2 grid grid-cols-subgrid border-t border-t-[#e0e0e0] py-3"
                >
                  <p class="text-[#757575] text-xs font-normal leading-normal">
                    Город
                  </p>
                  <p class="text-[#141414] text-xs font-normal leading-normal">
                    ${city || 'Не указан'}
                  </p>
                </div>
                ${teamImages.length > 0 ? `
                <div
                  class="col-span-2 grid grid-cols-subgrid border-t border-t-[#e0e0e0] py-3"
                >
                  <p class="text-[#757575] text-xs font-normal leading-normal">
                    Изображения команды
                  </p>
                  <div class="team-images-slider" style="max-width: 400px;">
                    <div class="slider-container" style="position: relative; overflow: hidden; border-radius: 8px;">
                      ${teamImages.map((image, index) => `
                        <div class="slide ${index === 0 ? 'active' : ''}" style="display: ${index === 0 ? 'block' : 'none'};">
                          <img src="${image.src}" alt="${image.alt}" style="width: 100%; height: 300px; object-fit: cover;">
                        </div>
                      `).join('')}
                      ${teamImages.length > 1 ? `
                        <button class="slider-btn prev" onclick="changeSlide(-1)" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">‹</button>
                        <button class="slider-btn next" onclick="changeSlide(1)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">›</button>
                      ` : ''}
                    </div>
                    ${teamImages.length > 1 ? `
                      <div class="slider-dots" style="text-align: center; margin-top: 10px;">
                        ${teamImages.map((_, index) => `
                          <span class="dot ${index === 0 ? 'active' : ''}" onclick="currentSlide(${index + 1})" style="height: 8px; width: 8px; margin: 0 4px; background-color: ${index === 0 ? '#bbb' : '#ddd'}; border-radius: 50%; display: inline-block; cursor: pointer;"></span>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                </div>
                ` : ''}
                <div
                  class="col-span-2 grid grid-cols-subgrid border-t border-t-[#e0e0e0] py-3"
                >
                  <p class="text-[#757575] text-xs font-normal leading-normal">
                    Описание
                  </p>
                  <p class="text-[#141414] text-xs font-normal leading-normal">
                    ${description || 'Описание отсутствует'}
                  </p>
                </div>
                <div
                  class="col-span-2 grid grid-cols-subgrid border-t border-t-[#e0e0e0] py-3"
                >
                  <p class="text-[#757575] text-xs font-normal leading-normal">
                    Статус команды
                  </p>
                  <div class="flex items-center gap-3">
                    <span class="px-3 py-1 rounded-full text-xs font-medium" style="background-color: ${getTeamStatusColor(status || 'recruiting')}; color: white;">
                      ${getTeamStatusText(status || 'recruiting')}
                    </span>
                    <span class="text-[#141414] text-xs font-normal leading-normal">
                      ${currentMembers || 0}/${maxMembers || 5} участников
                    </span>
                  </div>
                </div>
                
                ${achievements && achievements.length > 0 ? `
                <div
                  class="col-span-2 grid grid-cols-subgrid border-t border-t-[#e0e0e0] py-3"
                >
                  <p class="text-[#757575] text-xs font-normal leading-normal">
                    Достижения
                  </p>
                  <div class="text-[#141414] text-xs font-normal leading-normal">
                    ${achievements.map(achievement => `<div class="mb-1">• ${achievement}</div>`).join('')}
                  </div>
                </div>
                ` : ''}
                
                ${(status === 'recruiting' || !status) ? `
                <div class="col-span-2 flex flex-col items-center mt-6">
                  <button id="applyButton" onclick="openApplicationModal()" class="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    Отправить заявку
                  </button>
                  <div id="applicationStatus" class="text-center mt-2 hidden">
                    <p class="text-gray-600 text-sm">Вы уже подали заявку в эту команду</p>
                    <p class="text-blue-600 text-sm mt-1">
                      <a href="/cabinet.html" class="underline">Посмотреть в личном кабинете</a>
                    </p>
                  </div>
                </div>
                ` : ''}
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно подачи заявки -->
    <div id="applicationModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg max-w-md w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Подать заявку в команду ${name}</h3>
            <button onclick="closeApplicationModal()" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <form id="applicationForm">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Сообщение команде</label>
              <textarea id="applicantSkills" rows="4" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#667eea]" placeholder="Опишите ваши навыки, опыт работы и почему хотите присоединиться к команде"></textarea>
            </div>
            <div class="flex gap-3">
              <button type="button" onclick="closeApplicationModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Отмена
              </button>
              <button type="submit" class="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                Отправить заявку
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
      let slideIndex = 1;
      showSlides(slideIndex);

      function changeSlide(n) {
        showSlides(slideIndex += n);
      }

      function currentSlide(n) {
        showSlides(slideIndex = n);
      }

      function showSlides(n) {
        const slides = document.getElementsByClassName("slide");
        const dots = document.getElementsByClassName("dot");
        
        if (n > slides.length) {slideIndex = 1}
        if (n < 1) {slideIndex = slides.length}
        
        // Скрываем все слайды
        for (let i = 0; i < slides.length; i++) {
          slides[i].style.display = "none";
        }
        
        // Убираем активный класс со всех точек
        for (let i = 0; i < dots.length; i++) {
          dots[i].style.backgroundColor = "#ddd";
        }
        
        // Показываем текущий слайд
        if (slides[slideIndex-1]) {
          slides[slideIndex-1].style.display = "block";
        }
        
        // Активируем текущую точку
        if (dots[slideIndex-1]) {
          dots[slideIndex-1].style.backgroundColor = "#bbb";
        }
      }

      // Функции для работы с заявками
      function openApplicationModal() {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Для подачи заявки необходимо войти в аккаунт');
          return;
        }
        document.getElementById('applicationModal').classList.remove('hidden');
      }

      function closeApplicationModal() {
        document.getElementById('applicationModal').classList.add('hidden');
      }

      document.getElementById('applicationForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Для подачи заявки необходимо войти в аккаунт');
          return;
        }

        const message = document.getElementById('applicantSkills').value;
        
        try {
          const response = await fetch('/api/teams/${teamId || id || 'team_1753962000000_' + name.toLowerCase().replace(/\s+/g, '_')}/apply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ message })
          });

          const data = await response.json();
          
          if (response.ok) {
            // Отслеживание подачи заявки в Google Analytics
            if (typeof gtag !== 'undefined') {
              gtag('event', 'application_submitted', {
                team_name: '${name}',
                team_id: '${teamId || id || 'team_1753962000000_' + name.toLowerCase().replace(/\s+/g, '_')}'
              });
            }
            alert('✅ Заявка успешно отправлена!');
            closeApplicationModal();
            document.getElementById('applicationForm').reset();
          } else {
            if (response.status === 400 && data.error === 'Вы уже подали заявку в эту команду') {
              if (confirm('У вас уже есть активная заявка в эту команду. Хотите отменить её и подать новую?')) {
                // Находим и отменяем существующую заявку
                try {
                  const myApplicationsResponse = await fetch('/api/applications/my', {
                    headers: {
                      'Authorization': 'Bearer ' + token
                    }
                  });
                  
                  if (myApplicationsResponse.ok) {
                    const myApplications = await myApplicationsResponse.json();
                    const existingApplication = myApplications.find(app => 
                      app.teamId === '${teamId || id || 'team_1753962000000_' + name.toLowerCase().replace(/\s+/g, '_')}' && 
                      app.status === 'pending'
                    );
                    
                    if (existingApplication) {
                      const cancelResponse = await fetch('/api/applications/' + existingApplication.id, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': 'Bearer ' + token
                        }
                      });
                      
                      if (cancelResponse.ok) {
                        alert('Старая заявка отменена. Теперь можете подать новую.');
                        // Повторяем отправку новой заявки
                        const retryResponse = await fetch('/api/teams/${teamId || id || 'team_1753962000000_' + name.toLowerCase().replace(/\s+/g, '_')}/apply', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                          },
                          body: JSON.stringify({ message })
                        });
                        
                        if (retryResponse.ok) {
                          alert('✅ Новая заявка успешно отправлена!');
                          closeApplicationModal();
                          document.getElementById('applicationForm').reset();
                        } else {
                          const retryError = await retryResponse.json();
                          alert('Ошибка при отправке новой заявки: ' + retryError.error);
                        }
                      } else {
                        alert('Ошибка при отмене старой заявки');
                      }
                    } else {
                      alert('Заявка не найдена');
                    }
                  } else {
                    alert('Ошибка при получении списка заявок');
                  }
                } catch (cancelError) {
                  console.error('Error canceling application:', cancelError);
                  alert('Ошибка при отмене заявки');
                }
              }
            } else {
              alert('Ошибка: ' + data.error);
            }
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Ошибка отправки заявки');
        }
      });

      // Закрытие модального окна по клику вне его
      document.getElementById('applicationModal').addEventListener('click', function(e) {
        if (e.target === this) {
          closeApplicationModal();
        }
      });

      // Проверка, есть ли уже заявка у пользователя
      async function checkExistingApplication() {
        const token = localStorage.getItem('token');
        if (!token) return; // Если пользователь не авторизован, не проверяем

        try {
          const response = await fetch('/api/applications/my', {
            headers: {
              'Authorization': 'Bearer ' + token
            }
          });

          if (response.ok) {
            const applications = await response.json();
            const teamId = '${teamId || id || 'team_1753962000000_' + name.toLowerCase().replace(/\s+/g, '_')}';
            const existingApplication = applications.find(app => 
              app.teamId === teamId && app.status === 'pending'
            );

            if (existingApplication) {
              // Если заявка уже есть, делаем кнопку неактивной
              const applyButton = document.getElementById('applyButton');
              const applicationStatus = document.getElementById('applicationStatus');
              
              if (applyButton) {
                applyButton.disabled = true;
                applyButton.classList.add('opacity-50', 'cursor-not-allowed');
                applyButton.classList.remove('hover:bg-gray-800');
                applyButton.onclick = null; // Убираем обработчик клика
                applyButton.textContent = 'Заявка уже подана';
              }
              
              if (applicationStatus) {
                applicationStatus.classList.remove('hidden');
              }
            }
          }
        } catch (error) {
          console.error('Error checking existing application:', error);
        }
      }

      // Проверяем заявку при загрузке страницы
      document.addEventListener('DOMContentLoaded', function() {
        checkExistingApplication();
      });
    </script>
</body>
</html>`;
}

// Создать новую команду (и html-файл)
app.post('/team', (req, res) => {
  const { name, city, description, logo, photo, achievements } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const fileName = `${name.replace(/\s+/g, '_')}-team.html`;
  const filePath = path.join(TEAMS_DIR, fileName);
  if (fs.existsSync(filePath)) {
    return res.status(409).json({ error: 'file already exists' });
  }
  const html = teamHtmlTemplate({ name, city, description, logo, photo, achievements });
  fs.writeFileSync(filePath, html, 'utf8');
  res.json({ success: true, file: fileName });
});

// Переименовать команду (и html-файл)
app.put('/team/:oldName', (req, res) => {
  const { newName, city, description, logo, photo, achievements } = req.body;
  if (!newName) return res.status(400).json({ error: 'newName required' });
  const oldFile = `${req.params.oldName.replace(/\s+/g, '_')}-team.html`;
  const newFile = `${newName.replace(/\s+/g, '_')}-team.html`;
  const oldPath = path.join(TEAMS_DIR, oldFile);
  const newPath = path.join(TEAMS_DIR, newFile);
  if (!fs.existsSync(oldPath)) {
    return res.status(404).json({ error: 'old file not found' });
  }
  // Можно просто переименовать, но лучше пересоздать с новыми данными
  const html = teamHtmlTemplate({ name: newName, city, description, logo, photo, achievements });
  fs.writeFileSync(newPath, html, 'utf8');
  fs.unlinkSync(oldPath);
  res.json({ success: true, file: newFile });
});

// Вспомогательная функция для чтения пользователей
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return data ? JSON.parse(data) : [];
}

// Вспомогательная функция для записи пользователей
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readTeams() {
  if (!fs.existsSync(TEAMS_FILE)) return [];
  const data = fs.readFileSync(TEAMS_FILE, 'utf-8');
  return data ? JSON.parse(data) : [];
}

function writeTeams(teams) {
  fs.writeFileSync(TEAMS_FILE, JSON.stringify(teams, null, 2));
}

// Функции для маркетплейса
function readProducts() {
  if (!fs.existsSync(PRODUCTS_FILE)) return [];
  const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
  return data ? JSON.parse(data) : [];
}

function writeProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
}

function readProduct() {
  if (!fs.existsSync(PRODUCT_FILE)) return null;
  const data = fs.readFileSync(PRODUCT_FILE, 'utf8');
  return data ? JSON.parse(data)[0] : null;
}

function readCart() {
  if (!fs.existsSync(CART_FILE)) return {};
  const data = fs.readFileSync(CART_FILE, 'utf8');
  return data ? JSON.parse(data) : {};
}

function writeCart(cart) {
  fs.writeFileSync(CART_FILE, JSON.stringify(cart, null, 2), 'utf8');
}

function readHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return {};
  const data = fs.readFileSync(HISTORY_FILE, 'utf8');
  return data ? JSON.parse(data) : {};
}

function writeHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
}



// Функции для работы с чатами между пользователями
function readChats() {
  try {
    return JSON.parse(fs.readFileSync(CHATS_FILE, 'utf8'));
  } catch (error) {
    return {};
  }
}

function writeChats(chats) {
  try {
    fs.writeFileSync(CHATS_FILE, JSON.stringify(chats, null, 2));
  } catch (error) {
    console.error('Error writing chats:', error);
  }
}

// Функции для работы с турнирами
function readTournaments() {
  if (!fs.existsSync(TOURNAMENTS_FILE)) return [];
  const data = fs.readFileSync(TOURNAMENTS_FILE, 'utf-8');
  return data ? JSON.parse(data) : [];
}

function writeTournaments(tournaments) {
  fs.writeFileSync(TOURNAMENTS_FILE, JSON.stringify(tournaments, null, 2), 'utf8');
}

// Функции для работы с заявками на вступление в команды
function readApplications() {
  if (!fs.existsSync(APPLICATIONS_FILE)) return [];
  const data = fs.readFileSync(APPLICATIONS_FILE, 'utf-8');
  return data ? JSON.parse(data) : [];
}

function writeApplications(applications) {
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2), 'utf8');
}

// Генерация HTML страницы турнира
function generateTournamentHtml(tournament) {
  const imagePath = tournament.image ? 
    `../${tournament.image}` : 
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY2N2VlYSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VG91cm5hbWVudDwvdGV4dD48L3N2Zz4=';
  
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tournament.title} - Impacture</title>
    <link rel="stylesheet" href="../files/styles/navbar.css">
  <style>
        body { 
            font-family: 'Segoe UI', sans-serif; 
            background: #f5f6fa; 
            margin: 0; 
            padding: 0; 
        }
        .tournament-container {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .tournament-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .tournament-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        .tournament-status {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
            margin-bottom: 20px;
        }
        .status-recruiting { background: #28a745; }
        .status-full { background: #ffc107; color: #333; }
        .status-ongoing { background: #007bff; }
        .status-completed { background: #6c757d; }
        .tournament-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
            margin-bottom: 30px;
        }
        .tournament-content {
            padding: 40px;
        }
        .tournament-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        .info-label {
            font-weight: 600;
            color: #6c757d;
            font-size: 0.9rem;
            margin-bottom: 8px;
        }
        .info-value {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
        }
        .tournament-description {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .participate-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .participate-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        .participate-btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
            transform: none;
        }
        .participants-count {
            text-align: center;
            margin-bottom: 20px;
            font-size: 1.1rem;
            color: #6c757d;
        }
        @media (max-width: 768px) {
            .tournament-header { padding: 30px 20px; }
            .tournament-content { padding: 30px 20px; }
            .tournament-title { font-size: 2rem; }
        }
  </style>
</head>
<body>
    <header class="navbar-container">
        <div class="navbar-brand">
            <div class="navbar-logo">
                <img src="../files/images/impacture.png" alt="Impacture Logo" class="navbar-logo-img">
            </div>
            <h2 class="navbar-title">Impacture</h2>
        </div>
        <div class="navbar-links">
            <a href="../index.html" class="navbar-link">Главная</a>
            <a href="../student-page.html" class="navbar-link">Команды</a>
            <a href="../tournaments-page.html" class="navbar-link">Турниры</a>
            <a href="../marketplace.html" class="navbar-link">Маркетплейс</a>
        </div>
        <div class="navbar-spacer"></div>
        <div class="navbar-right">
            <div class="mobile-nav">
                <ul>
                    <li><a href="../index.html">Главная</a></li>
                    <li><a href="../student-page.html">Команды</a></li>
                    <li><a href="../tournaments-page.html">Турниры</a></li>
                    <li><a href="../marketplace.html">Маркетплейс</a></li>
                </ul>
            </div>
            <button class="mobile-menu-btn">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18M3 12h18M3 18h18" stroke="#141414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
    </div>
  </header>

    <div class="tournament-container">
        <div class="tournament-header">
            <h1 class="tournament-title">${tournament.title}</h1>
            <div class="tournament-status status-${tournament.status}">
                ${getStatusText(tournament.status)}
            </div>
        </div>
        
        <img src="${imagePath}" alt="${tournament.title}" class="tournament-image">
        
        <div class="tournament-content">
            <div class="tournament-info">
                <div class="info-item">
                    <div class="info-label">Город</div>
                    <div class="info-value">${tournament.city || 'Не указан'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Дата начала</div>
                    <div class="info-value">${new Date(tournament.startDate).toLocaleDateString('ru-RU')}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Дата окончания</div>
                    <div class="info-value">${new Date(tournament.endDate).toLocaleDateString('ru-RU')}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Участники</div>
                    <div class="info-value">${tournament.participants.length}${tournament.maxParticipants ? '/' + tournament.maxParticipants : ''}</div>
                </div>
            </div>
            
            ${tournament.description ? `
            <div class="tournament-description">
                <h3>Описание турнира</h3>
                <p>${tournament.description}</p>
            </div>
            ` : ''}
            
            <div class="participants-count">
                Участников: ${tournament.participants.length}${tournament.maxParticipants ? ' из ' + tournament.maxParticipants : ''}
            </div>
            
            <!-- Кнопка участия -->
            <button id="registerBtn" class="participate-btn">
                Участвовать
            </button>
          </div>
          </div>

    <script src="../files/scripts/mobile-nav.js"></script>
    <script src="../files/scripts/tournament-page.js"></script>
</body>
</html>`;

  // Сохраняем HTML файл
  const fileName = `${tournament.id}.html`;
  const filePath = path.join(__dirname, '..', 'tournaments', fileName);
  fs.writeFileSync(filePath, html, 'utf8');
  
  return html;
}

// Генерация HTML страницы товара
function generateProductHtml(product) {
  // Получаем данные продавца
  const users = readUsers();
  console.log('Generating HTML for product:', product.id, 'createdBy:', product.createdBy);
  console.log('Available users:', users.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` })));
  
  const seller = users.find(user => user.id === product.createdBy);
  console.log('Found seller:', seller ? `${seller.firstName} ${seller.lastName}` : 'NOT FOUND');
  
  const sellerName = seller ? `${seller.firstName} ${seller.lastName}` : 'Пользователь';
  
  const mainImage = product.images && product.images.length > 0 ? 
    `../${product.images[0].replace(/\\/g, '/')}` : 
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzY2N2VlYSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UHJvZHVjdDwvdGV4dD48L3N2Zz4=';
  
  const imagesHtml = product.images && product.images.length > 0 ? 
    product.images.map(img => `../${img.replace(/\\/g, '/')}`).join('","') : 
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzY2N2VlYSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UHJvZHVjdDwvdGV4dD48L3N2Zz4=';
  
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${product.title} - Impacture</title>
    <link rel="stylesheet" href="../files/styles/navbar.css">
    <style>

        
        body { font-family: 'Segoe UI', sans-serif; background: #f5f6fa; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: #f5f6fa; margin: 0; padding: 0; }
        .product-container {
            max-width: 1000px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .product-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .product-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        .product-price {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .product-condition {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
            margin-bottom: 20px;
            background: rgba(255,255,255,0.2);
        }
        .product-image-gallery {
            margin-bottom: 30px;
        }
        .main-image-container {
            position: relative;
            height: 400px;
            overflow: hidden;
            border-radius: 12px;
            margin-bottom: 15px;
        }
        .main-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        .main-image:hover {
            transform: scale(1.05);
        }
        .image-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.6);
            color: white;
            border: none;
            padding: 12px 16px;
            cursor: pointer;
            font-size: 1.2rem;
            border-radius: 50%;
            transition: all 0.3s;
            z-index: 10;
        }
        .image-nav:hover {
            background: rgba(0,0,0,0.8);
            transform: translateY(-50%) scale(1.1);
        }
        .image-nav.prev { left: 15px; }
        .image-nav.next { right: 15px; }
        .image-thumbnails {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding: 10px 0;
            scrollbar-width: thin;
            scrollbar-color: #ddd transparent;
        }
        .image-thumbnails::-webkit-scrollbar {
            height: 6px;
        }
        .image-thumbnails::-webkit-scrollbar-track {
            background: transparent;
        }
        .image-thumbnails::-webkit-scrollbar-thumb {
            background: #ddd;
            border-radius: 3px;
        }
        .thumbnail {
            width: 80px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s;
            flex-shrink: 0;
        }
        .thumbnail:hover {
            transform: scale(1.05);
            border-color: #667eea;
        }
        .thumbnail.active {
            border-color: #667eea;
            box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
        }
        .product-content {
            padding: 40px;
        }
        .product-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        .info-label {
            font-weight: 600;
            color: #6c757d;
            font-size: 0.9rem;
            margin-bottom: 8px;
        }
        .info-value {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
        }
        .product-description {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .action-buttons {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
        }
        .btn {
            flex: 1;
            padding: 16px;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }
        .seller-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
        }
        .chat-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            backdrop-filter: blur(5px);
        }
        .chat-modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .chat-content {
            background: white;
            border-radius: 16px;
            width: 95%;
            max-width: 800px;
            height: 90%;
            max-height: 800px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        .chat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-bottom: 1px solid #e9ecef;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 16px 16px 0 0;
        }
        .chat-header h5 {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
        }
        .chat-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s;
        }
        .chat-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .message {
            display: flex;
            flex-direction: column;
            max-width: 80%;
        }
        .message.sent {
            align-self: flex-end;
        }
        .message.received {
            align-self: flex-start;
        }
        .message-bubble {
            padding: 12px 16px;
            border-radius: 18px;
            font-size: 0.95rem;
            line-height: 1.4;
            word-wrap: break-word;
        }
        .message.sent .message-bubble {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 6px;
        }
        .message.received .message-bubble {
            background: #f1f3f4;
            color: #333;
            border-bottom-left-radius: 6px;
        }
        .message-text {
            margin-bottom: 8px;
        }
        .message-image {
            margin-top: 8px;
        }
        .message-image img {
            max-width: 200px;
            max-height: 150px;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .message-image img:hover {
            transform: scale(1.05);
        }
        .message-time {
            font-size: 0.75rem;
            color: #999;
            margin-top: 4px;
            text-align: center;
        }
        .chat-input-group {
            display: flex;
            gap: 10px;
            padding: 20px 25px;
            border-top: 1px solid #e9ecef;
            background: #f8f9fa;
            border-radius: 0 0 16px 16px;
        }
        .chat-input-wrapper {
            display: flex;
            align-items: center;
            flex: 1;
            gap: 10px;
        }
        .chat-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #ddd;
            border-radius: 25px;
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.2s;
        }
        .chat-input:focus {
            border-color: #667eea;
        }
        .chat-file-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: #e9ecef;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s;
            color: #6c757d;
        }
        .chat-file-btn:hover {
            background: #667eea;
            color: white;
        }
        .chat-file-preview {
            position: relative;
            padding: 10px 25px;
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
        }
        .chat-file-preview img {
            max-width: 200px;
            max-height: 150px;
            border-radius: 8px;
            object-fit: cover;
        }
        .remove-chat-file {
            position: absolute;
            top: 5px;
            right: 20px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .remove-chat-file:hover {
            background: #c82333;
        }
        .chat-send-btn {
            padding: 12px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .chat-send-btn:hover {
            transform: translateY(-1px);
        }
        @media (max-width: 768px) {
            .product-header { padding: 30px 20px; }
            .product-content { padding: 30px 20px; }
            .product-title { font-size: 2rem; }
            .action-buttons { flex-direction: column; }
            .chat-content {
                width: 100%;
                height: 100%;
                border-radius: 0;
                max-width: none;
                max-height: none;
            }
            .chat-header {
                padding: 15px 20px;
            }
            .chat-messages {
                padding: 15px;
            }
            .chat-input-group {
                padding: 15px 20px;
            }
        }
    </style>
</head>
<body>
    <header class="navbar-container">
        <div class="navbar-brand">
            <div class="navbar-logo">
                <img src="/files/images/impacture.png" alt="Impacture Logo" class="navbar-logo-img">
            </div>
            <h2 class="navbar-title">Impacture</h2>
        </div>
        <div class="navbar-links">
            <a href="/index.html" class="navbar-link">Главная</a>
            <a href="/student-page.html" class="navbar-link">Команды</a>
            <a href="/tournaments-page.html" class="navbar-link">Турниры</a>
            <a href="/marketplace.html" class="navbar-link">Маркетплейс</a>
        </div>
        <div class="navbar-spacer"></div>
        <div class="navbar-right">
            <div class="mobile-nav">
                <ul>
                    <li><a href="/index.html">Главная</a></li>
                    <li><a href="/student-page.html">Команды</a></li>
                    <li><a href="/tournaments-page.html">Турниры</a></li>
                    <li><a href="/marketplace.html">Маркетплейс</a></li>
                </ul>
            </div>
            <button class="mobile-menu-btn">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18M3 12h18M3 18h18" stroke="#141414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
          </div>
    </header>

    <div class="product-container">
        <div class="product-header">
            <h1 class="product-title">${product.title}</h1>
            <div class="product-price">${product.price} ₸</div>
            <div class="product-condition">
                ${getConditionText(product.condition)}
          </div>
        </div>
        
        <div class="product-image-gallery">
            <div class="main-image-container">
                <img src="${mainImage}" alt="${product.title}" class="main-image" id="main-image">
                ${product.images && product.images.length > 1 ? `
                <button class="image-nav prev" onclick="window.changeImage(-1)">&lt;</button>
                <button class="image-nav next" onclick="window.changeImage(1)">&gt;</button>
                ` : ''}
      </div>
            

          </div>
        
        <div class="product-content">
            <div class="product-info">
                <div class="info-item">
                    <div class="info-label">Категория</div>
                    <div class="info-value">${getCategoryText(product.category)}</div>
        </div>
                <div class="info-item">
                    <div class="info-label">Город</div>
                    <div class="info-value">${product.city || 'Не указан'}</div>
              </div>
                <div class="info-item">
                    <div class="info-label">Дата размещения</div>
                    <div class="info-value">${new Date(product.createdAt).toLocaleDateString('ru-RU')}</div>
              </div>
            </div>
            
            ${product.description ? `
            <div class="product-description">
                <h3>Описание товара</h3>
                <p>${product.description}</p>
          </div>
            ` : ''}
            

            
            <div class="seller-info">
                <h4>Информация о продавце</h4>
                <p>Продавец: ${sellerName}</p>
                <p>Товар размещен: ${new Date(product.createdAt).toLocaleDateString('ru-RU')}</p>
            </div>
            
            <!-- Кнопки действий -->
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="addToCart('${product.id}')">
                    Добавить в корзину
                </button>
                <button class="btn btn-secondary" onclick="openChatWithSeller('${product.createdBy}', '${sellerName}')">
                    Написать продавцу
                </button>
            </div>
        </div>
    </div>



  <script>
        // Данные товара
        const productData = {
            id: product.id,
            title: product.title,
            price: product.price,
            images: [imagesHtml]
        };
        let currentImageIndex = 0;
        window.changeImage = function(direction) {
            const images = productData.images;
            currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
            window.updateImage();
        }
        window.goToImage = function(index) {
            currentImageIndex = index;
            window.updateImage();
        }
        window.updateImage = function() {
            const mainImage = document.getElementById('main-image');
            mainImage.src = productData.images[currentImageIndex];
        }

        // Функция добавления в корзину
        window.addToCart = function(productId) {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Для добавления товара в корзину необходимо войти в аккаунт');
                window.location.href = '../login.html';
                return;
            }
            
            fetch('http://localhost:3000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    productId: productId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Товар добавлен в корзину!');
                } else {
                    alert(data.error || 'Ошибка добавления товара в корзину');
                }
            })
            .catch(error => {
                console.error('Error adding to cart:', error);
                alert('Ошибка добавления товара в корзину');
            });
        }

        // Функция открытия чата с продавцом
        window.openChatWithSeller = function(sellerId, sellerName) {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Для отправки сообщений необходимо войти в аккаунт');
                window.location.href = '../login.html';
                return;
            }
            
            // Открываем чат через marketplace с правильным именем продавца
            const chatUrl = '../marketplace.html?openChat=true&sellerId=' + sellerId + '&sellerName=' + encodeURIComponent(sellerName);
            window.location.href = chatUrl;
        }

        

        


  </script>
    

    
    <script src="../files/scripts/mobile-nav.js"></script>
</body>
</html>`;

  // Сохраняем HTML файл
  const fileName = `${product.id}.html`;
  const filePath = path.join(__dirname, '..', 'products', fileName);
  fs.writeFileSync(filePath, html, 'utf8');
  return html;
}

module.exports = { generateProductHtml };

// Вспомогательные функции для генерации HTML
function getStatusText(status) {
  switch (status) {
    case 'recruiting': return 'Набор участников';
    case 'full': return 'Собран';
    case 'ongoing': return 'Идет';
    case 'completed': return 'Завершен';
    default: return 'Неизвестно';
  }
}

function getConditionText(condition) {
  switch (condition) {
    case 'new': return 'Новое';
    case 'good': return 'Хорошее';
    case 'used': return 'Б/у';
    default: return 'Не указано';
  }
}

function getCategoryText(category) {
  switch (category) {
    case 'electronics': return 'Электроника';
    case 'clothing': return 'Одежда';
    case 'books': return 'Книги';
    case 'sports': return 'Спорт';
    case 'other': return 'Другое';
    default: return 'Не указано';
  }
}

function getButtonText(tournament) {
  if (tournament.status === 'completed') {
    return 'Турнир завершен';
  } else if (tournament.status === 'ongoing') {
    return 'Турнир идет';
  } else if (tournament.status === 'full') {
    return 'Мест нет';
  } else {
    return 'Участвовать';
  }
}

function getTeamStatusText(status) {
  switch (status) {
    case 'recruiting':
      return 'Ищем участников';
    case 'full':
      return 'Команда собрана';
    case 'closed':
      return 'Набор закрыт';
    default:
      return 'Неизвестно';
  }
}

function getTeamStatusColor(status) {
  switch (status) {
    case 'recruiting':
      return '#28a745';
    case 'full':
      return '#dc3545';
    case 'closed':
      return '#6c757d';
    default:
      return '#6c757d';
  }
}

// Настройка транспорта для отправки писем
// Функция для безопасного удаления файлов
const safeDeleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('File deleted successfully:', filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', filePath, error);
  }
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true для порта 465, false для других портов
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // Только для тестирования, в продакшене уберите эту строку
    }
  });
};

// Регистрация с подтверждением e-mail
app.post('/api/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }
  const users = readUsers();
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Пользователь уже существует' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const emailToken = crypto.randomBytes(32).toString('hex');
  const newUser = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    firstName,
    lastName,
    isEmailConfirmed: false, // Требуем подтверждение email
    emailToken: emailToken
  };
  users.push(newUser);
  writeUsers(users);

  // Отправляем email для подтверждения
  const confirmUrl = `http://${req.headers.host}/api/confirm-email?token=${emailToken}`;
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Impacture" <${process.env.SMTP_FROM || 'no-reply@impacture.com'}>`,
    to: email,
    subject: 'Подтверждение регистрации на Impacture',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Добро пожаловать на Impacture!</h2>
        <p>Привет, ${firstName}!</p>
        <p>Спасибо за регистрацию на Impacture. Для завершения регистрации, пожалуйста, подтвердите ваш email.</p>
        <p style="margin: 25px 0;">
          <a href="${confirmUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Подтвердить Email
          </a>
        </p>
        <p>Если кнопка не работает, скопируйте эту ссылку в браузер:</p>
        <p style="word-break: break-all; color: #666;">${confirmUrl}</p>
        <p>Ссылка действительна в течение 24 часов.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Если вы не регистрировались на Impacture, просто проигнорируйте это письмо.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email);
    console.log('User registered successfully:', { email, firstName, lastName });
    res.status(201).json({ 
      message: 'Регистрация успешна! Проверьте ваш email для подтверждения.'
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Удаляем пользователя если не удалось отправить email
    const updatedUsers = users.filter(u => u.email !== email);
    writeUsers(updatedUsers);
    res.status(500).json({ message: 'Ошибка при отправке email. Попробуйте еще раз.' });
  }
});

// Подтверждение e-mail
app.get('/api/confirm-email', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Нет токена');
  const users = readUsers();
  const user = users.find(u => u.emailToken === token);
  if (!user) return res.status(400).send('Неверный токен');
  user.isEmailConfirmed = true;
  user.emailToken = undefined;
  writeUsers(users);
  res.send('Почта успешно подтверждена! Теперь вы можете войти.');
});

// Вход с проверкой подтверждения e-mail
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email и пароль обязательны' });
  }
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Неверные email или пароль' });
  }
  if (!user.isEmailConfirmed) {
    return res.status(403).json({ message: 'Подтвердите e-mail для входа' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Неверные email или пароль' });
  }
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, firstName: user.firstName, lastName: user.lastName });
});

// Сброс пароля: запрос на e-mail
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Требуется email' });
  
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExp = Date.now() + 3600000; // 1 час
  writeUsers(users);
  
  const resetUrl = `http://${req.headers.host}/reset-password?token=${resetToken}`;
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Impacture" <${process.env.SMTP_FROM || 'no-reply@impacture.com'}>`,
    to: email,
    subject: 'Восстановление пароля на Impacture',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Восстановление пароля</h2>
        <p>Вы получили это письмо, потому что был отправлен запрос на восстановление пароля для вашей учетной записи.</p>
        <p>Для сброса пароля, пожалуйста, нажмите на кнопку ниже:</p>
        <p style="margin: 25px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Сбросить пароль
          </a>
        </p>
        <p>Или скопируйте и вставьте в браузер следующую ссылку:</p>
        <p><small>${resetUrl}</small></p>
        <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Ссылка действительна в течение 1 часа.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Инструкции по сбросу пароля отправлены на ваш email' });
  } catch (error) {
    console.error('Ошибка при отправке письма:', error);
    res.status(500).json({ message: 'Ошибка при отправке инструкций по сбросу пароля' });
  }
});

// Сброс пароля: установка нового пароля
app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Требуется токен и новый пароль' });
  }
  
  const users = readUsers();
  const user = users.find(u => u.resetToken === token && u.resetTokenExp > Date.now());
  
  if (!user) {
    return res.status(400).json({ 
      message: 'Неверный или устаревший токен. Пожалуйста, запросите новый запрос на сброс пароля.' 
    });
  }
  
  try {
    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    
    // Удаляем токен сброса
    delete user.resetToken;
    delete user.resetTokenExp;
    
    // Сохраняем обновленные данные пользователя
    writeUsers(users);
    
    // Отправляем подтверждение об успешной смене пароля
    const transporter = createTransporter();
    const mailOptions = {
      from: `"Impacture" <${process.env.SMTP_FROM || 'no-reply@impacture.com'}>`,
      to: user.email,
      subject: 'Пароль успешно изменен',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Пароль успешно изменен</h2>
          <p>Здравствуйте, ${user.firstName || 'пользователь'}!</p>
          <p>Вы успешно изменили пароль для вашей учетной записи на Impacture.</p>
          <p>Если это были не вы, пожалуйста, немедленно свяжитесь с нашей службой поддержки.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Пароль успешно изменен. Теперь вы можете войти с новым паролем.' });
    
  } catch (error) {
    console.error('Ошибка при сбросе пароля:', error);
    res.status(500).json({ message: 'Произошла ошибка при сбросе пароля' });
  }
});

// Middleware для проверки токена
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Нет токена' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Нет токена' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Неверный токен' });
  }
}

// Получить профиль пользователя
app.get('/api/profile', authMiddleware, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
});

// Получить всех пользователей (для администраторов)
app.get('/api/users', authMiddleware, (req, res) => {
  try {
    const users = readUsers();
    // Возвращаем только необходимые данные (без паролей)
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt
    }));
    res.json(safeUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
});

// Получить список всех пользователей (для админ-панели)
app.get('/api/users', (req, res) => {
  const users = readUsers();
  // Для безопасности не возвращаем пароли и токены
  const safeUsers = users.map(u => ({
    id: u.id,
    name: (u.firstName || '') + ' ' + (u.lastName || ''),
    email: u.email
  }));
  res.json(safeUsers);
});

// Получить данные пользователя по ID (для получения имени продавца)
app.get('/api/users/:id', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }
  // Возвращаем только безопасные данные
  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  });
});

// Удалить пользователя по id (для админ-панели)
app.delete('/api/users/:id', (req, res) => {
  let users = readUsers();
  const userIdx = users.findIndex(u => u.id === req.params.id);
  if (userIdx === -1) return res.status(404).json({ message: 'Пользователь не найден' });
  users.splice(userIdx, 1);
  writeUsers(users);
  res.json({ success: true });
});

// Получить список всех команд
app.get('/api/teams', (req, res) => {
  const teams = readTeams();
  res.json(teams);
});

// Создать новую команду
app.post('/api/teams', authMiddleware, teamUpload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), (req, res) => {
  try {
    console.log('Creating team with data:', req.body);
    console.log('Files:', req.files);
    
    const { name, city, description, achievements, status, maxMembers, currentMembers } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Название команды обязательно' });
    }

    console.log('Reading teams...');
    const teams = readTeams();
    console.log('Current teams count:', teams.length);
    
    const id = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Generated team ID:', id);
    
    // Обрабатываем загруженные файлы
    let logo = '';
    let photo = '';
    
    if (req.files && req.files.logo) {
      console.log('Processing logo file...');
      // Сохраняем относительный путь
      const relativePath = path.relative(path.join(__dirname, '..'), req.files.logo[0].path);
      logo = relativePath.replace(/\\/g, '/');
      console.log('Logo path:', logo);
    }
    if (req.files && req.files.photo) {
      console.log('Processing photo file...');
      // Сохраняем относительный путь
      const relativePath = path.relative(path.join(__dirname, '..'), req.files.photo[0].path);
      photo = relativePath.replace(/\\/g, '/');
      console.log('Photo path:', photo);
    }
    
    // Парсим достижения
    let achievementsArray = [];
    if (achievements) {
      try {
        achievementsArray = JSON.parse(achievements);
      } catch (e) {
        achievementsArray = achievements.split('\n').filter(a => a.trim());
      }
    }
    console.log('Achievements:', achievementsArray);
    
    const newTeam = {
      id,
      name,
      city: city || '',
      description: description || '',
      logo,
      photo,
      status: status || 'recruiting',
      maxMembers: parseInt(maxMembers) || 6,
      currentMembers: parseInt(currentMembers) || 1,
      achievements: achievementsArray,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };
    
    console.log('New team object:', newTeam);
    
    teams.push(newTeam);
    console.log('Writing teams to file...');
    writeTeams(teams);

    // Генерируем HTML страницу для команды
    console.log('Generating HTML...');
    const fileName = `${newTeam.name.replace(/\s+/g, '_')}-team.html`;
    const filePath = path.join(__dirname, '..', fileName);
    console.log('HTML file path:', filePath);
    
    const html = teamHtmlTemplate({
      ...newTeam,
      teamId: newTeam.id
    });
    console.log('HTML generated, writing to file...');
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Team HTML created:', filePath);

    res.json({ success: true, team: newTeam });
  } catch (error) {
    console.error('Error creating team:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Ошибка создания команды' });
  }
});

// Получить команду по ID
app.get('/api/teams/:id', (req, res) => {
  try {
    const teams = readTeams();
    const team = teams.find(t => t.id === req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Error getting team:', error);
    res.status(500).json({ error: 'Ошибка получения команды' });
  }
});

// Получить команду для редактирования
app.get('/api/teams/:id/edit', authMiddleware, (req, res) => {
  try {
    const teams = readTeams();
    const team = teams.find(t => t.id === req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    
    // Проверяем, что пользователь создал эту команду
    if (team.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для редактирования этой команды' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Error getting team for edit:', error);
    res.status(500).json({ error: 'Ошибка получения команды для редактирования' });
  }
});

// Обновить команду
app.put('/api/teams/:id', authMiddleware, teamUpload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), (req, res) => {
  try {
    const { name, city, description, achievements, status, maxMembers, currentMembers } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Название команды обязательно' });
    }

  let teams = readTeams();
  const idx = teams.findIndex(t => t.id === req.params.id);
    
    if (idx === -1) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    
    // Проверяем, что пользователь создал эту команду
    if (teams[idx].createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для редактирования этой команды' });
    }
    
    // Обрабатываем загруженные файлы
    let logo = teams[idx].logo;
    let photo = teams[idx].photo;
    
    if (req.files && req.files.logo) {
      // Сохраняем относительный путь
      const relativePath = path.relative(path.join(__dirname, '..'), req.files.logo[0].path);
      logo = relativePath.replace(/\\/g, '/');
    }
    if (req.files && req.files.photo) {
      // Сохраняем относительный путь
      const relativePath = path.relative(path.join(__dirname, '..'), req.files.photo[0].path);
      photo = relativePath.replace(/\\/g, '/');
    }
    
    // Парсим достижения
    let achievementsArray = teams[idx].achievements || [];
    if (achievements) {
      try {
        achievementsArray = JSON.parse(achievements);
      } catch (e) {
        achievementsArray = achievements.split('\n').filter(a => a.trim());
      }
    }
    
  teams[idx] = {
    ...teams[idx],
      name,
      city: city || '',
      description: description || '',
      logo,
      photo,
      status: status || teams[idx].status || 'recruiting',
      maxMembers: parseInt(maxMembers) || teams[idx].maxMembers || 6,
      currentMembers: parseInt(currentMembers) || teams[idx].currentMembers || 1,
      achievements: achievementsArray,
      updatedAt: new Date().toISOString()
    };
    
  writeTeams(teams);

  // Перегенерировать HTML-файл команды
  const teamData = teams[idx];
  const fileName = `${teamData.name.replace(/\s+/g, '_')}-team.html`;
  const filePath = path.join(__dirname, '..', fileName);
  const html = teamHtmlTemplate(teamData);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Team HTML updated:', filePath);

    res.json({ success: true, team: teams[idx] });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Ошибка обновления команды' });
  }
});

// Получить команды, созданные пользователем
app.get('/api/teams/user/created', authMiddleware, (req, res) => {
  try {
    const teams = readTeams();
    const userTeams = teams.filter(t => t.createdBy === req.user.id);
    res.json(userTeams);
  } catch (error) {
    console.error('Error getting user teams:', error);
    res.status(500).json({ error: 'Ошибка получения команд пользователя' });
  }
});

// Удалить команду по id
app.delete('/api/teams/:id', authMiddleware, (req, res) => {
  try {
    let teams = readTeams();
    const idx = teams.findIndex(t => t.id === req.params.id);
    
    if (idx === -1) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    
    const team = teams[idx];
    
    // Проверяем, что пользователь создал эту команду
    if (team.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для удаления этой команды' });
    }
    
    // Удаляем изображения команды
    safeDeleteFile(team.logo);
    safeDeleteFile(team.photo);
    
    // Удаляем HTML файл команды
    const htmlFilePath = path.join(__dirname, '..', 'teams', `${team.id}.html`);
    safeDeleteFile(htmlFilePath);
    
    teams.splice(idx, 1);
    writeTeams(teams);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Ошибка удаления команды' });
  }
});

// Получить товар (старый API для совместимости)
app.get('/api/product', (req, res) => {
  res.json(readProduct());
});

// Получить все товары
app.get('/api/products', (req, res) => {
  try {
    const products = readProducts();
    res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Ошибка получения товаров' });
  }
});

// Получить товар по ID
app.get('/api/products/:id', (req, res) => {
  try {
    const products = readProducts();
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: 'Ошибка получения товара' });
  }
});

// Создать товар
app.post('/api/products', authMiddleware, productUpload.array('images', 10), (req, res) => {
  try {
    const { title, description, price, condition, category, city } = req.body;
    
    if (!title || !price) {
      return res.status(400).json({ error: 'Название и цена обязательны' });
    }

    const products = readProducts();
    const id = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Обрабатываем загруженные изображения
    const images = req.files ? req.files.map(file => {
      // Сохраняем относительный путь вместо абсолютного
      const relativePath = path.relative(path.join(__dirname, '..'), file.path);
      return relativePath.replace(/\\/g, '/'); // Заменяем обратные слеши на прямые для веб
    }) : [];
    
    const newProduct = {
      id,
      title,
      description: description || '',
      price: parseFloat(price),
      condition: condition || 'new',
      category: category || 'other',
      city: city || '',
      images,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    products.push(newProduct);
    writeProducts(products);
    
    // Генерируем HTML страницу для товара
    console.log('Generating HTML for product:', newProduct.id);
    try {
      generateProductHtml(newProduct);
      console.log('HTML generated successfully for product:', newProduct.id);
    } catch (error) {
      console.error('Error generating HTML for product:', newProduct.id, error);
    }
    
    res.json({ 
      message: 'Товар успешно создан',
      product: newProduct
    });
    
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Ошибка создания товара' });
  }
});

// Обновить товар
app.put('/api/products/:id', authMiddleware, productUpload.array('images', 10), (req, res) => {
  try {
    const products = readProducts();
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const product = products[productIndex];
    
    if (product.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для редактирования этого товара' });
    }
    
    const { title, description, price, condition, category, city } = req.body;
    
    // Обновляем поля
    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price ? parseFloat(price) : product.price;
    product.condition = condition || product.condition;
    product.category = category || product.category;
    product.city = city || product.city;
    product.updatedAt = new Date().toISOString();
    
    // Добавляем новые изображения если есть
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => {
        // Сохраняем относительный путь вместо абсолютного
        const relativePath = path.relative(path.join(__dirname, '..'), file.path);
        return relativePath.replace(/\\/g, '/'); // Заменяем обратные слеши на прямые для веб
      });
      product.images = [...product.images, ...newImages];
    }
    
    writeProducts(products);
    
    // Обновляем HTML страницу товара
    generateProductHtml(product);
    
    res.json({ 
      message: 'Товар успешно обновлен',
      product: product
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Ошибка обновления товара' });
  }
});

// Удалить товар
app.delete('/api/products/:id', authMiddleware, (req, res) => {
  try {
    const products = readProducts();
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const product = products[productIndex];
    
    if (product.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для удаления этого товара' });
    }
    
    // Удаляем изображения
    if (product.images) {
      product.images.forEach(imagePath => {
        safeDeleteFile(imagePath);
      });
    }
    
    // Удаляем HTML файл товара
    const htmlFilePath = path.join(__dirname, '..', 'products', `${product.id}.html`);
    safeDeleteFile(htmlFilePath);
    
    products.splice(productIndex, 1);
    writeProducts(products);
    
    res.json({ message: 'Товар успешно удален' });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Ошибка удаления товара' });
  }
});

// Удалить изображение товара
app.delete('/api/products/:id/images/:imageIndex', authMiddleware, (req, res) => {
  try {
    const products = readProducts();
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const product = products[productIndex];
    
    if (product.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для редактирования этого товара' });
    }
    
    const imageIndex = parseInt(req.params.imageIndex);
    
    if (imageIndex < 0 || imageIndex >= product.images.length) {
      return res.status(400).json({ error: 'Неверный индекс изображения' });
    }
    
    // Удаляем файл изображения
    const imagePath = product.images[imageIndex];
    safeDeleteFile(imagePath);
    
    // Удаляем изображение из массива
    product.images.splice(imageIndex, 1);
    product.updatedAt = new Date().toISOString();
    
    writeProducts(products);
    
    // Обновляем HTML страницу товара
    generateProductHtml(product);
    
    res.json({ 
      message: 'Изображение успешно удалено',
      product: product
    });
    
  } catch (error) {
    console.error('Error deleting product image:', error);
    res.status(500).json({ error: 'Ошибка удаления изображения' });
  }
});

// Получить товары пользователя
app.get('/api/products/user/created', authMiddleware, (req, res) => {
  try {
    const products = readProducts();
    const userProducts = products.filter(p => p.createdBy === req.user.id);
    res.json(userProducts);
  } catch (error) {
    console.error('Error getting user products:', error);
    res.status(500).json({ error: 'Ошибка получения товаров пользователя' });
  }
});

// Получить корзину
app.get('/api/cart', authMiddleware, (req, res) => {
  const cart = readCart();
  const userId = req.user.id;
  res.json({ items: cart[userId] || [] });
});

// Добавить товар в корзину
app.post('/api/cart', authMiddleware, (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'ID товара обязателен' });
    }
    
    const products = readProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const cart = readCart();
    const userId = req.user.id;
    
    if (!cart[userId]) cart[userId] = [];
    
    const existingItem = cart[userId].find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart[userId].push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        qty: 1
      });
    }
    
    writeCart(cart);
    res.json({ success: true, message: 'Товар добавлен в корзину' });
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Ошибка добавления в корзину' });
  }
});

// Удалить товар из корзины
app.delete('/api/cart/:productId', authMiddleware, (req, res) => {
  try {
    const cart = readCart();
    const userId = req.user.id;
    const productId = req.params.productId;
    
    if (!cart[userId]) {
      return res.status(404).json({ error: 'Корзина пуста' });
    }
    
    const itemIndex = cart[userId].findIndex(item => item.id === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Товар не найден в корзине' });
    }
    
    cart[userId].splice(itemIndex, 1);
    writeCart(cart);
    
    res.json({ success: true, message: 'Товар удален из корзины' });
    
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Ошибка удаления из корзины' });
  }
});

// Изменить количество товара в корзине
app.put('/api/cart/:productId', authMiddleware, (req, res) => {
  try {
    const { qty } = req.body;
    const cart = readCart();
    const userId = req.user.id;
    const productId = req.params.productId;
    
    if (!cart[userId]) {
      return res.status(404).json({ error: 'Корзина пуста' });
    }
    
    const item = cart[userId].find(item => item.id === productId);
    
    if (!item) {
      return res.status(404).json({ error: 'Товар не найден в корзине' });
    }
    
    if (qty <= 0) {
      // Удаляем товар если количество 0 или меньше
      cart[userId] = cart[userId].filter(item => item.id !== productId);
    } else {
      item.qty = qty;
    }
    
    writeCart(cart);
    res.json({ success: true, message: 'Количество обновлено' });
    
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Ошибка обновления корзины' });
  }
});

// Оформить покупку
app.post('/api/checkout', authMiddleware, (req, res) => {
  const cart = readCart();
  const history = readHistory();
  const userId = req.user.id;
  if (!cart[userId] || cart[userId].length === 0) {
    return res.status(400).json({ message: 'Корзина пуста' });
  }
  if (!history[userId]) history[userId] = [];
  const now = new Date().toLocaleString('ru-RU');
  cart[userId].forEach(item => {
    history[userId].push({ name: item.name, date: now });
  });
  cart[userId] = [];
  writeCart(cart);
  writeHistory(history);
  res.json({ success: true });
});

// История покупок
app.get('/api/history', authMiddleware, (req, res) => {
  const history = readHistory();
  const userId = req.user.id;
  res.json(history[userId] || []);
});



// API для турниров

// Создать турнир
app.post('/api/tournaments', authMiddleware, upload.single('image'), (req, res) => {
  const { title, description, startDate, endDate, city, maxParticipants } = req.body;
  
  if (!title || !startDate || !endDate) {
    return res.status(400).json({ error: 'Название, дата начала и окончания обязательны' });
  }

  const tournaments = readTournaments();
  const id = `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newTournament = {
    id,
    title,
    description: description || '',
    startDate,
    endDate,
    city: city || '',
    maxParticipants: maxParticipants || null,
    image: req.file ? (() => {
      // Сохраняем относительный путь вместо абсолютного
      const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);
      return relativePath.replace(/\\/g, '/'); // Заменяем обратные слеши на прямые для веб
    })() : '',
    status: 'recruiting',
    participants: [],
    createdAt: new Date().toISOString(),
    createdBy: req.user.id
  };

  tournaments.push(newTournament);
  writeTournaments(tournaments);

  // Создать HTML файл турнира
  const fileName = `${id}.html`;
  const filePath = path.join(__dirname, '..', 'tournaments', fileName);
  
  // Создать папку tournaments если её нет
  const tournamentsDir = path.join(__dirname, '..', 'tournaments');
  if (!fs.existsSync(tournamentsDir)) {
    fs.mkdirSync(tournamentsDir, { recursive: true });
  }
  
  const tournamentHtml = generateTournamentHtml(newTournament);
  fs.writeFileSync(filePath, tournamentHtml, 'utf8');

  res.status(201).json({
    success: true,
    tournament: newTournament,
    url: `/tournaments/${fileName}`
  });
});

// Получить все турниры
app.get('/api/tournaments', (req, res) => {
  const tournaments = readTournaments();
  res.json(tournaments);
});

// Получить один турнир для редактирования (должен быть выше общего маршрута)
app.get('/api/tournaments/:id/edit', authMiddleware, (req, res) => {
  try {
    const tournaments = readTournaments();
    const tournament = tournaments.find(t => t.id === req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Турнир не найден' });
    }
    
    if (tournament.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для редактирования этого турнира' });
    }
    
    res.json(tournament);
  } catch (error) {
    console.error('Error getting tournament for edit:', error);
    res.status(500).json({ error: 'Ошибка получения турнира' });
  }
});

// Получить турнир по ID
app.get('/api/tournaments/:id', (req, res) => {
  const tournaments = readTournaments();
  const tournament = tournaments.find(t => t.id === req.params.id);
  
  if (!tournament) {
    return res.status(404).json({ error: 'Турнир не найден' });
  }
  
  res.json(tournament);
});

// Регистрация на турнир
app.post('/api/tournaments/:id/register', authMiddleware, (req, res) => {
  const tournamentId = req.params.id;
  const userId = req.user.id;

  try {
  const tournaments = readTournaments();
    const tournament = tournaments.find(t => t.id === tournamentId);

    if (!tournament) {
      return res.status(404).json({ error: 'Турнир не найден' });
    }

    if (tournament.status !== 'recruiting') {
      return res.status(400).json({ error: 'Регистрация на этот турнир закрыта' });
    }

    if (tournament.participants.includes(userId)) {
      return res.status(400).json({ error: 'Вы уже зарегистрированы на этот турнир' });
    }

    if (tournament.maxParticipants && tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({ error: 'Мест больше нет' });
    }

    // Добавляем участника
    tournament.participants.push(userId);

    // Проверяем, нужно ли изменить статус на "full"
    if (tournament.maxParticipants && tournament.participants.length >= tournament.maxParticipants) {
      tournament.status = 'full';
    }

    // Сохраняем обновленные данные
  writeTournaments(tournaments);

    // Обновляем HTML страницу турнира
    generateTournamentHtml(tournament);
  
  res.json({
      message: 'Успешная регистрация на турнир',
      participantsCount: tournament.participants.length,
      status: tournament.status
    });

  } catch (error) {
    console.error('Error registering for tournament:', error);
    res.status(500).json({ error: 'Ошибка регистрации на турнир' });
  }
});

// Получить турниры созданные пользователем
app.get('/api/tournaments/user/created', authMiddleware, (req, res) => {
  try {
    const tournaments = readTournaments();
    const userTournaments = tournaments.filter(t => t.createdBy === req.user.id);
    res.json(userTournaments);
  } catch (error) {
    console.error('Error getting user tournaments:', error);
    res.status(500).json({ error: 'Ошибка получения турниров пользователя' });
  }
});

// Получить турниры в которых участвует пользователь
app.get('/api/tournaments/user/participating', authMiddleware, (req, res) => {
  try {
    const tournaments = readTournaments();
    const participatingTournaments = tournaments.filter(t => 
      t.participants.includes(req.user.id)
    );
    res.json(participatingTournaments);
  } catch (error) {
    console.error('Error getting participating tournaments:', error);
    res.status(500).json({ error: 'Ошибка получения турниров участия' });
  }
});

// Обновить турнир
app.put('/api/tournaments/:id', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const tournaments = readTournaments();
    const tournamentIndex = tournaments.findIndex(t => t.id === req.params.id);
    
    if (tournamentIndex === -1) {
      return res.status(404).json({ error: 'Турнир не найден' });
    }
    
    const tournament = tournaments[tournamentIndex];
    
    if (tournament.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для редактирования этого турнира' });
    }
    
    // Обновляем данные турнира
    const { title, description, startDate, endDate, city, maxParticipants, status } = req.body;
    
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ error: 'Необходимо заполнить обязательные поля' });
    }
    
    // Обновляем поля
    tournament.title = title;
    tournament.description = description || '';
    tournament.city = city || '';
    tournament.startDate = startDate;
    tournament.endDate = endDate;
    tournament.maxParticipants = maxParticipants ? parseInt(maxParticipants) : null;
    tournament.status = status || 'recruiting';
    tournament.updatedAt = new Date().toISOString();
    
    // Если загружено новое изображение
    if (req.file) {
      // Удаляем старое изображение если оно есть
      if (tournament.image && fs.existsSync(tournament.image)) {
        fs.unlinkSync(tournament.image);
      }
      // Сохраняем относительный путь вместо абсолютного
      const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);
      tournament.image = relativePath.replace(/\\/g, '/'); // Заменяем обратные слеши на прямые для веб
    }
    
    // Сохраняем обновленные данные
    writeTournaments(tournaments);
    
    // Обновляем HTML страницу турнира
    generateTournamentHtml(tournament);
    
    res.json({ 
      message: 'Турнир успешно обновлен',
      tournament: tournament
    });
    
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ error: 'Ошибка обновления турнира' });
  }
});

// Удалить турнир
app.delete('/api/tournaments/:id', authMiddleware, (req, res) => {
  try {
  const tournaments = readTournaments();
    const tournamentIndex = tournaments.findIndex(t => t.id === req.params.id);
    
    if (tournamentIndex === -1) {
      return res.status(404).json({ error: 'Турнир не найден' });
    }
    
    const tournament = tournaments[tournamentIndex];
    
    if (tournament.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для удаления этого турнира' });
    }
    
    // Удаляем изображение если оно есть
    safeDeleteFile(tournament.image);
    
    // Удаляем HTML файл турнира
    const htmlFilePath = path.join(__dirname, '..', 'tournaments', `${tournament.id}.html`);
    safeDeleteFile(htmlFilePath);
    
    // Удаляем турнир из массива
    tournaments.splice(tournamentIndex, 1);
  writeTournaments(tournaments);
  
    res.json({ message: 'Турнир успешно удален' });
    
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({ error: 'Ошибка удаления турнира' });
  }
});

// Удалить участника из турнира
app.delete('/api/tournaments/:id/participants/:userId', authMiddleware, (req, res) => {
  try {
    const tournaments = readTournaments();
    const tournament = tournaments.find(t => t.id === req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Турнир не найден' });
    }
    
    if (tournament.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для управления этим турниром' });
    }
    
    const userId = req.params.userId;
    const participantIndex = tournament.participants.indexOf(userId);
    
    if (participantIndex === -1) {
      return res.status(404).json({ error: 'Участник не найден в турнире' });
    }
    
    // Удаляем участника
    tournament.participants.splice(participantIndex, 1);
    
    // Если турнир был "full" и участник удален, меняем статус на "recruiting"
    if (tournament.status === 'full' && tournament.maxParticipants && 
        tournament.participants.length < tournament.maxParticipants) {
      tournament.status = 'recruiting';
    }
    
    // Сохраняем обновленные данные
    writeTournaments(tournaments);
    
    // Обновляем HTML страницу турнира
    generateTournamentHtml(tournament);
    
    res.json({ 
      message: 'Участник успешно удален из турнира',
      participantsCount: tournament.participants.length,
      status: tournament.status
    });
    
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Ошибка удаления участника' });
  }
});

// Обновить статус турнира (автоматически по расписанию)
function updateTournamentStatuses() {
  const tournaments = readTournaments();
  const now = new Date();
  let updated = false;

  tournaments.forEach(tournament => {
    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);

    if (tournament.status === 'recruiting' || tournament.status === 'full') {
      if (now >= startDate) {
        tournament.status = 'ongoing';
        updated = true;
      }
    } else if (tournament.status === 'ongoing') {
      if (now >= endDate) {
        tournament.status = 'completed';
        updated = true;
      }
    }
  });

  if (updated) {
    writeTournaments(tournaments);
    
    // Обновляем HTML файлы
    tournaments.forEach(tournament => {
      const fileName = `${tournament.id}.html`;
      const filePath = path.join(__dirname, '..', 'tournaments', fileName);
      if (fs.existsSync(filePath)) {
        const tournamentHtml = generateTournamentHtml(tournament);
        fs.writeFileSync(filePath, tournamentHtml, 'utf8');
      }
    });
  }
}

// Запускаем обновление статусов каждые 5 минут
setInterval(updateTournamentStatuses, 5 * 60 * 1000);

// API для чатов между пользователями

// Получить список чатов пользователя
app.get('/api/chats', authMiddleware, (req, res) => {
  try {
    const chats = readChats();
    const userChats = [];
    const products = readProducts();
    
    // Находим все чаты, где участвует текущий пользователь
    Object.keys(chats).forEach(chatId => {
      const chat = chats[chatId];
      const participants = chatId.split('_');
      
      if (participants.includes(req.user.id)) {
        // Находим собеседника
        const otherUserId = participants.find(id => id !== req.user.id);
        if (otherUserId) {
          // Находим информацию о собеседнике
          const users = readUsers();
          const otherUser = users.find(u => u.id === otherUserId);
          
          if (otherUser) {
            // Находим последнее сообщение с информацией о товаре
            const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
            let productInfo = null;
            
            if (lastMessage && lastMessage.productId) {
              const product = products.find(p => p.id === lastMessage.productId);
              if (product) {
                productInfo = {
                  id: product.id,
                  title: product.title,
                  price: product.price
                };
              }
            }
            
            userChats.push({
              userId: otherUserId,
              userEmail: otherUser.email,
              lastMessage: lastMessage ? lastMessage.text : null,
              lastMessageTime: lastMessage ? lastMessage.timestamp : null,
              productInfo: productInfo
            });
          }
        }
      }
    });
    
    res.json(userChats);
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({ error: 'Ошибка получения чатов' });
  }
});

// Получить сообщения чата с конкретным пользователем
app.get('/api/chats/:userId/messages', authMiddleware, (req, res) => {
  try {
    const chats = readChats();
    const chatId = [req.user.id, req.params.userId].sort().join('_');
    const chat = chats[chatId];
    
    if (!chat) {
      res.json([]);
      return;
    }
    
    res.json(chat.messages || []);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Ошибка получения сообщений' });
  }
});

// Отправить текстовое сообщение
app.post('/api/chats/send', authMiddleware, (req, res) => {
  try {
    const { text, receiverId, productId } = req.body;
    
    if (!text || !receiverId) {
      return res.status(400).json({ error: 'Текст сообщения и получатель обязательны' });
    }
    
    const chats = readChats();
    const chatId = [req.user.id, receiverId].sort().join('_');
    
    if (!chats[chatId]) {
      chats[chatId] = { messages: [] };
    }
    
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: req.user.id,
      receiverId: receiverId,
      text: text,
      timestamp: new Date().toISOString(),
      type: 'text',
      productId: productId // Добавляем ссылку на товар, если есть
    };
    
    chats[chatId].messages.push(message);
    writeChats(chats);
    
    res.json({ success: true, message: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Ошибка отправки сообщения' });
  }
});

// Отправить изображение
app.post('/api/chats/send-image', authMiddleware, chatUpload.single('image'), (req, res) => {
  try {
    const { receiverId } = req.body;
    
    if (!req.file || !receiverId) {
      return res.status(400).json({ error: 'Изображение и получатель обязательны' });
    }
    
    const chats = readChats();
    const chatId = [req.user.id, receiverId].sort().join('_');
    
    if (!chats[chatId]) {
      chats[chatId] = { messages: [] };
    }
    
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: req.user.id,
      receiverId: receiverId,
      image: req.file.path,
      timestamp: new Date().toISOString(),
      type: 'image'
    };
    
    chats[chatId].messages.push(message);
    writeChats(chats);
    
    res.json({ success: true, message: message });
  } catch (error) {
    console.error('Error sending image:', error);
    res.status(500).json({ error: 'Ошибка отправки изображения' });
  }
});

// API для заявок на вступление в команды

// Подать заявку на вступление в команду
app.post('/api/teams/:teamId/apply', authMiddleware, (req, res) => {
  try {
    const { teamId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    
    // Проверяем существование команды
    const teams = readTeams();
    const team = teams.find(t => t.id === teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    
    // Проверяем, не подавал ли пользователь уже заявку
    const applications = readApplications();
    const existingApplication = applications.find(app => 
      app.teamId === teamId && app.userId === userId && app.status === 'pending'
    );
    
    if (existingApplication) {
      return res.status(400).json({ error: 'Вы уже подали заявку в эту команду' });
    }
    
    // Создаем новую заявку
    const application = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      teamId: teamId,
      userId: userId,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      message: message || '',
      status: 'pending', // pending, approved, rejected
      createdAt: new Date().toISOString()
    };
    
    applications.push(application);
    writeApplications(applications);
    
    res.json({ success: true, application });
  } catch (error) {
    console.error('Error applying to team:', error);
    res.status(500).json({ error: 'Ошибка подачи заявки' });
  }
});

// Получить заявки для команды (только для капитана)
app.get('/api/teams/:teamId/applications', authMiddleware, (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;
    
    // Проверяем, является ли пользователь капитаном команды
    const teams = readTeams();
    const team = teams.find(t => t.id === teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    
    if (team.createdBy !== userId) {
      return res.status(403).json({ error: 'Только капитан может просматривать заявки' });
    }
    
    const applications = readApplications();
    const teamApplications = applications.filter(app => app.teamId === teamId);
    
    res.json(teamApplications);
  } catch (error) {
    console.error('Error getting applications:', error);
    res.status(500).json({ error: 'Ошибка получения заявок' });
  }
});

// Принять или отклонить заявку
app.post('/api/applications/:applicationId/:action', authMiddleware, (req, res) => {
  try {
    const { applicationId, action } = req.params;
    const userId = req.user.id;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Неверное действие' });
    }
    
    const applications = readApplications();
    const application = applications.find(app => app.id === applicationId);
    
    if (!application) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }
    
    // Проверяем, является ли пользователь капитаном команды
    const teams = readTeams();
    const team = teams.find(t => t.id === application.teamId);
    
    if (!team || team.createdBy !== userId) {
      return res.status(403).json({ error: 'Только капитан может обрабатывать заявки' });
    }
    
    // Обновляем статус заявки
    application.status = action === 'approve' ? 'approved' : 'rejected';
    application.processedAt = new Date().toISOString();
    application.processedBy = userId;
    
    writeApplications(applications);
    
    // Если заявка одобрена, добавляем пользователя в команду
    if (action === 'approve') {
      if (!team.members) team.members = [];
      if (!team.members.includes(application.userId)) {
        team.members.push(application.userId);
        writeTeams(teams);
      }
    }
    
    res.json({ success: true, application });
  } catch (error) {
    console.error('Error processing application:', error);
    res.status(500).json({ error: 'Ошибка обработки заявки' });
  }
});

// Получить заявки пользователя
app.get('/api/applications/my', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const applications = readApplications();
    const userApplications = applications.filter(app => app.userId === userId);
    
    res.json(userApplications);
  } catch (error) {
    console.error('Error getting user applications:', error);
    res.status(500).json({ error: 'Ошибка получения заявок' });
  }
});

// Отменить заявку пользователем
app.delete('/api/applications/:applicationId', authMiddleware, (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;
    
    const applications = readApplications();
    const application = applications.find(app => app.id === applicationId);
    
    if (!application) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }
    
    // Проверяем, что пользователь отменяет свою заявку
    if (application.userId !== userId) {
      return res.status(403).json({ error: 'Можно отменить только свою заявку' });
    }
    
    // Проверяем, что заявка еще не обработана
    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Нельзя отменить уже обработанную заявку' });
    }
    
    // Удаляем заявку
    const updatedApplications = applications.filter(app => app.id !== applicationId);
    writeApplications(updatedApplications);
    
    res.json({ success: true, message: 'Заявка успешно отменена' });
  } catch (error) {
    console.error('Error canceling application:', error);
    res.status(500).json({ error: 'Ошибка отмены заявки' });
  }
});

// Пересоздать HTML файлы всех команд (для обновления шаблона)
app.post('/api/teams/regenerate-html', authMiddleware, (req, res) => {
  try {
    const teams = readTeams();
    
    teams.forEach(team => {
      const fileName = `${team.name.replace(/\s+/g, '_')}-team.html`;
      const filePath = path.join(__dirname, '..', fileName);
      const html = teamHtmlTemplate(team);
      fs.writeFileSync(filePath, html, 'utf8');
      console.log('Team HTML regenerated:', filePath);
    });
    
    res.json({ success: true, message: `Пересоздано ${teams.length} файлов команд` });
  } catch (error) {
    console.error('Error regenerating team HTML:', error);
    res.status(500).json({ error: 'Ошибка пересоздания файлов команд' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  updateTournamentStatuses(); // Обновляем статусы при запуске
});

// Экспортируем функции для использования в других файлах
module.exports = { generateProductHtml, generateTournamentHtml, teamHtmlTemplate };