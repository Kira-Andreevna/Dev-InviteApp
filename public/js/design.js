// ===== Модуль дизайна открытки =====

const DEFAULT_DESIGN = {
  colorPrimary: '#7c5cbf',
  colorBg:      '#ffffff',
  colorBlock:   '#ffffff',
  colorText:    '#2d2d2d',
  colorHeading: '#ffffff',
  colorHero1:   '#7c5cbf',
  colorHero2:   '#f4a261',
  fontHeading:  "'Segoe UI', sans-serif",
  fontBody:     "'Segoe UI', sans-serif",
  fontSizeBase: 16,
  fontSizeRatio: 1.8,
  fontSizeLocked: true,
  radius:       12,
  blockGap:     16,
  decoration:   null,
  bgPattern:    null,
  heroStyle:    'gradient',
  dividerStyle: 'none',
  blockShadow:  'soft',
  shadowColor:  '#000000',
  animation:    'fade',
  _theme:       null
};

// ===== Шрифты =====
const FONTS_HEADING = [
  // ✦ Роскошные засечки
  { label: 'Cormorant Garamond',  value: "'Cormorant Garamond', serif",   gf: 'Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400' },
  { label: 'Playfair Display',    value: "'Playfair Display', serif",     gf: 'Playfair+Display:ital,wght@0,400;0,700;1,400' },
  { label: 'DM Serif Display',    value: "'DM Serif Display', serif",     gf: 'DM+Serif+Display:ital@0;1' },
  { label: 'Bodoni Moda',         value: "'Bodoni Moda', serif",          gf: 'Bodoni+Moda:ital,wght@0,400;0,700;1,400' },
  { label: 'Libre Baskerville',   value: "'Libre Baskerville', serif",    gf: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400' },
  { label: 'Spectral',            value: "'Spectral', serif",             gf: 'Spectral:ital,wght@0,300;0,600;1,300' },
  // ✦ Современные гротески
  { label: 'Montserrat',          value: "'Montserrat', sans-serif",      gf: 'Montserrat:wght@300;400;700;900' },
  { label: 'Raleway',             value: "'Raleway', sans-serif",         gf: 'Raleway:wght@300;400;700' },
  { label: 'Josefin Sans',        value: "'Josefin Sans', sans-serif",    gf: 'Josefin+Sans:wght@100;300;400;700' },
  { label: 'Bebas Neue',          value: "'Bebas Neue', cursive",         gf: 'Bebas+Neue' },
  { label: 'Oswald',              value: "'Oswald', sans-serif",          gf: 'Oswald:wght@300;400;700' },
  { label: 'Cinzel',              value: "'Cinzel', serif",               gf: 'Cinzel:wght@400;700;900' },
  // ✦ Каллиграфия и рукопись
  { label: 'Great Vibes',         value: "'Great Vibes', cursive",        gf: 'Great+Vibes' },
  { label: 'Sacramento',          value: "'Sacramento', cursive",         gf: 'Sacramento' },
  { label: 'Pinyon Script',       value: "'Pinyon Script', cursive",      gf: 'Pinyon+Script' },
  { label: 'Alex Brush',          value: "'Alex Brush', cursive",         gf: 'Alex+Brush' },
  { label: 'Tangerine',           value: "'Tangerine', cursive",          gf: 'Tangerine:wght@400;700' },
  { label: 'Dancing Script',      value: "'Dancing Script', cursive",     gf: 'Dancing+Script:wght@400;700' },
  { label: 'Pacifico',            value: "'Pacifico', cursive",           gf: 'Pacifico' },
  { label: 'Lobster',             value: "'Lobster', cursive",            gf: 'Lobster' },
  // ✦ Системный
  { label: 'Segoe UI',            value: "'Segoe UI', sans-serif",        gf: null },
];

const FONTS_BODY = [
  { label: 'Lato',                value: "'Lato', sans-serif",            gf: 'Lato:wght@300;400;700' },
  { label: 'Open Sans',           value: "'Open Sans', sans-serif",       gf: 'Open+Sans:wght@300;400;600' },
  { label: 'Nunito',              value: "'Nunito', sans-serif",          gf: 'Nunito:wght@300;400;600' },
  { label: 'Jost',                value: "'Jost', sans-serif",            gf: 'Jost:wght@300;400;500' },
  { label: 'DM Sans',             value: "'DM Sans', sans-serif",         gf: 'DM+Sans:wght@300;400;500' },
  { label: 'Inter',               value: "'Inter', sans-serif",           gf: 'Inter:wght@300;400;500' },
  { label: 'Roboto',              value: "'Roboto', sans-serif",          gf: 'Roboto:wght@300;400;500' },
  { label: 'PT Sans',             value: "'PT Sans', sans-serif",         gf: 'PT+Sans:wght@400;700' },
  { label: 'Merriweather',        value: "'Merriweather', serif",         gf: 'Merriweather:wght@300;400;700' },
  { label: 'PT Serif',            value: "'PT Serif', serif",             gf: 'PT+Serif' },
  { label: 'Cormorant',           value: "'Cormorant', serif",            gf: 'Cormorant:wght@300;400;500' },
  { label: 'Source Sans 3',       value: "'Source Sans 3', sans-serif",   gf: 'Source+Sans+3:wght@300;400;600' },
  { label: 'Segoe UI',            value: "'Segoe UI', sans-serif",        gf: null },
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

// ===== Фоновые паттерны =====
const BG_PATTERNS = [
  { id: null,       name: 'Нет',        preview: '' },
  { id: 'dots',     name: 'Точки',      preview: '' },
  { id: 'grid',     name: 'Сетка',      preview: '' },
  { id: 'diagonal', name: 'Диагональ',  preview: '' },
  { id: 'waves',    name: 'Волны',      preview: '' },
  { id: 'circles',  name: 'Круги',      preview: '' },
  { id: 'noise',    name: 'Шум',        preview: '' },
  { id: 'linen',    name: 'Лён',        preview: '' },
];

// ===== Стили Hero-блока =====
const HERO_STYLES = [
  { id: 'gradient',  name: 'Градиент',   preview: '' },
  { id: 'solid',     name: 'Сплошной',   preview: '' },
  { id: 'wave',      name: 'Волна',      preview: '' },
  { id: 'diagonal',  name: 'Диагональ',  preview: '' },
  { id: 'glass',     name: 'Стекло',     preview: '' },
  { id: 'dark',      name: 'Тёмный',     preview: '' },
];

// ===== Разделители блоков =====
const DIVIDER_STYLES = [
  { id: 'none',    name: 'Нет',      preview: '' },
  { id: 'line',    name: 'Линия',    preview: '' },
  { id: 'dots',    name: 'Точки',    preview: '' },
  { id: 'wave',    name: 'Волна',    preview: '' },
  { id: 'diamond', name: 'Ромб',     preview: '' },
  { id: 'floral',  name: 'Флора',    preview: '' },
];

// ===== Тени блоков =====
const BLOCK_SHADOWS = [
  { id: 'none',    name: 'Нет' },
  { id: 'soft',    name: 'Мягкая' },
  { id: 'lifted',  name: 'Поднятая' },
  { id: 'glow',    name: 'Свечение' },
];

// ===== Анимации появления =====
const ANIMATIONS = [
  { id: 'none',    name: 'Нет' },
  { id: 'fade',    name: 'Плавно' },
  { id: 'slide',   name: 'Снизу' },
  { id: 'zoom',    name: 'Масштаб' },
  { id: 'flip',    name: 'Переворот' },
];

// ===== Инициализация =====
function initDesignPanel(designData) {
  window.design = Object.assign({}, DEFAULT_DESIGN, designData || {});
  renderFontSelects();
  renderThemes();
  renderDecorations();
  renderBgPatterns();
  renderHeroStyles();
  renderDividerStyles();
  renderBlockShadows();
  renderAnimations();
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
         onclick="selectDecoration(${d.id === null ? 'null' : `'${d.id}'`})">
      <span style="font-size:1.3rem">${d.preview}</span>
      <span style="font-size:0.65rem;margin-top:0.2rem;text-align:center">${d.name}</span>
    </div>
  `).join('');
}

function renderBgPatterns() {
  const el = document.getElementById('bgPatternsList');
  if (!el) return;
  el.innerHTML = BG_PATTERNS.map(p => `
    <div class="style-chip ${window.design.bgPattern === p.id ? 'selected' : ''}"
         onclick="selectBgPattern(${p.id === null ? 'null' : `'${p.id}'`})">
      <span class="style-chip-icon">${p.preview}</span>
      <span>${p.name}</span>
    </div>`).join('');
}

function renderHeroStyles() {
  const el = document.getElementById('heroStylesList');
  if (!el) return;
  el.innerHTML = HERO_STYLES.map(s => `
    <div class="style-chip ${window.design.heroStyle === s.id ? 'selected' : ''}"
         onclick="selectHeroStyle('${s.id}')">
      <span class="style-chip-icon">${s.preview}</span>
      <span>${s.name}</span>
    </div>`).join('');
}

function renderDividerStyles() {
  const el = document.getElementById('dividerStylesList');
  if (!el) return;
  el.innerHTML = DIVIDER_STYLES.map(s => `
    <div class="style-chip ${window.design.dividerStyle === s.id ? 'selected' : ''}"
         onclick="selectDividerStyle('${s.id}')">
      <span class="style-chip-icon">${s.preview}</span>
      <span>${s.name}</span>
    </div>`).join('');
}

function renderBlockShadows() {
  const el = document.getElementById('blockShadowsList');
  if (!el) return;
  el.innerHTML = BLOCK_SHADOWS.map(s => `
    <div class="style-chip ${window.design.blockShadow === s.id ? 'selected' : ''}"
         onclick="selectBlockShadow('${s.id}')">
      <span>${s.name}</span>
    </div>`).join('');
}

function renderAnimations() {
  const el = document.getElementById('animationsList');
  if (!el) return;
  el.innerHTML = ANIMATIONS.map(a => `
    <div class="style-chip ${window.design.animation === a.id ? 'selected' : ''}"
         onclick="selectAnimation('${a.id}')">
      <span>${a.name}</span>
    </div>`).join('');
}

function syncDesignControls() {
  const d = window.design;
  setVal('dColorPrimary', d.colorPrimary);
  setVal('dColorBg',      d.colorBg);
  setVal('dColorBlock',   d.colorBlock || d.colorBg);
  setVal('dColorText',    d.colorText);
  setVal('dColorHeading', d.colorHeading || '#ffffff');
  setVal('dColorHero1',   d.colorHero1);
  setVal('dColorHero2',   d.colorHero2);
  setVal('dFontHeading',  d.fontHeading);
  setVal('dFontBody',     d.fontBody);
  setVal('dFontSizeBase', d.fontSizeBase);
  setVal('dFontRatio',    d.fontSizeRatio);
  setVal('dRadius',       d.radius);
  setVal('dBlockGap',     d.blockGap ?? 16);
  setVal('dShadowColor',  d.shadowColor || '#000000');

  const base  = d.fontSizeBase  || 16;
  const ratio = d.fontSizeRatio || 1.8;
  document.getElementById('dFontSizeBaseVal').textContent  = base + 'px';
  document.getElementById('dFontRatioVal').textContent     = 'заг. ' + Math.round(base * ratio) + 'px';
  document.getElementById('dRadiusVal').textContent        = radiusLabel(d.radius);
  document.getElementById('dBlockGapVal').textContent      = (d.blockGap ?? 16) + 'px';
  updateLockBtn(d.fontSizeLocked);
  updateShadowColorVisibility(d.blockShadow);
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

// ===== Генерация CSS фонового паттерна =====
function getBgPatternCSS(patternId, primaryColor) {
  const c = primaryColor || '#7c5cbf';
  // Конвертируем hex в rgba с низкой прозрачностью
  const r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16);
  const rgba = (a) => `rgba(${r},${g},${b},${a})`;

  switch (patternId) {
    case 'dots':
      return `radial-gradient(${rgba(0.12)} 1.5px, transparent 1.5px)`;
    case 'grid':
      return `linear-gradient(${rgba(0.08)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(0.08)} 1px, transparent 1px)`;
    case 'diagonal':
      return `repeating-linear-gradient(45deg, ${rgba(0.06)} 0, ${rgba(0.06)} 1px, transparent 0, transparent 50%)`;
    case 'waves':
      return `repeating-linear-gradient(0deg, transparent, transparent 28px, ${rgba(0.07)} 28px, ${rgba(0.07)} 30px)`;
    case 'circles':
      return `radial-gradient(circle at 50% 50%, ${rgba(0.05)} 20%, transparent 20%), radial-gradient(circle at 0% 0%, ${rgba(0.05)} 20%, transparent 20%)`;
    case 'noise':
      return `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;
    case 'linen':
      return `repeating-linear-gradient(0deg, ${rgba(0.04)}, ${rgba(0.04)} 1px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, ${rgba(0.04)}, ${rgba(0.04)} 1px, transparent 1px, transparent 4px)`;
    default:
      return 'none';
  }
}

// ===== Генерация стиля Hero =====
function getHeroStyle(heroStyle, h1, h2) {
  switch (heroStyle) {
    case 'solid':    return `background:${h1};`;
    case 'wave':     return `background:linear-gradient(160deg,${h1} 0%,${h2} 100%);`;
    case 'diagonal': return `background:linear-gradient(135deg,${h1} 50%,${h2} 50%);`;
    case 'glass':    return `background:linear-gradient(135deg,${h1}cc,${h2}99);backdrop-filter:blur(10px);`;
    case 'dark':     return `background:linear-gradient(135deg,#0d0d0d,#1a1a2e);`;
    default:         return `background:linear-gradient(135deg,${h1},${h2});`;
  }
}

// ===== Применение темы =====
function applyTheme(themeId) {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return;
  Object.assign(window.design, theme.colors, theme.fonts, { _theme: themeId });
  // colorBlock следует за colorBg при смене темы
  window.design.colorBlock = theme.colors.colorBg;
  // colorHeading следует за colorPrimary при смене темы (белый — для hero на цветном фоне)
  window.design.colorHeading = '#ffffff';
  syncDesignControls();
  loadGoogleFonts();
  applyDesignToPreview();
  renderThemes();
  scheduleDraftSave();
}

// ===== Дебаунс для слайдеров =====
let _designTimer = null;
function updateDesignDebounced(key, value) {
  if (['fontSizeBase','fontSizeRatio','radius','blockGap'].includes(key)) {
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
  if (key === 'blockGap') {
    document.getElementById('dBlockGapVal').textContent = Math.round(value) + 'px';
  }
  // Шрифты грузим сразу, остальное — с задержкой
  if (key === 'fontHeading' || key === 'fontBody') {
    loadGoogleFonts();
    applyDesignToPreview();
    scheduleDraftSave();
    return;
  }

  clearTimeout(_designTimer);
  _designTimer = setTimeout(() => applyDesignToPreview(), 80);
  scheduleDraftSave();
}

// Алиас для вызовов из HTML
function updateDesign(key, value) {
  updateDesignDebounced(key, value);
}

function toggleFontLock() {
  window.design.fontSizeLocked = !window.design.fontSizeLocked;
  updateLockBtn(window.design.fontSizeLocked);
  scheduleDraftSave();
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
  scheduleDraftSave();
}

function selectBgPattern(id) {
  window.design.bgPattern = id;
  renderBgPatterns();
  applyDesignToPreview();
  scheduleDraftSave();
}

function selectHeroStyle(id) {
  window.design.heroStyle = id;
  renderHeroStyles();
  applyDesignToPreview();
  scheduleDraftSave();
}

function selectDividerStyle(id) {
  window.design.dividerStyle = id;
  renderDividerStyles();
  applyDesignToPreview();
  scheduleDraftSave();
}

function selectBlockShadow(id) {
  window.design.blockShadow = id;
  renderBlockShadows();
  updateShadowColorVisibility(id);
  applyDesignToPreview();
  scheduleDraftSave();
}

function updateShadowColorVisibility(shadowId) {
  const row = document.getElementById('dShadowColorRow');
  if (row) row.style.display = (shadowId === 'soft' || shadowId === 'lifted' || shadowId === 'glow') ? 'flex' : 'none';
}

function selectAnimation(id) {
  window.design.animation = id;
  renderAnimations();
  applyDesignToPreview();
  scheduleDraftSave();
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
  preview.style.setProperty('--inv-block-bg', d.colorBlock || d.colorBg);
  preview.style.setProperty('--inv-text',     d.colorText);
  preview.style.setProperty('--inv-heading',  d.colorHeading || d.colorPrimary);
  preview.style.setProperty('--inv-hero1',    d.colorHero1);
  preview.style.setProperty('--inv-hero2',    d.colorHero2);
  preview.style.setProperty('--inv-font-h',   d.fontHeading);
  preview.style.setProperty('--inv-font-b',   d.fontBody);
  preview.style.setProperty('--inv-fsize',    base + 'px');
  preview.style.setProperty('--inv-hsize',    hSize + 'px');
  preview.style.setProperty('--inv-radius',   d.radius + 'px');
  preview.style.setProperty('--inv-block-gap', (d.blockGap ?? 16) + 'px');
  preview.style.backgroundColor = d.colorBg;

  // Фоновый паттерн
  preview.style.backgroundImage = getBgPatternCSS(d.bgPattern, d.colorPrimary);
  const patternSizes = { dots:'24px 24px', grid:'32px 32px', diagonal:'8px 8px', circles:'60px 60px', waves:'auto 32px', linen:'4px 4px' };
  preview.style.backgroundSize = patternSizes[d.bgPattern] || 'auto';

  // Тень блоков
  preview.setAttribute('data-shadow', d.blockShadow || 'soft');
  preview.setAttribute('data-hero-style', d.heroStyle || 'gradient');
  preview.setAttribute('data-divider', d.dividerStyle || 'none');
}

// ===== Применение дизайна к превью (перерисовка + переменные) =====
function applyDesignToPreview() {
  if (typeof renderPreview === 'function') renderPreview();
  applyDesignVars();
  updateDecorationOverlay(document.getElementById('invitePreview'), window.design.decoration);
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
  scheduleDraftSave();
}

// ===== Глобальный макет =====
function setGlobalLayout(layout) {
  // Применяем layout ко всем блокам у которых нет своего
  if (typeof blocks !== 'undefined') {
    blocks.forEach(b => { if (!b.layoutLocked) b.layout = layout; });
    if (typeof renderPreview === 'function') renderPreview();
    scheduleDraftSave();
  }
}
