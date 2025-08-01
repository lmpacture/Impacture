// Cabinet.js - Личный кабинет (упрощенная версия)

// Глобальные переменные
let allTeams = [];
let allProducts = [];
let allTournaments = [];

document.addEventListener('DOMContentLoaded', function() {
  // Проверяем авторизацию
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Загружаем информацию о пользователе
  loadUserInfo();

  // Обработчик кнопки "Выйти"
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }

  // Инициализируем статические данные
  initializeStaticData();
});

// Загрузка информации о пользователе
async function loadUserInfo() {
  try {
    const firstName = localStorage.getItem('firstName') || 'Демо';
    const lastName = localStorage.getItem('lastName') || 'Пользователь';
    
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
      userInfo.textContent = `Здравствуйте, ${firstName} ${lastName}!`;
    }
  } catch (error) {
    console.error('Error loading user info:', error);
  }
}

// Инициализация статических данных
function initializeStaticData() {
  // Статические турниры
  allTournaments = [
    {
      id: 'tournament_1',
      title: 'Инженерный хакатон 2024',
      description: 'Создайте инновационные решения для реальных проблем',
      status: 'recruiting',
      startDate: '2024-12-15',
      endDate: '2024-12-17',
      city: 'Алматы',
      maxParticipants: 50,
      participants: [],
      createdBy: 'demo-user-1'
    },
    {
      id: 'tournament_2',
      title: 'Робототехнический турнир',
      description: 'Соревнования по программированию роботов',
      status: 'ongoing',
      startDate: '2024-12-10',
      endDate: '2024-12-12',
      city: 'Астана',
      maxParticipants: 30,
      participants: [1, 2, 3, 4, 5],
      createdBy: 'demo-user-1'
    }
  ];

  // Статические товары
  allProducts = [
    {
      id: 'product_1',
      title: 'Arduino Uno R3',
      description: 'Микроконтроллер для проектов робототехники',
      price: 15000,
      condition: 'new',
      category: 'electronics',
      city: 'Алматы',
      images: ['files/images/impacture.png'],
      createdBy: 'demo-user-1'
    },
    {
      id: 'product_2',
      title: 'Raspberry Pi 4 Model B',
      description: 'Одноплатный компьютер для разработки',
      price: 45000,
      condition: 'used',
      category: 'electronics',
      city: 'Астана',
      images: ['files/images/impacture.png'],
      createdBy: 'demo-user-1'
    }
  ];

  // Статические команды
  allTeams = [
    {
      id: 'team_1',
      name: 'FoxGang',
      description: 'Команда разработчиков игр и приложений',
      members: ['Алексей', 'Мария', 'Дмитрий'],
      maxMembers: 5,
      city: 'Алматы',
      image: 'files/images/impacture.png',
      status: 'recruiting',
      createdBy: 'demo-user-1'
    },
    {
      id: 'team_2',
      name: 'SlapSeals',
      description: 'Команда робототехников и инженеров',
      members: ['Елена', 'Артем', 'София'],
      maxMembers: 4,
      city: 'Астана',
      image: 'files/images/impacture.png',
      status: 'full',
      createdBy: 'demo-user-1'
    }
  ];
}

// Функции для турниров
async function loadMyTournaments() {
  try {
    const myTournaments = allTournaments.filter(t => t.createdBy === 'demo-user-1');
    displayMyTournaments(myTournaments);
  } catch (error) {
    console.error('Error loading my tournaments:', error);
  }
}

function displayMyTournaments(tournaments) {
  const container = document.getElementById('my-tournaments-container');
  if (!container) return;

  if (tournaments.length === 0) {
    container.innerHTML = '<p>У вас пока нет созданных турниров</p>';
    return;
  }

  container.innerHTML = tournaments.map(tournament => `
    <div class="tournament-item">
      <h4>${tournament.title}</h4>
      <p>${tournament.description}</p>
      <p>Статус: ${tournament.status}</p>
      <p>Город: ${tournament.city}</p>
    </div>
  `).join('');
}

// Функции для товаров
async function loadMyProducts() {
  try {
    const myProducts = allProducts.filter(p => p.createdBy === 'demo-user-1');
    displayMyProducts(myProducts);
  } catch (error) {
    console.error('Error loading my products:', error);
  }
}

function displayMyProducts(products) {
  const container = document.getElementById('my-products-container');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = '<p>У вас пока нет созданных товаров</p>';
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="product-item">
      <h4>${product.title}</h4>
      <p>${product.description}</p>
      <p>Цена: ${product.price}₸</p>
      <p>Город: ${product.city}</p>
    </div>
  `).join('');
}

// Функции для команд
async function loadMyTeams() {
  try {
    const myTeams = allTeams.filter(t => t.createdBy === 'demo-user-1');
    displayMyTeams(myTeams);
  } catch (error) {
    console.error('Error loading my teams:', error);
  }
}

function displayMyTeams(teams) {
  const container = document.getElementById('my-teams-container');
  if (!container) return;

  if (teams.length === 0) {
    container.innerHTML = '<p>У вас пока нет созданных команд</p>';
    return;
  }

  container.innerHTML = teams.map(team => `
    <div class="team-item">
      <h4>${team.name}</h4>
      <p>${team.description}</p>
      <p>Участники: ${team.members.join(', ')}</p>
      <p>Город: ${team.city}</p>
    </div>
  `).join('');
}

// Универсальные функции
function showMessage(message) {
  alert(message);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Экспортируем функции для использования в HTML
window.loadMyTournaments = loadMyTournaments;
window.loadMyProducts = loadMyProducts;
window.loadMyTeams = loadMyTeams;
window.openModal = openModal;
window.closeModal = closeModal;
window.showMessage = showMessage;

