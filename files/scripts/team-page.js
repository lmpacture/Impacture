// Универсальная страница команды
class TeamPage {
    constructor() {
        this.teamId = this.getTeamIdFromUrl();
        this.team = null;
        this.init();
    }

    // Получение ID команды из URL
    getTeamIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Инициализация страницы
    init() {
        if (!this.teamId) {
            this.showError('ID команды не указан');
            return;
        }

        this.loadTeam();
    }

    // Загрузка данных команды
    loadTeam() {
        // Показываем загрузку
        this.showLoading();

        // Имитация задержки загрузки
        setTimeout(() => {
            const teams = this.loadTeamsFromStorage();
            this.team = teams.find(team => team.id === this.teamId);

            if (this.team) {
                this.renderTeam();
            } else {
                this.showError('Команда не найдена');
            }
        }, 1000);
    }

    // Загрузка команд из localStorage
    loadTeamsFromStorage() {
        const storedTeams = localStorage.getItem('impacture_teams');
        if (storedTeams) {
            return JSON.parse(storedTeams);
        }
        
        // Возвращаем пустой массив, если данных нет
        return [];
    }

    // Рендеринг команды
    renderTeam() {
        // Скрываем загрузку
        this.hideLoading();

        // Обновляем заголовок страницы
        document.title = `${this.team.name} - Impacture`;

        // Заполняем основную информацию
        document.getElementById('teamName').textContent = this.team.name;
        document.getElementById('teamCity').innerHTML = `<i class="bi bi-geo-alt me-2"></i>${this.team.city}`;
        document.getElementById('teamDescription').textContent = this.team.description || 'Описание команды отсутствует';

        // Загружаем изображения
        const teamLogo = document.getElementById('teamLogo');
        const teamPhoto = document.getElementById('teamPhoto');

        if (this.team.logo) {
            teamLogo.src = this.team.logo;
            teamLogo.onerror = () => {
                teamLogo.src = 'files/images/impactrure_main_screen.png';
            };
        } else {
            teamLogo.src = 'files/images/impactrure_main_screen.png';
        }

        if (this.team.photo) {
            teamPhoto.src = this.team.photo;
            teamPhoto.onerror = () => {
                teamPhoto.src = 'files/images/impactrure_main_screen.png';
            };
        } else {
            teamPhoto.src = 'files/images/impactrure_main_screen.png';
        }

        // Рендерим достижения
        this.renderAchievements();

        // Обновляем статистику
        document.getElementById('achievementsCount').textContent = 
            this.team.achievements ? this.team.achievements.length : 0;

        // Заполняем дополнительную информацию
        document.getElementById('teamId').textContent = this.team.id;
        document.getElementById('teamNameInfo').textContent = this.team.name;
        document.getElementById('teamCityInfo').textContent = this.team.city;
        document.getElementById('loadDate').textContent = new Date().toLocaleString('ru-RU');

        // Показываем контент
        document.getElementById('teamContent').style.display = 'block';
    }

    // Рендеринг достижений
    renderAchievements() {
        const container = document.getElementById('achievementsContainer');
        
        if (!this.team.achievements || this.team.achievements.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="bi bi-trophy display-4 text-muted"></i>
                    <p class="text-muted mt-3">Достижения команды пока не добавлены</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.team.achievements.map((achievement, index) => `
            <div class="achievement-card mb-3">
                <div class="d-flex align-items-start">
                    <div class="achievement-icon me-3">
                        <i class="bi bi-award"></i>
                    </div>
                    <div class="flex-grow-1">
                        <h5 class="mb-1">Достижение ${index + 1}</h5>
                        <p class="mb-0 text-muted">${achievement}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Показ загрузки
    showLoading() {
        document.getElementById('loading').style.display = 'flex';
        document.getElementById('error').style.display = 'none';
        document.getElementById('teamContent').style.display = 'none';
    }

    // Скрытие загрузки
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    // Показ ошибки
    showError(message) {
        this.hideLoading();
        document.getElementById('error').style.display = 'block';
        document.getElementById('teamContent').style.display = 'none';
        
        // Обновляем сообщение об ошибке
        const errorTitle = document.querySelector('#error h3');
        if (errorTitle) {
            errorTitle.textContent = message;
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new TeamPage();
}); 