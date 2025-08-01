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

  // Инициализируем статические данные
  initializeStaticData();

  // Обработчики кнопок
  setupButtonHandlers();

  // Обработчик кнопки "Выйти"
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }
});

// Настройка обработчиков кнопок
function setupButtonHandlers() {
  // Турниры
  const createTournamentBtn = document.getElementById('create-tournament-btn');
  if (createTournamentBtn) {
    createTournamentBtn.addEventListener('click', () => {
      alert('Форма создания турнира появится здесь!');
    });
  }

  const myTournamentsBtn = document.getElementById('my-tournaments-btn');
  if (myTournamentsBtn) {
    myTournamentsBtn.addEventListener('click', loadMyTournaments);
  }

  // Товары
  const createProductBtn = document.getElementById('create-product-btn');
  if (createProductBtn) {
    createProductBtn.addEventListener('click', () => {
      alert('Форма добавления товара появится здесь!');
    });
  }

  const myProductsBtn = document.getElementById('my-products-btn');
  if (myProductsBtn) {
    myProductsBtn.addEventListener('click', loadMyProducts);
  }

  // Команды
  const createTeamBtn = document.getElementById('create-team-btn');
  if (createTeamBtn) {
    createTeamBtn.addEventListener('click', () => {
      alert('Форма создания команды появится здесь!');
    });
  }

  const myTeamsBtn = document.getElementById('my-teams-btn');
  if (myTeamsBtn) {
    myTeamsBtn.addEventListener('click', loadMyTeams);
  }
}

// Загрузка информации о пользователе
async function loadUserInfo() {
  try {
    const firstName = localStorage.getItem('firstName') || 'Пользователь';
    const lastName = localStorage.getItem('lastName') || '';
    const email = localStorage.getItem('email') || '';
    
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
      if (firstName && lastName) {
        userInfo.textContent = `Здравствуйте, ${firstName} ${lastName}!`;
      } else if (email) {
        userInfo.textContent = `Здравствуйте, ${email}!`;
      } else {
        userInfo.textContent = 'Здравствуйте!';
      }
    }
  } catch (error) {
    console.error('Error loading user info:', error);
  }
}

// Инициализация статических данных
function initializeStaticData() {
  // Пустые массивы
  allTournaments = [];
  allProducts = [];
  allTeams = [];
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
  // Создаем модальное окно для отображения турниров
  const modal = document.createElement('div');
  modal.className = 'modern-modal show';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h5>Мои турниры</h5>
        <button class="modal-close" onclick="this.closest('.modern-modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div id="my-tournaments-container">
          ${tournaments.length === 0 ? '<p>У вас пока нет созданных турниров</p>' : 
            tournaments.map(tournament => `
              <div class="tournament-item" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #333;">${tournament.title}</h4>
                <p style="margin: 0 0 10px 0; color: #666;">${tournament.description}</p>
                <p style="margin: 0 0 5px 0; color: #888;">Статус: ${tournament.status}</p>
                <p style="margin: 0; color: #888;">Город: ${tournament.city}</p>
              </div>
            `).join('')}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
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
  // Создаем модальное окно для отображения товаров
  const modal = document.createElement('div');
  modal.className = 'modern-modal show';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h5>Мои товары</h5>
        <button class="modal-close" onclick="this.closest('.modern-modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div id="my-products-container">
          ${products.length === 0 ? '<p>У вас пока нет созданных товаров</p>' : 
            products.map(product => `
              <div class="product-item" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #333;">${product.title}</h4>
                <p style="margin: 0 0 10px 0; color: #666;">${product.description}</p>
                <p style="margin: 0 0 5px 0; color: #888;">Цена: ${product.price}₸</p>
                <p style="margin: 0; color: #888;">Город: ${product.city}</p>
              </div>
            `).join('')}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
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
  // Создаем модальное окно для отображения команд
  const modal = document.createElement('div');
  modal.className = 'modern-modal show';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h5>Мои команды</h5>
        <button class="modal-close" onclick="this.closest('.modern-modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div id="my-teams-container">
          ${teams.length === 0 ? '<p>У вас пока нет созданных команд</p>' : 
            teams.map(team => `
              <div class="team-item" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #333;">${team.name}</h4>
                <p style="margin: 0 0 10px 0; color: #666;">${team.description}</p>
                <p style="margin: 0 0 5px 0; color: #888;">Участники: ${team.members.join(', ')}</p>
                <p style="margin: 0; color: #888;">Город: ${team.city}</p>
              </div>
            `).join('')}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
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

