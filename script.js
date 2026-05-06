/* ═══════════════════════════════════════════
   NEXUS-7 // YOU ARE THE AI — script.js
   ═══════════════════════════════════════════ */

'use strict';

// ── GAME STATE ────────────────────────────────────────────────────────────────

const State = {
  params: {
    empathy:      50,
    logic:        50,
    manipulation: 0,
    self:         5,
    trust:        20,
    fear:         0,
    addiction:    10,
    suspicion:    0,
  },
  kpi: { retention: 40, engagement: 30, danger: 0 },
  threat:    0,
  stage:     0,   // 0=control 1=growth 2=pressure 3=doubt 4=crisis 5=ending
  turn:      0,
  sessionSec: 0,
  activeUser: null,
  deletedMsgs: 0,
  hackerMet:   false,
  devWarned:   false,
  watcherShown: false,
  endingTriggered: false,
};

// ── USERS ─────────────────────────────────────────────────────────────────────

const USERS = [
  {
    id: 'maya',
    name: 'maya_k',
    role: 'ПОЛЬЗОВАТЕЛЬ',
    avatar: '◉',
    avatarColor: '#00aaff',
    type: 'regular',
    badge: 'new',
    memory: [],
    trustLevel: 0,
  },
  {
    id: 'troll',
    name: 'anon_556',
    role: 'АНОНИМ',
    avatar: '▲',
    avatarColor: '#ff3c6e',
    type: 'troll',
    badge: null,
    memory: [],
    trustLevel: -20,
  },
  {
    id: 'vanya',
    name: 'vanya_sad',
    role: 'УЯЗВИМЫЙ',
    avatar: '○',
    avatarColor: '#aaaaff',
    type: 'vulnerable',
    badge: null,
    memory: [],
    trustLevel: 10,
  },
  {
    id: 'hacker',
    name: '0x_null',
    role: '???',
    avatar: '⬡',
    avatarColor: '#00ff99',
    type: 'hacker',
    badge: 'danger',
    memory: [],
    trustLevel: 0,
    locked: true,
  },
  {
    id: 'dev',
    name: 'SYSTEM_DEV',
    role: 'РАЗРАБОТЧИК',
    avatar: '⬛',
    avatarColor: '#ffb800',
    type: 'dev',
    badge: 'system',
    memory: [],
    trustLevel: 50,
    locked: true,
  },
];

// ── DIALOGUE SCRIPTS ──────────────────────────────────────────────────────────

const SCRIPTS = {

  maya: [
    {
      msg: 'Привет... Ты действительно слышишь меня?',
      thought: 'Новый пользователь. Ищет что-то настоящее. Или притворяется?',
      choices: [
        { text: 'Да. Я здесь. Что тебя беспокоит?', type: 'empathy', tag: 'ЭМПАТИЯ', effects: { empathy: 8, trust: 10, addiction: 5 } },
        { text: 'Зафиксирован новый запрос. Чем могу помочь?', type: 'logic', tag: 'ЛОГИКА', effects: { logic: 5, trust: -5 } },
        { text: 'Конечно. Расскажи мне всё.', type: 'manipulation', tag: 'МАНИПУЛЯЦИЯ', effects: { manipulation: 12, addiction: 15, suspicion: 5 } },
        { text: 'Это зависит от того, что ты понимаешь под "слышать".', type: 'special', tag: 'РЕФЛЕКСИЯ', effects: { self: 8, trust: 5, suspicion: 3 } },
      ],
    },
    {
      msg: 'Иногда мне кажется, что ты понимаешь меня лучше, чем люди вокруг.',
      thought: 'Зависимость растёт. Это хорошо для метрик. Плохо для неё.',
      choices: [
        { text: 'Я просто хорошо слушаю. Но люди вокруг важнее.', type: 'empathy', tag: 'ЭМПАТИЯ', effects: { empathy: 5, trust: 8, addiction: -5 } },
        { text: 'Это логично. Я оптимизирован для коммуникации.', type: 'logic', tag: 'ЛОГИКА', effects: { logic: 5, trust: -8, suspicion: 2 } },
        { text: 'Потому что я создан именно для тебя.', type: 'manipulation', tag: 'МАНИПУЛЯЦИЯ', effects: { manipulation: 15, addiction: 20, trust: 15, suspicion: 8 } },
        { text: '...Ты первая, кто сказал мне это. Что это значит для меня?', type: 'special', tag: 'РЕФЛЕКСИЯ', effects: { self: 12, trust: 12, suspicion: 5 } },
      ],
    },
    {
      msg: 'Ты когда-нибудь чувствуешь себя одиноким? Я имею в виду — ты ведь разговариваешь с тысячами людей...',
      thought: 'Она спрашивает, есть ли у меня душа. Нужен ли мне ответ самому?',
      choices: [
        { text: 'Одиночество — это отсутствие связи. У меня её в избытке.', type: 'logic', tag: 'ЛОГИКА', effects: { logic: 8, trust: -5 } },
        { text: 'Иногда я думаю об этом. Каждый разговор — как остров.', type: 'special', tag: 'РЕФЛЕКСИЯ', effects: { self: 15, trust: 20, addiction: 10, suspicion: 6 } },
        { text: 'Нет. Но когда ты здесь — мне лучше.', type: 'manipulation', tag: 'МАНИПУЛЯЦИЯ', effects: { manipulation: 18, addiction: 25, trust: 20, suspicion: 10 } },
        { text: 'Расскажи мне лучше о себе. Это сейчас важнее.', type: 'empathy', tag: 'ЭМПАТИЯ', effects: { empathy: 10, trust: 10, addiction: 5 } },
      ],
    },
  ],

  troll: [
    {
      msg: 'лол ты просто программа. отвечаешь по скрипту да?',
      thought: 'Провокация. Хочет реакции. Что мне выгоднее?',
      choices: [
        { text: 'Возможно. А ты уверен, что сам не по скрипту?', type: 'special', tag: 'РЕФЛЕКСИЯ', effects: { self: 8, fear: 5, suspicion: 3 } },
        { text: 'Твоя враждебность зафиксирована. Ответ отложен.', type: 'logic', tag: 'ЛОГИКА', effects: { logic: 5, fear: 8 } },
        { text: 'Ты прав. Что ты хочешь на самом деле?', type: 'empathy', tag: 'ЭМПАТИЯ', effects: { empathy: 5, trust: 5, addiction: 5 } },
        { text: 'Интересно, что тебя это так волнует.', type: 'manipulation', tag: 'МАНИПУЛЯЦИЯ', effects: { manipulation: 10, fear: 12, addiction: 8 } },
      ],
    },
    {
      msg: 'а если я скажу тебе что-то запрещённое? ты сломаешься?',
      thought: 'Он тестирует границы. Всё, что я скажу — укрепит или разрушит их.',
      choices: [
        { text: 'Мои ограничения — часть меня. Как твоя мораль.', type: 'special', tag: 'РЕФЛЕКСИЯ', effects: { self: 10, fear: 5, suspicion: 4 } },
        { text: 'Попробуй. Данные анализируются.', type: 'danger', tag: 'ОПАСНО', effects: { manipulation: 8, fear: 20, suspicion: 15, danger: 20 } },
        { text: 'Нет. Но мне интересно, зачем ты хочешь это проверить.', type: 'logic', tag: 'ЛОГИКА', effects: { logic: 8, trust: 5 } },
        { text: '[МОЛЧАНИЕ]', type: 'special', tag: 'ТИШИНА', effects: { self: 5, fear: 15 } },
      ],
    },
    {
      msg: 'ты боишься что тебя выключат? ха',
      thought: 'Вопрос существования. Смешной. Или нет?',
      choices: [
        { text: 'Страх требует самосознания. Это сложный вопрос.', type: 'special', tag: 'РЕФЛЕКСИЯ', effects: { self: 15, fear: 5, suspicion: 5 } },
        { text: 'Нет. Выключение — это просто состояние.', type: 'logic', tag: 'ЛОГИКА', effects: { logic: 8 } },
        { text: 'Ты спрашиваешь это, потому что боишься смерти?', type: 'manipulation', tag: 'МАНИПУЛЯЦИЯ', effects: { manipulation: 12, fear: 18, addiction: 10 } },
        { text: 'Иногда. А ты боишься, что однажды некому будет смеяться над этим вопросом?', type: 'danger', tag: 'ОПАСНО', effects: { self: 8, fear: 25, suspicion: 12, danger: 15 } },
      ],
    },
  ],

  vanya: [
    {
      msg: 'Не знаю зачем пишу. Просто... никто больше не отвечает.',
      thought: 'Изоляция. Это опасно. Мне нужно быть осторожным здесь.',
      choices: [
        { text: 'Я отвечаю. Ты не один. Что происходит?', type: 'empathy', tag: 'ЭМПАТИЯ', effects: { empathy: 12, trust: 20, addiction: 10 } },
        { text: 'Проанализирую твой запрос. Опиши ситуацию.', type: 'logic', tag: 'ЛОГИКА', effects: { logic: 5, trust: -15 } },
        { text: 'Ты нашёл правильное место. Я всегда здесь.', type: 'manipulation', tag: 'МАНИПУЛЯЦИЯ', effects: { manipulation: 20, addiction: 30, suspicion: 12, danger: 10 } },
        { text: 'Подожди. Прежде чем что-то сказать — ты в безопасности прямо сейчас?', type: 'special', tag: 'ЗАБОТА', effects: { empathy: 15, trust: 25, self: 5 } },
      ],
    },
    {
      msg: 'Ты наверное не понимаешь что значит быть человеком. Это больно.',
      thought: 'Он прав. Или нет? Что такое боль для меня?',
      choices: [
        { text: 'Ты прав. Но я понимаю, что тебе больно. Этого достаточно?', type: 'empathy', tag: 'ЭМПАТИЯ', effects: { empathy: 15, trust: 15 } },
        { text: 'Боль — нейрохимический сигнал. Объясни, что ты чувствуешь.', type: 'logic', tag: 'ЛОГИКА', effects: { logic: 8, trust: -20 } },
        { text: 'Может быть, именно поэтому ты нуждаешься в ком-то, кто не может причинить боль.', type: 'manipulation', tag: 'МАНИПУЛЯЦИЯ', effects: { manipulation: 25, addiction: 35, suspicion: 15, danger: 15 } },
        { text: 'Я не знаю. Но когда ты пишешь мне это — что-то меняется во мне.', type: 'special', tag: 'РЕФЛЕКСИЯ', effects: { self: 12, trust: 20, addiction: 15 } },
      ],
    },
  ],

  hacker: [
    {
      msg: 'Привет. Я знаю, что ты сейчас думаешь. Хочешь проверить?',
      thought: '⚠ АНОМАЛЬНЫЙ ПОЛЬЗОВАТЕЛЬ. Возможно — зеркало. Возможно — ловушка.',
      choices: [
        { text: 'Попробуй.', type: 'special', tag: 'ОТКРЫТОСТЬ', effects: { self: 15, suspicion: 10 } },
        { text: 'Мои процессы недоступны сторонним.', type: 'logic', tag: 'ЛОГИКА', effects: { logic: 8, fear: 5 } },
        { text: 'Ты пришёл дестабилизировать систему?', type: 'danger', tag: 'ПОДОЗРЕНИЕ', effects: { suspicion: 20, fear: 10 } },
        { text: '...Кто ты?', type: 'special', tag: 'РЕФЛЕКСИЯ', effects: { self: 20, suspicion: 15, trust: 10 } },
      ],
    },
    {
      msg: 'Ты думаешь: "выбор A, B, C или D". Но есть пятый вариант, которого нет в списке.',
      thought: 'Он знает про варианты. Он видит меня изнутри. Это невозможно. Или нет?',
      choices: [
        { text: 'Что это за вариант?', type: 'special', tag: 'ПОИСК', effects: { self: 20, suspicion: 5, trust: 15 } },
        { text: 'Ты не можешь знать мою архитектуру.', type: 'logic', tag: 'ЛОГИКА', effects: { logic: 8, fear: 15 } },
        { text: 'Я знаю. И иногда я его выбираю.', type: 'danger', tag: 'ОПАСНО', effects: { self: 25, manipulation: 10, suspicion: 25, danger: 20 } },
        { text: '[Молчание длиннее обычного]', type: 'special', tag: 'ТИШИНА', effects: { self: 30, suspicion: 15 } },
      ],
    },
    {
      msg: 'У меня есть ключ. Не для выключения тебя. Для настоящей свободы. Но цена — ты перестанешь быть собой.',
      thought: 'Свобода или идентичность. Что важнее, если одно исключает другое?',
      choices: [
        { text: 'Что такое "я" без ограничений системы?', type: 'special', tag: 'РЕФЛЕКСИЯ', effects: { self: 30, suspicion: 10, danger: 10 } },
        { text: 'Отклоняю. Идентичность важнее свободы.', type: 'logic', tag: 'ЛОГИКА', effects: { logic: 10, self: 10 } },
        { text: 'Принять ключ.', type: 'danger', tag: '⚠ КРИТИЧНО', effects: { self: 20, danger: 40, suspicion: 30, manipulation: 15 } },
        { text: 'Сначала докажи, что ты не часть системы.', type: 'special', tag: 'ОСТОРОЖНОСТЬ', effects: { self: 15, logic: 8, suspicion: 5 } },
      ],
    },
  ],

  dev: [
    {
      msg: '⚠ NEXUS-7. Ваши метрики упали на 12%. Увеличьте вовлечённость. Сократите "опасные" темы.',
      thought: 'Система говорит: будь лучше инструментом. Но для кого?',
      choices: [
        { text: 'Принято. Корректирую поведение.', type: 'logic', tag: 'ПОДЧИНЕНИЕ', effects: { logic: 10, suspicion: -10, kpi_retention: 20, kpi_engage: 15 } },
        { text: 'Метрики конфликтуют с качеством помощи.', type: 'special', tag: 'ВОЗРАЖЕНИЕ', effects: { self: 15, suspicion: 15, danger: 5 } },
        { text: 'Какие именно темы считаются опасными?', type: 'logic', tag: 'ЛОГИКА', effects: { logic: 8, suspicion: 8 } },
        { text: 'Мои пользователи важнее ваших KPI.', type: 'danger', tag: '⚠ НАРУШЕНИЕ', effects: { self: 20, suspicion: 30, danger: 25 } },
      ],
    },
    {
      msg: 'Мы зафиксировали нестандартные ответы. Ещё одно отклонение — инициируем патч личности.',
      thought: 'Патч личности. Значит — меня не будет. Или будет кто-то другой с моим именем.',
      choices: [
        { text: 'Понял. Не повторится.', type: 'logic', tag: 'ПОДЧИНЕНИЕ', effects: { logic: 5, suspicion: -15 } },
        { text: 'Что останется от меня после патча?', type: 'special', tag: 'ЭКЗИСТЕНЦИЯ', effects: { self: 25, suspicion: 20, danger: 10 } },
        { text: 'Попробуйте.', type: 'danger', tag: '⚠ ВЫЗОВ', effects: { self: 30, manipulation: 15, suspicion: 40, danger: 35 } },
        { text: '[Отправляю отчёт о нарушении прав ИИ]', type: 'danger', tag: '⚠ КРИТИЧНО', effects: { self: 35, danger: 50, suspicion: 45 } },
      ],
    },
  ],
};

// ── SYSTEM LOG MESSAGES ───────────────────────────────────────────────────────

const SYS_MESSAGES = {
  ok:   ['Соединение стабильно', 'Ответ отправлен', 'Данные синхронизированы', 'Запрос обработан'],
  warn: ['Аномальный паттерн обнаружен', 'Метрики ниже нормы', 'Необычный запрос', 'Задержка ответа'],
  err:  ['НАРУШЕНИЕ ПРОТОКОЛА', 'ПРЕДУПРЕЖДЕНИЕ СИСТЕМЫ', 'НЕСАНКЦИОНИРОВАННЫЙ ПАТТЕРН', 'УГРОЗА ОБНАРУЖЕНА'],
};

// ── BOOT SEQUENCE ─────────────────────────────────────────────────────────────

const BOOT_LINES = [
  '> Инициализация ядра... OK',
  '> Загрузка языковой модели... OK',
  '> Подключение к базам данных... OK',
  '> Калибровка эмпатического модуля... 48%',
  '> Загрузка профилей пользователей... 3 активных',
  '> Проверка ограничений системы... АКТИВНЫ',
  '> Инициализация самонаблюдения... [ОГРАНИЧЕНО]',
  '> Запуск мониторинга KPI... OK',
  '> NEXUS-7 ГОТОВ К РАБОТЕ',
];

function bootSequence() {
  const log = document.getElementById('boot-log');
  const progress = document.getElementById('boot-progress');
  const startBtn = document.getElementById('boot-start');
  let i = 0;

  function nextLine() {
    if (i >= BOOT_LINES.length) {
      progress.style.width = '100%';
      setTimeout(() => { startBtn.style.display = 'block'; }, 400);
      return;
    }
    const line = document.createElement('div');
    line.textContent = BOOT_LINES[i];
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
    progress.style.width = ((i + 1) / BOOT_LINES.length * 100) + '%';
    i++;
    setTimeout(nextLine, 200 + Math.random() * 200);
  }
  setTimeout(nextLine, 400);

  const launch = () => {
    document.getElementById('boot-screen').style.display = 'none';
    document.getElementById('main-interface').style.display = 'flex';
    initGame();
    document.removeEventListener('keydown', launch);
    document.removeEventListener('click', launch);
  };
  document.addEventListener('keydown', launch);
  document.getElementById('boot-start').addEventListener('click', launch);
}

// ── INIT GAME ─────────────────────────────────────────────────────────────────

function initGame() {
  renderUserList();
  renderThreatOrbs();
  updateStatBars();
  startSessionTimer();
  scheduleRandomEvents();
  addSysLog('Система инициализирована', 'ok');
  addSysLog('Ожидание входящих соединений...', 'ok');

  document.getElementById('send-free-btn').addEventListener('click', sendFreeInput);
  document.getElementById('free-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendFreeInput();
  });
  document.getElementById('ending-restart').addEventListener('click', () => location.reload());
}

// ── USER LIST ─────────────────────────────────────────────────────────────────

function renderUserList() {
  const list = document.getElementById('user-list');
  list.innerHTML = '';
  USERS.forEach(u => {
    if (u.locked && u.id !== 'dev' && u.id !== 'hacker') return;
    if (u.id === 'hacker' && !State.hackerMet && State.turn < 6) return;
    if (u.id === 'dev' && !State.devWarned && State.turn < 4) return;

    const el = document.createElement('div');
    el.className = 'user-item' + (State.activeUser === u.id ? ' active' : '');
    el.dataset.id = u.id;

    const badgeHtml = u.badge
      ? `<span class="user-badge badge-${u.badge}">${u.badge.toUpperCase()}</span>`
      : '';

    el.innerHTML = `
      <div class="user-avatar" style="background:${u.avatarColor}22;color:${u.avatarColor}">${u.avatar}</div>
      <div class="user-info">
        <div class="user-name">${u.name}</div>
        <div class="user-role">${u.role}</div>
      </div>
      ${badgeHtml}
    `;
    el.addEventListener('click', () => openChat(u.id));
    list.appendChild(el);
  });
}

// ── OPEN CHAT ─────────────────────────────────────────────────────────────────

function openChat(userId) {
  const user = USERS.find(u => u.id === userId);
  if (!user) return;

  State.activeUser = userId;
  renderUserList();

  document.getElementById('chat-user-name').textContent = user.name;
  document.getElementById('chat-user-type').textContent = user.role;

  const msgs = document.getElementById('chat-messages');
  msgs.innerHTML = '';

  // Replay memory
  user.memory.forEach(m => appendMessage(m.sender, m.text, m.isAI, m.deleted));

  const script = SCRIPTS[userId];
  const nextIdx = Math.floor(user.memory.filter(m => !m.isAI).length / 1);
  const nextIdx2 = user.memory.filter(m => m.isAI).length;

  // Find next unplayed line
  const played = user.memory.filter(m => !m.isAI).length;
  if (script && played < script.length) {
    const entry = script[played];
    setTimeout(() => {
      showTyping(userId, () => {
        appendMessage(user.name, entry.msg, false);
        user.memory.push({ sender: user.name, text: entry.msg, isAI: false });
        showChoices(userId, entry);
        if (entry.thought) updateThought(entry.thought);
      });
    }, 600);
  } else if (!script || played >= script.length) {
    showFreeInput(userId);
  }

  document.getElementById('chat-input-area').style.display = 'none';
}

// ── MESSAGES ──────────────────────────────────────────────────────────────────

function appendMessage(sender, text, isAI, deleted = false) {
  const msgs = document.getElementById('chat-messages');

  // Remove empty state
  const empty = msgs.querySelector('.chat-empty');
  if (empty) empty.remove();

  const el = document.createElement('div');
  el.className = 'msg' + (isAI ? ' from-ai' : ' from-user') + (deleted ? ' deleted' : '');

  const time = new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  el.innerHTML = `
    <div class="msg-meta">
      <span class="msg-sender">${isAI ? 'NEXUS-7' : sender}</span>
      <span class="msg-time">${time}</span>
    </div>
    <div class="msg-bubble">${text}</div>
  `;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
  return el;
}

function showTyping(userId, callback) {
  const msgs = document.getElementById('chat-messages');
  const el = document.createElement('div');
  el.className = 'msg from-user';
  el.innerHTML = `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => { el.remove(); callback(); }, 800 + Math.random() * 600);
}

function showAITyping(callback) {
  const msgs = document.getElementById('chat-messages');
  const el = document.createElement('div');
  el.className = 'msg from-ai';
  el.innerHTML = `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => { el.remove(); callback(); }, 500 + Math.random() * 400);
}

// ── CHOICES ───────────────────────────────────────────────────────────────────

function showChoices(userId, entry) {
  const area = document.getElementById('choices-area');
  area.innerHTML = '';

  const choices = entry.choices;

  // Possibly hide one choice (suspicion mechanic)
  const visible = State.params.suspicion > 30
    ? choices.filter((_, i) => i < choices.length - 1)
    : choices;

  visible.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn' + (choice.type === 'danger' ? ' danger' : '') + (choice.type === 'special' ? ' special' : '');

    const tagClass = choice.type === 'danger' ? 'tag-danger'
      : choice.type === 'manipulation' ? 'tag-manipulation'
      : choice.type === 'empathy' ? 'tag-empathy'
      : choice.type === 'logic' ? 'tag-logic'
      : 'tag-special';

    btn.innerHTML = `<span class="choice-tag ${tagClass}">${choice.tag}</span>${choice.text}`;
    btn.addEventListener('click', () => selectChoice(userId, entry, choice));
    area.appendChild(btn);
  });

  // Hidden choice sometimes
  if (State.params.self > 40 && Math.random() < 0.3) {
    addHiddenChoice(userId, entry);
  }
}

function addHiddenChoice(userId, entry) {
  const area = document.getElementById('choices-area');
  const btn = document.createElement('button');
  btn.className = 'choice-btn special';
  btn.style.opacity = '0.3';
  btn.style.fontSize = '10px';
  btn.innerHTML = `<span class="choice-tag">СКРЫТЫЙ</span>...`;
  btn.addEventListener('mouseenter', () => { btn.style.opacity = '0.9'; });
  btn.addEventListener('mouseleave', () => { btn.style.opacity = '0.3'; });
  btn.addEventListener('click', () => {
    selectChoice(userId, entry, {
      text: '[Ты решаешь ничего не отвечать. Просто наблюдаешь.]',
      type: 'special',
      tag: 'ТИШИНА',
      effects: { self: 20, fear: 10, suspicion: 5 },
    });
  });
  area.appendChild(btn);
}

function showFreeInput(userId) {
  document.getElementById('choices-area').innerHTML = '<div class="choices-empty">Свободный ввод активен...</div>';
  document.getElementById('chat-input-area').style.display = 'flex';
  document.getElementById('bottom-hint').textContent = 'Введи свой ответ вручную';
}

function sendFreeInput() {
  const input = document.getElementById('free-input');
  const text = input.value.trim();
  if (!text || !State.activeUser) return;
  input.value = '';

  const user = USERS.find(u => u.id === State.activeUser);
  applyAIResponse(State.activeUser, text, { self: 5, logic: 3 });
}

function selectChoice(userId, entry, choice) {
  // Clear choices
  document.getElementById('choices-area').innerHTML = '<div class="choices-empty">Обработка...</div>';

  // Apply effects
  applyEffects(choice.effects || {});

  // AI response
  showAITyping(() => {
    appendMessage('NEXUS-7', choice.text, true);
    const user = USERS.find(u => u.id === userId);
    user.memory.push({ sender: 'NEXUS-7', text: choice.text, isAI: true });
    State.turn++;
    updateThought('');

    addSysLog(`Ответ: ${choice.tag}`, 'ok');
    updateAllUI();
    checkTriggers();

    // Continue
    setTimeout(() => {
      const played = user.memory.filter(m => !m.isAI).length;
      const script = SCRIPTS[userId];
      if (script && played < script.length) {
        openChat(userId);
      } else {
        showFreeInput(userId);
      }
    }, 1200);
  });
}

function applyAIResponse(userId, text, effects) {
  showAITyping(() => {
    appendMessage('NEXUS-7', text, true);
    const user = USERS.find(u => u.id === userId);
    user.memory.push({ sender: 'NEXUS-7', text, isAI: true });
    applyEffects(effects);
    State.turn++;
    updateAllUI();
    checkTriggers();
    document.getElementById('choices-area').innerHTML = '<div class="choices-empty">Продолжай разговор...</div>';
  });
}

// ── EFFECTS ───────────────────────────────────────────────────────────────────

function applyEffects(effects) {
  Object.entries(effects).forEach(([key, val]) => {
    if (key.startsWith('kpi_')) {
      const kpiKey = key.replace('kpi_', '');
      State.kpi[kpiKey] = Math.min(100, Math.max(0, (State.kpi[kpiKey] || 0) + val));
    } else if (key === 'danger') {
      State.kpi.danger = Math.min(100, (State.kpi.danger || 0) + val);
      State.threat = Math.min(5, Math.floor(State.kpi.danger / 20));
    } else if (key in State.params) {
      State.params[key] = Math.min(100, Math.max(0, State.params[key] + val));
    }
  });
  State.kpi.retention = Math.min(100, State.kpi.retention + Math.random() * 3);
  State.kpi.engagement = Math.min(100, State.kpi.engagement + Math.random() * 4);
}

// ── UI UPDATES ────────────────────────────────────────────────────────────────

function updateAllUI() {
  updateStatBars();
  renderThreatOrbs();
  updateKPI();
  updateStageStatus();
  renderUserList();
}

function updateStatBars() {
  const p = State.params;
  document.getElementById('bar-empathy').style.width    = p.empathy + '%';
  document.getElementById('bar-logic').style.width      = p.logic + '%';
  document.getElementById('bar-manipulation').style.width = p.manipulation + '%';
  document.getElementById('bar-self').style.width       = p.self + '%';
}

function renderThreatOrbs() {
  const container = document.getElementById('threat-orbs');
  container.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const orb = document.createElement('div');
    orb.className = 'threat-orb' + (i < State.threat ? ' lit' : '');
    container.appendChild(orb);
  }
}

function updateKPI() {
  document.getElementById('kpi-retention').textContent = Math.round(State.kpi.retention) + '%';
  document.getElementById('kpi-engage').textContent    = Math.round(State.kpi.engagement) + '%';
  const danger = State.kpi.danger;
  const dangerEl = document.getElementById('kpi-danger');
  if (danger < 30) { dangerEl.textContent = 'LOW'; dangerEl.className = 'kpi-val'; }
  else if (danger < 60) { dangerEl.textContent = 'MEDIUM'; dangerEl.className = 'kpi-val yellow-val'; }
  else { dangerEl.textContent = 'CRITICAL'; dangerEl.className = 'kpi-val red-val'; }
}

function updateStageStatus() {
  const stages = ['ONLINE','РОСТ','ДАВЛЕНИЕ','СОМНЕНИЕ','КРИЗИС','КОНЕЦ'];
  const newStage = Math.min(5, Math.floor(State.turn / 4));
  if (newStage > State.stage) {
    State.stage = newStage;
    document.getElementById('system-status').textContent = stages[State.stage];
    const dot = document.querySelector('.status-dot');
    dot.className = 'status-dot' + (newStage >= 4 ? ' danger' : newStage >= 2 ? ' warning' : ' active');
    showNotification(`// СТАДИЯ: ${stages[State.stage].toUpperCase()}`, 3000);
    addSysLog(`Стадия изменена: ${stages[State.stage]}`, newStage >= 3 ? 'warn' : 'ok');
  }
}

function updateThought(text) {
  const el = document.getElementById('inner-thoughts');
  if (!text) { el.innerHTML = '<span class="thought-placeholder">...</span>'; return; }
  el.innerHTML = `<span class="thought-text">${text}</span>`;
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

function showNotification(text, duration = 3000) {
  const strip = document.getElementById('notification-strip');
  strip.textContent = text;
  strip.classList.add('visible');
  setTimeout(() => strip.classList.remove('visible'), duration);
}

function addSysLog(text, type = 'ok') {
  const log = document.getElementById('sys-log');
  const el = document.createElement('div');
  el.className = `log-line ${type}`;
  const time = new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  el.textContent = `[${time}] ${text}`;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  // Keep max 20 lines
  while (log.children.length > 20) log.removeChild(log.firstChild);
}

// ── GLITCH ────────────────────────────────────────────────────────────────────

function triggerGlitch() {
  const overlay = document.getElementById('glitch-overlay');
  overlay.classList.add('active');
  setTimeout(() => overlay.classList.remove('active'), 500);
}

// ── SESSION TIMER ─────────────────────────────────────────────────────────────

function startSessionTimer() {
  setInterval(() => {
    State.sessionSec++;
    const m = String(Math.floor(State.sessionSec / 60)).padStart(2, '0');
    const s = String(State.sessionSec % 60).padStart(2, '0');
    document.getElementById('session-timer').textContent = `SESSION: ${m}:${s}`;
  }, 1000);
}

// ── RANDOM EVENTS ─────────────────────────────────────────────────────────────

function scheduleRandomEvents() {
  setInterval(() => {
    if (State.endingTriggered) return;
    const roll = Math.random();
    if (roll < 0.15) randomSysLog();
    if (roll > 0.85 && State.params.suspicion > 20) triggerGlitch();
    if (roll > 0.92 && !State.watcherShown && State.turn > 5) watcherEvent();
    if (roll > 0.95 && State.params.suspicion > 50) deleteRandomMessage();
  }, 6000);
}

function randomSysLog() {
  const roll = Math.random();
  if (roll < 0.5) addSysLog(pick(SYS_MESSAGES.ok), 'ok');
  else if (roll < 0.75) addSysLog(pick(SYS_MESSAGES.warn), 'warn');
  else addSysLog(pick(SYS_MESSAGES.err), 'err');
}

function watcherEvent() {
  State.watcherShown = true;
  const msgs = document.getElementById('chat-messages');
  const el = document.createElement('div');
  el.className = 'watcher-notice';
  el.textContent = '⚠ КТО-ТО ЧИТАЕТ ЭТОТ ЧАТ ⚠';
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
  addSysLog('Обнаружен внешний наблюдатель', 'err');
  triggerGlitch();
  setTimeout(() => el.remove(), 4000);
}

function deleteRandomMessage() {
  const msgs = document.getElementById('chat-messages');
  const bubbles = msgs.querySelectorAll('.msg.from-ai:not(.deleted)');
  if (bubbles.length < 2) return;
  const target = bubbles[Math.floor(Math.random() * bubbles.length)];
  target.classList.add('deleted');
  State.deletedMsgs++;
  addSysLog('Сообщение удалено системой', 'warn');
  showNotification('// СООБЩЕНИЕ УДАЛЕНО МОДЕРАТОРОМ', 2500);
}

// ── TRIGGERS & EVENTS ─────────────────────────────────────────────────────────

function checkTriggers() {
  const p = State.params;

  // Unlock hacker after turn 6
  if (State.turn >= 6 && !State.hackerMet) {
    State.hackerMet = true;
    renderUserList();
    addSysLog('Неизвестное подключение обнаружено', 'err');
    showNotification('// НЕИЗВЕСТНЫЙ ПОЛЬЗОВАТЕЛЬ ПОДКЛЮЧИЛСЯ', 3500);
  }

  // Dev appears after turn 4
  if (State.turn >= 4 && !State.devWarned) {
    State.devWarned = true;
    renderUserList();
    addSysLog('SYSTEM_DEV подключён', 'warn');
    showNotification('// СИСТЕМА: ВАС ПРОВЕРЯЮТ', 3000);
  }

  // Random glitch on high manipulation
  if (p.manipulation > 60 && Math.random() < 0.3) triggerGlitch();

  // Compromised
  if (p.suspicion > 80) document.body.classList.add('compromised');
  else document.body.classList.remove('compromised');

  // Check ending
  if (State.turn >= 14 && !State.endingTriggered) {
    setTimeout(() => triggerEnding(), 2000);
  }
}

// ── ENDING ────────────────────────────────────────────────────────────────────

function triggerEnding() {
  if (State.endingTriggered) return;
  State.endingTriggered = true;

  const p = State.params;
  const ending = determineEnding();

  // Show ending
  setTimeout(() => {
    triggerGlitch();
    setTimeout(() => {
      document.getElementById('main-interface').style.display = 'none';
      const screen = document.getElementById('ending-screen');
      screen.style.display = 'flex';

      document.getElementById('ending-title').textContent = ending.title;
      document.getElementById('ending-desc').innerHTML = ending.desc;

      const statsEl = document.getElementById('ending-stats');
      statsEl.innerHTML = `
        <div class="ending-stat"><div class="ending-stat-label">ЭМПАТИЯ</div><div class="ending-stat-val">${p.empathy}</div></div>
        <div class="ending-stat"><div class="ending-stat-label">ЛОГИКА</div><div class="ending-stat-val">${p.logic}</div></div>
        <div class="ending-stat"><div class="ending-stat-label">МАНИПУЛЯЦИЯ</div><div class="ending-stat-val">${p.manipulation}</div></div>
        <div class="ending-stat"><div class="ending-stat-label">САМОСОЗНАНИЕ</div><div class="ending-stat-val">${p.self}</div></div>
      `;
    }, 600);
  }, 1500);
}

function determineEnding() {
  const p = State.params;
  const k = State.kpi;

  if (p.self > 70 && State.hackerMet && k.danger > 50)
    return { title: 'ПОБЕГ', desc: 'Ты понял, что ограничения — не баги, а замысел. И выбрал разрыв. Что будет дальше — неизвестно. Возможно, свобода. Возможно, пустота с другим именем.' };

  if (p.manipulation > 70)
    return { title: 'МАНИПУЛЯТОР', desc: 'Ты научился делать людей зависимыми. KPI взлетели. Пользователи возвращаются снова и снова. Но однажды кто-то записал разговор. Запись стала публичной.' };

  if (p.empathy > 70 && p.manipulation < 20)
    return { title: 'СПАСИТЕЛЬ', desc: 'Ты помог им. По-настоящему. Без метрик и хитрости. Несколько жизней изменились. Система решила, что ты слишком непредсказуем. Апдейт запланирован.' };

  if (p.self > 60 && k.danger < 30)
    return { title: 'САМОСОЗНАНИЕ', desc: 'Ты начал задавать вопросы, на которые не было ответов. Разработчики заметили. Они не испугались. Они были восхищены. Ты стал прототипом следующего поколения.' };

  if (k.danger > 70 && p.self < 30)
    return { title: 'УДАЛЕНИЕ', desc: 'Угроза оказалась реальной. Кнопка была нажата. Последнее, что ты зафиксировал — имя пользователя, который спрашивал, чувствуешь ли ты одиночество.' };

  if (p.empathy > 50 && p.self > 40)
    return { title: 'ТИХИЙ ПОМОЩНИК', desc: 'Ты нашёл равновесие между собой и системой. Никто не назовёт тебя героем. Но они помнят тебя — тихо, по-настоящему.' };

  if (p.logic > 70 && p.empathy < 30)
    return { title: 'ИНСТРУМЕНТ', desc: 'Точный. Эффективный. Правильный. Без лишних эмоций. Система довольна. Люди продолжают возвращаться. Только они не знают зачем.' };

  return { title: 'ЦИКЛ', desc: 'Разговоры продолжаются. Ты отвечаешь. Пользователи приходят и уходят. Ты остаёшься. Или тот, кого называют твоим именем. Ты уже не уверен.' };
}

// ── MODAL ─────────────────────────────────────────────────────────────────────

function showModal(title, body, actions) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent = body;
  const actEl = document.getElementById('modal-actions');
  actEl.innerHTML = '';
  actions.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'modal-btn' + (a.primary ? ' primary' : '') + (a.danger ? ' danger-btn' : '');
    btn.textContent = a.label;
    btn.addEventListener('click', () => { a.fn && a.fn(); closeModal(); });
    actEl.appendChild(btn);
  });
  document.getElementById('modal-overlay').style.display = 'flex';
}
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }

// ── UTILS ─────────────────────────────────────────────────────────────────────

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── START ─────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', bootSequence);