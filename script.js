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

  /* ---------- 14. Расчёт стоимости услуги (13 услуг) ---------- */
  // Множители перемножаются: цена = base × (критерий1) × (критерий2) × …
  // base = нижняя граница = цена «от …» на карточке этапа (первый вариант каждого поля = ×1)
  // quote: true → без цифр, «по запросу» (для индивидуальных работ)
  var CALC = {
    body: {
      title: 'Ремонт кузова',
      base: 3000,
      service: 'body',
      book: 'Записаться на ремонт',
      fields: [
        { label: 'Тип повреждения', options: [
          ['Царапина', 1.0], ['Вмятина', 1.8], ['Коррозия / сквозное', 2.6]
        ]},
        { label: 'Размер повреждения', options: [
          ['До 10 см', 1.0], ['10–30 см', 1.3], ['Больше 30 см', 1.6]
        ]},
        { label: 'Повреждённых элементов', options: [
          ['1', 1.0], ['2–3', 2.0], ['4 и больше', 3.2]
        ]}
      ]
    },
    polish: {
      title: 'Полировка кузова',
      base: 8000,
      service: 'polish',
      book: 'Записаться на полировку',
      fields: [
        { label: 'Класс авто', options: [
          ['Мини / хэтчбек', 1.0], ['Седан', 1.15], ['Кроссовер', 1.35],
          ['Внедорожник', 1.55], ['Премиум', 1.9]
        ]},
        { label: 'Состояние лака', options: [
          ['Лёгкие царапины', 1.0], ['Голограммы', 1.25], ['Глубокая матовость', 1.6]
        ]},
        { label: 'Тип полировки', options: [
          ['Защитная', 1.0], ['Абразивная', 1.3], ['Комбинированная', 1.6]
        ]}
      ]
    },
    paint: {
      title: 'Покраска',
      base: 6000,
      service: 'paint',
      book: 'Записаться на покраску',
      fields: [
        { label: 'Тип краски', options: [
          ['Базовый', 1.0], ['Металлик', 1.25], ['Перламутр / 3 слоя', 1.6], ['Мат', 1.7]
        ]},
        { label: 'Элементов', options: [
          ['1', 1.0], ['2', 1.9], ['3 и больше', 2.7]
        ]},
        { label: 'Подготовка', options: [
          ['Без ремонта', 1.0], ['Со шпатлёвкой', 1.5]
        ]}
      ]
    },
    ceramic: {
      title: 'Керамическое покрытие',
      base: 25000,
      service: 'ceramic',
      book: 'Записаться на керамику',
      fields: [
        { label: 'Класс авто', options: [
          ['Мини / хэтчбек', 1.0], ['Седан', 1.15], ['Кроссовер', 1.35],
          ['Внедорожник', 1.55], ['Премиум', 1.9]
        ]},
        { label: 'Срок службы покрытия', options: [
          ['1 год', 1.0], ['2 года', 1.4], ['3–5 лет', 1.9]
        ]},
        { label: 'Слоёв', options: [
          ['1', 1.0], ['2', 1.2]
        ]},
        { label: 'Подготовка кузова', options: [
          ['Полировка не нужна', 1.0], ['Требуется полировка', 1.35]
        ]}
      ]
    },
    interior: {
      title: 'Химчистка салона',
      base: 5000,
      service: 'interior',
      book: 'Записаться на химчистку',
      fields: [
        { label: 'Объём', options: [
          ['Частичная (сиденья)', 1.0], ['Полная', 1.6]
        ]},
        { label: 'Материал', options: [
          ['Ткань', 1.0], ['Кожа / экокожа', 1.2], ['Алькантара', 1.35]
        ]},
        { label: 'Загрязнение', options: [
          ['Среднее', 1.0], ['Сильное', 1.3]
        ]},
        { label: 'Размер авто', options: [
          ['Седан / хэтчбек', 1.0], ['Кроссовер', 1.15], ['Минивэн / 7 мест', 1.35]
        ]}
      ]
    },
    ppf: {
      title: 'Бронирование плёнкой (PPF)',
      base: 40000,
      service: 'ppf',
      book: 'Записаться на PPF',
      fields: [
        { label: 'Объём', options: [
          ['Полный фронт (капот, бампер, крылья, зеркала)', 1.0], ['Полный кузов', 2.3]
        ]},
        { label: 'Плёнка', options: [
          ['Глянец', 1.0], ['Мат', 1.15]
        ]},
        { label: 'Класс авто', options: [
          ['Мини / хэтчбек', 1.0], ['Седан', 1.1], ['Кроссовер', 1.25],
          ['Внедорожник', 1.4], ['Премиум', 1.7]
        ]}
      ]
    },
    headlights: {
      title: 'Полировка фар',
      base: 3000,
      service: 'headlights',
      book: 'Записаться на полировку фар',
      fields: [
        { label: 'Количество фар', options: [
          ['2', 1.0], ['4', 1.8]
        ]},
        { label: 'Помутнение', options: [
          ['Лёгкое', 1.0], ['Сильное', 1.5]
        ]},
        { label: 'Снятие фар', options: [
          ['Без снятия', 1.0], ['Со снятием', 1.25]
        ]}
      ]
    },
    rain: {
      title: 'Антидождь на стёкла',
      base: 2500,
      service: 'rain',
      book: 'Записаться на антидождь',
      fields: [
        { label: 'Стёкла', options: [
          ['Лобовое', 1.0], ['Лобовое + передние боковые', 1.6], ['Все стёкла', 2.4]
        ]},
        { label: 'Состав', options: [
          ['Сезонный', 1.0], ['На год', 1.3]
        ]},
        { label: 'Очистка стекла', options: [
          ['Не требуется', 1.0], ['Требуется', 1.3]
        ]}
      ]
    },
    gloss: {
      title: 'Покрытие лаком',
      base: 4000,
      service: 'gloss',
      book: 'Записаться на покрытие',
      fields: [
        { label: 'Состав', options: [
          ['Воск', 1.0], ['Силант', 1.3], ['Жидкое стекло', 1.8]
        ]},
        { label: 'Класс авто', options: [
          ['Мини / хэтчбек', 1.0], ['Седан', 1.15], ['Кроссовер', 1.35],
          ['Внедорожник', 1.55], ['Премиум', 1.9]
        ]}
      ]
    },
    upholstery: {
      title: 'Обшивка салона',
      base: 15000,
      service: 'upholstery',
      book: 'Записаться на обшивку',
      fields: [
        { label: 'Что перетягиваем', options: [
          ['Руль', 1.0], ['Сиденья (пара)', 2.5], ['Панель / торпедо', 2.0], ['Потолок', 1.6]
        ]},
        { label: 'Материал', options: [
          ['Экокожа', 1.0], ['Алькантара', 1.2], ['Натуральная кожа', 1.5]
        ]},
        { label: 'Строчка', options: [
          ['Стандарт', 1.0], ['Кастом (контрастная)', 1.2]
        ]}
      ]
    },
    tuning: {
      title: 'Внешний тюнинг',
      quote: true,
      service: 'tuning',
      book: 'Обсудить тюнинг',
      fields: [
        { label: 'Тип тюнинга', options: [
          ['Обвес / бампер', 1], ['Спойлер', 1], ['Карбоновые детали', 1], ['Диски', 1]
        ]},
        { label: 'Что делаем', options: [
          ['Установка готового', 1], ['Изготовление на заказ', 1]
        ]}
      ]
    },
    engine: {
      title: 'Детейлинг двигателя',
      base: 2500,
      service: 'engine',
      book: 'Записаться на детейлинг',
      fields: [
        { label: 'Загрязнение', options: [
          ['Среднее', 1.0], ['Сильное', 1.3]
        ]},
        { label: 'Доп. работы', options: [
          ['Без допов', 1.0], ['Консервация пластика', 1.25], ['Полировка навесного', 1.5]
        ]}
      ]
    },
    wheels: {
      title: 'Реставрация дисков',
      base: 4000,
      service: 'wheels',
      book: 'Записаться на реставрацию',
      fields: [
        { label: 'Количество дисков', options: [
          ['1', 1.0], ['2', 2.0], ['3', 3.0], ['4', 3.8]
        ]},
        { label: 'Диаметр', options: [
          ['До R17', 1.0], ['R18–19', 1.15], ['R20 и больше', 1.3]
        ]},
        { label: 'Работы', options: [
          ['Шлифовка', 1.0], ['Покраска', 1.3], ['Порошковая окраска', 1.6], ['Правка геометрии', 1.4]
        ]},
        { label: 'Повреждения', options: [
          ['Задиры', 1.0], ['Гнутый диск', 1.25], ['Трещина', 1.6]
        ]}
      ]
    }
  };

  var calcModal  = document.getElementById('calcModal');
  var calcFields = document.getElementById('calcFields');
  var calcValue  = document.getElementById('calcValue');
  var calcTitle  = document.getElementById('calcTitle');
  var calcBook   = document.getElementById('calcBook');
  var lastFocus  = null;
  var activeCalc = null;

  function formatRub(n) {
    return n.toLocaleString('ru-RU').replace(/\u00A0/g, ' ') + ' ₽';
  }

  function roundPrice(n) {
    return Math.round(n / 500) * 500;
  }

  function recalc() {
    if (!activeCalc) return;
    if (activeCalc.quote) {
      calcValue.textContent = 'по запросу';
      return;
    }
    var price = activeCalc.base;
    calcFields.querySelectorAll('select').forEach(function (sel) {
      price *= parseFloat(sel.value) || 1;
    });
    calcValue.textContent = 'от ' + formatRub(roundPrice(price));
  }

  function buildCalc(cfg) {
    activeCalc = cfg;
    calcTitle.textContent = cfg.title;
    calcBook.textContent = cfg.book || 'Записаться';
    calcFields.innerHTML = '';

    cfg.fields.forEach(function (field) {
      var group = document.createElement('label');
      group.className = 'calc-field';

      var caption = document.createElement('span');
      caption.textContent = field.label;

      var sel = document.createElement('select');
      field.options.forEach(function (opt) {
        var o = document.createElement('option');
        o.value = opt[1];
        o.textContent = opt[0];
        sel.appendChild(o);
      });
      sel.addEventListener('change', recalc);

      group.appendChild(caption);
      group.appendChild(sel);
      calcFields.appendChild(group);
    });

    recalc();
  }

  function openCalc(key) {
    if (!calcModal || !CALC[key]) return;
    buildCalc(CALC[key]);
    lastFocus = document.activeElement;
    calcModal.hidden = false;
    document.body.classList.add('calc-open');
    var firstSelect = calcFields.querySelector('select');
    if (firstSelect) firstSelect.focus();
  }

  function closeCalc() {
    if (!calcModal || calcModal.hidden) return;
    calcModal.hidden = true;
    document.body.classList.remove('calc-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('.stage-calc').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openCalc(btn.getAttribute('data-service'));
    });
  });

  if (calcModal) {
    calcModal.querySelectorAll('[data-calc-close]').forEach(function (el) {
      el.addEventListener('click', closeCalc);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeCalc();
    });

    if (calcBook) {
      calcBook.addEventListener('click', function () {
        // Подставляем услугу в форму заявки, затем плавный скролл к ней
        if (form && activeCalc && activeCalc.service) {
          var opt = fieldService.querySelector('option[value="' + activeCalc.service + '"]');
          if (opt) fieldService.value = activeCalc.service;
        }
        closeCalc();
      });
    }
  }

});
