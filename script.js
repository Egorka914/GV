// =========================
// БАЗА ДАННЫХ ДЛЯ ОТЗЫВОВ
// =========================
class ReviewsDatabase {
    constructor() {
        this.reviews = JSON.parse(localStorage.getItem('challengeReviews')) || this.getDefaultReviews();
        this.currentSlide = 0;
        this.autoSlideInterval = null;
    }

    // Стандартные отзывы для начала
    getDefaultReviews() {
        return [
            {
                id: 1,
                name: "Анна",
                age: 32,
                text: "После челленджа почувствовала невероятный прилив энергии! Утром просыпаюсь бодрой, хотя раньше всегда была сонной. Спасибо за трансформацию!",
                photo: null,
                date: new Date('2024-01-15')
            },
            {
                id: 2,
                name: "Михаил",
                age: 28,
                text: "Никогда не думал, что смогу стоять на гвоздях. Челлендж помог преодолеть страх и обрести уверенность в себе. Рекомендую всем!",
                photo: null,
                date: new Date('2024-01-20')
            },
            {
                id: 3,
                name: "Екатерина",
                age: 41,
                text: "5 дней изменили мое отношение к стрессу. Теперь у меня есть инструмент, который быстро возвращает меня в состояние баланса. Благодарю!",
                photo: null,
                date: new Date('2024-02-01')
            }
        ];
    }

    // Получить все отзывы
    getAllReviews() {
        return this.reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Добавить новый отзыв
    addReview(reviewData) {
        const newReview = {
            id: Date.now(),
            name: reviewData.name,
            age: parseInt(reviewData.age),
            text: reviewData.text,
            photo: reviewData.photo,
            date: new Date()
        };

        this.reviews.unshift(newReview);
        this.saveToLocalStorage();
        return newReview;
    }

    // Сохранить в localStorage
    saveToLocalStorage() {
        localStorage.setItem('challengeReviews', JSON.stringify(this.reviews));
    }

    // Получить фото-отзывы (с фото)
    getPhotoReviews() {
        return this.reviews.filter(review => review.photo).slice(0, 6);
    }
}

// =========================
// ОСНОВНОЙ КОД
// =========================
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация базы данных
    const reviewsDB = new ReviewsDatabase();

    // =========================
    // ОБРАТНЫЙ ОТСЧЕТ
    // =========================
    function initializeCountdown() {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 5); // 5 дней от текущей даты
        targetDate.setHours(20, 0, 0, 0); // Устанавливаем на 20:00

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                // Время истекло
                document.getElementById('countdown-container').innerHTML = 
                    '<div class="timer-expired">Челлендж начался! Присоединяйтесь прямо сейчас!</div>';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Анимация изменения цифр
            animateNumber('days', days.toString().padStart(2, '0'));
            animateNumber('hours', hours.toString().padStart(2, '0'));
            animateNumber('minutes', minutes.toString().padStart(2, '0'));
            animateNumber('seconds', seconds.toString().padStart(2, '0'));
        }

        function animateNumber(elementId, newValue) {
            const element = document.getElementById(elementId);
            if (element.textContent !== newValue) {
                element.classList.add('changing');
                setTimeout(() => {
                    element.textContent = newValue;
                    element.classList.remove('changing');
                }, 150);
            }
        }

        // Обновляем каждую секунду
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // =========================
    // СЛАЙДЕР ОТЗЫВОВ
    // =========================
    function initializeReviewsSlider() {
        const track = document.querySelector('.slider-track');
        const dotsContainer = document.querySelector('.slider-dots');
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');

        let currentSlide = 0;
        const reviews = reviewsDB.getAllReviews();

        // Создаем слайды
        function createSlides() {
            track.innerHTML = '';
            dotsContainer.innerHTML = '';

            reviews.forEach((review, index) => {
                // Создаем слайд
                const slide = document.createElement('div');
                slide.className = 'review-slide';
                slide.innerHTML = `
                    <div class="review-header">
                        <div class="review-avatar">${review.name.charAt(0)}</div>
                        <div class="review-info">
                            <h4>${review.name}</h4>
                            <span class="review-age">${review.age} лет</span>
                        </div>
                    </div>
                    <div class="review-text">"${review.text}"</div>
                `;
                track.appendChild(slide);

                // Создаем точки навигации
                const dot = document.createElement('div');
                dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });

            updateSlider();
        }

        function goToSlide(index) {
            currentSlide = index;
            updateSlider();
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % reviews.length;
            updateSlider();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + reviews.length) % reviews.length;
            updateSlider();
        }

        function updateSlider() {
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Обновляем активную точку
            document.querySelectorAll('.slider-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        // Инициализация
        createSlides();

        // Обработчики событий
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        // Автопрокрутка
        let autoSlide = setInterval(nextSlide, 5000);

        // Останавливаем автопрокрутку при наведении
        track.addEventListener('mouseenter', () => clearInterval(autoSlide));
        track.addEventListener('mouseleave', () => {
            autoSlide = setInterval(nextSlide, 5000);
        });
    }

    // =========================
    // ГАЛЕРЕЯ ФОТО-ОТЗЫВОВ
    // =========================
    function initializePhotoGallery() {
        const galleryGrid = document.querySelector('.gallery-grid');
        const photoReviews = reviewsDB.getPhotoReviews();

        // Заглушки для фото, если нет реальных фото
        const placeholderPhotos = [
            'Foto/332bd2eb-6fc0-4041-8f58-67e7e83bcc80.jpg',
            'Foto/6836cb3f-8376-430c-bc89-a21818ab0016.jpg',
            'Foto/ad93cf9e-0ecf-4ef7-883d-7c3545ed8a58.jpg',
            'Foto/b2f6cab9-0727-4bec-ac50-d9526bdac550.jpg',
            'Foto/cb2e3b4a-1ab0-4e13-a791-df95f7ddbccf.jpg',
            'Foto/332bd2eb-6fc0-4041-8f58-67e7e83bcc80.jpg'
        ];

        galleryGrid.innerHTML = '';

        // Показываем либо реальные фото, либо заглушки
        const photosToShow = photoReviews.length > 0 ? 
            photoReviews : 
            placeholderPhotos.map((photo, index) => ({ photo, id: index }));

        photosToShow.forEach((item, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `<img src="${item.photo || 'Foto/placeholder.jpg'}" alt="Отзыв участника ${index + 1}" loading="lazy">`;
            
            galleryItem.addEventListener('click', () => {
                openPhotoModal(item.photo || 'Foto/placeholder.jpg');
            });

            galleryGrid.appendChild(galleryItem);
        });
    }

    // =========================
    // МОДАЛЬНЫЕ ОКНА
    // =========================
    function initializeModals() {
        const reviewModal = document.getElementById('review-modal');
        const photoModal = document.getElementById('photo-modal');
        const addReviewBtn = document.getElementById('add-review-btn');
        const reviewForm = document.getElementById('review-form');

        // Открытие модального окна для добавления отзыва
        addReviewBtn.addEventListener('click', () => {
            reviewModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });

        // Обработка формы отзыва
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('review-name').value,
                age: document.getElementById('review-age').value,
                text: document.getElementById('review-text').value,
                photo: null
            };

            // Обработка загрузки фото
            const photoInput = document.getElementById('review-photo');
            if (photoInput.files.length > 0) {
                const file = photoInput.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    formData.photo = e.target.result;
                    saveReview(formData);
                };
                
                reader.readAsDataURL(file);
            } else {
                saveReview(formData);
            }
        });

        function saveReview(formData) {
            reviewsDB.addReview(formData);
            
            // Закрываем модальное окно
            reviewModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Сбрасываем форму
            reviewForm.reset();
            
            // Обновляем отзывы на странице
            initializeReviewsSlider();
            initializePhotoGallery();
            
            // Показываем уведомление
            showNotification('Ваш отзыв успешно добавлен!', 'success');
        }

        // Открытие модального окна для просмотра фото
        function openPhotoModal(photoSrc) {
            const modalPhoto = document.getElementById('modal-photo');
            modalPhoto.src = photoSrc;
            photoModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        // Закрытие модальных окон
        function closeModals() {
            reviewModal.style.display = 'none';
            photoModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // Обработчики закрытия
        document.querySelectorAll('.close-payment').forEach(closeBtn => {
            closeBtn.addEventListener('click', closeModals);
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModals();
                }
            });
        });

        // Закрытие по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModals();
            }
        });
    }

    // =========================
    // УВЕДОМЛЕНИЯ
    // =========================
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // =========================
    // АНИМАЦИИ ПРИ ПРОКРУТКЕ
    // =========================
    function initializeScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Наблюдаем за элементами с анимацией
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    // =========================
    // МОБИЛЬНОЕ МЕНЮ
    // =========================
    function initializeMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navOverlay = document.getElementById('nav-overlay');

        function toggleMenu() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            navOverlay.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
        }

        hamburger.addEventListener('click', toggleMenu);
        navOverlay.addEventListener('click', toggleMenu);

        // Закрытие меню при клике на ссылку
        document.querySelectorAll('.nav a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

    // =========================
    // ПЛАВНАЯ ПРОКРУТКА
    // =========================
    function initializeSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // =========================
    // ЧАСТИЦЫ ДЛЯ ФОНА
    // =========================
    function initializeParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 5 + 2}px;
                height: ${Math.random() * 5 + 2}px;
                background: ${Math.random() > 0.5 ? 'var(--primary-red)' : 'var(--primary-blue)'};
                border-radius: 50%;
                opacity: ${Math.random() * 0.6 + 0.2};
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 10}s infinite ease-in-out;
                animation-delay: ${Math.random() * 5}s;
            `;
            particlesContainer.appendChild(particle);
        }
    }

    // =========================
    // ИНИЦИАЛИЗАЦИЯ ВСЕХ ФУНКЦИЙ
    // =========================
    function initializeAll() {
        initializeCountdown();
        initializeReviewsSlider();
        initializePhotoGallery();
        initializeModals();
        initializeScrollAnimations();
        initializeMobileMenu();
        initializeSmoothScroll();
        initializeParticles();

        // Добавляем CSS для анимации уведомлений
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        console.log('🔥 Челлендж Точка Опоры - все системы запущены!');
    }

    // Запускаем инициализацию
    initializeAll();
});

// Добавляем обработчик ошибок для отладки
window.addEventListener('error', function(e) {
    console.error('Произошла ошибка:', e.error);
});
// Обработчики для кнопок CTA
document.querySelectorAll('.btn-challenge, .btn-large').forEach(button => {
    button.addEventListener('click', function() {
        document.getElementById('payment-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
});

// Закрытие модального окна оплаты
document.querySelector('#payment-modal .close-payment').addEventListener('click', function() {
    document.getElementById('payment-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Закрытие по клику вне окна
document.getElementById('payment-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});