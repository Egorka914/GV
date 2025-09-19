const slides = document.querySelectorAll('.slide');
let current = 0;

// Показать конкретный слайд
function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
}

// Автоперелистывание каждые 4 секунды
let slideInterval = setInterval(() => {
  current = (current + 1) % slides.length;
  showSlide(current);
}, 4000);

// Кнопки вперед/назад
document.querySelector('.next').addEventListener('click', () => {
  current = (current + 1) % slides.length;
  showSlide(current);
  resetInterval();
});

document.querySelector('.prev').addEventListener('click', () => {
  current = (current - 1 + slides.length) % slides.length;
  showSlide(current);
  resetInterval();
});

// Сброс интервала при ручном перелистывании
function resetInterval() {
  clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    current = (current + 1) % slides.length;
    showSlide(current);
  }, 4000);
}

// Параллакс при движении мыши
document.querySelector('.gallery').addEventListener('mousemove', (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  slides.forEach(slide => {
    if (slide.classList.contains('active')) {
      slide.style.transform = `scale(1.05) translate(${x * 20}px, ${y * 20}px)`;
    }
  });
});


// Модальное окно с видео
const modal = document.getElementById('modal-video');
const btnVideo = document.querySelector('.btn-video');
const spanClose = document.querySelector('.close');
const iframe = document.getElementById('video-frame');

btnVideo.addEventListener('click', () => {
  modal.style.display = 'flex';
  iframe.src = "https://www.youtube.com/embed/VIDEO_ID?autoplay=1"; // замените VIDEO_ID на ваш
});

spanClose.addEventListener('click', () => {
  modal.style.display = 'none';
  iframe.src = ""; // останавливаем видео
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    iframe.src = "";
  }
});
