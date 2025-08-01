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

// Загрузка команд из API
async function loadTeams() {
    try {
        const response = await fetch('http://localhost:3000/api/teams');
        
        if (response.ok) {
            allTeams = await response.json();
            console.log('Загружено команд:', allTeams.length);
            displayTeamsForPage(1);
            updatePagination();
        } else {
            console.error('Ошибка загрузки команд');
        }
    } catch (error) {
        console.error('Error loading teams:', error);
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


