// ===== Модуль дизайна открытки =====

const DEFAULT_DESIGN = {
  colorPrimary: '#7c5cbf',
  colorBg:      '#ffffff',
  colorText:    '#2d2d2d',
  colorHero1:   '#7c5cbf',
  colorHero2:   '#f4a261',
  fontHeading:  "'Segoe UI', sans-serif",
  fontBody:     "'Segoe UI', sans-serif",
  fontSizeBase: 16,      // размер основного текста (px)
  fontSizeRatio: 1.8,    // коэффициент: заголовок = base * ratio
  fontSizeLocked: true,  // связаны ли слайдеры
  radius:       12,
  decoration:   null,
  _theme:       null
};

// ===== Шрифты =====
// Сгруппированы по характеру — реально разные
const FONTS_HEADING = [
  // Элегантные засечки
  { label: 'Cormorant Garamond — элегантный',  value: "'Cormorant Garamond', serif",  gf: 'Cormorant+Garamond' },
  { label: 'Playfair Display — классика',       value: "'Playfair Display', serif",    gf: 'Playfair+Display' },
  { label: 'Libre Baskerville — книжный',       value: "'Libre Baskerville', serif",   gf: 'Libre+Baskerville' },
  // Гротески
  { label: 'Montserrat — современный',          value: "'Montserrat', sans-serif",     gf: 'Montserrat' },
  { label: 'Raleway — геометричный',            value: "'Raleway', sans-serif",        gf: 'Raleway' },
  { label: 'Oswald — плотный',                  value: "'Oswald', sans-serif",         gf: 'Oswald' },
  { label: 'Bebas Neue — жирный дисплей',       value: "'Bebas Neue', cursive",        gf: 'Bebas+Neue' },
  // Рукописные
  { label: 'Pacifico — дружелюбный',            value: "'Pacifico', cursive",          gf: 'Pacifico' },
  { label: 'Lobster — ретро',                   value: "'Lobster', cursive",           gf: 'Lobster' },
  { label: 'Dancing Script — каллиграфия',      value: "'Dancing Script', cursive",    gf: 'Dancing+Script' },
  { label: 'Great Vibes — свадебный',           value: "'Great Vibes', cursive",       gf: 'Great+Vibes' },
  { label: 'Sacramento — тонкая рукопись',      value: "'Sacramento', cursive",        gf: 'Sacramento' },
  // Системный
  { label: 'Segoe UI — системный',              value: "'Segoe UI', sans-serif",       gf: null },
];

const FONTS_BODY = [
  { label: 'Lato — нейтральный',               value: "'Lato', sans-serif",           gf: 'Lato' },
  { label: 'Open Sans — читаемый',              value: "'Open Sans', sans-serif",      gf: 'Open+Sans' },
  { label: 'Roboto — технологичный',            value: "'Roboto', sans-serif",         gf: 'Roboto' },
  { label: 'Nunito — мягкий',                   value: "'Nunito', sans-serif",         gf: 'Nunito' },
  { label: 'PT Sans — русский дизайн',          value: "'PT Sans', sans-serif",        gf: 'PT+Sans' },
  { label: 'Merriweather — газетный',           value: "'Merriweather', serif",        gf: 'Merriweather' },
  { label: 'PT Serif — академичный',            value: "'PT Serif', serif",            gf: 'PT+Serif' },
  { label: 'Source Sans 3 — чистый',            value: "'Source Sans 3', sans-serif",  gf: 'Source+Sans+3' },
  { label: 'Segoe UI — системный',              value: "'Segoe UI', sans-serif",       gf: null },
];

// ===== Темы =====
const THEMES = [
  {
    id: 'default',  name: 'Классика',      emoji: '🤍',
    colors: { colorPrimary:'#7c5cbf', colorBg:'#ffffff', colorText:'#2d2d2d', colorHero1:'#7c5cbf', colorHero2:'#f4a261' },
    fonts:  { fontHeading: "'Segoe UI', sans-serif",          fontBody: "'Lato', sans-serif" }
  },
  {
    id: 'wedding',  name: 'Свадьба',       emoji: '💍',
    colors: { colorPrimary:'#a07850', colorBg:'#fdf8f3', colorText:'#3d2b1f', colorHero1:'#c9a87c', colorHero2:'#e8d5b7' },
    fonts:  { fontHeading: "'Great Vibes', cursive",          fontBody: "'Lato', sans-serif" }
  },
  {
    id: 'birthday', name: 'День рождения', emoji: '🎂',
    colors: { colorPrimary:'#e91e8c', colorBg:'#fff0f8', colorText:'#2d0a1e', colorHero1:'#e91e8c', colorHero2:'#ff9800' },
    fonts:  { fontHeading: "'Pacifico', cursive",             fontBody: "'Nunito', sans-serif" }
  },
  {
    id: 'nature',   name: 'Природа',       emoji: '🌿',
    colors: { colorPrimary:'#2e7d32', colorBg:'#f1f8e9', colorText:'#1b3a1e', colorHero1:'#388e3c', colorHero2:'#8bc34a' },
    fonts:  { fontHeading: "'Libre Baskerville', serif",      fontBody: "'Open Sans', sans-serif" }
  },
  {
    id: 'ocean',    name: 'Океан',         emoji: '🌊',
    colors: { colorPrimary:'#0277bd', colorBg:'#e3f2fd', colorText:'#0d1b2a', colorHero1:'#0288d1', colorHero2:'#26c6da' },
    fonts:  { fontHeading: "'Raleway', sans-serif",           fontBody: "'Source Sans 3', sans-serif" }
  },
  {
    id: 'night',    name: 'Ночь',          emoji: '🌙',
    colors: { colorPrimary:'#9c27b0', colorBg:'#1a1a2e', colorText:'#e0e0e0', colorHero1:'#4a148c', colorHero2:'#1565c0' },
    fonts:  { fontHeading: "'Oswald', sans-serif",            fontBody: "'Roboto', sans-serif" }
  },
  {
    id: 'minimal',  name: 'Минимализм',    emoji: '◻️',
    colors: { colorPrimary:'#212121', colorBg:'#fafafa', colorText:'#212121', colorHero1:'#424242', colorHero2:'#757575' },
    fonts:  { fontHeading: "'Bebas Neue', cursive",           fontBody: "'Lato', sans-serif" }
  },
  {
    id: 'rose',     name: 'Розовый',       emoji: '🌸',
    colors: { colorPrimary:'#c2185b', colorBg:'#fce4ec', colorText:'#3e0020', colorHero1:'#e91e63', colorHero2:'#f48fb1' },
    fonts:  { fontHeading: "'Dancing Script', cursive",       fontBody: "'Nunito', sans-serif" }
  },
  {
    id: 'retro',    name: 'Ретро',         emoji: '🎞️',
    colors: { colorPrimary:'#bf360c', colorBg:'#fff8e1', colorText:'#3e2723', colorHero1:'#e64a19', colorHero2:'#ff8f00' },
    fonts:  { fontHeading: "'Lobster', cursive",              fontBody: "'Merriweather', serif" }
  },
  {
    id: 'elegant',  name: 'Элегантность',  emoji: '🖤',
    colors: { colorPrimary:'#37474f', colorBg:'#eceff1', colorText:'#263238', colorHero1:'#263238', colorHero2:'#546e7a' },
    fonts:  { fontHeading: "'Cormorant Garamond', serif",     fontBody: "'PT Serif', serif" }
  },
  {
    id: 'spring',   name: 'Весна',         emoji: '🌷',
    colors: { colorPrimary:'#7b1fa2', colorBg:'#f3e5f5', colorText:'#2d0a3e', colorHero1:'#ab47bc', colorHero2:'#f06292' },
    fonts:  { fontHeading: "'Sacramento', cursive",           fontBody: "'PT Sans', sans-serif" }
  },
  {
    id: 'corporate',name: 'Корпоратив',    emoji: '💼',
    colors: { colorPrimary:'#1565c0', colorBg:'#f5f7fa', colorText:'#1a1a2e', colorHero1:'#1565c0', colorHero2:'#0097a7' },
    fonts:  { fontHeading: "'Montserrat', sans-serif",        fontBody: "'Open Sans', sans-serif" }
  }
];

// ===== Декорации =====
// Каждая декорация — набор символов + CSS-паттерн фона
const DECORATIONS = [
  { id: null,        name: 'Нет',        preview: '—',  emojis: [] },
  { id: 'confetti',  name: 'Конфетти',   preview: '🎊', emojis: ['🎊','🎉','✨','🎈','🎀','🎁'] },
  { id: 'hearts',    name: 'Сердечки',   preview: '❤️', emojis: ['❤️','💕','💖','💗','💓','🩷'] },
  { id: 'flowers',   name: 'Цветы',      preview: '🌸', emojis: ['🌸','🌺','🌼','🌻','💐','🌹'] },
  { id: 'stars',     name: 'Звёзды',     preview: '⭐', emojis: ['⭐','✨','🌟','💫','🌠','✦'] },
  { id: 'leaves',    name: 'Листья',     preview: '🍃', emojis: ['🍃','🌿','🍀','🌱','🍂','🌾'] },
  { id: 'rings',     name: 'Свадьба',    preview: '💍', emojis: ['💍','💎','🤍','🕊️','✨','🌸'] },
  { id: 'balloons',  name: 'Шарики',     preview: '🎈', emojis: ['🎈','🎊','🎉','🎀','🎁','🥳'] },
  { id: 'snowflakes',name: 'Снежинки',   preview: '❄️', emojis: ['❄️','🌨️','⛄','🌟','✨','💙'] },
  { id: 'butterflies',name:'Бабочки',    preview: '🦋', emojis: ['🦋','🌸','🌺','✨','🌿','💜'] },
];

// ===== Инициализация =====
function initDesignPanel(designData) {
  window.design = Object.assign({}, DEFAULT_DESIGN, designData || {});
  renderFontSelects();
  renderThemes();
  renderDecorations();
  syncDesignControls();
  applyDesignToPreview();
}

function renderFontSelects() {
  const hSel = document.getElementById('dFontHeading');
  const bSel = document.getElementById('dFontBody');
  if (hSel) hSel.innerHTML = FONTS_HEADING.map(f =>
    `<option value="${f.value}">${f.label}</option>`).join('');
  if (bSel) bSel.innerHTML = FONTS_BODY.map(f =>
    `<option value="${f.value}">${f.label}</option>`).join('');
}

function renderThemes() {
  document.getElementById('themesList').innerHTML = THEMES.map(t => `
    <div class="theme-card ${window.design._theme === t.id ? 'selected' : ''}"
         onclick="applyTheme('${t.id}')" title="${t.name}">
      <div class="theme-preview" style="background:linear-gradient(135deg,${t.colors.colorHero1},${t.colors.colorHero2})">
        <span style="font-family:${t.fonts.fontHeading};font-size:0.7rem;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.4)">${t.emoji}</span>
      </div>
      <div class="theme-name">${t.name}</div>
    </div>
  `).join('');
}

function renderDecorations() {
  document.getElementById('decorationsList').innerHTML = DECORATIONS.map(d => `
    <div class="decoration-card ${window.design.decoration === d.id ? 'selected' : ''}"
         onclick="selectDecoration(${JSON.stringify(d.id)})">
      <span style="font-size:1.3rem">${d.preview}</span>
      <span style="font-size:0.65rem;margin-top:0.2rem;text-align:center">${d.name}</span>
    </div>
  `).join('');
}

function syncDesignControls() {
  const d = window.design;
  setVal('dColorPrimary', d.colorPrimary);
  setVal('dColorBg',      d.colorBg);
  setVal('dColorText',    d.colorText);
  setVal('dColorHero1',   d.colorHero1);
  setVal('dColorHero2',   d.colorHero2);
  setVal('dFontHeading',  d.fontHeading);
  setVal('dFontBody',     d.fontBody);
  setVal('dFontSizeBase', d.fontSizeBase);
  setVal('dFontRatio',    d.fontSizeRatio);
  setVal('dRadius',       d.radius);

  const base  = d.fontSizeBase  || 16;
  const ratio = d.fontSizeRatio || 1.8;
  document.getElementById('dFontSizeBaseVal').textContent  = base + 'px';
  document.getElementById('dFontRatioVal').textContent     = 'заг. ' + Math.round(base * ratio) + 'px';
  document.getElementById('dRadiusVal').textContent        = radiusLabel(d.radius);
  updateLockBtn(d.fontSizeLocked);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}

function radiusLabel(r) {
  r = parseInt(r);
  if (r === 0)  return '0px — острые';
  if (r <= 8)   return r + 'px — мягкие';
  if (r <= 20)  return r + 'px — округлые';
  return r + 'px — очень круглые';
}

// ===== Применение темы =====
function applyTheme(themeId) {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return;
  Object.assign(window.design, theme.colors, theme.fonts, { _theme: themeId });
  syncDesignControls();
  loadGoogleFonts();
  applyDesignToPreview();
  renderThemes();
}

// ===== Дебаунс для слайдеров =====
let _designTimer = null;
function updateDesignDebounced(key, value) {
  if (['fontSizeBase','fontSizeRatio','radius'].includes(key)) {
    window.design[key] = parseFloat(value);
  } else {
    window.design[key] = value;
  }

  if (key === 'fontSizeBase' || key === 'fontSizeRatio') {
    const base  = window.design.fontSizeBase  || 16;
    const ratio = window.design.fontSizeRatio || 1.8;
    document.getElementById('dFontSizeBaseVal').textContent = base + 'px';
    document.getElementById('dFontRatioVal').textContent    = 'заг. ' + Math.round(base * ratio) + 'px';
  }
  if (key === 'radius') {
    document.getElementById('dRadiusVal').textContent = radiusLabel(value);
  }

  // Шрифты грузим сразу, остальное — с задержкой
  if (key === 'fontHeading' || key === 'fontBody') {
    loadGoogleFonts();
    applyDesignToPreview();
    return;
  }

  clearTimeout(_designTimer);
  _designTimer = setTimeout(() => applyDesignToPreview(), 80);
}

// Алиас для вызовов из HTML
function updateDesign(key, value) {
  updateDesignDebounced(key, value);
}

function toggleFontLock() {
  window.design.fontSizeLocked = !window.design.fontSizeLocked;
  updateLockBtn(window.design.fontSizeLocked);
}

function updateLockBtn(locked) {
  const btn = document.getElementById('dFontLockBtn');
  if (btn) {
    btn.textContent = locked ? '🔒' : '🔓';
    btn.title = locked ? 'Размеры связаны (нажмите чтобы разделить)' : 'Размеры независимы';
  }
  const ratioRow = document.getElementById('dFontRatioRow');
  if (ratioRow) ratioRow.style.display = locked ? 'none' : 'flex';
}

function selectDecoration(id) {
  window.design.decoration = id;
  renderDecorations();
  applyDesignToPreview();
}

// ===== Применение только CSS-переменных (без перерисовки блоков) =====
function applyDesignVars() {
  const d = window.design;
  const preview = document.getElementById('invitePreview');
  if (!preview) return;

  const base  = d.fontSizeBase  || 16;
  const ratio = d.fontSizeRatio || 1.8;
  const hSize = Math.round(base * ratio);

  preview.style.setProperty('--inv-primary', d.colorPrimary);
  preview.style.setProperty('--inv-bg',       d.colorBg);
  preview.style.setProperty('--inv-text',     d.colorText);
  preview.style.setProperty('--inv-hero1',    d.colorHero1);
  preview.style.setProperty('--inv-hero2',    d.colorHero2);
  preview.style.setProperty('--inv-font-h',   d.fontHeading);
  preview.style.setProperty('--inv-font-b',   d.fontBody);
  preview.style.setProperty('--inv-fsize',    base + 'px');
  preview.style.setProperty('--inv-hsize',    hSize + 'px');
  preview.style.setProperty('--inv-radius',   d.radius + 'px');
  preview.style.backgroundColor = d.colorBg;
}

// ===== Применение дизайна к превью (перерисовка + переменные) =====
function applyDesignToPreview() {
  applyDesignVars();
  updateDecorationOverlay(document.getElementById('invitePreview'), window.design.decoration);
  if (typeof renderPreview === 'function') renderPreview();
}

// ===== Декоративный оверлей =====
// Позиции фиксированы по сиду чтобы не прыгали при каждом обновлении
function updateDecorationOverlay(container, decoId) {
  container.querySelectorAll('.deco-overlay').forEach(el => el.remove());
  if (!decoId) return;

  const deco = DECORATIONS.find(d => d.id === decoId);
  if (!deco || !deco.emojis.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'deco-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  // Детерминированные позиции (псевдослучайные по индексу)
  const positions = [
    [5,3],[18,12],[35,5],[52,8],[70,2],[85,10],[92,20],
    [8,30],[25,40],[60,35],[78,28],[45,18],[15,50],[90,45],
    [30,60],[65,55],[10,70],[50,65],[80,72],[40,80],
    [20,88],[55,85],[75,90],[95,82]
  ];

  const count = Math.min(20, positions.length);
  for (let i = 0; i < count; i++) {
    const [lp, tp] = positions[i];
    const span = document.createElement('span');
    span.textContent = deco.emojis[i % deco.emojis.length];
    const size = 0.9 + (i % 5) * 0.25;
    const opacity = 0.12 + (i % 4) * 0.06;
    span.style.cssText = `position:absolute;left:${lp}%;top:${tp}%;font-size:${size}rem;opacity:${opacity};pointer-events:none;user-select:none;`;
    overlay.appendChild(span);
  }

  container.style.position = 'relative';
  container.insertBefore(overlay, container.firstChild);
}

// ===== Google Fonts =====
function buildGFMap() {
  const map = {};
  [...FONTS_HEADING, ...FONTS_BODY].forEach(f => { if (f.gf) map[f.value] = f.gf; });
  return map;
}

function loadGoogleFonts() {
  const map = buildGFMap();
  [window.design.fontHeading, window.design.fontBody].forEach(f => {
    if (!f || !map[f]) return;
    const id = 'gf-' + map[f];
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id; link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${map[f]}:wght@400;600;700&display=swap`;
      document.head.appendChild(link);
    }
  });
}

// ===== Переключение вкладок =====
function switchTab(tab) {
  document.getElementById('tabContent').style.display = tab === 'content' ? 'block' : 'none';
  document.getElementById('tabDesign').style.display  = tab === 'design'  ? 'block' : 'none';
  document.querySelectorAll('.sidebar-tab').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && tab === 'content') || (i === 1 && tab === 'design'));
  });
}

// ===== Быстрые пресеты скругления =====
function setRadius(val) {
  window.design.radius = val;
  setVal('dRadius', val);
  document.getElementById('dRadiusVal').textContent = radiusLabel(val);
  applyDesignToPreview();
}

// ===== Глобальный макет =====
function setGlobalLayout(layout) {
  // Применяем layout ко всем блокам у которых нет своего
  if (typeof blocks !== 'undefined') {
    blocks.forEach(b => { if (!b.layoutLocked) b.layout = layout; });
    if (typeof renderPreview === 'function') renderPreview();
  }
}
