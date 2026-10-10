/* ================= Tesla Detailing — script.js ================= */

document.addEventListener('DOMContentLoaded', function () {

  var TELEGRAM_USER = 'teslavs';
  var TELEGRAM_URL  = 'https://t.me/' + TELEGRAM_USER;
  var reduceMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Мобильное меню (бургер) ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 2. Заголовки секций тоже появляются плавно ---------- */
  document.querySelectorAll('.section-title, .section-sub').forEach(function (el) {
    el.classList.add('reveal');
  });

  /* ---------- 3. Каскадное появление (стаггер) ---------- */
  document.querySelectorAll('.grid, .steps, .gallery, .contacts-grid, .faq').forEach(function (container) {
    var i = 0;
    container.querySelectorAll('.reveal').forEach(function (el) {
      el.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
      i++;
    });
  });

  /* ---------- 4. Появление блоков при прокрутке ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- 5. Счётчики в герое (8+ / 4 000+ / 2 года) ---------- */
  function animateCounter(el) {
    var text = el.textContent.trim();
    var m = text.match(/^([^\d]*)(\d[\d\s]*)(.*)$/);
    if (!m) return;
    var prefix = m[1];
    var target = parseInt(m[2].replace(/\s/g, ''), 10);
    var suffix = m[3];
    if (!isFinite(target) || target < 2) return;

    var start = null;
    var duration = 1300;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var value = Math.round(target * eased);
      el.textContent = prefix + value.toLocaleString('ru-RU') + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var statsBlock = document.querySelector('.hero-stats');
  if (statsBlock && !reduceMotion) {
    if ('IntersectionObserver' in window) {
      var statsIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          statsBlock.querySelectorAll('strong').forEach(animateCounter);
          statsIo.disconnect();
        });
      }, { threshold: 0.4 });
      statsIo.observe(statsBlock);
    } else {
      statsBlock.querySelectorAll('strong').forEach(animateCounter);
    }
  }

  /* ---------- 6. Параллакс фона героя ---------- */
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg && !reduceMotion) {
    heroBg.style.willChange = 'transform';
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < 1000) heroBg.style.transform = 'translateY(' + (y * 0.12).toFixed(2) + 'px) scale(1.06)';
    }, { passive: true });
  }

  /* ---------- 7. Шапка при прокрутке + кнопка «наверх» ---------- */
  var header = document.querySelector('.site-header');
  var toTop = document.getElementById('toTop');

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 16);
    if (toTop) toTop.classList.toggle('show', y > 620);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 8. Минимальная дата в форме = сегодня ---------- */
  var dateInput = document.getElementById('date');
  var today = new Date();
  var todayStr = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');
  if (dateInput) dateInput.setAttribute('min', todayStr);

  /* ---------- 9. Год в подвале ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 10. FAQ: открыт только один вопрос ---------- */
  var faqItems = document.querySelectorAll('#faqList details');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- 11. Валидация формы + передача заявки в Telegram ---------- */
  var form = document.getElementById('bookingForm');
  var response = document.getElementById('formResponse');
  var fieldName = document.getElementById('name');
  var fieldPhone = document.getElementById('phone');
  var fieldCar = document.getElementById('car');
  var fieldService = document.getElementById('service');
  var fieldDate = document.getElementById('date');

  function showResponse(message, type, link) {
    if (!response) return;
    response.className = 'form-response ' + type;
    response.innerHTML = '';

    var p = document.createElement('p');
    p.textContent = message;
    response.appendChild(p);

    if (link) {
      var a = document.createElement('a');
      a.href = link;
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'response-link';
      a.textContent = 'Открыть чат Telegram';
      response.appendChild(a);
    }

    if (type === 'success') {
      setTimeout(function () {
        response.className = 'form-response';
        response.innerHTML = '';
      }, 15000);
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  function formatDate(iso) {
    var parts = iso.split('-');
    return parts.length === 3 ? parts[2] + '.' + parts[1] + '.' + parts[0] : iso;
  }

  function buildMessage(data) {
    return [
      'Новая заявка с сайта Tesla Detailing',
      '',
      'Имя: ' + data.name,
      'Телефон: ' + data.phone,
      'Авто: ' + data.car,
      'Услуга: ' + data.service,
      'Желаемая дата: ' + formatDate(data.date)
    ].join('\n');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name    = fieldName.value.trim();
      var phone   = fieldPhone.value.trim();
      var car     = fieldCar.value.trim();
      var service = fieldService.options[fieldService.selectedIndex].text;
      var date    = fieldDate.value;

      if (!name || !phone || !car || !fieldService.value || !date) {
        showResponse('Пожалуйста, заполните все поля.', 'error');
        return;
      }

      if (name.length < 2) {
        showResponse('Введите, пожалуйста, имя (минимум 2 символа).', 'error');
        return;
      }

      var digits = phone.replace(/\D/g, '');
      if (!/^[78]\d{10}$/.test(digits)) {
        showResponse('Проверьте телефон: формат +7XXXXXXXXXX или 8XXXXXXXXXX.', 'error');
        return;
      }

      if (date < todayStr) {
        showResponse('Дата не может быть в прошлом.', 'error');
        return;
      }

      var message = buildMessage({
        name: name, phone: phone, car: car, service: service, date: date
      });

      // Открываем чат Telegram (только по действию пользователя — так не блокируется браузером)
      var chatWindow = window.open(TELEGRAM_URL, '_blank');
      if (chatWindow) chatWindow.opener = null;

      copyToClipboard(message).then(function () {
        showResponse(
          'Спасибо, ' + name + '! Текст заявки скопирован — вставьте его в чат (Ctrl+V) и отправьте. ' +
          'Мы ответим в течение 15 минут.',
          'success',
          chatWindow ? null : TELEGRAM_URL
        );
      }).catch(function () {
        showResponse(
          'Чат Telegram открыт. Скопируйте, пожалуйста, данные заявки вручную и отправьте их нам.',
          'success',
          chatWindow ? null : TELEGRAM_URL
        );
      });

      form.reset();
      if (dateInput) dateInput.setAttribute('min', todayStr);
    });
  }

  /* ---------- 12. Блок «До/После»: ползунок сравнения ---------- */
  var sliders = document.querySelectorAll('.ba-slider');

  function applyPosition(slider, value) {
    var p = Math.max(0, Math.min(100, parseFloat(value)));
    var before = slider.querySelector('.ba-before');
    var line = slider.querySelector('.ba-line');
    var knob = slider.querySelector('.ba-knob');
    if (before) before.style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)';
    if (line) line.style.left = p + '%';
    if (knob) knob.style.left = p + '%';
    return p;
  }

  sliders.forEach(function (slider) {
    var range = slider.querySelector('.ba-range');
    if (!range) return;

    range.addEventListener('input', function () {
      applyPosition(slider, range.value);
    });
    applyPosition(slider, range.value);

    // Один раз показываем, что ползунок тянется: 50 → 82 → 18 → 50
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    var hinted = false;
    var hintIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || hinted) return;
        hinted = true;
        hintIo.disconnect();

        var start = null;
        var duration = 1500;

        function hint(ts) {
          if (start === null) start = ts;
          var t = Math.min((ts - start) / duration, 1);
          var v;
          if (t < 0.35)      v = 50 + (82 - 50) * (t / 0.35);
          else if (t < 0.75) v = 82 + (18 - 82) * ((t - 0.35) / 0.40);
          else               v = 18 + (50 - 18) * ((t - 0.75) / 0.25);

          range.value = v;
          applyPosition(slider, v);
          if (t < 1) requestAnimationFrame(hint);
        }
        setTimeout(function () { requestAnimationFrame(hint); }, 300);
      });
    }, { threshold: 0.45 });
    hintIo.observe(slider);
  });

  /* ---------- 13. Фоновая история: кадры меняются при прокрутке ---------- */
  var bgFrames = Array.prototype.slice.call(document.querySelectorAll('#bgStage .bg-frame'));
  var bgScenes = Array.prototype.slice.call(document.querySelectorAll('[data-bg-frame]'));

  if (bgFrames.length && bgScenes.length) {
    var currentFrame = -1;

    // Ленивая подгрузка: тянем кадр заранее, а не всю историю сразу
    function loadFrame(i) {
      for (var k = i; k <= i + 1 && k < bgFrames.length; k++) {
        var f = bgFrames[k];
        if (f && !f.getAttribute('src') && f.getAttribute('data-src')) {
          f.setAttribute('src', f.getAttribute('data-src'));
        }
      }
    }

    function showFrame(i) {
      if (i === currentFrame) return;
      currentFrame = i;
      bgFrames.forEach(function (f, idx) { f.classList.toggle('is-active', idx === i); });
    }

    var bgTicking = false;

    function updateFrame() {
      bgTicking = false;
      var mid = window.innerHeight * 0.5;
      var best = 0;
      var bestDist = Infinity;

      bgScenes.forEach(function (scene) {
        var rect = scene.getBoundingClientRect();
        var dist = Math.abs(rect.top + rect.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = parseInt(scene.getAttribute('data-bg-frame'), 10) || 0;
        }
      });

      loadFrame(best);
      showFrame(best);
    }

    function requestFrameUpdate() {
      if (bgTicking) return;
      bgTicking = true;
      requestAnimationFrame(updateFrame);
    }

    window.addEventListener('scroll', requestFrameUpdate, { passive: true });
    window.addEventListener('resize', requestFrameUpdate, { passive: true });

    loadFrame(0);
    showFrame(0);
    updateFrame();
  }

});
