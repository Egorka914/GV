// =========================
// КОНФИГУРАЦИЯ SUPABASE
// =========================
const SUPABASE_URL = 'https://zsffpgnvpgvtlptovagd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZmZwZ252cGd2dGxwdG92YWdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY5MTc3OSwiZXhwIjoyMDc0MjY3Nzc5fQ.whouWVGlAvYmtmNJu4KzYGVkGiWuhqPE3FwZaI_7ebM';

// Инициализация Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================
// БАЗА ДАННЫХ ДЛЯ ОТЗЫВОВ (Supabase)
// =========================
class SupabaseReviews {
    constructor() {
        this.supabase = supabase;
    }

    // Получить все отзывы из Supabase
    async getAllReviews() {
        try {
            const { data, error } = await this.supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
            return this.getDefaultReviews(); // Fallback
        }
    }

    // Добавить новый отзыв в Supabase
    async addReview(reviewData) {
        try {
            const { data, error } = await this.supabase
                .from('reviews')
                .insert([reviewData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Ошибка добавления отзыва:', error);
            throw error;
        }
    }

    // Получить фото-отзывы
    async getPhotoReviews() {
        const reviews = await this.getAllReviews();
        return reviews.filter(review => review.photo_url).slice(0, 6);
    }

  
}

// =========================
// ФУНКЦИЯ ЗАГРУЗКИ ФОТО В SUPABASE STORAGE
// =========================
async function uploadReviewPhoto(file) {
    try {
        // Генерируем уникальное имя файла
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `review-photos/${fileName}`;

        // Загружаем файл в Supabase Storage
        const { data, error } = await supabase.storage
            .from('review-photos')
            .upload(filePath, file);

        if (error) throw error;

        // Получаем публичный URL загруженного файла
        const { data: { publicUrl } } = supabase.storage
            .from('review-photos')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Ошибка загрузки фото:', error);
        throw error;
    }
}

// =========================
// ОСНОВНОЙ КОД
// =========================
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация базы данных Supabase
    const reviewsDB = new SupabaseReviews();

    // =========================
    // ОБРАТНЫЙ ОТСЧЕТ
    // =========================
    function initializeCountdown() {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 5);
        targetDate.setHours(20, 0, 0, 0);

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                document.getElementById('countdown-container').innerHTML = 
                    '<div class="timer-expired">Челлендж начался! Присоединяйтесь прямо сейчас!</div>';
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
            if (element.textContent !== newValue) {
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
    // СЛАЙДЕР ОТЗЫВОВ (Supabase)
    // =========================
    async function initializeReviewsSlider() {
        const track = document.getElementById('slider-track');
        const dotsContainer = document.getElementById('slider-dots');
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');

        let currentSlide = 0;
        let reviews = [];

        function createSlides() {
            track.innerHTML = '';
            dotsContainer.innerHTML = '';

            if (reviews.length === 0) {
                track.innerHTML = '<div class="review-slide"><p>Пока нет отзывов</p></div>';
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

        // Инициализация
        try {
            reviews = await reviewsDB.getAllReviews();
            await createSlides();
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
        }

        // Обработчики событий
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        // Автопрокрутка
        let autoSlide = setInterval(nextSlide, 5000);

        track.addEventListener('mouseenter', () => clearInterval(autoSlide));
        track.addEventListener('mouseleave', () => {
            autoSlide = setInterval(nextSlide, 5000);
        });
    }

    // =========================
    // КАРУСЕЛЬ ФОТО-ОТЗЫВОВ (Supabase)
    // =========================
    async function initializePhotoCarousel() {
        const track = document.getElementById('carousel-track');
        const dotsContainer = document.getElementById('carousel-dots');
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');

        let currentSlide = 0;
        let photoReviews = [];
        let autoSlideInterval;

        function createCarousel() {
            track.innerHTML = '';
            dotsContainer.innerHTML = '';

            if (photoReviews.length === 0) {
                track.innerHTML = '<div class="carousel-slide no-photos"><p>Пока нет фото-отзывов</p></div>';
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
                    slide.innerHTML = `<div class="text-photo"><p>"${review.text}"</p><span>- ${review.name}</span></div>`;
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

        // Инициализация
        try {
            photoReviews = await reviewsDB.getPhotoReviews();
            await createCarousel();
            startAutoSlide();
        } catch (error) {
            console.error('Ошибка загрузки фото-отзывов:', error);
        }

        // Обработчики событий
        prevBtn.addEventListener('click', () => {
            stopAutoSlide();
            prevSlide();
            startAutoSlide();
        });

        nextBtn.addEventListener('click', () => {
            stopAutoSlide();
            nextSlide();
            startAutoSlide();
        });

        track.addEventListener('mouseenter', stopAutoSlide);
        track.addEventListener('mouseleave', startAutoSlide);
    }

    // =========================
    // МОДАЛЬНЫЕ ОКНА
    // =========================
    function initializeModals() {
        const reviewModal = document.getElementById('review-modal');
        const photoModal = document.getElementById('photo-modal');
        const paymentModal = document.getElementById('payment-modal');
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
                            // Создаем контейнер для превью если его нет
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
                            
                            // Добавляем обработчик для кнопки удаления
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

        // Функция удаления превью
        function removePhotoPreview() {
            const photoPreview = document.getElementById('photo-preview');
            const photoInput = document.getElementById('review-photo');
            
            if (photoPreview) {
                photoPreview.remove();
            }
            if (photoInput) {
                photoInput.value = '';
            }
        }

        // =========================
        // ОБРАБОТКА ФОРМЫ ОТЗЫВА
        // =========================
        function initializeReviewForm() {
            // Открытие модального окна для добавления отзыва
            addReviewBtn.addEventListener('click', () => {
                reviewModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });

            // Обработка формы отзыва
            reviewForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitButton = reviewForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                
                // Блокируем кнопку на время отправки
                submitButton.textContent = 'Отправка...';
                submitButton.disabled = true;

                const formData = {
                    name: document.getElementById('review-name').value.trim(),
                    age: parseInt(document.getElementById('review-age').value),
                    text: document.getElementById('review-text').value.trim(),
                    photo_url: null,
                    created_at: new Date().toISOString()
                };

                // Валидация
                if (!formData.name || !formData.text || isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
                    showNotification('Пожалуйста, заполните все обязательные поля корректно', 'error');
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    return;
                }

                // Обработка загрузки фото
                const photoInput = document.getElementById('review-photo');
                if (photoInput.files.length > 0) {
                    const file = photoInput.files[0];
                    
                    // Проверяем размер файла (макс. 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        showNotification('Размер фото не должен превышать 5MB', 'error');
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                        return;
                    }

                    // Проверяем тип файла
                    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                    if (!validTypes.includes(file.type)) {
                        showNotification('Разрешены только JPG, PNG и WebP форматы', 'error');
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                        return;
                    }

                    try {
                        showNotification('Загружаем фото...', 'info');
                        formData.photo_url = await uploadReviewPhoto(file);
                    } catch (error) {
                        showNotification('Ошибка загрузки фото. Попробуйте еще раз', 'error');
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                        return;
                    }
                }

                try {
                    await saveReview(formData);
                } catch (error) {
                    showNotification('Ошибка при добавлении отзыва. Попробуйте еще раз', 'error');
                } finally {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }
            });

            async function saveReview(formData) {
                await reviewsDB.addReview(formData);
                
                // Закрываем модальное окно
                reviewModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                reviewForm.reset();
                
                // Удаляем превью фото
                removePhotoPreview();
                
                // Обновляем отзывы на странице
                await initializeReviewsSlider();
                await initializePhotoCarousel();
                
                showNotification('Ваш отзыв успешно добавлен!', 'success');
            }
        }

        // =========================
        // УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ
        // =========================
        function initializeModalControls() {
            // Открытие модального окна для просмотра фото
            window.openPhotoModal = function(photoSrc) {
                const modalPhoto = document.getElementById('modal-photo');
                modalPhoto.src = photoSrc;
                photoModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            };

            // Закрытие модальных окон
            function closeModals() {
                reviewModal.style.display = 'none';
                photoModal.style.display = 'none';
                paymentModal.style.display = 'none';
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

            // Обработчики для кнопок CTA
            document.querySelectorAll('.btn-challenge, .btn-large').forEach(button => {
                button.addEventListener('click', function() {
                    paymentModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                });
            });
        }

        // Инициализация всех функций модальных окон
        initializePhotoPreview();
        initializeReviewForm();
        initializeModalControls();
    }

    // =========================
    // УВЕДОМЛЕНИЯ
    // =========================
    function showNotification(message, type = 'info') {
        // Удаляем существующие уведомления
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Добавляем стили для уведомлений
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        // Цвета в зависимости от типа
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#2196F3',
            warning: '#ff9800'
        };

        notification.style.background = colors[type] || colors.info;

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
                    if (navMenu.classList.contains('active')) {
                        toggleMenu();
                    }
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
    async function initializeAll() {
        initializeCountdown();
        initializeScrollAnimations();
        initializeMobileMenu();
        initializeSmoothScroll();
        initializeParticles();
        initializeModals();
        
        // Инициализация слайдеров после загрузки данных
        await initializeReviewsSlider();
        await initializePhotoCarousel();

        console.log('🔥 Челлендж Точка Опоры - все системы запущены!');
    }

    // Запускаем инициализацию
    initializeAll().catch(error => {
        console.error('Ошибка инициализации:', error);
    });
});

// Добавляем обработчик ошибок для отладки
window.addEventListener('error', function(e) {
    console.error('Произошла ошибка:', e.error);
});
// =========================
// ОБРАБОТКА ФОРМЫ РЕГИСТРАЦИИ
// =========================
function initializeRegistrationForm() {
    const registrationForm = document.getElementById('challenge-form');
    
    if (!registrationForm) return;
    
    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = registrationForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Блокируем кнопку на время отправки
        submitButton.textContent = 'Отправка...';
        submitButton.disabled = true;
        
        const formData = {
            name: document.getElementById('reg-name').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            phone: document.getElementById('reg-phone').value.trim(),
            created_at: new Date().toISOString()
        };
        
        // Валидация
        if (!formData.name || !formData.email || !formData.phone) {
            showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
        }
        
        // Проверка согласия
        const agreementCheckbox = document.getElementById('reg-agreement');
        if (!agreementCheckbox.checked) {
            showNotification('Необходимо согласие с условиями участия', 'error');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
        }
        
        try {
            // Сохранение в Supabase (нужно создать таблицу registrations)
            const { data, error } = await supabase
                .from('registrations')
                .insert([formData])
                .select()
                .single();
                
            if (error) throw error;
            
            // Успешная отправка
            showNotification('Вы успешно записаны на челлендж! Скоро с вами свяжутся.', 'success');
            registrationForm.reset();
            
        } catch (error) {
            console.error('Ошибка при записи:', error);
            showNotification('Ошибка при отправке формы. Попробуйте еще раз.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Добавить вызов этой функции в initializeAll()
async function initializeAll() {
    initializeCountdown();
    initializeScrollAnimations();
    initializeMobileMenu();
    initializeSmoothScroll();
    initializeParticles();
    initializeModals();
    initializeRegistrationForm(); // Добавить эту строку
    
    await initializeReviewsSlider();
    await initializePhotoCarousel();
}
// =========================
// ПРОКРУТКА К РЕГИСТРАЦИИ
// =========================
function scrollToRegistration() {
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
// ЯНДЕКС.КАССА
// =========================
function initializeYooKassa() {
    const paymentButton = document.querySelector('#payment-modal .btn-payment');
    if (paymentButton) {
        paymentButton.addEventListener('click', processPayment);
    }

    // Обработчики для выбора способа оплаты
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

async function processPayment() {
    const submitButton = document.querySelector('#payment-modal .btn-payment');
    const originalText = submitButton.textContent;
    
    // Блокируем кнопку на время обработки
    submitButton.textContent = 'Подготовка оплаты...';
    submitButton.disabled = true;

    try {
        const selectedMethod = document.querySelector('.payment-option.active').dataset.method;
        
        const paymentData = {
            amount: 1700,
            description: 'Участие в челлендже "Точка Опоры"',
            method: selectedMethod,
            email: getSavedEmail()
        };

        // Здесь будет реальный запрос к вашему бэкенду
        // const response = await fetch('/api/create-payment', {
        //     method: 'POST',
        //     headers: {'Content-Type': 'application/json'},
        //     body: JSON.stringify(paymentData)
        // });

        // Временная заглушка для демонстрации
        showNotification('Перенаправляем на страницу оплаты Яндекс.Кассы...', 'info');
        
        // Имитация перенаправления (в реальности будет payment.confirmation_url)
        setTimeout(() => {
            window.open('https://yoomoney.ru/', '_blank');
            document.getElementById('payment-modal').style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 2000);
        
    } catch (error) {
        console.error('Ошибка оплаты:', error);
        showNotification('Ошибка при обработке оплаты. Попробуйте еще раз.', 'error');
        
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Вспомогательная функция для получения email
function getSavedEmail() {
    return localStorage.getItem('challenge_email') || 
           document.getElementById('reg-email')?.value || 
           'client@example.com';
}

// =========================
// ОБНОВЛЕННАЯ ФОРМА РЕГИСТРАЦИИ
// =========================
function initializeRegistrationForm() {
    const registrationForm = document.getElementById('challenge-form');
    
    if (!registrationForm) return;
    
    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = registrationForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Блокируем кнопку на время отправки
        submitButton.textContent = 'Отправка...';
        submitButton.disabled = true;
        
        const formData = {
            name: document.getElementById('reg-name').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            phone: document.getElementById('reg-phone').value.trim(),
            created_at: new Date().toISOString()
        };
        
        // Валидация
        if (!formData.name || !formData.email || !formData.phone) {
            showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
        }
        
        // Проверка согласия
        const agreementCheckbox = document.getElementById('reg-agreement');
        if (!agreementCheckbox.checked) {
            showNotification('Необходимо согласие с условиями участия', 'error');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
        }
        
        try {
            // Сохраняем email для использования в оплате
            localStorage.setItem('challenge_email', formData.email);
            
            // Сохранение в Supabase
            const { data, error } = await supabase
                .from('registrations')
                .insert([formData])
                .select()
                .single();
                
            if (error) throw error;
            
            // Успешная отправка - показываем модальное окно оплаты
            showNotification('Регистрация успешна! Переходите к оплате.', 'success');
            
            // Показываем модальное окно оплаты
            const paymentModal = document.getElementById('payment-modal');
            if (paymentModal) {
                paymentModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
            
        } catch (error) {
            console.error('Ошибка при записи:', error);
            showNotification('Ошибка при отправке формы. Попробуйте еще раз.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// =========================
// ОБНОВЛЕННАЯ ИНИЦИАЛИЗАЦИЯ
// =========================
async function initializeAll() {
    initializeCountdown();
    initializeScrollAnimations();
    initializeMobileMenu();
    initializeSmoothScroll();
    initializeParticles();
    initializeModals();
    initializeRegistrationForm();
    initializeYooKassa(); // Добавляем инициализацию кассы
    
    await initializeReviewsSlider();
    await initializePhotoCarousel();

    console.log('🔥 Челлендж Точка Опоры - все системы запущены!');
}