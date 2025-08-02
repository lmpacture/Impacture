// Cabinet.js - Личный кабинет

// Глобальные переменные
let allTeams = [];

// Функция для парсинга дат в разных форматах
function parseDate(dateString) {
  // Формат ДД.ММ.ГГГГ
  const ddMmYyyyPattern = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  const ddMmMatch = dateString.match(ddMmYyyyPattern);
  if (ddMmMatch) {
    const day = parseInt(ddMmMatch[1]);
    const month = parseInt(ddMmMatch[2]) - 1; // Месяцы в JS начинаются с 0
    const year = parseInt(ddMmMatch[3]);
    const date = new Date(year, month, day);
    if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
      return date;
    }
  }
  
  // Формат ГГГГ-ММ-ДД
  const yyyyMmDdPattern = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const yyyyMmMatch = dateString.match(yyyyMmDdPattern);
  if (yyyyMmMatch) {
    const year = parseInt(yyyyMmMatch[1]);
    const month = parseInt(yyyyMmMatch[2]) - 1;
    const day = parseInt(yyyyMmMatch[3]);
    const date = new Date(year, month, day);
    if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
      return date;
    }
  }
  
  return null;
}

document.addEventListener('DOMContentLoaded', function() {
  // Проверяем авторизацию
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

  // Загружаем информацию о пользователе
  loadUserInfo();



  // Обработчик кнопки "Мои турниры"
  const myTournamentsBtn = document.getElementById('my-tournaments-btn');
  if (myTournamentsBtn) {
    myTournamentsBtn.addEventListener('click', loadMyTournaments);
  }

  // Обработчик кнопки "История турниров"
  const tournamentHistoryBtn = document.getElementById('tournament-history-btn');
  if (tournamentHistoryBtn) {
    tournamentHistoryBtn.addEventListener('click', loadTournamentHistory);
  }

  // Обработчик кнопки "Создать турнир"
  const createTournamentBtn = document.getElementById('create-tournament-btn');
  if (createTournamentBtn) {
    createTournamentBtn.addEventListener('click', openTournamentModal);
  }

  // Обработчик кнопки "Выйти"
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }

  // Обработчик создания турнира
  const submitTournamentBtn = document.getElementById('submit-tournament');
  if (submitTournamentBtn) {
    submitTournamentBtn.addEventListener('click', createTournament);
  }

  // Обработчики закрытия модальных окон
  setupModalHandlers();

  // Обработчики загрузки файлов
  setupFileUpload();

  // Устанавливаем минимальные даты для полей дат
  setupDateValidation();

  // Настройка обработчиков для товаров
  setupProductHandlers();
  
  // Настройка обработчиков для команд
  setupTeamHandlers();
  
  // Настройка обработчиков для заявок
  setupApplicationHandlers();
});

// Настройка обработчиков модальных окон
function setupModalHandlers() {
  // Модальное окно создания турнира
  const closeModalBtn = document.getElementById('close-tournament-modal');
  const cancelBtn = document.getElementById('cancel-tournament');
  const modal = document.getElementById('tournament-modal');

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeTournamentModal);
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeTournamentModal);
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeTournamentModal();
      }
    });
  }

  // Модальное окно моих турниров
  const closeMyTournamentsBtn = document.getElementById('close-my-tournaments');
  const myTournamentsModal = document.getElementById('my-tournaments-modal');

  if (closeMyTournamentsBtn) {
    closeMyTournamentsBtn.addEventListener('click', closeMyTournamentsModal);
  }
  if (myTournamentsModal) {
    myTournamentsModal.addEventListener('click', (e) => {
      if (e.target === myTournamentsModal) {
        closeMyTournamentsModal();
      }
    });
  }

  // Модальное окно истории
  const closeHistoryBtn = document.getElementById('close-history');
  const historyModal = document.getElementById('tournament-history-modal');

  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener('click', closeHistoryModal);
  }
  if (historyModal) {
    historyModal.addEventListener('click', (e) => {
      if (e.target === historyModal) {
        closeHistoryModal();
      }
    });
  }

  // Модальное окно редактирования
  const closeEditBtn = document.getElementById('close-edit-tournament');
  const cancelEditBtn = document.getElementById('cancel-edit-tournament');
  const editModal = document.getElementById('edit-tournament-modal');

  if (closeEditBtn) {
    closeEditBtn.addEventListener('click', closeEditTournamentModal);
  }
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', closeEditTournamentModal);
  }
  if (editModal) {
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        closeEditTournamentModal();
      }
    });
  }

  // Кнопка обновления турнира
  const updateTournamentBtn = document.getElementById('update-tournament');
  if (updateTournamentBtn) {
    updateTournamentBtn.addEventListener('click', updateTournament);
  }

  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTournamentModal();
      closeMyTournamentsModal();
      closeHistoryModal();
      closeEditTournamentModal();
    }
  });
}

// Загрузка моих турниров
async function loadMyTournaments() {
  try {
    const token = localStorage.getItem('token');
            const response = await fetch('/api/tournaments/user/created', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
    });

    if (response.ok) {
      const tournaments = await response.json();
      displayMyTournaments(tournaments);
      openMyTournamentsModal();
    } else {
      throw new Error('Ошибка загрузки турниров');
    }
  } catch (error) {
    console.error('Error loading my tournaments:', error);
    alert('Ошибка загрузки турниров');
  }
}

// Отображение моих турниров
function displayMyTournaments(tournaments) {
  const container = document.getElementById('my-tournaments-list');
  
  if (tournaments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-trophy"></i>
        <h4>У вас пока нет турниров</h4>
        <p>Создайте свой первый турнир!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tournaments.map(tournament => `
    <div class="tournament-item">
      <div class="tournament-item-header">
        <h4 class="tournament-item-title">${tournament.title}</h4>
        <span class="tournament-item-status status-${tournament.status}">
          ${getStatusText(tournament.status)}
        </span>
      </div>
      <div class="tournament-item-info">
        <div><strong>Город:</strong> ${tournament.city || 'Не указан'}</div>
        <div><strong>Дата начала:</strong> ${new Date(tournament.startDate).toLocaleDateString('ru-RU')}</div>
        <div><strong>Дата окончания:</strong> ${new Date(tournament.endDate).toLocaleDateString('ru-RU')}</div>
        <div><strong>Участники:</strong> ${tournament.participants.length}${tournament.maxParticipants ? '/' + tournament.maxParticipants : ''}</div>
      </div>
      <div class="tournament-item-actions">
        <button class="btn btn-sm btn-view" onclick="viewTournament('${tournament.id}')">
          <i class="bi bi-eye"></i> Просмотр
        </button>
        <button class="btn btn-sm btn-edit" onclick="editTournament('${tournament.id}')">
          <i class="bi bi-pencil"></i> Редактировать
        </button>
        <button class="btn btn-sm btn-delete" onclick="deleteTournament('${tournament.id}')">
          <i class="bi bi-trash"></i> Удалить
        </button>
      </div>
    </div>
  `).join('');
}

// Загрузка истории участия
async function loadTournamentHistory() {
  try {
    const token = localStorage.getItem('token');
            const response = await fetch('/api/tournaments/user/participating', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
    });

    if (response.ok) {
      const tournaments = await response.json();
      displayTournamentHistory(tournaments);
      openHistoryModal();
    } else {
      throw new Error('Ошибка загрузки истории');
    }
  } catch (error) {
    console.error('Error loading tournament history:', error);
    alert('Ошибка загрузки истории');
  }
}

// Отображение истории участия
function displayTournamentHistory(tournaments) {
  const container = document.getElementById('tournament-history-list');
  
  if (tournaments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-calendar-check"></i>
        <h4>Вы пока не участвовали в турнирах</h4>
        <p>Зарегистрируйтесь на турнир, чтобы увидеть его здесь!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tournaments.map(tournament => `
    <div class="tournament-item">
      <div class="tournament-item-header">
        <h4 class="tournament-item-title">${tournament.title}</h4>
        <span class="tournament-item-status status-${tournament.status}">
          ${getStatusText(tournament.status)}
        </span>
      </div>
      <div class="tournament-item-info">
        <div><strong>Организатор:</strong> ${tournament.createdBy || 'Неизвестно'}</div>
        <div><strong>Город:</strong> ${tournament.city || 'Не указан'}</div>
        <div><strong>Дата начала:</strong> ${new Date(tournament.startDate).toLocaleDateString('ru-RU')}</div>
        <div><strong>Дата окончания:</strong> ${new Date(tournament.endDate).toLocaleDateString('ru-RU')}</div>
        <div><strong>Участников:</strong> ${tournament.participants.length}${tournament.maxParticipants ? '/' + tournament.maxParticipants : ''}</div>
      </div>
      <div class="tournament-item-actions">
        <button class="btn btn-sm btn-view" onclick="viewTournament('${tournament.id}')">
          <i class="bi bi-eye"></i> Просмотр
        </button>
      </div>
    </div>
  `).join('');
}

// Функции для работы с модальными окнами
function openMyTournamentsModal() {
  const modal = document.getElementById('my-tournaments-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeMyTournamentsModal() {
  const modal = document.getElementById('my-tournaments-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function openHistoryModal() {
  const modal = document.getElementById('tournament-history-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeHistoryModal() {
  const modal = document.getElementById('tournament-history-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Функции для работы с турнирами
function viewTournament(tournamentId) {
  window.open(`tournaments/${tournamentId}.html`, '_blank');
}

async function editTournament(tournamentId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/tournaments/${tournamentId}/edit`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const tournament = await response.json();
      fillEditForm(tournament);
      openEditTournamentModal();
    } else {
      throw new Error('Ошибка загрузки турнира');
    }
  } catch (error) {
    console.error('Error loading tournament for edit:', error);
    alert('Ошибка загрузки турнира');
  }
}

function fillEditForm(tournament) {
  document.getElementById('edit-tournament-title').value = tournament.title;
  document.getElementById('edit-tournament-city').value = tournament.city || '';
  document.getElementById('edit-tournament-description').value = tournament.description || '';
  document.getElementById('edit-tournament-start-date').value = new Date(tournament.startDate).toLocaleDateString('ru-RU');
  document.getElementById('edit-tournament-end-date').value = new Date(tournament.endDate).toLocaleDateString('ru-RU');
  document.getElementById('edit-tournament-max-participants').value = tournament.maxParticipants || '';
  document.getElementById('edit-tournament-status').value = tournament.status || 'recruiting';
  
  // Загружаем список участников
  loadParticipantsList(tournament);
  
  // Сохраняем ID турнира для обновления
  document.getElementById('edit-tournament-form').dataset.tournamentId = tournament.id;
}

function openEditTournamentModal() {
  const modal = document.getElementById('edit-tournament-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeEditTournamentModal() {
  const modal = document.getElementById('edit-tournament-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    document.getElementById('edit-tournament-form').reset();
  }
}

async function updateTournament() {
  const form = document.getElementById('edit-tournament-form');
  const tournamentId = form.dataset.tournamentId;
  
  if (!tournamentId) {
    alert('Ошибка: ID турнира не найден');
    return;
  }

  const title = document.getElementById('edit-tournament-title').value.trim();
  const description = document.getElementById('edit-tournament-description').value.trim();
  const city = document.getElementById('edit-tournament-city').value.trim();
  const startDate = document.getElementById('edit-tournament-start-date').value;
  const endDate = document.getElementById('edit-tournament-end-date').value;
  const maxParticipants = document.getElementById('edit-tournament-max-participants').value;
  const status = document.getElementById('edit-tournament-status').value;
  const imageFile = document.getElementById('edit-tournament-image').files[0];

  // Валидация
            if (!title) {
    alert('Введите название турнира');
    return;
  }
  if (!startDate) {
    alert('Выберите дату начала');
    return;
  }
  if (!endDate) {
    alert('Выберите дату окончания');
                return;
            }
            
  // Проверяем формат дат
  const startDateObj = parseDate(startDate);
  const endDateObj = parseDate(endDate);
  
  if (!startDateObj) {
    alert('Неверный формат даты начала. Используйте формат ДД.ММ.ГГГГ или ГГГГ-ММ-ДД');
    return;
  }
  if (!endDateObj) {
    alert('Неверный формат даты окончания. Используйте формат ДД.ММ.ГГГГ или ГГГГ-ММ-ДД');
    return;
  }

  // Преобразуем даты в ISO формат
  const startDateISO = startDateObj.toISOString().split('T')[0];
  const endDateISO = endDateObj.toISOString().split('T')[0];
  
  if (startDateISO > endDateISO) {
    alert('Дата окончания не может быть раньше даты начала');
                return;
            }

            try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('city', city);
    formData.append('startDate', startDateISO);
    formData.append('endDate', endDateISO);
    formData.append('status', status);
    if (maxParticipants) {
      formData.append('maxParticipants', maxParticipants);
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }

            const response = await fetch(`/api/tournaments/${tournamentId}`, {
      method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
      body: formData
                });

                const data = await response.json();

    if (response.ok) {
      alert('🎉 Турнир успешно обновлен!');
      closeEditTournamentModal();
      loadMyTournaments(); // Обновляем список
    } else {
      throw new Error(data.error || 'Ошибка обновления турнира');
    }
  } catch (error) {
    console.error('Error updating tournament:', error);
    alert(error.message || 'Ошибка обновления турнира');
  }
}

async function deleteTournament(tournamentId) {
  console.log('Attempting to delete tournament:', tournamentId);
  
  if (!tournamentId) {
    console.error('No tournamentId provided');
    alert('Ошибка: не указан ID турнира');
    return;
  }
  
  console.log('Showing custom confirmation dialog for tournament...');
  
  // Используем кастомный диалог подтверждения
  const confirmed = await showCustomConfirm('Вы уверены, что хотите удалить этот турнир? Это действие нельзя отменить.');
  console.log('Tournament confirmation result:', confirmed);
  
  if (!confirmed) {
    console.log('User cancelled tournament deletion');
    return;
  }

  console.log('Proceeding with tournament deletion...');
  
  try {
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'exists' : 'missing');
    
    if (!token) {
      alert('Ошибка: не найден токен авторизации');
      return;
    }
    
    const response = await fetch(`/api/tournaments/${tournamentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Tournament deletion response status:', response.status);
    
    const data = await response.json();

    if (response.ok) {
      console.log('Tournament deleted successfully');
      alert('✅ Турнир успешно удален!');
      loadMyTournaments(); // Обновляем список
    } else {
      throw new Error(data.error || 'Ошибка удаления турнира');
    }
  } catch (error) {
    console.error('Error deleting tournament:', error);
    alert(error.message || 'Ошибка удаления турнира');
  }
}

// Загрузить список участников турнира
async function loadParticipantsList(tournament) {
  const participantsList = document.getElementById('edit-participants-list');
  
  if (!tournament.participants || tournament.participants.length === 0) {
    participantsList.innerHTML = '<div class="no-participants">Нет участников</div>';
    return;
  }

  try {
    const token = localStorage.getItem('token');
            const response = await fetch(`/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

            if (!response.ok) {
      throw new Error('Ошибка загрузки пользователей');
    }

    const users = await response.json();
    const participants = users.filter(user => tournament.participants.includes(user.id));
    
    participantsList.innerHTML = participants.map(participant => `
      <div class="participant-item" data-user-id="${participant.id}">
        <div class="participant-info">
          <div class="participant-avatar">
            ${participant.firstName ? participant.firstName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div class="participant-name">
              ${participant.firstName || ''} ${participant.lastName || ''}
            </div>
            <div class="participant-email">${participant.email}</div>
          </div>
        </div>
        <button class="remove-participant-btn" onclick="removeParticipant('${tournament.id}', '${participant.id}')">
          Удалить
        </button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading participants:', error);
    participantsList.innerHTML = '<div class="no-participants">Ошибка загрузки участников</div>';
  }
}

// Удалить участника из турнира
async function removeParticipant(tournamentId, userId) {
  console.log('Attempting to remove participant:', userId, 'from tournament:', tournamentId);
  
  if (!tournamentId || !userId) {
    console.error('Missing tournamentId or userId');
    alert('Ошибка: не указаны ID турнира или участника');
    return;
  }
  
  console.log('Showing custom confirmation dialog for participant removal...');
  
  // Используем кастомный диалог подтверждения
  const confirmed = await showCustomConfirm('Вы уверены, что хотите удалить этого участника из турнира?');
  console.log('Participant removal confirmation result:', confirmed);
  
  if (!confirmed) {
    console.log('User cancelled participant removal');
    return;
  }

  console.log('Proceeding with participant removal...');
  
  try {
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'exists' : 'missing');
    
    if (!token) {
      alert('Ошибка: не найден токен авторизации');
      return;
    }
    
    const response = await fetch(`/api/tournaments/${tournamentId}/participants/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Participant removal response status:', response.status);
    
    const data = await response.json();

    if (response.ok) {
      console.log('Participant removed successfully');
      alert('✅ Участник успешно удален из турнира!');
      // Обновляем список участников
      const tournament = await getTournament(tournamentId);
      if (tournament) {
        loadParticipantsList(tournament);
      }
    } else {
      throw new Error(data.error || 'Ошибка удаления участника');
    }
  } catch (error) {
    console.error('Error removing participant:', error);
    alert(error.message || 'Ошибка удаления участника');
  }
}

// Получить турнир по ID
async function getTournament(tournamentId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/tournaments/${tournamentId}/edit`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error getting tournament:', error);
    return null;
  }
}

// Вспомогательные функции
function getStatusText(status) {
  switch (status) {
    case 'recruiting': return 'Набор участников';
    case 'full': return 'Собран';
    case 'ongoing': return 'Идет';
    case 'completed': return 'Завершен';
    default: return 'Неизвестно';
  }
}

// Настройка загрузки файлов
function setupFileUpload() {
  const fileInput = document.getElementById('tournament-image');
  const uploadBtn = document.getElementById('upload-btn');
  const fileInfo = document.getElementById('file-info');
  const fileName = document.getElementById('file-name');
  const removeFileBtn = document.getElementById('remove-file');

  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }

  if (removeFileBtn) {
    removeFileBtn.addEventListener('click', removeFile);
  }
}

// Обработка выбора файла
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Валидация типа файла
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    alert('❌ Поддерживаются только изображения: JPG, PNG, GIF, WebP');
    removeFile();
    return;
  }

  // Валидация размера файла (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert('❌ Размер файла не должен превышать 5MB');
    removeFile();
    return;
  }

  // Показываем информацию о файле
  const fileInfo = document.getElementById('file-info');
  const fileName = document.getElementById('file-name');
  
  fileName.textContent = file.name;
  fileInfo.style.display = 'flex';
  
  // Скрываем кнопку загрузки
  const uploadBtn = document.getElementById('upload-btn');
  uploadBtn.style.display = 'none';

  // Создаем предпросмотр
  createFilePreview(file);
}

// Создание предпросмотра файла
function createFilePreview(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    // Удаляем старый предпросмотр если есть
    const oldPreview = document.querySelector('.file-preview');
    if (oldPreview) {
      oldPreview.remove();
    }

    // Создаем новый предпросмотр
    const preview = document.createElement('img');
    preview.src = e.target.result;
    preview.className = 'file-preview';
    preview.alt = 'Предпросмотр изображения';

    // Добавляем после информации о файле
    const fileInfo = document.getElementById('file-info');
    fileInfo.parentNode.insertBefore(preview, fileInfo.nextSibling);
  };
  reader.readAsDataURL(file);
}

// Удаление файла
function removeFile() {
  const fileInput = document.getElementById('tournament-image');
  const uploadBtn = document.getElementById('upload-btn');
  const fileInfo = document.getElementById('file-info');
  const preview = document.querySelector('.file-preview');

  // Очищаем input
  fileInput.value = '';

  // Скрываем информацию о файле
  fileInfo.style.display = 'none';

  // Показываем кнопку загрузки
  uploadBtn.style.display = 'flex';

  // Удаляем предпросмотр
  if (preview) {
    preview.remove();
  }
}

// Открытие модального окна
function openTournamentModal() {
  const modal = document.getElementById('tournament-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Блокируем прокрутку
  }
}

// Закрытие модального окна
function closeTournamentModal() {
  const modal = document.getElementById('tournament-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Возвращаем прокрутку
    // Очищаем форму
    document.getElementById('tournament-form').reset();
    // Удаляем файл
    removeFile();
  }
}

// Загрузка информации о пользователе
async function loadUserInfo() {
  try {
    const token = localStorage.getItem('token');
            const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const user = await response.json();
      // Сохраняем userId в localStorage
      localStorage.setItem('userId', user.id);
      
      const userInfoElement = document.getElementById('user-info');
      if (userInfoElement) {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const displayName = fullName || user.email || 'Пользователь';
        userInfoElement.textContent = `Добро пожаловать, ${displayName}!`;
      }
    } else {
      throw new Error('Failed to load user info');
    }
  } catch (error) {
    console.error('Error loading user info:', error);
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement) {
      userInfoElement.textContent = 'Ошибка загрузки данных пользователя';
    }
  }
}

// Создание турнира
async function createTournament() {
  console.log('Функция createTournament вызвана');
  
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Необходимо войти в аккаунт');
    return;
  }

  // Получаем данные из формы
  const title = document.getElementById('tournament-title').value.trim();
  const description = document.getElementById('tournament-description').value.trim();
  const city = document.getElementById('tournament-city').value.trim();
  const startDate = document.getElementById('tournament-start-date').value;
  const endDate = document.getElementById('tournament-end-date').value;
  const maxParticipants = document.getElementById('tournament-max-participants').value;
  const imageFile = document.getElementById('tournament-image').files[0];

  console.log('Данные формы:', { title, description, city, startDate, endDate, maxParticipants });

  // Валидация
            if (!title) {
    alert('Введите название турнира');
    return;
  }
  if (!startDate) {
    alert('Выберите дату начала');
    return;
  }
  if (!endDate) {
    alert('Выберите дату окончания');
                return;
            }
            
  console.log('Парсинг дат...');
  // Проверяем формат дат
  const startDateObj = parseDate(startDate);
  const endDateObj = parseDate(endDate);
  
  console.log('Результат парсинга:', { startDateObj, endDateObj });
  
  if (!startDateObj) {
    alert('Неверный формат даты начала. Используйте формат ДД.ММ.ГГГГ или ГГГГ-ММ-ДД');
    return;
  }
  if (!endDateObj) {
    alert('Неверный формат даты окончания. Используйте формат ДД.ММ.ГГГГ или ГГГГ-ММ-ДД');
    return;
  }
  
  // Преобразуем даты в ISO формат для отправки на сервер
  const startDateISO = startDateObj.toISOString().split('T')[0];
  const endDateISO = endDateObj.toISOString().split('T')[0];
  
  console.log('ISO даты:', { startDateISO, endDateISO });
  
  if (startDateISO > endDateISO) {
    alert('Дата окончания не может быть раньше даты начала');
                return;
            }

            try {
    console.log('Отправка запроса...');
    const submitBtn = document.getElementById('submit-tournament');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Создание...';

    // Создаем FormData для отправки файла
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('city', city);
    formData.append('startDate', startDateISO);
    formData.append('endDate', endDateISO);
    if (maxParticipants) {
      formData.append('maxParticipants', maxParticipants);
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }

    console.log('Отправка на сервер...');
                const response = await fetch('/api/tournaments', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
        // Не добавляем Content-Type, браузер сам установит для FormData
      },
      body: formData
    });

    console.log('Ответ сервера:', response.status);
                const data = await response.json();
    console.log('Данные ответа:', data);

    if (response.ok) {
      alert('🎉 Турнир успешно создан!');
      
      // Закрываем модальное окно
      closeTournamentModal();
      
      // Перенаправляем на страницу турнира
                setTimeout(() => {
        window.location.href = data.url;
      }, 1000);
                
    } else {
      throw new Error(data.error || 'Ошибка создания турнира');
    }
            } catch (error) {
    console.error('Ошибка создания турнира:', error);
    alert(error.message || 'Ошибка создания турнира');
            } finally {
    const submitBtn = document.getElementById('submit-tournament');
                submitBtn.disabled = false;
    submitBtn.textContent = 'Создать турнир';
  }
}

// Настройка валидации дат
function setupDateValidation() {
  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];
  
  // Валидация для формы создания турнира
  const startDateInput = document.getElementById('tournament-start-date');
  const endDateInput = document.getElementById('tournament-end-date');
  
  if (startDateInput) {
    startDateInput.addEventListener('blur', function() {
      if (this.value) {
        const date = parseDate(this.value);
        if (!date) {
          alert('Пожалуйста, введите дату в формате ДД.ММ.ГГГГ или ГГГГ-ММ-ДД (например: 30.07.2025 или 2025-07-30)');
          this.value = '';
          this.focus();
        }
            }
        });
    }

  if (endDateInput) {
    endDateInput.addEventListener('blur', function() {
      if (this.value) {
        const date = parseDate(this.value);
        if (!date) {
          alert('Пожалуйста, введите дату в формате ДД.ММ.ГГГГ или ГГГГ-ММ-ДД (например: 30.07.2025 или 2025-07-30)');
          this.value = '';
          this.focus();
        }
      }
    });
  }
  
  // Валидация для формы редактирования турнира
  const editStartDateInput = document.getElementById('edit-tournament-start-date');
  const editEndDateInput = document.getElementById('edit-tournament-end-date');
  
  if (editStartDateInput) {
    editStartDateInput.addEventListener('blur', function() {
      if (this.value) {
        const date = parseDate(this.value);
        if (!date) {
          alert('Пожалуйста, введите дату в формате ДД.ММ.ГГГГ или ГГГГ-ММ-ДД (например: 30.07.2025 или 2025-07-30)');
          this.value = '';
          this.focus();
        }
      }
    });
  }
  
  if (editEndDateInput) {
    editEndDateInput.addEventListener('blur', function() {
      if (this.value) {
        const date = parseDate(this.value);
        if (!date) {
          alert('Пожалуйста, введите дату в формате ДД.ММ.ГГГГ или ГГГГ-ММ-ДД (например: 30.07.2025 или 2025-07-30)');
          this.value = '';
          this.focus();
        }
      }
    });
  }
}

// Настройка обработчиков для товаров
function setupProductHandlers() {
  const createProductBtn = document.getElementById('create-product-btn');
  const myProductsBtn = document.getElementById('my-products-btn');
  const productModal = document.getElementById('product-modal');
  const closeProductModalBtn = document.getElementById('close-product-modal');
  const cancelProductBtn = document.getElementById('cancel-product');
  const submitProductBtn = document.getElementById('submit-product');
  const closeMyProductsBtn = document.getElementById('close-my-products');
  
  if (createProductBtn) {
    createProductBtn.addEventListener('click', openProductModal);
  }
  
  if (myProductsBtn) {
    myProductsBtn.addEventListener('click', openMyProductsModal);
  }
  
  if (closeProductModalBtn) {
    closeProductModalBtn.addEventListener('click', closeProductModal);
  }
  
  if (cancelProductBtn) {
    cancelProductBtn.addEventListener('click', closeProductModal);
  }
  
  if (submitProductBtn) {
    submitProductBtn.addEventListener('click', createProduct);
  }
  
  if (closeMyProductsBtn) {
    closeMyProductsBtn.addEventListener('click', closeMyProductsModal);
  }
  
  // Закрытие по клику вне модального окна
  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) {
        closeProductModal();
      }
    });
  }
  
  // Закрытие модального окна моих товаров по клику вне
  const myProductsModal = document.getElementById('my-products-modal');
  if (myProductsModal) {
    myProductsModal.addEventListener('click', (e) => {
      if (e.target === myProductsModal) {
        closeMyProductsModal();
      }
    });
  }
  
  // Закрытие модальных окон по клавише Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const productModal = document.getElementById('product-modal');
      const myProductsModal = document.getElementById('my-products-modal');
      const editProductModal = document.getElementById('edit-product-modal');
      
      if (productModal && productModal.classList.contains('show')) {
        closeProductModal();
      }
      
      if (myProductsModal && myProductsModal.classList.contains('show')) {
        closeMyProductsModal();
      }
      
      if (editProductModal && editProductModal.classList.contains('show')) {
        closeEditProductModal();
      }
    }
  });
  
  // Настройка загрузки файлов для товаров
  setupProductFileUpload();
  
  // Настройка обработчиков для редактирования товаров
  setupEditProductHandlers();
}

// Открытие модального окна создания товара
function openProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) {
    // Очищаем глобальную переменную при открытии модального окна
    selectedProductFiles = [];
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

// Закрытие модального окна создания товара
function closeProductModal() {
  const modal = document.getElementById('product-modal');
        if (modal) {
    // Очищаем глобальную переменную при закрытии модального окна
    selectedProductFiles = [];
    
    modal.classList.remove('show');
    document.body.style.overflow = '';
    document.getElementById('product-form').reset();
  }
}

// Создание товара
async function createProduct() {
  const title = document.getElementById('product-title').value.trim();
  const description = document.getElementById('product-description').value.trim();
  const price = document.getElementById('product-price').value;
  const category = document.getElementById('product-category').value;
  const condition = document.getElementById('product-condition').value;
  const city = document.getElementById('product-city').value.trim();
  const imageFiles = document.getElementById('product-images').files;

  // Валидация
  if (!title) {
    alert('Введите название товара');
    return;
  }
  if (!price || price <= 0) {
    alert('Введите корректную цену');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('condition', condition);
    formData.append('city', city);
    
    // Добавляем изображения
    for (let i = 0; i < imageFiles.length; i++) {
      formData.append('images', imageFiles[i]);
    }

            const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      alert('🎉 Товар успешно добавлен!');
      closeProductModal();
    } else {
      throw new Error(data.error || 'Ошибка создания товара');
    }
  } catch (error) {
    console.error('Error creating product:', error);
    alert(error.message || 'Ошибка создания товара');
  }
}

// Открытие модального окна моих товаров
function openMyProductsModal() {
  const modal = document.getElementById('my-products-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    loadMyProducts();
  }
}

// Закрытие модального окна моих товаров
function closeMyProductsModal() {
  const modal = document.getElementById('my-products-modal');
        if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Загрузка моих товаров
async function loadMyProducts() {
  try {
    const token = localStorage.getItem('token');
            const response = await fetch('/api/products/user/created', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const products = await response.json();
      displayMyProducts(products);
    } else {
      throw new Error('Ошибка загрузки товаров');
    }
  } catch (error) {
    console.error('Error loading products:', error);
    document.getElementById('my-products-list').innerHTML = 
      '<div class="loading"><p>Ошибка загрузки товаров</p></div>';
  }
}

// Отображение моих товаров
function displayMyProducts(products) {
  const list = document.getElementById('my-products-list');
  
  if (!products || products.length === 0) {
    list.innerHTML = '<div class="no-tournaments">У вас пока нет товаров</div>';
    return;
  }
  
  list.innerHTML = products.map(product => `
    <div class="tournament-item">
      <img src="${product.images && product.images.length > 0 ? product.images[0] : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iMjAiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBpbWc8L3RleHQ+PC9zdmc+'}" 
           alt="${product.title}">
      <div class="tournament-info">
        <div class="tournament-title">${product.title}</div>
        <div class="tournament-date">${product.price}₸ • ${getConditionText(product.condition)}</div>
      </div>
      <div class="tournament-actions">
        <button class="btn btn-sm btn-primary view-product-btn" data-product-id="${product.id}">Просмотр</button>
        <button class="btn btn-sm btn-secondary edit-product-btn" data-product-id="${product.id}">Редактировать</button>
        <button class="btn btn-sm btn-danger delete-product-btn" data-product-id="${product.id}">Удалить</button>
      </div>
    </div>
  `).join('');
  
  // Добавляем обработчики событий после создания HTML
  setupProductActionHandlers();
}

// Настройка обработчиков для действий с товарами
function setupProductActionHandlers() {
  const list = document.getElementById('my-products-list');
  
  // Обработчик для кнопки "Просмотр"
  list.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-product-btn')) {
      const productId = e.target.getAttribute('data-product-id');
      console.log('View button clicked for product:', productId);
      viewProduct(productId);
    }
  });
  
  // Обработчик для кнопки "Редактировать"
  list.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-product-btn')) {
      const productId = e.target.getAttribute('data-product-id');
      editProduct(productId);
    }
  });
  
  // Обработчик для кнопки "Удалить"
  list.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-product-btn')) {
      const productId = e.target.getAttribute('data-product-id');
      console.log('Delete button clicked for product:', productId);
      deleteProduct(productId);
    }
  });
}

// Просмотр товара
function viewProduct(productId) {
  console.log('Opening product page:', productId);
  const url = `/products/${productId}.html`;
  console.log('Product URL:', url);
  // Открываем в том же окне вместо всплывающего
  window.location.href = url;
}

// Глобальная переменная для хранения данных редактируемого товара
let editingProduct = null;
let selectedEditProductFiles = [];

// Редактирование товара
async function editProduct(productId) {
  try {
    const token = localStorage.getItem('token');
            const response = await fetch(`/api/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      editingProduct = await response.json();
      fillEditProductForm(editingProduct);
      openEditProductModal();
    } else {
      throw new Error('Ошибка загрузки товара');
    }
  } catch (error) {
    console.error('Error loading product:', error);
    alert(error.message || 'Ошибка загрузки товара');
  }
}

// Заполнение формы редактирования товара
function fillEditProductForm(product) {
  document.getElementById('edit-product-title').value = product.title;
  document.getElementById('edit-product-description').value = product.description || '';
  document.getElementById('edit-product-price').value = product.price;
  document.getElementById('edit-product-category').value = product.category;
  document.getElementById('edit-product-condition').value = product.condition;
  document.getElementById('edit-product-city').value = product.city || '';
  
  // Отображаем текущие изображения
  displayCurrentProductImages(product.images || []);
}

// Отображение текущих изображений товара
function displayCurrentProductImages(images) {
  const currentImagesContainer = document.getElementById('edit-product-current-images');
  
  if (images.length === 0) {
    currentImagesContainer.innerHTML = '<p class="text-muted">Нет изображений</p>';
    return;
  }
  
  currentImagesContainer.innerHTML = images.map((image, index) => `
    <div class="current-image-item">
      <img src="${image}" alt="Изображение ${index + 1}">
      <button type="button" class="remove-current-image" onclick="removeCurrentProductImage('${image}', ${index})">&times;</button>
    </div>
  `).join('');
}

// Удаление текущего изображения товара
async function removeCurrentProductImage(imagePath, index) {
  if (!confirm('Удалить это изображение?')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
            const response = await fetch(`/api/products/${editingProduct.id}/images/${index}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      // Обновляем список изображений
      editingProduct.images.splice(index, 1);
      displayCurrentProductImages(editingProduct.images);
    } else {
      throw new Error('Ошибка удаления изображения');
    }
  } catch (error) {
    console.error('Error removing image:', error);
    alert(error.message || 'Ошибка удаления изображения');
  }
}

// Открытие модального окна редактирования товара
function openEditProductModal() {
  const modal = document.getElementById('edit-product-modal');
  if (modal) {
    // Очищаем глобальную переменную для новых файлов
    selectedEditProductFiles = [];
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

// Закрытие модального окна редактирования товара
function closeEditProductModal() {
  const modal = document.getElementById('edit-product-modal');
  if (modal) {
    // Очищаем глобальную переменную
    selectedEditProductFiles = [];
    editingProduct = null;
    
    modal.classList.remove('show');
    document.body.style.overflow = '';
    document.getElementById('edit-product-form').reset();
  }
}

// Обновление товара
async function updateProduct() {
  const title = document.getElementById('edit-product-title').value.trim();
  const description = document.getElementById('edit-product-description').value.trim();
  const price = document.getElementById('edit-product-price').value;
  const category = document.getElementById('edit-product-category').value;
  const condition = document.getElementById('edit-product-condition').value;
  const city = document.getElementById('edit-product-city').value.trim();
  const newImageFiles = document.getElementById('edit-product-images').files;

  // Валидация
  if (!title) {
    alert('Введите название товара');
    return;
  }
  if (!price || price <= 0) {
    alert('Введите корректную цену');
                return;
            }
            
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('condition', condition);
    formData.append('city', city);
    
    // Добавляем новые изображения
    for (let i = 0; i < newImageFiles.length; i++) {
      formData.append('images', newImageFiles[i]);
    }

            const response = await fetch(`/api/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ Товар успешно обновлен!');
      closeEditProductModal();
      loadMyProducts(); // Обновляем список товаров
    } else {
      throw new Error(data.error || 'Ошибка обновления товара');
    }
  } catch (error) {
    console.error('Error updating product:', error);
    alert(error.message || 'Ошибка обновления товара');
  }
}

// Удаление товара
async function deleteProduct(productId) {
  console.log('Attempting to delete product:', productId);
  
  // Проверяем, что productId передан
  if (!productId) {
    console.error('No productId provided');
    alert('Ошибка: не указан ID товара');
    return;
  }
  
  console.log('Showing custom confirmation dialog...');
  
  // Создаем собственный диалог подтверждения
  const confirmed = await showCustomConfirm('Вы уверены, что хотите удалить этот товар?');
  console.log('Confirmation result:', confirmed);
  
  if (!confirmed) {
    console.log('User cancelled deletion');
    return;
  }

  console.log('Proceeding with deletion...');
  
  try {
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'exists' : 'missing');
    
    if (!token) {
      alert('Ошибка: не найден токен авторизации');
      return;
    }
    
    const url = `/api/products/${productId}`;
    console.log('Making DELETE request to:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      console.log('Product deleted successfully');
      alert('✅ Товар успешно удален!');
      loadMyProducts();
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('Error data:', errorData);
      throw new Error(errorData.message || 'Ошибка удаления товара');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    alert(error.message || 'Ошибка удаления товара');
  }
}

// Собственный диалог подтверждения
function showCustomConfirm(message) {
  return new Promise((resolve) => {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    // Создаем диалог
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    dialog.innerHTML = `
      <h4 style="margin-bottom: 15px;">Подтверждение</h4>
      <p style="margin-bottom: 20px;">${message}</p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="confirm-yes" style="
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">Да, удалить</button>
        <button id="confirm-no" style="
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">Отмена</button>
      </div>
    `;
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    
    // Обработчики кнопок
    document.getElementById('confirm-yes').addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve(true);
    });
    
    document.getElementById('confirm-no').addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve(false);
    });
    
    // Закрытие по клику вне диалога
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        resolve(false);
      }
    });
  });
}

// Настройка загрузки файлов для товаров
function setupProductFileUpload() {
  const productFileInput = document.getElementById('product-images');
  const productUploadBtn = document.getElementById('product-upload-btn');
  const productFileInfo = document.getElementById('product-file-info');
  const productFileName = document.getElementById('product-file-name');
  const productRemoveFileBtn = document.getElementById('product-remove-file');

  if (productUploadBtn) {
    productUploadBtn.addEventListener('click', () => {
      productFileInput.click();
    });
  }

  if (productFileInput) {
    productFileInput.addEventListener('change', handleProductFileSelect);
  }

  if (productRemoveFileBtn) {
    productRemoveFileBtn.addEventListener('click', removeProductFile);
  }
}

// Настройка обработчиков для редактирования товаров
function setupEditProductHandlers() {
  const editProductModal = document.getElementById('edit-product-modal');
  const closeEditProductModalBtn = document.getElementById('close-edit-product-modal');
  const cancelEditProductBtn = document.getElementById('cancel-edit-product');
  const updateProductBtn = document.getElementById('update-product');
  
  if (closeEditProductModalBtn) {
    closeEditProductModalBtn.addEventListener('click', closeEditProductModal);
  }
  
  if (cancelEditProductBtn) {
    cancelEditProductBtn.addEventListener('click', closeEditProductModal);
  }
  
  if (updateProductBtn) {
    updateProductBtn.addEventListener('click', updateProduct);
  }
  
  // Закрытие по клику вне модального окна
  if (editProductModal) {
    editProductModal.addEventListener('click', (e) => {
      if (e.target === editProductModal) {
        closeEditProductModal();
      }
    });
  }
  
  // Настройка загрузки файлов для редактирования товаров
  setupEditProductFileUpload();
}

// Настройка загрузки файлов для редактирования товаров
function setupEditProductFileUpload() {
  const editProductFileInput = document.getElementById('edit-product-images');
  const editProductUploadBtn = document.getElementById('edit-product-upload-btn');
  const editProductFileInfo = document.getElementById('edit-product-file-info');
  const editProductFileName = document.getElementById('edit-product-file-name');
  const editProductRemoveFileBtn = document.getElementById('edit-product-remove-file');

  if (editProductUploadBtn) {
    editProductUploadBtn.addEventListener('click', () => {
      editProductFileInput.click();
    });
  }

  if (editProductFileInput) {
    editProductFileInput.addEventListener('change', handleEditProductFileSelect);
  }

  if (editProductRemoveFileBtn) {
    editProductRemoveFileBtn.addEventListener('click', removeEditProductFile);
  }
}

// Глобальная переменная для хранения выбранных файлов
let selectedProductFiles = [];

// Обработка выбора файлов товаров
function handleProductFileSelect(event) {
  const newFiles = Array.from(event.target.files);
  const fileInfo = document.getElementById('product-file-info');
  const fileName = document.getElementById('product-file-name');
  const previewContainer = document.getElementById('product-images-preview');
  
  if (newFiles.length > 0) {
    // Добавляем новые файлы к существующим
    selectedProductFiles = [...selectedProductFiles, ...newFiles];
    
    // Обновляем input с всеми файлами
    const dt = new DataTransfer();
    selectedProductFiles.forEach(file => dt.items.add(file));
    event.target.files = dt.files;
    
    const fileNames = selectedProductFiles.map(file => file.name).join(', ');
    fileName.textContent = fileNames;
    fileInfo.style.display = 'flex';
    
    // Создаем предварительный просмотр всех изображений
    previewContainer.innerHTML = '';
    previewContainer.style.display = 'grid';
    
    selectedProductFiles.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const previewItem = document.createElement('div');
          previewItem.className = 'image-preview-item';
          previewItem.innerHTML = `
            <img src="${e.target.result}" alt="Предварительный просмотр">
            <button type="button" class="remove-image" onclick="removeProductImage(${index})">&times;</button>
          `;
          previewContainer.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
      }
    });
  } else {
    fileInfo.style.display = 'none';
    previewContainer.style.display = 'none';
  }
}

// Удаление файлов товаров
function removeProductFile() {
  const fileInput = document.getElementById('product-images');
  const fileInfo = document.getElementById('product-file-info');
  const previewContainer = document.getElementById('product-images-preview');
  
  // Очищаем глобальную переменную
  selectedProductFiles = [];
  
  fileInput.value = '';
  fileInfo.style.display = 'none';
  previewContainer.style.display = 'none';
  previewContainer.innerHTML = '';
}

// Удаление отдельного изображения из предварительного просмотра
function removeProductImage(index) {
  const fileInput = document.getElementById('product-images');
  
  // Удаляем файл из глобального массива
  selectedProductFiles.splice(index, 1);
  
  // Создаем новый FileList без удаленного файла
  const dt = new DataTransfer();
  selectedProductFiles.forEach(file => dt.items.add(file));
  fileInput.files = dt.files;
  
  // Обновляем предварительный просмотр
  handleProductFileSelect({ target: fileInput });
}

// Обработка выбора файлов для редактирования товара
function handleEditProductFileSelect(event) {
  const newFiles = Array.from(event.target.files);
  const fileInfo = document.getElementById('edit-product-file-info');
  const fileName = document.getElementById('edit-product-file-name');
  const previewContainer = document.getElementById('edit-product-images-preview');
  
  if (newFiles.length > 0) {
    // Добавляем новые файлы к существующим
    selectedEditProductFiles = [...selectedEditProductFiles, ...newFiles];
    
    // Обновляем input с всеми файлами
    const dt = new DataTransfer();
    selectedEditProductFiles.forEach(file => dt.items.add(file));
    event.target.files = dt.files;
    
    const fileNames = selectedEditProductFiles.map(file => file.name).join(', ');
    fileName.textContent = fileNames;
    fileInfo.style.display = 'flex';
    
    // Создаем предварительный просмотр всех изображений
    previewContainer.innerHTML = '';
    previewContainer.style.display = 'grid';
    
    selectedEditProductFiles.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const previewItem = document.createElement('div');
          previewItem.className = 'image-preview-item';
          previewItem.innerHTML = `
            <img src="${e.target.result}" alt="Предварительный просмотр">
            <button type="button" class="remove-image" onclick="removeEditProductImage(${index})">&times;</button>
          `;
          previewContainer.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
      }
    });
  } else {
    fileInfo.style.display = 'none';
    previewContainer.style.display = 'none';
  }
}

// Удаление отдельного изображения из предварительного просмотра редактирования
function removeEditProductImage(index) {
  const fileInput = document.getElementById('edit-product-images');
  
  // Удаляем файл из глобального массива
  selectedEditProductFiles.splice(index, 1);
  
  // Создаем новый FileList без удаленного файла
  const dt = new DataTransfer();
  selectedEditProductFiles.forEach(file => dt.items.add(file));
  fileInput.files = dt.files;
  
  // Обновляем предварительный просмотр
  handleEditProductFileSelect({ target: fileInput });
}

// Удаление файлов редактирования товара
function removeEditProductFile() {
  const fileInput = document.getElementById('edit-product-images');
  const fileInfo = document.getElementById('edit-product-file-info');
  const previewContainer = document.getElementById('edit-product-images-preview');
  
  // Очищаем глобальную переменную
  selectedEditProductFiles = [];
  
  fileInput.value = '';
  fileInfo.style.display = 'none';
  previewContainer.style.display = 'none';
  previewContainer.innerHTML = '';
}

// Вспомогательная функция для текста состояния
function getConditionText(condition) {
  switch (condition) {
    case 'new': return 'Новое';
    case 'good': return 'Хорошее';
    case 'used': return 'Б/у';
    default: return 'Не указано';
  }
}

// ===== ФУНКЦИИ ДЛЯ УПРАВЛЕНИЯ КОМАНДАМИ =====

// Настройка обработчиков для команд
function setupTeamHandlers() {
  // Обработчик кнопки "Создать команду"
  const createTeamBtn = document.getElementById('create-team-btn');
  if (createTeamBtn) {
    createTeamBtn.addEventListener('click', openTeamModal);
  }

  // Обработчик кнопки "Мои команды"
  const myTeamsBtn = document.getElementById('my-teams-btn');
  if (myTeamsBtn) {
    myTeamsBtn.addEventListener('click', loadMyTeams);
  }

  // Обработчик создания команды
  const submitTeamBtn = document.getElementById('submit-team');
  if (submitTeamBtn) {
    submitTeamBtn.addEventListener('click', createTeam);
  }

  // Обработчики закрытия модальных окон команд
  const closeTeamModalBtn = document.getElementById('close-team-modal');
  const cancelTeamBtn = document.getElementById('cancel-team');
  const closeMyTeamsBtn = document.getElementById('close-my-teams');

  if (closeTeamModalBtn) {
    closeTeamModalBtn.addEventListener('click', closeTeamModal);
  }
  if (cancelTeamBtn) {
    cancelTeamBtn.addEventListener('click', closeTeamModal);
  }
  if (closeMyTeamsBtn) {
    closeMyTeamsBtn.addEventListener('click', closeMyTeamsModal);
  }

  // Закрытие по клику вне модального окна
  document.addEventListener('click', function(e) {
    const teamModal = document.getElementById('team-modal');
    const myTeamsModal = document.getElementById('my-teams-modal');
    
    if (e.target === teamModal) {
      closeTeamModal();
    }
    if (e.target === myTeamsModal) {
      closeMyTeamsModal();
    }
  });

  // Закрытие по клавише Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const teamModal = document.getElementById('team-modal');
      const myTeamsModal = document.getElementById('my-teams-modal');
      const editTeamModal = document.getElementById('edit-team-modal');
      
      if (teamModal && teamModal.classList.contains('show')) {
        closeTeamModal();
      }
      if (myTeamsModal && myTeamsModal.classList.contains('show')) {
        closeMyTeamsModal();
      }
      if (editTeamModal && editTeamModal.classList.contains('show')) {
        closeEditTeamModal();
      }
    }
  });

  // Обработчики для редактирования команд
  const closeEditTeamModalBtn = document.getElementById('close-edit-team-modal');
  const cancelEditTeamBtn = document.getElementById('cancel-edit-team');
  const submitEditTeamBtn = document.getElementById('submit-edit-team');

  if (closeEditTeamModalBtn) {
    closeEditTeamModalBtn.addEventListener('click', closeEditTeamModal);
  }
  if (cancelEditTeamBtn) {
    cancelEditTeamBtn.addEventListener('click', closeEditTeamModal);
  }
  if (submitEditTeamBtn) {
    submitEditTeamBtn.addEventListener('click', updateTeam);
  }

  // Закрытие модального окна редактирования по клику вне его
  document.addEventListener('click', function(e) {
    const editTeamModal = document.getElementById('edit-team-modal');
    if (e.target === editTeamModal) {
      closeEditTeamModal();
    }
  });

  // Настройка загрузки файлов для команд
  setupTeamFileUpload();
  
  // Настройка загрузки файлов для редактирования команд
  setupEditTeamFileUpload();
}

// Открытие модального окна создания команды
function openTeamModal() {
  const modal = document.getElementById('team-modal');
  if (modal) {
    modal.classList.add('show');
    // Очищаем форму
    document.getElementById('team-form').reset();
    // Очищаем информацию о файлах
    document.getElementById('team-logo-file-info').style.display = 'none';
    document.getElementById('team-photo-file-info').style.display = 'none';
  }
}

// Закрытие модального окна создания команды
function closeTeamModal() {
  const modal = document.getElementById('team-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

// Создание команды
async function createTeam() {
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

            const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      
      // Отслеживание создания команды в Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'team_created', {
          team_name: name,
          team_city: city
        });
      }
      
      alert('✅ Команда успешно создана!');
      closeTeamModal();
      // Обновляем список команд
      loadMyTeams();
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка создания команды');
    }
        } catch (error) {
    console.error('Error creating team:', error);
    alert(error.message || 'Ошибка создания команды');
  }
}

// Загрузка команд пользователя
async function loadMyTeams() {
  try {
    const token = localStorage.getItem('token');
            const response = await fetch('/api/teams/user/created', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      allTeams = await response.json();
      displayMyTeams(allTeams);
      openMyTeamsModal();
    } else {
      throw new Error('Ошибка загрузки команд');
    }
  } catch (error) {
    console.error('Error loading teams:', error);
    alert('Ошибка загрузки команд');
  }
}

// Отображение команд пользователя
function displayMyTeams(teams) {
  const teamsList = document.getElementById('my-teams-list');
  
  if (!teams || teams.length === 0) {
    teamsList.innerHTML = '<p class="text-center text-muted">У вас пока нет созданных команд</p>';
    return;
  }

  teamsList.innerHTML = teams.map(team => `
    <div class="tournament-item">
      <div class="tournament-info">
        <h4>${team.name}</h4>
        <p class="tournament-date">${team.city || 'Город не указан'} • ${new Date(team.createdAt).toLocaleDateString('ru-RU')}</p>
        <p class="tournament-description">${team.description || 'Описание отсутствует'}</p>
                        </div>
      <div class="tournament-actions">
        <button class="btn btn-primary btn-sm" onclick="viewTeam('${team.id}')">Просмотр</button>
        <button class="btn btn-secondary btn-sm" onclick="editTeam('${team.id}')">Редактировать</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTeam('${team.id}')">Удалить</button>
                            </div>
                        </div>
  `).join('');
}

// Открытие модального окна моих команд
function openMyTeamsModal() {
  const modal = document.getElementById('my-teams-modal');
  if (modal) {
    modal.classList.add('show');
  }
}

// Закрытие модального окна моих команд
function closeMyTeamsModal() {
  const modal = document.getElementById('my-teams-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

// Просмотр команды
function viewTeam(teamId) {
  // Находим команду в списке
  const team = allTeams.find(t => t.id === teamId);
  if (!team) {
    console.error('Команда не найдена:', teamId);
    return;
  }
  
  // Открываем страницу команды в новой вкладке
  window.open(`../${team.name.replace(/\s+/g, '_')}-team.html`, '_blank');
}

// Редактирование команды
function editTeam(teamId) {
  // Находим команду в списке
  const team = allTeams.find(t => t.id === teamId);
  if (!team) {
    console.error('Команда не найдена:', teamId);
    return;
  }
  
  // Заполняем форму редактирования
  document.getElementById('edit-team-name').value = team.name;
  document.getElementById('edit-team-city').value = team.city || '';
  document.getElementById('edit-team-description').value = team.description || '';
  document.getElementById('edit-team-status').value = team.status || 'recruiting';
  document.getElementById('edit-team-max-members').value = team.maxMembers || 6;
  document.getElementById('edit-team-current-members').value = team.currentMembers || 1;
  document.getElementById('edit-team-achievements').value = team.achievements ? team.achievements.join('\n') : '';
  
  // Показываем текущие изображения
  const currentLogo = document.getElementById('current-team-logo');
  const currentPhoto = document.getElementById('current-team-photo');
  
  if (team.logo) {
    currentLogo.innerHTML = `<img src="../${team.logo}" alt="Текущий логотип" style="max-width:100px;max-height:100px;border-radius:8px;">`;
    currentLogo.style.display = 'block';
        } else {
    currentLogo.style.display = 'none';
  }
  
  if (team.photo) {
    currentPhoto.innerHTML = `<img src="../${team.photo}" alt="Текущее фото" style="max-width:100px;max-height:100px;border-radius:8px;">`;
    currentPhoto.style.display = 'block';
  } else {
    currentPhoto.style.display = 'none';
  }
  
  // Сохраняем ID команды для обновления
  document.getElementById('edit-team-modal').dataset.teamId = teamId;
  
  // Открываем модальное окно редактирования
  openEditTeamModal();
}

// Удаление команды
async function deleteTeam(teamId) {
  console.log('Attempting to delete team:', teamId);
  
  if (!teamId) {
    console.error('No teamId provided');
    alert('Ошибка: не указан ID команды');
    return;
  }
  
  console.log('Showing custom confirmation dialog for team...');
  
  // Используем кастомный диалог подтверждения
  const confirmed = await showCustomConfirm('Вы уверены, что хотите удалить эту команду?');
  console.log('Team confirmation result:', confirmed);
  
  if (!confirmed) {
    console.log('User cancelled team deletion');
    return;
  }

  console.log('Proceeding with team deletion...');
  
  try {
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'exists' : 'missing');
    
    if (!token) {
      alert('Ошибка: не найден токен авторизации');
      return;
    }
    
    const response = await fetch(`/api/teams/${teamId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Team deletion response status:', response.status);
    
    if (response.ok) {
      console.log('Team deleted successfully');
      alert('✅ Команда успешно удалена!');
      loadMyTeams();
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('Error data:', errorData);
      throw new Error(errorData.message || 'Ошибка удаления команды');
    }
  } catch (error) {
    console.error('Error deleting team:', error);
    alert(error.message || 'Ошибка удаления команды');
  }
}

// Настройка загрузки файлов для команд
function setupTeamFileUpload() {
  // Логотип команды
  const teamLogoInput = document.getElementById('team-logo');
  const teamLogoUploadBtn = document.getElementById('team-logo-upload-btn');
  const teamLogoFileInfo = document.getElementById('team-logo-file-info');
  const teamLogoFileName = document.getElementById('team-logo-file-name');
  const teamLogoRemoveFileBtn = document.getElementById('team-logo-remove-file');

  if (teamLogoUploadBtn) {
    teamLogoUploadBtn.addEventListener('click', () => {
      teamLogoInput.click();
    });
  }

  if (teamLogoInput) {
    teamLogoInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        teamLogoFileName.textContent = file.name;
        teamLogoFileInfo.style.display = 'flex';
      } else {
        teamLogoFileInfo.style.display = 'none';
      }
    });
  }

  if (teamLogoRemoveFileBtn) {
    teamLogoRemoveFileBtn.addEventListener('click', () => {
      teamLogoInput.value = '';
      teamLogoFileInfo.style.display = 'none';
    });
  }

  // Фото команды
  const teamPhotoInput = document.getElementById('team-photo');
  const teamPhotoUploadBtn = document.getElementById('team-photo-upload-btn');
  const teamPhotoFileInfo = document.getElementById('team-photo-file-info');
  const teamPhotoFileName = document.getElementById('team-photo-file-name');
  const teamPhotoRemoveFileBtn = document.getElementById('team-photo-remove-file');

  if (teamPhotoUploadBtn) {
    teamPhotoUploadBtn.addEventListener('click', () => {
      teamPhotoInput.click();
    });
  }

  if (teamPhotoInput) {
    teamPhotoInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        teamPhotoFileName.textContent = file.name;
        teamPhotoFileInfo.style.display = 'flex';
      } else {
        teamPhotoFileInfo.style.display = 'none';
      }
    });
  }

  if (teamPhotoRemoveFileBtn) {
    teamPhotoRemoveFileBtn.addEventListener('click', () => {
      teamPhotoInput.value = '';
      teamPhotoFileInfo.style.display = 'none';
    });
  }
}

// Настройка загрузки файлов для редактирования команд
function setupEditTeamFileUpload() {
  // Логотип команды
  const editTeamLogoInput = document.getElementById('edit-team-logo');
  const editTeamLogoUploadBtn = document.getElementById('edit-team-logo-upload-btn');
  const editTeamLogoFileInfo = document.getElementById('edit-team-logo-file-info');
  const editTeamLogoFileName = document.getElementById('edit-team-logo-file-name');
  const editTeamLogoRemoveFileBtn = document.getElementById('edit-team-logo-remove-file');

  if (editTeamLogoUploadBtn) {
    editTeamLogoUploadBtn.addEventListener('click', () => {
      editTeamLogoInput.click();
    });
  }

  if (editTeamLogoInput) {
    editTeamLogoInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        editTeamLogoFileName.textContent = file.name;
        editTeamLogoFileInfo.style.display = 'flex';
      } else {
        editTeamLogoFileInfo.style.display = 'none';
      }
    });
  }

  if (editTeamLogoRemoveFileBtn) {
    editTeamLogoRemoveFileBtn.addEventListener('click', () => {
      editTeamLogoInput.value = '';
      editTeamLogoFileInfo.style.display = 'none';
    });
  }

  // Фото команды
  const editTeamPhotoInput = document.getElementById('edit-team-photo');
  const editTeamPhotoUploadBtn = document.getElementById('edit-team-photo-upload-btn');
  const editTeamPhotoFileInfo = document.getElementById('edit-team-photo-file-info');
  const editTeamPhotoFileName = document.getElementById('edit-team-photo-file-name');
  const editTeamPhotoRemoveFileBtn = document.getElementById('edit-team-photo-remove-file');

  if (editTeamPhotoUploadBtn) {
    editTeamPhotoUploadBtn.addEventListener('click', () => {
      editTeamPhotoInput.click();
    });
  }

  if (editTeamPhotoInput) {
    editTeamPhotoInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        editTeamPhotoFileName.textContent = file.name;
        editTeamPhotoFileInfo.style.display = 'flex';
      } else {
        editTeamPhotoFileInfo.style.display = 'none';
      }
    });
  }

  if (editTeamPhotoRemoveFileBtn) {
    editTeamPhotoRemoveFileBtn.addEventListener('click', () => {
      editTeamPhotoInput.value = '';
      editTeamPhotoFileInfo.style.display = 'none';
    });
  }
}

// Функции для редактирования команд
function openEditTeamModal() {
  const modal = document.getElementById('edit-team-modal');
  if (modal) {
    modal.classList.add('show');
  }
}

function closeEditTeamModal() {
  const modal = document.getElementById('edit-team-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

// Обновление команды
async function updateTeam() {
  const teamId = document.getElementById('edit-team-modal').dataset.teamId;
  if (!teamId) {
    alert('Ошибка: ID команды не найден');
    return;
  }

  const formData = new FormData();
  
  // Основные данные команды
  formData.append('name', document.getElementById('edit-team-name').value);
  formData.append('city', document.getElementById('edit-team-city').value);
  formData.append('description', document.getElementById('edit-team-description').value);
  formData.append('status', document.getElementById('edit-team-status').value);
  formData.append('maxMembers', document.getElementById('edit-team-max-members').value);
  formData.append('currentMembers', document.getElementById('edit-team-current-members').value);
  
  // Достижения
  const achievementsText = document.getElementById('edit-team-achievements').value;
  const achievements = achievementsText.split('\n').filter(line => line.trim() !== '');
  formData.append('achievements', JSON.stringify(achievements));
  
  // Файлы
  const logoFile = document.getElementById('edit-team-logo').files[0];
  const photoFile = document.getElementById('edit-team-photo').files[0];
  
  if (logoFile) {
    formData.append('logo', logoFile);
  }
  
  if (photoFile) {
    formData.append('photo', photoFile);
  }

  try {
    const token = localStorage.getItem('token');
            const response = await fetch(`/api/teams/${teamId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.ok) {
      alert('✅ Команда успешно обновлена!');
      closeEditTeamModal();
      loadMyTeams(); // Перезагружаем список команд
} else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка обновления команды');
    }
  } catch (error) {
    console.error('Error updating team:', error);
    alert(error.message || 'Ошибка обновления команды');
  }
}

// Функции для работы с заявками на вступление в команды

// Настройка обработчиков для заявок
function setupApplicationHandlers() {
  // Обработчик кнопки "Заявки в мои команды"
  const teamApplicationsBtn = document.getElementById('team-applications-btn');
  if (teamApplicationsBtn) {
    teamApplicationsBtn.addEventListener('click', loadTeamApplications);
  }

  // Обработчик кнопки "Мои заявки"
  const myApplicationsBtn = document.getElementById('my-applications-btn');
  if (myApplicationsBtn) {
    myApplicationsBtn.addEventListener('click', loadMyApplications);
  }

  // Обработчики закрытия модальных окон заявок
  const closeTeamApplicationsBtn = document.getElementById('close-team-applications');
  if (closeTeamApplicationsBtn) {
    closeTeamApplicationsBtn.addEventListener('click', closeTeamApplicationsModal);
  }

  const closeMyApplicationsBtn = document.getElementById('close-my-applications');
  if (closeMyApplicationsBtn) {
    closeMyApplicationsBtn.addEventListener('click', closeMyApplicationsModal);
  }
}

// Загрузка заявок в мои команды
async function loadTeamApplications() {
  try {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    console.log('Token:', token ? 'exists' : 'missing');
    console.log('UserId:', userId);
    
    if (!token) {
      alert('Необходимо войти в аккаунт');
      return;
    }
    
    if (!userId) {
      alert('Ошибка: ID пользователя не найден. Попробуйте перезагрузить страницу.');
      return;
    }
    
            const teams = await fetch('/api/teams', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json());

    const myTeams = teams.filter(team => team.createdBy === userId);
    
    console.log('Все команды:', teams.length);
    console.log('Мои команды:', myTeams.length);
    
    if (myTeams.length === 0) {
      alert('У вас нет команд для просмотра заявок');
      return;
    }

    const allApplications = [];
    
    for (const team of myTeams) {
      try {
        const response = await fetch(`/api/teams/${team.id}/applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const applications = await response.json();
          applications.forEach(app => {
            app.teamName = team.name;
            app.teamId = team.id;
          });
          allApplications.push(...applications);
        }
      } catch (error) {
        console.error(`Error loading applications for team ${team.id}:`, error);
      }
    }

    displayTeamApplications(allApplications);
    openTeamApplicationsModal();
  } catch (error) {
    console.error('Error loading team applications:', error);
    alert('Ошибка загрузки заявок');
  }
}

// Отображение заявок в мои команды
function displayTeamApplications(applications) {
  const container = document.getElementById('team-applications-list');
  
  if (!applications || applications.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-inbox"></i>
        <h4>Нет заявок</h4>
        <p>Пока нет заявок на вступление в ваши команды</p>
      </div>
    `;
    return;
  }

  container.innerHTML = applications.map(application => `
    <div class="tournament-item">
      <div class="tournament-item-header">
        <h4 class="tournament-item-title">${application.userName}</h4>
        <span class="tournament-item-status status-${application.status}">
          ${getApplicationStatusText(application.status)}
        </span>
      </div>
      <div class="tournament-item-info">
        <div><strong>Команда:</strong> ${application.teamName}</div>
        <div><strong>Email:</strong> ${application.userEmail}</div>
        <div><strong>Дата подачи:</strong> ${new Date(application.createdAt).toLocaleDateString('ru-RU')}</div>
      </div>
      ${application.message ? `
        <div style="margin-bottom: 16px;">
          <strong>Сообщение:</strong>
          <p style="margin-top: 8px; color: #666; font-style: italic;">${application.message}</p>
        </div>
      ` : ''}
      ${application.status === 'pending' ? `
        <div class="tournament-item-actions">
          <button class="btn btn-sm btn-success" onclick="approveApplication('${application.id}')">
            ✅ Принять
          </button>
          <button class="btn btn-sm btn-danger" onclick="rejectApplication('${application.id}')">
            ❌ Отклонить
          </button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

// Загрузка моих заявок
async function loadMyApplications() {
  try {
    const token = localStorage.getItem('token');
            const response = await fetch('/api/applications/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const applications = await response.json();
      await displayMyApplications(applications);
      openMyApplicationsModal();
    } else {
      throw new Error('Ошибка загрузки заявок');
    }
  } catch (error) {
    console.error('Error loading my applications:', error);
    alert('Ошибка загрузки заявок');
  }
}

// Отображение моих заявок
async function displayMyApplications(applications) {
  const container = document.getElementById('my-applications-list');
  
  if (!applications || applications.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-inbox"></i>
        <h4>Нет заявок</h4>
        <p>Вы пока не подавали заявки на вступление в команды</p>
      </div>
    `;
    return;
  }

  // Получаем информацию о командах
  try {
            const teamsResponse = await fetch('/api/teams');
    const teams = await teamsResponse.json();
    
    container.innerHTML = applications.map(application => {
      const team = teams.find(t => t.id === application.teamId);
      const teamName = team ? team.name : 'Неизвестная команда';
      
      return `
        <div class="tournament-item">
          <div class="tournament-item-header">
            <h4 class="tournament-item-title">Заявка в команду "${teamName}"</h4>
            <span class="tournament-item-status status-${application.status}">
              ${getApplicationStatusText(application.status)}
            </span>
          </div>
          <div class="tournament-item-info">
            <div><strong>Дата подачи:</strong> ${new Date(application.createdAt).toLocaleDateString('ru-RU')}</div>
            ${application.processedAt ? `
              <div><strong>Обработана:</strong> ${new Date(application.processedAt).toLocaleDateString('ru-RU')}</div>
            ` : ''}
          </div>
          ${application.message ? `
            <div style="margin-bottom: 16px;">
              <strong>Ваше сообщение:</strong>
              <p style="margin-top: 8px; color: #666; font-style: italic;">${application.message}</p>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading teams:', error);
    // Fallback если не удалось загрузить команды
    container.innerHTML = applications.map(application => `
      <div class="tournament-item">
        <div class="tournament-item-header">
          <h4 class="tournament-item-title">Заявка в команду</h4>
          <span class="tournament-item-status status-${application.status}">
            ${getApplicationStatusText(application.status)}
          </span>
        </div>
        <div class="tournament-item-info">
          <div><strong>Дата подачи:</strong> ${new Date(application.createdAt).toLocaleDateString('ru-RU')}</div>
          ${application.processedAt ? `
            <div><strong>Обработана:</strong> ${new Date(application.processedAt).toLocaleDateString('ru-RU')}</div>
          ` : ''}
        </div>
        ${application.message ? `
          <div style="margin-bottom: 16px;">
            <strong>Ваше сообщение:</strong>
            <p style="margin-top: 8px; color: #666; font-style: italic;">${application.message}</p>
          </div>
        ` : ''}
      </div>
    `).join('');
  }
}

// Принятие заявки
async function approveApplication(applicationId) {
  console.log('Attempting to approve application:', applicationId);
  
  if (!applicationId) {
    console.error('No applicationId provided');
    alert('Ошибка: не указан ID заявки');
    return;
  }
  
  console.log('Showing custom confirmation dialog for approval...');
  
  // Используем кастомный диалог подтверждения
  const confirmed = await showCustomConfirm('Вы уверены, что хотите принять эту заявку?');
  console.log('Approval confirmation result:', confirmed);
  
  if (!confirmed) {
    console.log('User cancelled approval');
    return;
  }

  console.log('Proceeding with application approval...');
  
  try {
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'exists' : 'missing');
    
    if (!token) {
      alert('Ошибка: не найден токен авторизации');
      return;
    }
    
    const response = await fetch(`/api/applications/${applicationId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Approval response status:', response.status);
    
    if (response.ok) {
      console.log('Application approved successfully');
      // Отслеживание принятия заявки в Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'application_approved', {
          application_id: applicationId
        });
      }
      alert('✅ Заявка принята!');
      loadTeamApplications(); // Перезагружаем список
    } else {
      const errorData = await response.json();
      console.log('Error data:', errorData);
      throw new Error(errorData.error || 'Ошибка принятия заявки');
    }
  } catch (error) {
    console.error('Error approving application:', error);
    alert(error.message || 'Ошибка принятия заявки');
  }
}

// Отклонение заявки
async function rejectApplication(applicationId) {
  console.log('Attempting to reject application:', applicationId);
  
  if (!applicationId) {
    console.error('No applicationId provided');
    alert('Ошибка: не указан ID заявки');
    return;
  }
  
  console.log('Showing custom confirmation dialog for rejection...');
  
  // Используем кастомный диалог подтверждения
  const confirmed = await showCustomConfirm('Вы уверены, что хотите отклонить эту заявку?');
  console.log('Rejection confirmation result:', confirmed);
  
  if (!confirmed) {
    console.log('User cancelled rejection');
    return;
  }

  console.log('Proceeding with application rejection...');
  
  try {
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'exists' : 'missing');
    
    if (!token) {
      alert('Ошибка: не найден токен авторизации');
      return;
    }
    
    const response = await fetch(`/api/applications/${applicationId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Rejection response status:', response.status);
    
    if (response.ok) {
      console.log('Application rejected successfully');
      // Отслеживание отклонения заявки в Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'application_rejected', {
          application_id: applicationId
        });
      }
      alert('❌ Заявка отклонена');
      loadTeamApplications(); // Перезагружаем список
    } else {
      const errorData = await response.json();
      console.log('Error data:', errorData);
      throw new Error(errorData.error || 'Ошибка отклонения заявки');
    }
  } catch (error) {
    console.error('Error rejecting application:', error);
    alert(error.message || 'Ошибка отклонения заявки');
  }
}

// Получение текста статуса заявки
function getApplicationStatusText(status) {
  switch (status) {
    case 'pending':
      return 'Ожидает рассмотрения';
    case 'approved':
      return 'Принята';
    case 'rejected':
      return 'Отклонена';
    default:
      return 'Неизвестно';
  }
}

// Открытие модального окна заявок в мои команды
function openTeamApplicationsModal() {
  const modal = document.getElementById('team-applications-modal');
  if (modal) {
    modal.classList.add('show');
  }
}

// Закрытие модального окна заявок в мои команды
function closeTeamApplicationsModal() {
  const modal = document.getElementById('team-applications-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

// Открытие модального окна моих заявок
function openMyApplicationsModal() {
  const modal = document.getElementById('my-applications-modal');
  if (modal) {
    modal.classList.add('show');
  }
}

// Закрытие модального окна моих заявок
function closeMyApplicationsModal() {
  const modal = document.getElementById('my-applications-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

// Добавляем обработчики заявок в основную функцию
document.addEventListener('DOMContentLoaded', function() {
  // ... существующий код ...
  
  // Настройка обработчиков для заявок
  setupApplicationHandlers();
});

