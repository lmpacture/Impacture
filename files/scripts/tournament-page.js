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
  
  // Сначала проверяем, зарегистрирован ли пользователь уже
  try {
    const checkResponse = await fetch(`http://localhost:3000/api/tournaments/${tournamentId}`);
    if (!checkResponse.ok) throw new Error('Не удалось получить данные турнира');
    
    const tournament = await checkResponse.json();
    const currentUserId = JSON.parse(atob(token.split('.')[1])).id;
    
    // Проверяем, зарегистрирован ли пользователь уже
    if (tournament.participants && tournament.participants.includes(currentUserId)) {
      alert('Вы уже зарегистрированы на этот турнир!');
      updateTournamentData(); // Обновляем данные для правильного отображения кнопки
      return;
    }
    
    // Если не зарегистрирован, регистрируем
    const response = await fetch(`http://localhost:3000/api/tournaments/${tournamentId}/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Успешная регистрация на турнир!');
      updateTournamentData(); // Обновляем данные
    } else {
      alert(data.error || 'Ошибка регистрации на турнир');
    }
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
    const response = await fetch(`http://localhost:3000/api/tournaments/${tournamentId}`);
    if (!response.ok) throw new Error('Не удалось загрузить данные турнира');
    
    const tournament = await response.json();
    
    // Обновляем количество участников
    const participantsElement = document.querySelector('.bi-people').parentElement.querySelector('span');
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
      const token = localStorage.getItem('token');
      let currentUserId = null;
      
      if (token) {
        try {
          currentUserId = JSON.parse(atob(token.split('.')[1])).id;
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
      
      const isRegistered = currentUserId && tournament.participants && tournament.participants.includes(currentUserId);
      
      if (tournament.status === 'recruiting' && !isFull) {
        if (isRegistered) {
          registerBtn.textContent = 'Вы зарегистрированы';
          registerBtn.disabled = false;
          registerBtn.className = 'participate-btn';
          registerBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        } else {
          registerBtn.textContent = 'Участвовать';
          registerBtn.disabled = false;
          registerBtn.className = 'participate-btn';
          registerBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
      } else if (tournament.status === 'recruiting' && isFull) {
        registerBtn.textContent = 'Мест нет';
        registerBtn.disabled = true;
        registerBtn.className = 'participate-btn';
        registerBtn.style.background = '#6c757d';
      } else if (tournament.status === 'ongoing') {
        registerBtn.textContent = 'Турнир идет';
        registerBtn.disabled = true;
        registerBtn.className = 'participate-btn';
        registerBtn.style.background = '#007bff';
      } else {
        registerBtn.textContent = 'Завершен';
        registerBtn.disabled = true;
        registerBtn.className = 'participate-btn';
        registerBtn.style.background = '#6c757d';
      }
    }
    
  } catch (error) {
    console.error('Error updating tournament data:', error);
  }
} 