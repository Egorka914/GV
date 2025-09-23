// =========================
    // ОСНОВНОЙ КОД JAVASCRIPT
    // =========================

    // Инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
      // Инициализация всех компонентов
      initNavigation();
      initScrollEffects();
      initGallery();
      initCountdownTimer();
      initParticles();
      initModal();
    });

    // =========================
    // НАВИГАЦИЯ И МОБИЛЬНОЕ МЕНЮ
    // =========================
    function initNavigation() {
      const hamburger = document.getElementById('hamburger');
      const navMenu = document.getElementById('nav-menu');
      const navOverlay = document.getElementById('nav-overlay');

      function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
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
    // ЭФФЕКТЫ ПРИ СКРОЛЛЕ
    // =========================
    function initScrollEffects() {
      // Плавная прокрутка для якорей
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });

      // Анимация появления элементов при скролле
      const fadeElements = document.querySelectorAll('.fade-in');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1 });

      fadeElements.forEach(el => observer.observe(el));

      // Изменение хедера при скролле
      const header = document.querySelector('.header');
      
      window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
          header.style.background = 'rgba(10, 10, 10, 0.95)';
          header.style.backdropFilter = 'blur(10px)';
        } else {
          header.style.background = 'var(--dark-bg)';
          header.style.backdropFilter = 'blur(0)';
        }
      });
    }

    // =========================
    // ГАЛЕРЕЯ СЛАЙДОВ
    // =========================
    function initGallery() {
      const slides = document.querySelectorAll('.slide');
      const dotsContainer = document.querySelector('.slides-dots');
      const prevBtn = document.querySelector('.prev');
      const nextBtn = document.querySelector('.next');
      let currentSlide = 0;

      // Создание точек навигации
      slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
      });

      const dots = document.querySelectorAll('.dot');

      function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
      }

      function nextSlide() {
        goToSlide(currentSlide + 1);
      }

      function prevSlide() {
        goToSlide(currentSlide - 1);
      }

      prevBtn.addEventListener('click', prevSlide);
      nextBtn.addEventListener('click', nextSlide);

      // Автоматическая смена слайдов
      let slideInterval = setInterval(nextSlide, 5000);

      // Остановка автопрокрутки при наведении
      const gallery = document.querySelector('.gallery');
      gallery.addEventListener('mouseenter', () => clearInterval(slideInterval));
      gallery.addEventListener('mouseleave', () => {
        slideInterval = setInterval(nextSlide, 5000);
      });
    }

    // =========================
    // ТАЙМЕР ОБРАТНОГО ОТСЧЕТА
    // =========================
    function initCountdownTimer() {
      const daysEl = document.getElementById('days');
      const hoursEl = document.getElementById('hours');
      const minutesEl = document.getElementById('minutes');
      const secondsEl = document.getElementById('seconds');
      const countdownContainer = document.getElementById('countdown-container');

      // Устанавливаем дату начала челленджа (через 7 дней от текущей даты)
      const challengeDate = new Date();
      challengeDate.setDate(challengeDate.getDate() + 7);
      challengeDate.setHours(10, 0, 0, 0); // 10:00 утра

      function updateCountdown() {
        const now = new Date().getTime();
        const distance = challengeDate - now;

        if (distance < 0) {
          // Если время истекло
          countdownContainer.innerHTML = '<div class="timer-expired">Челлендж начался! Присоединяйтесь!</div>';
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Анимация изменения цифр
        animateValue(daysEl, days.toString().padStart(2, '0'));
        animateValue(hoursEl, hours.toString().padStart(2, '0'));
        animateValue(minutesEl, minutes.toString().padStart(2, '0'));
        animateValue(secondsEl, seconds.toString().padStart(2, '0'));
      }

      function animateValue(element, newValue) {
        if (element.textContent !== newValue) {
          element.classList.add('changing');
          setTimeout(() => {
            element.textContent = newValue;
            element.classList.remove('changing');
          }, 300);
        }
      }

      // Обновляем каждую секунду
      updateCountdown();
      setInterval(updateCountdown, 1000);
    }

    // =========================
    // СИСТЕМА ЧАСТИЦ ДЛЯ ФОНА
    // =========================
    function initParticles() {
      const particlesContainer = document.getElementById('particles');
      const particleCount = 30;

      for (let i = 0; i < particleCount; i++) {
        createParticle();
      }

      function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 5 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        particlesContainer.appendChild(particle);
      }
    }

    // =========================
    // МОДАЛЬНОЕ ОКНО
    // =========================
    function initModal() {
      const modal = document.getElementById('payment-modal');
      const openButtons = document.querySelectorAll('.btn-challenge, .btn-large');
      const closeButton = document.querySelector('.close-payment');

      openButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          modal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        });
      });

      closeButton.addEventListener('click', closeModal);

      // Закрытие по клику вне модального окна
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });

      function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }