// Chat.js - Система чатов

// Глобальные переменные
let allChats = [];
let currentChatMessages = [];
let currentUser = null;
let currentChatUser = null;

// Инициализация чата после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Настройка обработчиков чата
    setupChatHandlers();
    
    // Добавление кнопки чата в навбар
    addChatButtonToNavbar();
});

// Загрузка информации о текущем пользователе
async function loadCurrentUser() {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            // Имитируем данные пользователя
            currentUser = {
                id: 'demo-user-1',
                firstName: 'Демо',
                lastName: 'Пользователь',
                email: localStorage.getItem('email') || 'demo@example.com'
            };
        }
    } catch (error) {
        console.error('Error loading current user:', error);
    }
}

// Настройка обработчиков чата
function setupChatHandlers() {
    // Проверяем, есть ли элементы чата на странице
    const chatModal = document.getElementById('chat-modal');
    const chatList = document.getElementById('chat-list');
    
    if (!chatModal || !chatList) {
        console.log('Элементы чата не найдены на этой странице');
        return;
    }

    // Кнопка открытия чата
    const chatBtn = document.getElementById('chat-btn');
    if (chatBtn) {
        chatBtn.addEventListener('click', openChatModal);
    }

    // Кнопка закрытия чата
    const closeChatBtn = document.getElementById('close-chat-modal');
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', closeChatModal);
    }

    // Кнопка "Назад к чатам"
    const backToChatsBtn = document.getElementById('back-to-chats');
    if (backToChatsBtn) {
        backToChatsBtn.addEventListener('click', showChatList);
    }

    // Кнопка отправки сообщения
    const sendMessageBtn = document.getElementById('send-message-btn');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }

    // Поле ввода сообщения
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Кнопка прикрепления файла
    const attachFileBtn = document.getElementById('attach-file-btn');
    const chatFileInput = document.getElementById('chat-file-input');
    if (attachFileBtn && chatFileInput) {
        attachFileBtn.addEventListener('click', () => chatFileInput.click());
        chatFileInput.addEventListener('change', handleFileUpload);
    }

    // Закрытие по клику вне модального окна
    document.addEventListener('click', function(e) {
        if (e.target === chatModal) {
            closeChatModal();
        }
    });

    // Закрытие по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (chatModal && chatModal.classList.contains('show')) {
                closeChatModal();
            }
        }
    });
}

// Открытие модального окна чата
async function openChatModal() {
    const modal = document.getElementById('chat-modal');
    const chatList = document.getElementById('chat-list');
    
    if (modal && chatList) {
        modal.classList.add('show');
        await loadCurrentUser(); // Убеждаемся, что currentUser загружен
        loadChats();
    } else {
        console.log('Элементы чата не найдены на этой странице');
    }
}

// Закрытие модального окна чата
function closeChatModal() {
    const modal = document.getElementById('chat-modal');
    if (modal) {
        modal.classList.remove('show');
        showChatList();
    }
}

// Загрузка списка чатов
async function loadChats() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Проверяем, что элементы чата существуют
        const chatList = document.getElementById('chat-list');
        if (!chatList) {
            console.log('Элементы чата не найдены на этой странице');
            return;
        }

        // Пустой массив чатов
        allChats = [];
        
        await displayChats();
    } catch (error) {
        console.error('Error loading chats:', error);
    }
}

// Отображение списка чатов
async function displayChats() {
    const chatList = document.getElementById('chat-list');
    if (!chatList) return;

    if (!allChats || allChats.length === 0) {
        chatList.innerHTML = '<div class="no-chats">Нет активных чатов</div>';
        return;
    }

    // Имитируем данные пользователей
    const users = [
        { id: 'user_1', firstName: 'Алексей', lastName: 'Петров', email: 'alex@example.com' },
        { id: 'user_2', firstName: 'Мария', lastName: 'Иванова', email: 'maria@example.com' }
    ];
    
    chatList.innerHTML = allChats.map(chat => {
        // Находим пользователя по ID
        const user = users.find(u => u.id === chat.userId);
        const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : chat.userEmail;
        const avatarText = user ? (user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()) : chat.userEmail.charAt(0).toUpperCase();
        
        let productInfo = '';
        let productInfoData = null;
        if (chat.productInfo) {
            productInfo = `
                <div class="chat-product-info">
                    <small>💬 О товаре: ${chat.productInfo.title} (${chat.productInfo.price}₸)</small>
                </div>
            `;
            productInfoData = chat.productInfo;
        }
        
        return `
            <div class="chat-item" onclick="openChat('${chat.userId}', '${displayName}', ${JSON.stringify(productInfoData).replace(/"/g, '&quot;')})">
                <div class="chat-avatar">
                    ${avatarText}
                </div>
                <div class="chat-info">
                    <div class="chat-name">${displayName}</div>
                    <div class="chat-last-message">${chat.lastMessage || 'Нет сообщений'}</div>
                    ${productInfo}
                </div>
            </div>
        `;
    }).join('');
}

// Открытие чата с конкретным пользователем
async function openChat(userId, userName, productInfo = null) {
    // Если productInfo передана как строка, парсим её
    if (typeof productInfo === 'string' && productInfo !== 'null') {
        try {
            productInfo = JSON.parse(productInfo);
        } catch (e) {
            productInfo = null;
        }
    }
    
    currentChatUser = { id: userId, name: userName, productInfo: productInfo };
    
    // Показываем интерфейс сообщений
    document.getElementById('chat-list').style.display = 'none';
    document.getElementById('chat-messages').style.display = 'flex';
    document.getElementById('current-chat-user').textContent = userName;
    
    // Загружаем сообщения
    await loadChatMessages(userId);
}

// Загрузка сообщений чата
async function loadChatMessages(userId) {
    try {
        // Загружаем сообщения из локального хранилища
        const chatKey = `chat_${userId}`;
        currentChatMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
        
        // Если сообщений нет, добавляем демо-сообщения
        if (currentChatMessages.length === 0) {
            currentChatMessages = [
                {
                    id: 1,
                    text: 'Привет! Интересует ваш товар',
                    senderId: userId,
                    receiverId: 'demo-user-1',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    type: 'text'
                },
                {
                    id: 2,
                    text: 'Здравствуйте! Конечно, расскажу подробнее',
                    senderId: 'demo-user-1',
                    receiverId: userId,
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    type: 'text'
                }
            ];
            localStorage.setItem(chatKey, JSON.stringify(currentChatMessages));
        }
        
        displayMessages();
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Отображение сообщений
function displayMessages() {
    const messagesContainer = document.getElementById('messages-container');
    if (!messagesContainer) return;

    console.log('Current user:', currentUser);
    console.log('Current chat messages:', currentChatMessages);

    messagesContainer.innerHTML = currentChatMessages.map(message => {
        const isSent = message.senderId === currentUser.id;
        console.log(`Message ${message.id}: senderId=${message.senderId}, currentUser.id=${currentUser.id}, isSent=${isSent}`);
        
        const messageTime = new Date(message.timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let content = '';
        if (message.image) {
            content = `<img src="../${message.image}" alt="Изображение" class="message-image" onclick="openImageModal('${message.image}')">`;
        } else {
            content = `<div class="message-content">${message.text}</div>`;
        }

        return `
            <div class="message ${isSent ? 'sent' : 'received'}">
                ${content}
                <div class="message-time">${messageTime}</div>
            </div>
        `;
    }).join('');

    // Прокручиваем к последнему сообщению
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Отправка сообщения
async function sendMessage() {
    if (!currentChatUser) return;

    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message) return;

    try {
        // Имитируем отправку сообщения без API
        const newMessage = {
            id: Date.now(),
            text: message,
            senderId: currentUser?.id || 'demo-user-1',
            receiverId: currentChatUser.id,
            timestamp: new Date().toISOString(),
            type: 'text'
        };
        
        // Добавляем сообщение в локальное хранилище
        const chatKey = `chat_${currentChatUser.id}`;
        const existingMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
        existingMessages.push(newMessage);
        localStorage.setItem(chatKey, JSON.stringify(existingMessages));
        
        messageInput.value = '';
        // Перезагружаем сообщения
        await loadChatMessages(currentChatUser.id);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Обработка загрузки файла
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file || !currentChatUser) return;

    try {
        // Имитируем отправку изображения без API
        const reader = new FileReader();
        reader.onload = function(e) {
            const newMessage = {
                id: Date.now(),
                image: e.target.result,
                senderId: currentUser?.id || 'demo-user-1',
                receiverId: currentChatUser.id,
                timestamp: new Date().toISOString(),
                type: 'image'
            };
            
            // Добавляем сообщение в локальное хранилище
            const chatKey = `chat_${currentChatUser.id}`;
            const existingMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
            existingMessages.push(newMessage);
            localStorage.setItem(chatKey, JSON.stringify(existingMessages));
            
            // Перезагружаем сообщения
            loadChatMessages(currentChatUser.id);
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error sending image:', error);
    }

    // Очищаем input
    event.target.value = '';
}

// Показать список чатов
function showChatList() {
    document.getElementById('chat-list').style.display = 'block';
    document.getElementById('chat-messages').style.display = 'none';
    currentChatUser = null;
}

// Открытие изображения в модальном окне
function openImageModal(imagePath) {
    // Создаем модальное окно для просмотра изображения
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20000;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = `../${imagePath}`;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
    `;
    
    modal.appendChild(img);
    document.body.appendChild(modal);
    
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Функция для добавления кнопки чата на другие страницы
function addChatButtonToNavbar() {
    const navbarRight = document.querySelector('.navbar-right');
    if (navbarRight && !document.getElementById('chat-btn')) {
        const chatBtn = document.createElement('button');
        chatBtn.id = 'chat-btn';
        chatBtn.className = 'chat-btn';
        chatBtn.title = 'Сообщения';
        chatBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#141414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        chatBtn.addEventListener('click', openChatModal);
        
        // Вставляем перед auth-buttons
        const authButtons = navbarRight.querySelector('.auth-buttons');
        if (authButtons) {
            navbarRight.insertBefore(chatBtn, authButtons);
        } else {
            navbarRight.appendChild(chatBtn);
        }
    }
}

// Добавляем кнопку чата на все страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addChatButtonToNavbar);
} else {
    addChatButtonToNavbar();
} 