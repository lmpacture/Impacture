document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile nav script loaded');
    
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');

    console.log('Elements found:', {
        mobileMenuBtn: !!mobileMenuBtn,
        mobileNav: !!mobileNav,
        mobileCloseBtn: !!mobileCloseBtn
    });

    if (mobileMenuBtn && mobileNav) {
        console.log('Adding event listeners');
        
        // Простой обработчик клика
        mobileMenuBtn.onclick = function() {
            console.log('Mobile menu button clicked');
            
            if (mobileNav.classList.contains('active')) {
                console.log('Closing menu');
                mobileNav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                console.log('Opening menu');
                mobileNav.classList.add('active');
                mobileMenuBtn.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        };

        // Обработчик кнопки закрытия
        if (mobileCloseBtn) {
            mobileCloseBtn.onclick = function() {
                console.log('Close button clicked');
                mobileNav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
                
                // Добавляем анимацию скрытия кнопки бургер
                mobileMenuBtn.style.opacity = '0';
                mobileMenuBtn.style.transform = 'scale(0.8)';
                
                // Показываем кнопку бургер через небольшую задержку
                setTimeout(() => {
                    mobileMenuBtn.style.opacity = '1';
                    mobileMenuBtn.style.transform = 'scale(1)';
                }, 300);
            };
        }

        // Обработчики ссылок
        const mobileLinks = mobileNav.querySelectorAll('a');
        mobileLinks.forEach((link, index) => {
            // Добавляем индекс для анимации
            link.style.setProperty('--item-index', index);
            
            link.onclick = function() {
                console.log('Mobile link clicked');
                mobileNav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            };
        });

        console.log('Event listeners added successfully');
    } else {
        console.error('Mobile navigation elements not found!');
    }
});
