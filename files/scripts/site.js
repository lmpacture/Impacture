document.addEventListener('DOMContentLoaded', () => {
  const store = JSON.parse(localStorage.getItem('siteContent') || '{}');

  // Главная страница
  const titleEl = document.getElementById('main-title');
  if (titleEl && store.mainTitle) titleEl.textContent = store.mainTitle;
  const subtitleEl = document.getElementById('main-subtitle');
  if (subtitleEl && store.mainSubtitle) subtitleEl.textContent = store.mainSubtitle;

  // Карточки главной страницы
  const cardsContainer = document.getElementById('cards-container');
  // If no stored cards and there are cards in DOM, import them
  if ((!store.cards || store.cards.length === 0) && cardsContainer) {
    const domCards = cardsContainer.querySelectorAll('.card');
    store.cards = Array.from(domCards).map((c) => ({
      title: c.querySelector('.card-title')?.textContent.trim() || '',
      text: c.querySelector('.card-text')?.textContent.trim() || '',
      img: c.querySelector('img')?.getAttribute('src') || '',
    }));
    localStorage.setItem('siteContent', JSON.stringify(store));
  }
  if (cardsContainer && Array.isArray(store.cards)) {
    cardsContainer.innerHTML = '';
    store.cards.forEach((card) => {
      const col = document.createElement('div');
      col.className = 'col-lg-4 col-md-6 mt-4';
      col.innerHTML = `
        <div class="card" style="width: 18rem">
          <img src="${card.img || ''}" class="card-img-top" alt="" />
          <div class="card-body">
            <h5 class="card-title">${card.title || ''}</h5>
            <p class="card-text">${card.text || ''}</p>
          </div>
        </div>`;
      cardsContainer.appendChild(col);
    });
  }

  // Карточки страницы студентов
  let studentCardsContainer = document.getElementById('student-cards');
  if (!studentCardsContainer) {
    // fallback: первая .row внутри section
    const section = document.querySelector('section');
    if (section) studentCardsContainer = section.querySelector('.row');
  }
  // import student cards if empty
  if ((!store.studentCards || store.studentCards.length === 0) && studentCardsContainer) {
    const domCards = studentCardsContainer.querySelectorAll('.card');
    store.studentCards = Array.from(domCards).map((c) => ({
      title: c.querySelector('.card-title')?.textContent.trim() || '',
      text: c.querySelector('.card-text')?.textContent.trim() || '',
      img: c.querySelector('img')?.getAttribute('src') || '',
    }));
    localStorage.setItem('siteContent', JSON.stringify(store));
  }
  if (studentCardsContainer && Array.isArray(store.studentCards)) {
    studentCardsContainer.innerHTML = '';
    store.studentCards.forEach((card) => {
      const col = document.createElement('div');
      col.className = 'col-lg-4 col-md-6 mt-4';
      col.innerHTML = `
        <div class="card" style="width: 18rem">
          <img src="${card.img || ''}" class="card-img-top" alt="" />
          <div class="card-body">
            <h5 class="card-title">${card.title || ''}</h5>
            <p class="card-text">${card.text || ''}</p>
          </div>
        </div>`;
      studentCardsContainer.appendChild(col);
    });
  }
});

// --- Регистрация ---
document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('register-form');
  if (regForm && !window.location.pathname.includes('register.html')) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Registration form submitted');
      
      const email = regForm.email.value.trim();
      const password = regForm.password.value;
      const firstName = regForm.firstName.value.trim();
      const lastName = regForm.lastName.value.trim();
      
      console.log('Registration data:', { email, firstName, lastName, password: '***' });
      
      if (!email || !password || !firstName || !lastName) {
        alert('Пожалуйста, заполните все поля');
        return;
      }
      
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName })
        });
        
        console.log('Registration response status:', res.status);
        
        const data = await res.json();
        console.log('Registration response data:', data);
        
        if (res.ok) {
          // Отслеживание регистрации в Google Analytics
          if (typeof gtag !== 'undefined') {
            gtag('event', 'sign_up', {
              method: 'email'
            });
          }
          alert('Регистрация успешна! Теперь войдите.');
          window.location.href = 'login.html';
        } else {
          alert(data.message || 'Ошибка регистрации');
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Ошибка сети. Попробуйте еще раз.');
      }
    });
  }

  // --- Вход ---
  const loginForm = document.getElementById('login-form');
  if (loginForm && !window.location.pathname.includes('login.html')) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Login form submitted');
      
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;
      
      console.log('Login data:', { email, password: '***' });
      
      if (!email || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
      }
      
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        console.log('Login response status:', res.status);
        
        const data = await res.json();
        console.log('Login response data:', data);
        
        if (res.ok) {
          // Отслеживание входа в Google Analytics
          if (typeof gtag !== 'undefined') {
            gtag('event', 'login', {
              method: 'email'
            });
          }
          localStorage.setItem('token', data.token);
          localStorage.setItem('firstName', data.firstName);
          localStorage.setItem('lastName', data.lastName);

          console.log('Login successful, redirecting to cabinet');
          window.location.href = 'cabinet.html';
        } else {
          alert(data.message || 'Ошибка входа');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Ошибка сети. Попробуйте еще раз.');
      }
    });
  }
});

// --- Личный кабинет ---
if (window.location.pathname.endsWith('cabinet.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    const userInfo = document.getElementById('user-info');
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
    if (firstName && lastName) {
      userInfo.textContent = `Здравствуйте, ${firstName} ${lastName}!`;
    } else {
      userInfo.textContent = 'Не удалось загрузить данные пользователя.';
    }

    document.getElementById('logout-btn').onclick = () => {
      localStorage.clear();
      window.location.href = 'login.html';
    };

    document.getElementById('create-team-btn').onclick = () => {
      // Открываем модальное окно создания команды
      const teamModal = document.getElementById('team-modal');
      if (teamModal) {
        teamModal.classList.add('show');
        // Очищаем форму
        const teamForm = document.getElementById('team-form');
        if (teamForm) {
          teamForm.reset();
        }
        // Очищаем информацию о файлах
        const logoFileInfo = document.getElementById('team-logo-file-info');
        const photoFileInfo = document.getElementById('team-photo-file-info');
        if (logoFileInfo) logoFileInfo.style.display = 'none';
        if (photoFileInfo) photoFileInfo.style.display = 'none';
      }
    };

    // Обработчики для закрытия модального окна команды
    const closeTeamModalBtn = document.getElementById('close-team-modal');
    const cancelTeamBtn = document.getElementById('cancel-team');
    
    if (closeTeamModalBtn) {
      closeTeamModalBtn.onclick = () => {
        const teamModal = document.getElementById('team-modal');
        if (teamModal) {
          teamModal.classList.remove('show');
        }
      };
    }
    
    if (cancelTeamBtn) {
      cancelTeamBtn.onclick = () => {
        const teamModal = document.getElementById('team-modal');
        if (teamModal) {
          teamModal.classList.remove('show');
        }
      };
    }

    // Закрытие по клику вне модального окна
    document.addEventListener('click', function(e) {
      const teamModal = document.getElementById('team-modal');
      if (e.target === teamModal) {
        teamModal.classList.remove('show');
      }
    });

    // Закрытие по клавише Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const teamModal = document.getElementById('team-modal');
        if (teamModal && teamModal.classList.contains('show')) {
          teamModal.classList.remove('show');
        }
      }
    });

    // Обработчик для кнопки "Создать команду" в модальном окне
    const submitTeamBtn = document.getElementById('submit-team');
    if (submitTeamBtn) {
      submitTeamBtn.onclick = async () => {
        try {
          const name = document.getElementById('team-name').value.trim();
          const city = document.getElementById('team-city').value.trim();
          const description = document.getElementById('team-description').value.trim();
          const status = document.getElementById('team-status').value;
          const maxMembers = parseInt(document.getElementById('team-max-members').value) || 6;
          const currentMembers = parseInt(document.getElementById('team-current-members').value) || 1;
          const achievements = document.getElementById('team-achievements').value.trim();

          if (!name) {
            alert('Пожалуйста, введите название команды');
            return;
          }
          
          const token = localStorage.getItem('token');
          const formData = new FormData();
          
          formData.append('name', name);
          formData.append('city', city);
          formData.append('description', description);
          formData.append('status', status);
          formData.append('maxMembers', maxMembers);
          formData.append('currentMembers', currentMembers);
          
          // Обрабатываем достижения
          const achievementsArray = achievements.split('\n').filter(achievement => achievement.trim());
          formData.append('achievements', JSON.stringify(achievementsArray));

          // Добавляем файлы
          const logoFile = document.getElementById('team-logo').files[0];
          const photoFile = document.getElementById('team-photo').files[0];
          
          if (logoFile) {
            formData.append('logo', logoFile);
          }
          if (photoFile) {
            formData.append('photo', photoFile);
          }

          const response = await fetch('http://localhost:3000/api/teams', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            alert('✅ Команда успешно создана!');
            // Закрываем модальное окно
            const teamModal = document.getElementById('team-modal');
            if (teamModal) {
              teamModal.classList.remove('show');
            }
          } else {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка создания команды');
          }
        } catch (error) {
          console.error('Error creating team:', error);
          alert(error.message || 'Ошибка создания команды');
        }
      };
    }
  });
}

// --- Динамический navbar ---
// function renderNavbar() {
//   const navbar = document.createElement('nav');
//   navbar.className = 'main-navbar';
//   navbar.innerHTML = `
//     <div class="nav-content">
//       <a href="index.html" class="nav-logo">Главная</a>
//       <div class="nav-links" id="nav-links"></div>
//     </div>
//   `;
//   document.body.prepend(navbar);

//   const navLinks = navbar.querySelector('#nav-links');
//   const token = localStorage.getItem('token');
//   if (token) {
//     navLinks.innerHTML = `
//       <a href="cabinet.html">Личный кабинет</a>
//       <button id="nav-logout-btn" class="nav-btn">Выйти</button>
//     `;
//     navbar.querySelector('#nav-logout-btn').onclick = () => {
//       localStorage.clear();
//       window.location.href = 'login.html';
//     };
//   } else {
//     navLinks.innerHTML = `
//       <a href="login.html">Вход</a>
//       <a href="register.html">Регистрация</a>
//     `;
//   }
// }

// --- Динамические кнопки в index.html ---
function renderAuthButtons() {
  const authDiv = document.getElementById('auth-buttons');
  if (!authDiv) return;
  if (window.innerWidth <= 768) {
    authDiv.innerHTML = '';
    return;
  }
  const token = localStorage.getItem('token');
  if (token) {
    authDiv.innerHTML = `
      <a href="cabinet.html" class="text-[#4078c0] text-sm font-medium leading-normal">Личный кабинет</a>
      <button id="header-logout-btn" class="nav-btn">Выйти</button>
    `;
    document.getElementById('header-logout-btn').onclick = () => {
      localStorage.clear();
      window.location.href = 'login.html';
    };
  } else {
    authDiv.innerHTML = `
      <a href="login.html" class="text-[#4078c0] text-sm font-medium leading-normal">Вход</a>
      <a href="register.html" class="text-[#4078c0] text-sm font-medium leading-normal">Регистрация</a>
    `;
  }
}

// --- Динамические кнопки в мобильном меню ---
let renderMobileAuthButtonsCalled = false;
let renderMobileAuthButtonsTimeout = null;

function renderMobileAuthButtons() {
  // Защита от множественных вызовов
  if (renderMobileAuthButtonsCalled) {
    console.log('renderMobileAuthButtons already called, skipping...');
    return;
  }
  
  console.log('renderMobileAuthButtons called');
  renderMobileAuthButtonsCalled = true;
  
  // Очищаем предыдущий таймаут
  if (renderMobileAuthButtonsTimeout) {
    clearTimeout(renderMobileAuthButtonsTimeout);
  }
  
  const mobileNav = document.querySelector('.mobile-nav ul');
  if (!mobileNav) {
    renderMobileAuthButtonsCalled = false;
    return;
  }
  
  // Очищаем только кнопки авторизации, оставляя основные ссылки
  const authButtons = mobileNav.querySelectorAll('.mobile-auth');
  authButtons.forEach(btn => btn.remove());
  
  // Добавляем кнопки авторизации
  const token = localStorage.getItem('token');
  if (token) {
    const liCabinet = document.createElement('li');
    liCabinet.className = 'mobile-auth';
    liCabinet.innerHTML = '<a href="cabinet.html">Личный кабинет</a>';
    const liLogout = document.createElement('li');
    liLogout.className = 'mobile-auth';
    const btn = document.createElement('button');
    btn.textContent = 'Выйти';
    btn.className = 'button';
    btn.onclick = () => {
      localStorage.clear();
      window.location.href = 'login.html';
    };
    liLogout.appendChild(btn);
    mobileNav.appendChild(liCabinet);
    mobileNav.appendChild(liLogout);
  } else {
    const liLogin = document.createElement('li');
    liLogin.className = 'mobile-auth';
    liLogin.innerHTML = '<a href="login.html">Вход</a>';
    const liReg = document.createElement('li');
    liReg.className = 'mobile-auth';
    liReg.innerHTML = '<a href="register.html">Регистрация</a>';
    mobileNav.appendChild(liLogin);
    mobileNav.appendChild(liReg);
  }
  
  // Сбрасываем флаг через задержку
  renderMobileAuthButtonsTimeout = setTimeout(() => {
    renderMobileAuthButtonsCalled = false;
  }, 200);
}

// Флаг для отслеживания инициализации
let siteInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
  if (siteInitialized) {
    console.log('Site already initialized, skipping...');
    return;
  }
  
  console.log('Initializing site...');
  siteInitialized = true;
  
  renderAuthButtons();
  renderMobileAuthButtons();
  
  // Обновлять кнопки при изменении размера окна
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      renderAuthButtons();
      renderMobileAuthButtons();
    }, 100);
  });
});

// Сброс пароля: отправка запроса на e-mail
async function requestPasswordReset(email) {
  const res = await fetch('http://localhost:3000/api/request-password-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  return data.message;
}
