// Confirm Email JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Получаем токен из URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const email = urlParams.get('email');
  
  if (!token) {
    showError('Токен подтверждения не найден');
    return;
  }
  
  // Имитируем проверку токена
  setTimeout(() => {
    // В реальной системе здесь была бы проверка токена на сервере
    if (token && email) {
      // Сохраняем подтвержденный email
      localStorage.setItem('confirmedEmail', email);
      localStorage.setItem('emailConfirmed', 'true');
      
      showSuccess();
    } else {
      showError('Неверный токен подтверждения');
    }
  }, 2000); // Имитируем задержку проверки
});

function showSuccess() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('success').style.display = 'block';
}

function showError(message) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error').style.display = 'block';
  document.getElementById('error-message').textContent = message;
} 