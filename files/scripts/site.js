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
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = regForm.email.value.trim();
      const password = regForm.password.value;
      const firstName = regForm.firstName.value.trim();
      const lastName = regForm.lastName.value.trim();
      const res = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName })
      });
      const data = await res.json();
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
    });
  }

  // --- Вход ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
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

        window.location.href = 'cabinet.html';
      } else {
        alert(data.message || 'Ошибка входа');
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
      alert('Форма создания команды появится здесь!');
      // Здесь будет переход или открытие формы создания команды
    };
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
function renderMobileAuthButtons() {
  console.log('renderMobileAuthButtons called');
  if (window.innerWidth > 768) return; // Только для мобильных
  const mobileNav = document.querySelector('.mobile-nav ul');
  if (!mobileNav) return;
  // Полностью пересоздаём ul: только основные ссылки без 'Найти команду'
  mobileNav.innerHTML = `
    <li><a href="index.html">Главная</a></li>
    <li><a href="student-page.html">Команды</a></li>
    <li><a href="tournaments-page.html">Турниры</a></li>
    <li><a href="marketplace.html">Маркетплейс</a></li>
  `;
  // Затем добавляем кнопки авторизации
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
}

document.addEventListener('DOMContentLoaded', () => {
  renderAuthButtons();
  renderMobileAuthButtons();
  window.addEventListener('resize', () => {
    renderAuthButtons();
    renderMobileAuthButtons();
  });
  // Обновлять кнопки при каждом открытии мобильного меню
  const burger = document.querySelector('.mobile-menu-btn');
  if (burger) {
    burger.addEventListener('click', () => {
      renderMobileAuthButtons();
    });
  }
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
