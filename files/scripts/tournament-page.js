// Tournament page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.addEventListener('click', registerForTournament);
  }
  
  // Обновляем данные каждые 30 секунд
  setInterval(updateTournamentData, 30000);
});

// Регистрация на турнир
async function registerForTournament() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Для участия в турнире необходимо войти в аккаунт');
    window.location.href = '../login.html';
    return;
  }
  
  const tournamentId = getTournamentIdFromUrl();
  if (!tournamentId) {
    alert('Ошибка: не удалось определить турнир');
    return;
  }
  
  try {
    // Имитируем регистрацию без API
    alert('Успешная регистрация на турнир!');
    updateTournamentData(); // Обновляем данные
  } catch (error) {
    console.error('Error registering for tournament:', error);
    alert('Ошибка регистрации на турнир');
  }
}

// Получение ID турнира из URL
function getTournamentIdFromUrl() {
  const path = window.location.pathname;
  const match = path.match(/tournaments\/([^\/]+)\.html/);
  return match ? match[1] : null;
}

// Обновление данных турнира
async function updateTournamentData() {
  const tournamentId = getTournamentIdFromUrl();
  if (!tournamentId) return;
  
  try {
    // Статические данные турнира
    const tournament = {
      id: tournamentId,
      participants: [1, 2, 3, 4, 5],
      maxParticipants: 30,
      status: 'recruiting'
    };
    
    // Обновляем количество участников
    const participantsElement = document.querySelector('.bi-people')?.parentElement?.querySelector('span');
    if (participantsElement) {
      const maxParticipants = tournament.maxParticipants || '∞';
      participantsElement.textContent = `${tournament.participants ? tournament.participants.length : 0} / ${maxParticipants} участников`;
    }
    
    // Обновляем статус
    const statusElement = document.querySelector('.status-badge');
    if (statusElement) {
      const statusText = {
        'recruiting': 'Набор участников',
        'full': 'Собран',
        'ongoing': 'Идет',
        'completed': 'Завершен'
      };
      statusElement.textContent = statusText[tournament.status];
      statusElement.className = `status-badge status-${tournament.status}`;
    }
    
    // Обновляем кнопку регистрации
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
      const isFull = tournament.maxParticipants && tournament.participants && tournament.participants.length >= tournament.maxParticipants;
      
      if (tournament.status === 'recruiting' && !isFull) {
        registerBtn.textContent = 'Участвовать';
        registerBtn.disabled = false;
        registerBtn.className = 'px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-opacity-90';
      } else if (tournament.status === 'recruiting' && isFull) {
        registerBtn.textContent = 'Мест нет';
        registerBtn.disabled = true;
        registerBtn.className = 'px-6 py-3 bg-gray-300 text-gray-600 font-medium rounded-lg cursor-not-allowed';
      } else if (tournament.status === 'ongoing') {
        registerBtn.textContent = 'Турнир идет';
        registerBtn.disabled = true;
        registerBtn.className = 'px-6 py-3 bg-green-500 text-white font-medium rounded-lg cursor-not-allowed';
      } else {
        registerBtn.textContent = 'Завершен';
        registerBtn.disabled = true;
        registerBtn.className = 'px-6 py-3 bg-gray-500 text-white font-medium rounded-lg cursor-not-allowed';
      }
    }
    
  } catch (error) {
    console.error('Error updating tournament data:', error);
  }
} 