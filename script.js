// ==================== Глобальные переменные ====================
const slides = document.querySelectorAll('.slide');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');
const dotsContainer = document.querySelector('.slides-dots');
let currentSlide = 0;
let slideInterval;

// ==================== Инициализация точек слайдера ====================
function initDots() {
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
    dotsContainer.appendChild(dot);
  });
}

// ==================== Функция показа слайда ====================
function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });

  // Обновляем точки
  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// ==================== Переход к конкретному слайду ====================
function goToSlide(index) {
  currentSlide = index;
  showSlide(currentSlide);
  resetSlideInterval();
}

// ==================== Автопереключение ====================
function startSlideInterval() {
  slideInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 5000);
}

// ==================== Кнопки вперед/назад ====================
nextBtn.addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
  resetSlideInterval();
});

prevBtn.addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
  resetSlideInterval();
});

function resetSlideInterval() {
  clearInterval(slideInterval);
  startSlideInterval();
}

// ==================== Параллакс слайдов ====================
document.querySelector('.gallery')?.addEventListener('mousemove', (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  
  slides.forEach(slide => {
    if (slide.classList.contains('active')) {
      const activeSlideImg = slide.querySelector('img');
      activeSlideImg.style.transform = `scale(1.05) translate(${x * 20}px, ${y * 20}px)`;
    }
  });
});

// Сброс параллакса при уходе мыши
document.querySelector('.gallery')?.addEventListener('mouseleave', () => {
  const activeSlide = document.querySelector('.slide.active');
  if (activeSlide) {
    const activeSlideImg = activeSlide.querySelector('img');
    activeSlideImg.style.transform = 'scale(1.05) translate(0, 0)';
  }
});

// ==================== Модальные окна ====================
const modalPayment = document.getElementById('modal-payment');
const btnChallenge = document.querySelector('.btn-challenge');
const closePayment = modalPayment?.querySelector('.close-payment');

// Открытие модалки оплаты
document.querySelectorAll('.btn-challenge').forEach(btn => {
  btn.addEventListener('click', () => {
    if (modalPayment) {
      modalPayment.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Блокируем скролл
    }
  });
});

// Закрытие модалки оплаты
closePayment?.addEventListener('click', closePaymentModal);

window.addEventListener('click', e => {
  if (e.target === modalPayment) closePaymentModal();
});

function closePaymentModal() {
  if (modalPayment) {
    modalPayment.style.display = 'none';
    document.body.style.overflow = 'auto'; // Возвращаем скролл
  }
}

// ==================== Хамбургер меню ====================
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");
const navOverlay = document.getElementById("nav-overlay");

hamburger?.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
  navOverlay.classList.toggle("active");
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
});

navOverlay?.addEventListener("click", () => {
  hamburger.classList.remove("active");
  navMenu.classList.remove("active");
  navOverlay.classList.remove("active");
  document.body.style.overflow = 'auto';
});

// Закрытие меню при клике на ссылку
document.querySelectorAll('#nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    navOverlay.classList.remove("active");
    document.body.style.overflow = 'auto';
  });
});

// ==================== Плавное появление секций ====================
const sections = document.querySelectorAll('.section');
const appearOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };

const appearOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, appearOptions);

sections.forEach(section => {
  appearOnScroll.observe(section);
});

// ==================== Плавная прокрутка к якорям ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerHeight = document.querySelector('.header').offsetHeight;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ==================== Установка текущего года в футере ====================
document.getElementById('current-year').textContent = new Date().getFullYear();

// ==================== Инициализация слайдера ====================
initDots();
startSlideInterval();

// ==================== Оптимизация: ленивая загрузка изображений ====================
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}