// Tournaments page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  loadTournaments();
});

// Загрузка турниров
async function loadTournaments() {
  const container = document.getElementById('tournaments-container');
  
  try {
            const response = await fetch('/api/tournaments');
    if (!response.ok) throw new Error('Не удалось загрузить турниры');
    
    const tournaments = await response.json();
    
    if (tournaments.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <div class="mb-4">
            <i class="bi bi-trophy" style="font-size: 3rem; color: #6b7280;"></i>
          </div>
          <h3 class="text-gray-600 mb-2">Турниров пока нет</h3>
          <p class="text-gray-500">Будьте первым, кто создаст турнир!</p>
        </div>
      `;
      return;
    }
    
    // Сортируем турниры: сначала идущие, потом набор, потом завершенные
    tournaments.sort((a, b) => {
      const statusOrder = { 'ongoing': 0, 'recruiting': 1, 'full': 2, 'completed': 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
    
    container.innerHTML = tournaments.map(tournament => createTournamentCard(tournament)).join('');
    
    // Добавляем обработчики для кнопок регистрации
    tournaments.forEach(tournament => {
      const registerBtn = document.getElementById(`register-${tournament.id}`);
      if (registerBtn) {
        registerBtn.addEventListener('click', () => registerForTournament(tournament.id));
      }
    });
    
  } catch (error) {
    console.error('Error loading tournaments:', error);
    container.innerHTML = `
      <div class="error">
        <div class="mb-4">
          <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: #ef4444;"></i>
        </div>
        <h3 class="text-red-600 mb-2">Ошибка загрузки</h3>
        <p class="text-red-500">Не удалось загрузить турниры. Попробуйте обновить страницу.</p>
        <button class="btn btn-primary mt-3" onclick="loadTournaments()">Попробовать снова</button>
      </div>
    `;
  }
}

// Создание карточки турнира
function createTournamentCard(tournament) {
  const statusText = {
    'recruiting': 'Набор участников',
    'full': 'Собран',
    'ongoing': 'Идет',
    'completed': 'Завершен'
  };
  
  const participantsCount = tournament.participants ? tournament.participants.length : 0;
  const maxParticipants = tournament.maxParticipants || '∞';
  const isFull = tournament.maxParticipants && participantsCount >= tournament.maxParticipants;
  

  
  return `
    <div class="tournament-card">
      <div class="row">
        <div class="col-md-4">
          <img src="${tournament.image || 'https://via.placeholder.com/400x200?text=Tournament'}" 
               alt="${tournament.title}" 
               class="tournament-image">
        </div>
        <div class="col-md-8">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h3 class="mb-0">${tournament.title}</h3>
            <span class="status-badge status-${tournament.status}">${statusText[tournament.status]}</span>
          </div>
          
          <p class="text-muted mb-3">${tournament.description || 'Описание турнира будет добавлено позже.'}</p>
          
          <div class="row mb-3">
            <div class="col-sm-6">
              <small class="text-muted">
                <i class="bi bi-calendar me-1"></i>
                ${new Date(tournament.startDate).toLocaleDateString()} - ${new Date(tournament.endDate).toLocaleDateString()}
              </small>
            </div>
            <div class="col-sm-6">
              <small class="text-muted">
                <i class="bi bi-geo-alt me-1"></i>
                ${tournament.city || 'Город не указан'}
              </small>
            </div>
          </div>
          
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted">
              <i class="bi bi-people me-1"></i>
              ${participantsCount} / ${maxParticipants} участников
            </div>
            
            <div class="d-flex gap-2">
              <a href="tournaments/${tournament.id}.html" class="btn btn-outline-primary btn-sm">
                Подробнее
              </a>
              
              ${tournament.status === 'recruiting' && !isFull ? 
                `<button id="register-${tournament.id}" class="btn btn-primary btn-sm">
                  Участвовать
                </button>` : 
                tournament.status === 'recruiting' && isFull ?
                `<span class="btn btn-secondary btn-sm disabled">Мест нет</span>` :
                tournament.status === 'ongoing' ?
                `<span class="btn btn-success btn-sm disabled">Идет</span>` :
                `<span class="btn btn-secondary btn-sm disabled">Завершен</span>`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Регистрация на турнир
async function registerForTournament(tournamentId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Для участия в турнире необходимо войти в аккаунт');
    window.location.href = 'login.html';
                return;
            }

  try {
            const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Успешная регистрация на турнир!');
      loadTournaments(); // Перезагружаем список
    } else {
      alert(data.error || 'Ошибка регистрации на турнир');
    }
        } catch (error) {
    console.error('Error registering for tournament:', error);
    alert('Ошибка регистрации на турнир');
  }
} 