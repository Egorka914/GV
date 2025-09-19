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
// Модальное окно оплаты
const modalPayment = document.getElementById('modal-payment');
const btnChallenge = document.querySelector('.btn-challenge');
const closePayment = document.querySelector('.close-payment');
const paymentForm = document.getElementById('payment-form');
const paymentSuccess = document.getElementById('payment-success');

btnChallenge.addEventListener('click', () => {
  modalPayment.style.display = 'flex';
});

closePayment.addEventListener('click', () => {
  modalPayment.style.display = 'none';
  paymentForm.reset();
  paymentSuccess.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modalPayment) {
    modalPayment.style.display = 'none';
    paymentForm.reset();
    paymentSuccess.style.display = 'none';
  }
});
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");
const navOverlay = document.getElementById("nav-overlay");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  hamburger.classList.toggle("active");
  navOverlay.classList.toggle("active");
});

// Закрытие меню при клике на фон
navOverlay.addEventListener("click", () => {
  navMenu.classList.remove("active");
  hamburger.classList.remove("active");
  navOverlay.classList.remove("active");
});



// Обработка формы оплаты (симуляция)
paymentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // Здесь можно интегрировать реальный платёжный сервис
  paymentSuccess.style.display = 'block';
  paymentForm.reset();
  const ykButton = document.getElementById("yookassa-button");
const modalPayment = document.getElementById("modal-payment");
const closePayment = document.querySelector(".close-payment");

// Открытие модального окна
document.querySelector(".btn-challenge").addEventListener("click", () => {
  modalPayment.style.display = "flex";
});

// Закрытие модального окна
closePayment.addEventListener("click", () => modalPayment.style.display = "none");
window.addEventListener("click", (e) => {
  if (e.target === modalPayment) modalPayment.style.display = "none";
});

// Кнопка оплаты — редирект
ykButton.addEventListener("click", async () => {
  try {
    // Запрос на сервер для создания платежа
    const response = await fetch("/create-payment", { method: "POST" });
    const data = await response.json();

    // Перенаправление пользователя на ЮKassa
    window.location.href = data.confirmation_url;
  } catch (err) {
    alert("Ошибка при оплате. Попробуйте снова.");
    console.error(err);
  }
});

});const express = require("express");
const fetch = require("node-fetch"); // npm i node-fetch@2
const app = express();

app.use(express.static("public"));
app.use(express.json());

const SHOP_ID = "ВАШ_SHOP_ID";
const SECRET_KEY = "ВАШ_СЕКРЕТНЫЙ_КЛЮЧ";

app.post("/create-payment", async (req, res) => {
  try {
    const paymentData = {
      amount: {
        value: "500.00",
        currency: "RUB"
      },
      confirmation: {
        type: "redirect",
        return_url: "http://localhost:3000/success.html"
      },
      capture: true,
      description: "Оплата участия в челлендже"
    };

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString("base64")
      }
    });

    const data = await response.json();
    res.json({ confirmation_url: data.confirmation.confirmation_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка создания платежа" });
  }
});

app.listen(3000, () => console.log("Сервер запущен на http://localhost:3000"));


