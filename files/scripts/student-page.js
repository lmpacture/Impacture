// Функции для страницы инженерных команд
let allTeams = [];
let currentPage = 1;
const teamsPerPage = 8; // Количество команд на странице

document.addEventListener('DOMContentLoaded', function() {
    // Функция для мобильного меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
        });

        // Закрыть меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
                mobileNav.classList.remove('active');
            }
        });
    }

    // Загружаем команды из API
    loadTeams();
    
    // Настройка обработчиков пагинации
    setupPaginationHandlers();
});

// Загрузка команд
async function loadTeams() {
  const container = document.getElementById('teams-container');
  
  // Проверяем, что контейнер найден
  if (!container) {
    console.error('Контейнер teams-container не найден');
    return;
  }
  
  try {
    // Статические данные команд
    const teams = [
      {
        id: 'team_1',
        name: 'FoxGang',
        description: 'Команда разработчиков игр и приложений',
        members: ['Алексей', 'Мария', 'Дмитрий'],
        maxMembers: 5,
        city: 'Алматы',
        image: 'files/images/impacture.png',
        status: 'recruiting'
      },
      {
        id: 'team_2',
        name: 'SlapSeals',
        description: 'Команда робототехников и инженеров',
        members: ['Елена', 'Артем', 'София'],
        maxMembers: 4,
        city: 'Астана',
        image: 'files/images/impacture.png',
        status: 'full'
      },
      {
        id: 'team_3',
        name: 'Fantast_6',
        description: 'Команда AI и машинного обучения',
        members: ['Иван', 'Анна', 'Павел', 'Ольга'],
        maxMembers: 6,
        city: 'Алматы',
        image: 'files/images/impacture.png',
        status: 'recruiting'
      },
      {
        id: 'team_4',
        name: 'Fizmat Tech',
        description: 'Команда физиков и математиков',
        members: ['Сергей', 'Наталья'],
        maxMembers: 5,
        city: 'Астана',
        image: 'files/images/impacture.png',
        status: 'recruiting'
      }
    ];
    
    if (teams.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <div class="mb-4">
            <i class="bi bi-people" style="font-size: 3rem; color: #6b7280;"></i>
          </div>
          <h3 class="text-gray-600 mb-2">Команд пока нет</h3>
          <p class="text-gray-500">Будьте первым, кто создаст команду!</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = teams.map(team => createTeamCard(team)).join('');
    
    // Добавляем обработчики для кнопок
    teams.forEach(team => {
      const joinBtn = document.getElementById(`join-${team.id}`);
      if (joinBtn) {
        joinBtn.addEventListener('click', () => joinTeam(team.id));
      }
    });
    
  } catch (error) {
    console.error('Error loading teams:', error);
    if (container) {
      container.innerHTML = `
        <div class="text-center py-5">
          <div class="mb-4">
            <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: #ef4444;"></i>
          </div>
          <h3 class="text-gray-600 mb-2">Ошибка загрузки команд</h3>
          <p class="text-gray-500">Попробуйте обновить страницу</p>
        </div>
      `;
    }
  }
}

// Создание карточки команды
function createTeamCard(team) {
  const statusText = {
    'recruiting': 'Набор участников',
    'full': 'Команда собрана',
    'active': 'Активна'
  };
  
  const membersCount = team.members ? team.members.length : 0;
  const isFull = team.maxMembers && membersCount >= team.maxMembers;
  
  return `
    <div class="team-card">
      <div class="row">
        <div class="col-md-4">
          <img src="${team.image || 'files/images/impacture.png'}" 
               alt="${team.name}" 
               class="team-image">
        </div>
        <div class="col-md-8">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h3 class="mb-0">${team.name}</h3>
            <span class="status-badge status-${team.status}">${statusText[team.status]}</span>
          </div>
          
          <p class="text-muted mb-3">${team.description || 'Описание команды будет добавлено позже.'}</p>
          
          <div class="row mb-3">
            <div class="col-sm-6">
              <small class="text-muted">
                <i class="bi bi-geo-alt me-1"></i>
                ${team.city || 'Город не указан'}
              </small>
            </div>
            <div class="col-sm-6">
              <small class="text-muted">
                <i class="bi bi-people me-1"></i>
                ${membersCount} / ${team.maxMembers || '∞'} участников
              </small>
            </div>
          </div>
          
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted">
              <small>Участники: ${team.members ? team.members.join(', ') : 'Нет участников'}</small>
            </div>
            
            <div class="d-flex gap-2">
              <a href="teams/${team.name.replace(/\s+/g, '_')}-team.html" class="btn btn-outline-primary btn-sm">
                Подробнее
              </a>
              
              ${team.status === 'recruiting' && !isFull ? 
                `<button id="join-${team.id}" class="btn btn-primary btn-sm">
                  Присоединиться
                </button>` : 
                team.status === 'recruiting' && isFull ?
                `<span class="btn btn-secondary btn-sm disabled">Мест нет</span>` :
                `<span class="btn btn-secondary btn-sm disabled">Команда собрана</span>`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Присоединение к команде
async function joinTeam(teamId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Для присоединения к команде необходимо войти в аккаунт');
    window.location.href = 'login.html';
    return;
  }

  try {
    // Показываем сообщение об успешном присоединении
    alert('Успешное присоединение к команде!');
    loadTeams(); // Перезагружаем список
  } catch (error) {
    console.error('Error joining team:', error);
    alert('Ошибка присоединения к команде');
  }
}

// Отображение команд для конкретной страницы
function displayTeamsForPage(page) {
    console.log('Отображаем страницу:', page);
    let teamsContainer = document.querySelector('.grid.grid-cols-4');
    
    // Альтернативный селектор если первый не работает
    if (!teamsContainer) {
        teamsContainer = document.querySelector('.grid-cols-4');
    }
    
    if (!teamsContainer) {
        console.error('Контейнер команд не найден');
        return;
    }
    
    console.log('Контейнер команд найден:', teamsContainer);

    if (!allTeams || allTeams.length === 0) {
        teamsContainer.innerHTML = '<p class="text-center text-muted col-span-full">Команды не найдены</p>';
        return;
    }

    // Вычисляем индексы для текущей страницы
    const startIndex = (page - 1) * teamsPerPage;
    const endIndex = startIndex + teamsPerPage;
    const teamsForPage = allTeams.slice(startIndex, endIndex);

    teamsContainer.innerHTML = teamsForPage.map(team => `
        <a href="${team.name.replace(/\s+/g, '_')}-team.html" class="flex flex-col gap-2 pb-2">
            <div class="relative">
                <div
                    class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
                    style="
                        background-image: url('${team.logo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzY2N2VlYSIvPjx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRlYW08L3RleHQ+PC9zdmc+'}');
                        "
                ></div>
                <div class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white" 
                     style="background-color: ${getTeamStatusColor(team.status)};">
                    ${getTeamStatusText(team.status)}
                </div>
            </div>
            <div>
                <p class="text-[#141414] text-sm font-medium leading-normal">
                    ${team.name}
                </p>
                <p class="text-[#757575] text-xs font-normal leading-normal">
                    ${team.city || 'Город не указан'}, Казахстан
                </p>
                <p class="text-[#757575] text-xs font-normal leading-normal">
                    ${team.currentMembers || 0}/${team.maxMembers || '∞'} участников
                </p>
            </div>
        </a>
    `).join('');
    
    currentPage = page;
}

// Настройка обработчиков пагинации
function setupPaginationHandlers() {
    const paginationContainer = document.querySelector('.flex.items-center.justify-center.p-4.mt-8 .flex.items-center.gap-2');
    
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.textContent.match(/^\d+$/)) {
                e.preventDefault();
                const page = parseInt(e.target.textContent);
                if (page >= 1 && page <= Math.ceil(allTeams.length / teamsPerPage)) {
                    displayTeamsForPage(page);
                    updatePagination();
                }
            }
        });
    }
    
    // Альтернативный селектор для пагинации
    if (!paginationContainer) {
        const alternativePagination = document.querySelector('.flex.items-center.gap-2');
        if (alternativePagination) {
            alternativePagination.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' && e.target.textContent.match(/^\d+$/)) {
                    e.preventDefault();
                    const page = parseInt(e.target.textContent);
                    if (page >= 1 && page <= Math.ceil(allTeams.length / teamsPerPage)) {
                        displayTeamsForPage(page);
                        updatePagination();
                    }
                }
            });
        }
    }
}

// Обновление пагинации
function updatePagination() {
    const totalPages = Math.ceil(allTeams.length / teamsPerPage);
    console.log('Всего страниц:', totalPages, 'Команд на страницу:', teamsPerPage);
    
    let paginationContainer = document.querySelector('.flex.items-center.justify-center.p-4.mt-8 .flex.items-center.gap-2');
    
    // Альтернативный селектор для пагинации
    if (!paginationContainer) {
        paginationContainer = document.querySelector('.flex.items-center.gap-2');
    }
    
    if (!paginationContainer) {
        console.error('Контейнер пагинации не найден');
        return;
    }
    
    console.log('Контейнер пагинации найден:', paginationContainer);
    
    // Очищаем контейнер
    paginationContainer.innerHTML = '';
    
    // Создаем кнопки пагинации
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.className = `text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#141414] rounded-full hover:bg-gray-100 ${
            i === currentPage ? 'bg-[#141414] text-white' : ''
        }`;
        paginationContainer.appendChild(pageLink);
    }
    
    console.log('Пагинация обновлена');
}

// Функции для получения статуса команды
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


