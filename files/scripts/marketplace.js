// Глобальные переменные
let allProducts = [];
let filteredProducts = [];


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  console.log('Marketplace.js загружен');
  
  // Загружаем данные
  loadProducts();
  loadCart();
  setupEventListeners();
  renderAuthButtons();
  
  // Добавляем отступ для фильтров на мобильных устройствах
  function addMobileFilterSpacing() {
    if (window.innerWidth <= 768) {
      const searchSection = document.querySelector('.search-section');
      const filtersPanel = document.getElementById('filters-panel');
      
      if (searchSection) {
        searchSection.style.marginBottom = '25px';
      }
      
      if (filtersPanel) {
        filtersPanel.style.marginTop = '25px';
        filtersPanel.style.paddingTop = '15px';
      }
    }
  }
  
  addMobileFilterSpacing();
  
  // Обновляем отступ при изменении размера окна
  window.addEventListener('resize', addMobileFilterSpacing);
  
  // Проверяем параметры URL для автоматического открытия чата
  const urlParams = new URLSearchParams(window.location.search);
  const openChat = urlParams.get('openChat');
  const sellerId = urlParams.get('sellerId');
  const productId = urlParams.get('productId');
  const productTitle = urlParams.get('productTitle');
  const productPrice = urlParams.get('productPrice');
  const sellerName = urlParams.get('sellerName');
  
  // Отладочная информация
  console.log('Marketplace URL params:', {
    openChat,
    sellerId,
    productId,
    productTitle,
    productPrice,
    sellerName
  });
  
  // Если нужно открыть чат, делаем это после загрузки страницы
  if (openChat === 'true' && sellerId) {
    console.log('Attempting to open chat with seller:', sellerId);
    setTimeout(async () => {
      console.log('Checking if openChatModal exists:', typeof window.openChatModal);
      if (window.openChatModal) {
        console.log('Opening chat modal...');
        window.openChatModal();
        setTimeout(async () => {
          console.log('Checking if openChat exists:', typeof window.openChat);
          if (window.openChat) {
            // Используем переданное имя продавца или получаем данные с сервера
            let finalSellerName = sellerName || 'Продавец';
            
            if (!sellerName) {
              try {
                const response = await fetch(`/api/users/${sellerId}`);
                if (response.ok) {
                  const seller = await response.json();
                  finalSellerName = `${seller.firstName} ${seller.lastName}`;
                }
              } catch (error) {
                console.error('Error loading seller data:', error);
              }
            }
            
            window.openChat(sellerId, finalSellerName, JSON.stringify({
              id: productId,
              title: productTitle,
              price: productPrice
            }));
          }
        }, 100);
      }
    }, 500);
  }
  

});

// Настройка обработчиков событий
function setupEventListeners() {
  // Поиск
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(filterProducts, 300));
  }
  
  // Фильтры
  const filtersToggle = document.getElementById('filters-toggle');
  const filtersPanel = document.getElementById('filters-panel');
  if (filtersToggle && filtersPanel) {
    filtersToggle.addEventListener('click', () => {
      filtersPanel.classList.toggle('show');
    });
  }
  
  // Фильтры
  const categoryFilter = document.getElementById('category-filter');
  const conditionFilter = document.getElementById('condition-filter');
  const priceFromFilter = document.getElementById('price-from');
  const priceToFilter = document.getElementById('price-to');
  const clearFiltersBtn = document.getElementById('clear-filters');
  
  if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
  if (conditionFilter) conditionFilter.addEventListener('change', filterProducts);
  if (priceFromFilter) priceFromFilter.addEventListener('input', debounce(filterProducts, 300));
  if (priceToFilter) priceToFilter.addEventListener('input', debounce(filterProducts, 300));
  if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);
  
  // Корзина
  const cartIcon = document.getElementById('cart-icon');
  const cartModal = document.getElementById('cart-modal');
  const closeCartBtn = document.getElementById('close-cart');
  const checkoutBtn = document.getElementById('checkout-btn');
  
  if (cartIcon) cartIcon.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
  
  // Закрытие модальных окон по клику вне их
  document.addEventListener('click', (e) => {
    if (e.target === cartModal) closeCart();
  });
}

// Загрузка товаров
async function loadProducts() {
  try {
    console.log('Loading products...');
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Ошибка загрузки товаров');
    
    allProducts = await response.json();
    console.log('Loaded products:', allProducts);
    filteredProducts = [...allProducts];
    renderProducts();
  } catch (error) {
    console.error('Error loading products:', error);
    document.getElementById('products-grid').innerHTML = 
      '<div class="loading"><p>Ошибка загрузки товаров</p></div>';
  }
}

// Отображение товаров
function renderProducts() {
  const grid = document.getElementById('products-grid');
  console.log('Rendering products:', filteredProducts.length);
  
  if (filteredProducts.length === 0) {
    grid.innerHTML = '<div class="loading"><p>Товары не найдены</p></div>';
    return;
  }
  
  const productsHTML = filteredProducts.map(product => `
    <div class="product-card" onclick="openProductPage('${product.id}')" style="cursor: pointer;">
      <img src="${product.images && product.images.length > 0 ? product.images[0] : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}" 
           class="product-image" alt="${product.title}">
      <div class="product-info">
        <h5 class="product-title">${product.title}</h5>
        <p class="product-description">${product.description}</p>
        <div class="product-price">${product.price}₸</div>
        <div class="product-meta">
          <span class="product-condition condition-${product.condition}">${getConditionText(product.condition)}</span>
          <span>${product.city || 'Не указан'}</span>
        </div>
      </div>

    </div>
  `).join('');
  
  console.log('Products HTML generated');
  grid.innerHTML = productsHTML;
}

// Фильтрация товаров
function filterProducts() {
  const searchQuery = document.getElementById('search-input').value.toLowerCase();
  const category = document.getElementById('category-filter').value;
  const condition = document.getElementById('condition-filter').value;
  const priceFrom = parseFloat(document.getElementById('price-from').value) || 0;
  const priceTo = parseFloat(document.getElementById('price-to').value) || Infinity;
  
  filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery) || 
                         product.description.toLowerCase().includes(searchQuery);
    const matchesCategory = !category || product.category === category;
    const matchesCondition = !condition || product.condition === condition;
    const matchesPrice = product.price >= priceFrom && product.price <= priceTo;
    
    return matchesSearch && matchesCategory && matchesCondition && matchesPrice;
  });
  
  renderProducts();
}

// Очистка фильтров
function clearFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('category-filter').value = '';
  document.getElementById('condition-filter').value = '';
  document.getElementById('price-from').value = '';
  document.getElementById('price-to').value = '';
  
  filteredProducts = [...allProducts];
  renderProducts();
}

// Открытие страницы товара
function openProductPage(productId) {
  console.log('Opening product page:', productId);
  const url = `/products/${productId}.html`;
  console.log('Product URL:', url);
  // Открываем в том же окне вместо всплывающего
  window.location.href = url;
}

// Открытие чата с продавцом
function openChatWithSeller(sellerId, productTitle, productPrice, sellerName) {
  console.log('Opening chat with seller:', sellerId, productTitle, productPrice, sellerName);
  
  // Проверяем, есть ли токен пользователя
  const token = getToken();
  if (!token) {
    alert('Войдите для отправки сообщений продавцу');
    return;
  }
  
  // Открываем чат через URL параметры
  const chatUrl = `marketplace.html?openChat=true&sellerId=${sellerId}&productTitle=${encodeURIComponent(productTitle)}&productPrice=${encodeURIComponent(productPrice)}&sellerName=${encodeURIComponent(sellerName || 'Продавец')}`;
  window.location.href = chatUrl;
}

// Корзина
async function loadCart() {
  const token = getToken();
  if (!token) {
    updateCartBadge(0);
    return;
  }
  
  try {
    const response = await fetch('/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const cart = await response.json();
      updateCartBadge(cart.items.length);
    } else {
      updateCartBadge(0);
    }
  } catch (error) {
    console.error('Error loading cart:', error);
    updateCartBadge(0);
  }
}

function updateCartBadge(count) {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

async function addToCart(productId) {
  const token = getToken();
  if (!token) {
    alert('Войдите для добавления товаров в корзину');
    return;
  }
  
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });
    
    if (response.ok) {
      loadCart();
      alert('Товар добавлен в корзину!');
    } else {
      throw new Error('Ошибка добавления в корзину');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('Ошибка добавления в корзину');
  }
}

function openCart() {
  const token = getToken();
  if (!token) {
    alert('Войдите для просмотра корзины');
    return;
  }
  
  loadCartItems();
  document.getElementById('cart-modal').classList.add('show');
}

function closeCart() {
  document.getElementById('cart-modal').classList.remove('show');
}

async function loadCartItems() {
  const token = getToken();
  if (!token) return;
  
  try {
    const response = await fetch('/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const cart = await response.json();
      renderCartItems(cart.items);
    }
  } catch (error) {
    console.error('Error loading cart items:', error);
  }
}

function renderCartItems(items) {
  const cartBody = document.getElementById('cart-body');
  
  if (!items || items.length === 0) {
    cartBody.innerHTML = '<p class="text-center text-muted">Корзина пуста</p>';
    return;
  }
  
  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  cartBody.innerHTML = `
    ${items.map(item => `
      <div class="cart-item">
        <img src="${item.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iMzAiIHk9IjMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}" 
             class="cart-item-image" alt="${item.title}">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${item.price}₸</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateCartItemQty('${item.id}', ${item.qty - 1})">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateCartItemQty('${item.id}', ${item.qty + 1})">+</button>
        </div>
        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `).join('')}
    <div class="cart-total">
              <div class="cart-total-price">Итого: ${total}₸</div>
    </div>
  `;
}

async function updateCartItemQty(productId, qty) {
  const token = getToken();
  if (!token) return;
  
  try {
    const response = await fetch(`/api/cart/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ qty })
    });
    
    if (response.ok) {
      loadCartItems();
      loadCart();
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
  }
}

async function removeFromCart(productId) {
  const token = getToken();
  if (!token) return;
  
  try {
    const response = await fetch(`/api/cart/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      loadCartItems();
      loadCart();
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
  }
}

async function checkout() {
  const token = getToken();
  if (!token) {
    alert('Войдите для оформления покупки');
    return;
  }
  
  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      alert('Покупка оформлена!');
      closeCart();
      loadCart();
    } else {
      throw new Error('Ошибка оформления покупки');
    }
  } catch (error) {
    console.error('Error checkout:', error);
    alert('Ошибка оформления покупки');
  }
}



// Управление кнопками авторизации
function renderAuthButtons() {
  const authButtons = document.getElementById('auth-buttons');
  if (!authButtons) return;
  
  const token = getToken();
  if (!token) {
    authButtons.innerHTML = '<a href="login.html" class="auth-btn auth-btn-primary">Войти</a>';
  } else {
    authButtons.innerHTML = `
      <a href="cabinet.html" class="auth-btn auth-btn-secondary">Личный кабинет</a>
      <button class="auth-btn auth-btn-primary" id="logout-btn">Выйти</button>
    `;
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = function() {
        localStorage.removeItem('token');
        window.location.reload();
      };
    }
  }
}

// Вспомогательные функции
function getToken() {
  return localStorage.getItem('token');
}

function getConditionText(condition) {
  switch (condition) {
    case 'new': return 'Новое';
    case 'good': return 'Хорошее';
    case 'used': return 'Б/у';
    default: return 'Не указано';
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Автообновление чата удалено - теперь используется общий чат в навбаре