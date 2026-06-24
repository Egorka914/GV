// =========================
// ЛОКАЛЬНАЯ БАЗА ДАННЫХ ДЛЯ ОТЗЫВОВ
// =========================
class LocalReviews {
    constructor() {
        // Загружаем отзывы из localStorage или используем начальные
        this.reviews = this.loadReviews();
    }

    // Загрузить отзывы из localStorage
    loadReviews() {
        const saved = localStorage.getItem('reviews');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return this.getDefaultReviews();
            }
        }
        return this.getDefaultReviews();
    }

    // Сохранить отзывы в localStorage
    saveReviews() {
        localStorage.setItem('reviews', JSON.stringify(this.reviews));
    }

    // Начальные отзывы
    getDefaultReviews() {
        return [
            {
                id: 1,
                name: 'Анна',
                age: 28,
                text: 'После челленджа я чувствую невероятную лёгкость и уверенность. Гвозди помогли мне найти внутреннюю опору!',
                photo_url: null,
                created_at: new Date('2025-02-15').toISOString()
            },
            {
                id: 2,
                name: 'Максим',
                age: 34,
                text: '5 дней изменили моё восприятие себя. Энергия зашкаливает, а страх ушёл. Рекомендую всем!',
                photo_url: null,
                created_at: new Date('2025-02-10').toISOString()
            },
            {
                id: 3,
                name: 'Елена',
                age: 42,
                text: 'Я боялась даже пробовать, но после первого дня поняла - это моё! Теперь утро начинается с гвоздей и улыбки.',
                photo_url: null,
                created_at: new Date('2025-02-05').toISOString()
            }
        ];
    }

    // Получить все отзывы
    getAllReviews() {
        return this.reviews;
    }

    // Добавить новый отзыв
    addReview(reviewData) {
        const newReview = {
            id: Date.now(),
            ...reviewData,
            created_at: new Date().toISOString()
        };
        this.reviews.unshift(newReview);
        this.saveReviews();
        return newReview;
    }

    // Получить фото-отзывы
    getPhotoReviews() {
        return this.reviews.filter(review => review.photo_url).slice(0, 6);
    }
}

// =========================
// ОСНОВНОЙ КОД
// =========================
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация локальной базы данных
    const reviewsDB = new LocalReviews();

    // =========================
    // ОБРАТНЫЙ ОТСЧЕТ
    // =========================
    function initializeCountdown() {
        const targetDate = new Date(2025, 9, 3, 6, 0, 0); // 3 октября 2025, 6:00

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                document.getElementById('countdown-container').innerHTML = 
                    '<div class="timer-expired">🔥 Челлендж уже начался! Присоединяйтесь прямо сейчас!</div>';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            animateNumber('days', days.toString().padStart(2, '0'));
            animateNumber('hours', hours.toString().padStart(2, '0'));
            animateNumber('minutes', minutes.toString().padStart(2, '0'));
            animateNumber('seconds', seconds.toString().padStart(2, '0'));
        }

        function animateNumber(elementId, newValue) {
            const element = document.getElementById(elementId);
            if (element && element.textContent !== newValue) {
                element.classList.add('changing');
                setTimeout(() => {
                    element.textContent = newValue;
                    element.classList.remove('changing');
                }, 150);
            }
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // =========================
    // СЛАЙДЕР ОТЗЫВОВ
    // =========================
    function initializeReviewsSlider() {
        const track = document.getElementById('slider-track');
        const dotsContainer = document.getElementById('slider-dots');
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');

        let currentSlide = 0;
        const reviews = reviewsDB.getAllReviews();

        function createSlides() {
            track.innerHTML = '';
            dotsContainer.innerHTML = '';

            if (reviews.length === 0) {
                track.innerHTML = '<div class="review-slide"><p>Пока нет отзывов. Будьте первым!</p></div>';
                return;
            }

            reviews.forEach((review, index) => {
                const slide = document.createElement('div');
                slide.className = 'review-slide';
                slide.innerHTML = `
                    <div class="review-header">
                        <div class="review-avatar">${review.name.charAt(0)}</div>
                        <div class="review-info">
                            <h4>${review.name}</h4>
                            <span class="review-age">${review.age} лет</span>
                            <span class="review-date">${formatDate(review.created_at)}</span>
                        </div>
                    </div>
                    <div class="review-text">"${review.text}"</div>
                `;
                track.appendChild(slide);

                const dot = document.createElement('div');
                dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });

            updateSlider();
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
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
            if (reviews.length > 0) {
                track.style.transform = `translateX(-${currentSlide * 100}%)`;
                
                document.querySelectorAll('.slider-dot').forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentSlide);
                });
            }
        }

        createSlides();

        // Обработчики событий
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Автопрокрутка
        let autoSlide = setInterval(nextSlide, 5000);

        if (track) {
            track.addEventListener('mouseenter', () => clearInterval(autoSlide));
            track.addEventListener('mouseleave', () => {
                autoSlide = setInterval(nextSlide, 5000);
            });
        }
    }

    // =========================
    // КАРУСЕЛЬ ФОТО-ОТЗЫВОВ
    // =========================
    function initializePhotoCarousel() {
        const track = document.getElementById('carousel-track');
        const dotsContainer = document.getElementById('carousel-dots');
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');

        let currentSlide = 0;
        const photoReviews = reviewsDB.getPhotoReviews();
        let autoSlideInterval;

        function createCarousel() {
            track.innerHTML = '';
            dotsContainer.innerHTML = '';

            if (photoReviews.length === 0) {
                track.innerHTML = `
                    <div class="carousel-slide no-photos">
                        <p>📸 Пока нет фото-отзывов. Добавьте свой!</p>
                    </div>
                `;
                return;
            }

            photoReviews.forEach((review, index) => {
                const slide = document.createElement('div');
                slide.className = 'carousel-slide';
                
                if (review.photo_url) {
                    slide.innerHTML = `
                        <div class="photo-slide-content">
                            <img src="${review.photo_url}" alt="Фото отзыва от ${review.name}" loading="lazy">
                            <div class="photo-review-info">
                                <h4>${review.name}</h4>
                                <p>${review.age} лет</p>
                            </div>
                        </div>
                    `;
                    slide.querySelector('img').addEventListener('click', () => openPhotoModal(review.photo_url));
                } else {
                    slide.innerHTML = `
                        <div class="text-photo">
                            <p>"${review.text}"</p>
                            <span>- ${review.name}</span>
                        </div>
                    `;
                }
                
                track.appendChild(slide);

                const dot = document.createElement('div');
                dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });

            updateCarousel();
        }

        function goToSlide(index) {
            currentSlide = index;
            updateCarousel();
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % photoReviews.length;
            updateCarousel();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + photoReviews.length) % photoReviews.length;
            updateCarousel();
        }

        function updateCarousel() {
            if (photoReviews.length > 0) {
                track.style.transform = `translateX(-${currentSlide * 100}%)`;
                
                document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentSlide);
                });
            }
        }

        function startAutoSlide() {
            if (photoReviews.length > 1) {
                autoSlideInterval = setInterval(nextSlide, 4000);
            }
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        createCarousel();
        startAutoSlide();

        // Обработчики событий
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                stopAutoSlide();
                prevSlide();
                startAutoSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                stopAutoSlide();
                nextSlide();
                startAutoSlide();
            });
        }

        if (track) {
            track.addEventListener('mouseenter', stopAutoSlide);
            track.addEventListener('mouseleave', startAutoSlide);
        }
    }

    // =========================
    // МОДАЛЬНЫЕ ОКНА
    // =========================
    function initializeModals() {
        const reviewModal = document.getElementById('review-modal');
        const photoModal = document.getElementById('photo-modal');
        const telegramModal = document.getElementById('telegram-modal');
        const addReviewBtn = document.getElementById('add-review-btn');
        const reviewForm = document.getElementById('review-form');

        // =========================
        // ПРЕВЬЮ ФОТО
        // =========================
        function initializePhotoPreview() {
            const photoInput = document.getElementById('review-photo');
            if (!photoInput) return;

            photoInput.addEventListener('change', function(e) {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        let photoPreview = document.getElementById('photo-preview');
                        
                        if (!photoPreview) {
                            const previewContainer = document.createElement('div');
                            previewContainer.id = 'photo-preview';
                            previewContainer.style.cssText = `
                                margin-top: 10px;
                                text-align: center;
                            `;
                            previewContainer.innerHTML = `
                                <img src="${e.target.result}" alt="Превью фото" style="max-width: 200px; max-height: 150px; border-radius: 8px;">
                                <button type="button" id="remove-photo-btn" style="margin-left: 10px; background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">× Удалить</button>
                            `;
                            photoInput.parentNode.appendChild(previewContainer);
                            
                            document.getElementById('remove-photo-btn').addEventListener('click', removePhotoPreview);
                        } else {
                            photoPreview.innerHTML = `
                                <img src="${e.target.result}" alt="Превью фото" style="max-width: 200px; max-height: 150px; border-radius: 8px;">
                                <button type="button" id="remove-photo-btn" style="margin-left: 10px; background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">× Удалить</button>
                            `;
                            document.getElementById('remove-photo-btn').addEventListener('click', removePhotoPreview);
                        }
                    };
                    
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }

        function removePhotoPreview() {
            const photoPreview = document.getElementById('photo-preview');
            const photoInput = document.getElementById('review-photo');
            
            if (photoPreview) photoPreview.remove();
            if (photoInput) photoInput.value = '';
        }

        // =========================
        // ОБРАБОТКА ФОРМЫ ОТЗЫВА
        // =========================
        function initializeReviewForm() {
            if (addReviewBtn) {
                addReviewBtn.addEventListener('click', () => {
                    reviewModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                });
            }

            if (reviewForm) {
                reviewForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const submitButton = reviewForm.querySelector('button[type="submit"]');
                    const originalText = submitButton.textContent;
                    
                    submitButton.textContent = 'Отправка...';
                    submitButton.disabled = true;

                    const name = document.getElementById('review-name').value.trim();
                    const age = parseInt(document.getElementById('review-age').value);
                    const text = document.getElementById('review-text').value.trim();
                    
                    // Валидация
                    if (!name || !text || isNaN(age) || age < 1 || age > 120) {
                        showNotification('Пожалуйста, заполните все обязательные поля корректно', 'error');
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                        return;
                    }

                    // Обработка фото
                    const photoInput = document.getElementById('review-photo');
                    let photo_url = null;

                    if (photoInput.files.length > 0) {
                        const file = photoInput.files[0];
                        if (file.size > 5 * 1024 * 1024) {
                            showNotification('Размер фото не должен превышать 5MB', 'error');
                            submitButton.textContent = originalText;
                            submitButton.disabled = false;
                            return;
                        }

                        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                        if (!validTypes.includes(file.type)) {
                            showNotification('Разрешены только JPG, PNG и WebP форматы', 'error');
                            submitButton.textContent = originalText;
                            submitButton.disabled = false;
                            return;
                        }

                        // Конвертируем фото в base64 для локального хранения
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            photo_url = e.target.result;
                            saveReviewAndClose(name, age, text, photo_url, submitButton, originalText);
                        };
                        reader.readAsDataURL(file);
                        return;
                    }

                    saveReviewAndClose(name, age, text, null, submitButton, originalText);
                });
            }
        }

        function saveReviewAndClose(name, age, text, photo_url, submitButton, originalText) {
            try {
                reviewsDB.addReview({ name, age, text, photo_url });
                
                // Закрываем модальное окно
                const reviewModal = document.getElementById('review-modal');
                reviewModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                const reviewForm = document.getElementById('review-form');
                reviewForm.reset();
                removePhotoPreview();
                
                // Обновляем слайдеры
                initializeReviewsSlider();
                initializePhotoCarousel();
                
                showNotification('Ваш отзыв успешно добавлен! 🎉', 'success');
            } catch (error) {
                showNotification('Ошибка при добавлении отзыва', 'error');
            } finally {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        }

        // =========================
        // УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ
        // =========================
        function initializeModalControls() {
            window.openPhotoModal = function(photoSrc) {
                const modalPhoto = document.getElementById('modal-photo');
                if (modalPhoto) {
                    modalPhoto.src = photoSrc;
                    photoModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            };

            function closeModals() {
                if (reviewModal) reviewModal.style.display = 'none';
                if (photoModal) photoModal.style.display = 'none';
                if (telegramModal) telegramModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }

            document.querySelectorAll('.close-payment').forEach(closeBtn => {
                closeBtn.addEventListener('click', closeModals);
            });

            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', function(e) {
                    if (e.target === this) closeModals();
                });
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') closeModals();
            });

            const telegramBtn = document.querySelector('.btn-telegram');
            if (telegramBtn) {
                telegramBtn.addEventListener('click', function() {
                    setTimeout(() => {
                        if (telegramModal) {
                            telegramModal.style.display = 'none';
                            document.body.style.overflow = 'auto';
                        }
                    }, 500);
                });
            }
        }

        initializePhotoPreview();
        initializeReviewForm();
        initializeModalControls();
    }

    // =========================
    // УВЕДОМЛЕНИЯ
    // =========================
    function showNotification(message, type = 'info') {
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
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

        if (hamburger && navMenu && navOverlay) {
            hamburger.addEventListener('click', toggleMenu);
            navOverlay.addEventListener('click', toggleMenu);

            document.querySelectorAll('.nav a').forEach(link => {
                link.addEventListener('click', () => {
                    if (navMenu.classList.contains('active')) toggleMenu();
                });
            });
        }
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
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
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
        if (!particlesContainer) return;

        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 5 + 2}px;
                height: ${Math.random() * 5 + 2}px;
                background: ${Math.random() > 0.5 ? '#f512fb' : '#274aff'};
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
    // ОБРАБОТКА ФОРМЫ РЕГИСТРАЦИИ
    // =========================
    function initializeRegistrationForm() {
        const registrationForm = document.getElementById('challenge-form');
        const telegramModal = document.getElementById('telegram-modal');
        
        if (!registrationForm) return;
        
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitButton = registrationForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Отправка...';
            submitButton.disabled = true;
            
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            
            if (!name || !email || !phone) {
                showNotification('Пожалуйста, заполните все обязательные поля', 'error');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                return;
            }
            
            const agreementCheckbox = document.getElementById('reg-agreement');
            if (!agreementCheckbox.checked) {
                showNotification('Необходимо согласие с условиями участия', 'error');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                return;
            }
            
            showNotification('Регистрация успешна! Переходите в Telegram.', 'success');
            
            if (telegramModal) {
                telegramModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
            
            registrationForm.reset();
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    }

    // =========================
    // ПРОКРУТКА К РЕГИСТРАЦИИ
    // =========================
    window.scrollToRegistration = function() {
        const registrationSection = document.getElementById('registration');
        if (registrationSection) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = registrationSection.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // =========================
    // ИНИЦИАЛИЗАЦИЯ ВСЕХ ФУНКЦИЙ
    // =========================
    function initializeAll() {
        initializeCountdown();
        initializeScrollAnimations();
        initializeMobileMenu();
        initializeSmoothScroll();
        initializeParticles();
        initializeModals();
        initializeRegistrationForm();
        initializeReviewsSlider();
        initializePhotoCarousel();

        console.log('🔥 Челлендж Точка Опоры - все системы запущены!');
    }

    // Запускаем инициализацию
    initializeAll();
});
