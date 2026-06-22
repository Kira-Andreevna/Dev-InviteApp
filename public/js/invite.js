// ===== Страница публичного приглашения =====

const slug = location.pathname.split('/').pop();

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(`/api/invite/${slug}`);
    if (!res.ok) throw new Error('not found');
    const card = await res.json();

    const content = typeof card.content_json === 'string'
      ? JSON.parse(card.content_json)
      : card.content_json;

    document.title = card.title + ' — InviteCard';

    // Применяем дизайн
    if (content.design) applyDesign(content.design);

    renderInvite(content.blocks || []);

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('invitePage').style.display = 'block';
  } catch {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('notFound').style.display = 'block';
  }
});

// ===== Применение дизайна на публичной странице =====
function applyDesign(d) {
  const root = document.documentElement;
  if (d.colorPrimary) root.style.setProperty('--inv-primary', d.colorPrimary);
  if (d.colorBg)      { root.style.setProperty('--inv-bg', d.colorBg); document.body.style.background = d.colorBg; }
  if (d.colorBlock)   root.style.setProperty('--inv-block-bg', d.colorBlock);
  else if (d.colorBg) root.style.setProperty('--inv-block-bg', d.colorBg);
  if (d.colorText)    root.style.setProperty('--inv-text', d.colorText);
  if (d.colorHeading) root.style.setProperty('--inv-heading', d.colorHeading);
  else if (d.colorPrimary) root.style.setProperty('--inv-heading', d.colorPrimary);
  if (d.colorHero1)   root.style.setProperty('--inv-hero1', d.colorHero1);
  if (d.colorHero2)   root.style.setProperty('--inv-hero2', d.colorHero2);
  if (d.fontHeading)  root.style.setProperty('--inv-font-h', d.fontHeading);
  if (d.fontBody)     root.style.setProperty('--inv-font-b', d.fontBody);
  if (d.fontSizeBase) root.style.setProperty('--inv-fsize', d.fontSizeBase + 'px');
  if (d.radius != null) root.style.setProperty('--inv-radius', d.radius + 'px');
  root.style.setProperty('--inv-block-gap', (d.blockGap ?? 16) + 'px');

  // Цвет тени — конвертируем hex в r,g,b для использования в rgba()
  if (d.shadowColor) {
    const sc = d.shadowColor;
    const sr = parseInt(sc.slice(1,3),16), sg = parseInt(sc.slice(3,5),16), sb = parseInt(sc.slice(5,7),16);
    root.style.setProperty('--inv-shadow-clr', `${sr},${sg},${sb}`);
  }

  // Фоновый паттерн
  if (d.bgPattern) {
    document.body.style.backgroundImage = getBgPatternCSS(d.bgPattern, d.colorPrimary);
    document.body.style.backgroundSize = getBgPatternSize(d.bgPattern);
  }

  // Атрибуты для CSS-стилей
  document.body.setAttribute('data-hero-style', d.heroStyle || 'gradient');
  document.body.setAttribute('data-shadow', d.blockShadow || 'soft');
  document.body.setAttribute('data-divider', d.dividerStyle || 'none');
  document.body.setAttribute('data-animation', d.animation || 'fade');

  // Загружаем Google Fonts
  loadInviteFonts(d);

  // Декорации
  if (d.decoration) addDecorationOverlay(d.decoration);
}

function getBgPatternCSS(patternId, primaryColor) {
  const c = primaryColor || '#7c5cbf';
  const r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16);
  const rgba = (a) => `rgba(${r},${g},${b},${a})`;
  switch (patternId) {
    case 'dots':     return `radial-gradient(${rgba(0.12)} 1.5px, transparent 1.5px)`;
    case 'grid':     return `linear-gradient(${rgba(0.08)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(0.08)} 1px, transparent 1px)`;
    case 'diagonal': return `repeating-linear-gradient(45deg, ${rgba(0.06)} 0, ${rgba(0.06)} 1px, transparent 0, transparent 50%)`;
    case 'waves':    return `repeating-linear-gradient(0deg, transparent, transparent 28px, ${rgba(0.07)} 28px, ${rgba(0.07)} 30px)`;
    case 'circles':  return `radial-gradient(circle at 50% 50%, ${rgba(0.05)} 20%, transparent 20%), radial-gradient(circle at 0% 0%, ${rgba(0.05)} 20%, transparent 20%)`;
    case 'linen':    return `repeating-linear-gradient(0deg, ${rgba(0.04)}, ${rgba(0.04)} 1px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, ${rgba(0.04)}, ${rgba(0.04)} 1px, transparent 1px, transparent 4px)`;
    default:         return 'none';
  }
}

function getBgPatternSize(patternId) {
  switch (patternId) {
    case 'dots':     return '24px 24px';
    case 'grid':     return '32px 32px';
    case 'diagonal': return '8px 8px';
    case 'circles':  return '60px 60px';
    default:         return 'auto';
  }
}

function loadInviteFonts(d) {
  const GFONTS = {
    "'Playfair Display', serif":    'Playfair+Display',
    "'Montserrat', sans-serif":     'Montserrat',
    "'Lobster', cursive":           'Lobster',
    "'Pacifico', cursive":          'Pacifico',
    "'Raleway', sans-serif":        'Raleway',
    "'Cormorant Garamond', serif":  'Cormorant+Garamond',
    "'Nunito', sans-serif":         'Nunito',
    "'Lato', sans-serif":           'Lato',
    "'Open Sans', sans-serif":      'Open+Sans',
    "'Roboto', sans-serif":         'Roboto',
    "'Merriweather', serif":        'Merriweather',
    "'PT Serif', serif":            'PT+Serif',
    "'PT Sans', sans-serif":        'PT+Sans',
    "'Oswald', sans-serif":         'Oswald',
    "'Bebas Neue', cursive":        'Bebas+Neue',
    "'Dancing Script', cursive":    'Dancing+Script',
    "'Great Vibes', cursive":       'Great+Vibes',
    "'Sacramento', cursive":        'Sacramento',
    "'Libre Baskerville', serif":   'Libre+Baskerville',
    "'Source Sans 3', sans-serif":  'Source+Sans+3',
  };
  [d.fontHeading, d.fontBody].forEach(f => {
    if (f && GFONTS[f] && !document.getElementById('gf-' + GFONTS[f])) {
      const link = document.createElement('link');
      link.id = 'gf-' + GFONTS[f];
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${GFONTS[f]}:wght@400;600;700&display=swap`;
      document.head.appendChild(link);
    }
  });
}

const DECO_EMOJIS = {
  confetti: ['🎊','🎉','✨','🎈','🎀'],
  hearts:   ['❤️','💕','💖','💗','💓'],
  flowers:  ['🌸','🌺','🌼','🌻','💐'],
  stars:    ['⭐','✨','🌟','💫','⭐'],
  leaves:   ['🍃','🌿','🍀','🌱','🍂'],
  rings:    ['💍','✨','💎','🤍','💍'],
  balloons: ['🎈','🎊','🎉','🎀','🎈']
};

function addDecorationOverlay(decoId) {
  const emojis = DECO_EMOJIS[decoId];
  if (!emojis) return;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden';
  for (let i = 0; i < 16; i++) {
    const span = document.createElement('span');
    span.textContent = emojis[i % emojis.length];
    span.style.cssText = `position:absolute;left:${Math.random()*95}%;top:${Math.random()*100}%;font-size:${1+Math.random()*1.5}rem;opacity:${0.1+Math.random()*0.2};`;
    overlay.appendChild(span);
  }
  document.body.appendChild(overlay);
}

function renderInvite(blocks) {
  const container = document.getElementById('inviteContent');
  container.innerHTML = blocks.map((block, i) => renderBlock(block, i)).join('');
  // Запускаем анимацию появленияЗ
  const anim = document.body.getAttribute('data-animation') || 'fade';
  if (anim !== 'none') initScrollAnimations(anim);
}

function getDividerHTML(style, color) {
  if (!style || style === 'none') return '';
  const c = color || 'var(--inv-primary)';
  switch (style) {
    case 'line':    return `<div class="inv-divider inv-divider--line" style="background:${c}33"></div>`;
    case 'dots':    return `<div class="inv-divider inv-divider--dots" style="color:${c}">● ● ●</div>`;
    case 'wave':    return `<div class="inv-divider inv-divider--wave" style="color:${c}55">〰〰〰〰〰〰〰〰〰〰</div>`;
    case 'diamond': return `<div class="inv-divider inv-divider--diamond" style="color:${c}">◆ ◇ ◆</div>`;
    case 'floral':  return `<div class="inv-divider inv-divider--floral" style="color:${c}">❧ ✦ ❧</div>`;
    default:        return '';
  }
}

function renderBlock(block, i) {
  const heroStyle = document.body.getAttribute('data-hero-style') || 'gradient';
  const divStyle  = document.body.getAttribute('data-divider') || 'none';
  const shadow    = document.body.getAttribute('data-shadow') || 'soft';
  const divider   = i > 0 ? getDividerHTML(divStyle, 'var(--inv-primary)') : '';
  const animClass = 'inv-animate';
  const shadowClass = `inv-shadow--${shadow}`;

  // Выравнивание текста по настройке блока
  const isCentered = block.layout === 'centered';
  const alignStyle    = isCentered ? 'text-align:center;' : '';
  const flexCenter    = isCentered ? 'justify-content:center;text-align:center;' : '';

  switch (block.type) {
    case 'hero':
      return `<div class="inv-hero inv-hero--${heroStyle} ${animClass}">
        ${heroStyle === 'wave' ? '<div class="inv-hero-wave"></div>' : ''}
        <h1 style="color:var(--inv-heading,var(--inv-primary))">${escHtml(block.value || 'Вы приглашены!')}</h1>
        ${block.subtitle ? `<p style="color:var(--inv-heading,var(--inv-primary))">${escHtml(block.subtitle)}</p>` : ''}
      </div>`;

    case 'story':
      return `${divider}<div class="inv-block ${animClass} ${shadowClass}" style="${alignStyle}">
        <p>${escHtml(block.value || '')}</p>
      </div>`;

    case 'details':
      return `${divider}<div class="inv-block ${animClass} ${shadowClass}" style="${alignStyle}">
        <p>${escHtml(block.value || '')}</p>
      </div>`;

    case 'wishes':
      return `${divider}<div class="inv-block ${animClass} ${shadowClass}" style="${alignStyle}">
        <p style="font-weight:bold;font-style:italic">${escHtml(block.value || '')}</p>
      </div>`;

    case 'date':
      return `${divider}<div class="inv-date ${animClass} ${shadowClass}" style="${flexCenter}">
        <div class="inv-date-info" style="flex:1;${alignStyle}">
          <div class="date-val" style="font-weight:bold;font-style:italic;${alignStyle}display:block;">${block.value ? formatDate(block.value) : 'Дата уточняется'}</div>
        </div>
      </div>`;

    case 'event-time':
      return `${divider}<div class="inv-date ${animClass} ${shadowClass}" style="${flexCenter}">
        <div class="inv-date-info" style="flex:1;${alignStyle}">
          <div class="date-val" style="font-weight:bold;font-style:italic;${alignStyle}display:block;">${block.time || 'Время уточняется'}</div>
        </div>
      </div>`;

    case 'event-place':
      return `${divider}<div class="inv-date ${animClass} ${shadowClass}" style="${flexCenter}">
        <div class="inv-date-info" style="flex:1;${alignStyle}">
          <div class="date-val" style="font-weight:bold;font-style:italic;${alignStyle}display:block;">${block.place ? escHtml(block.place) : 'Место уточняется'}</div>
        </div>
      </div>`;

    case 'palette':
      if (!block.colors || !block.colors.length) return '';
      return `${divider}<div class="inv-palette ${animClass} ${shadowClass}">
        <div class="color-palette" style="${isCentered ? 'justify-content:center;' : ''}">
          ${block.colors.map(c => `<div class="color-swatch" style="background:${c}" title="${c}"></div>`).join('')}
        </div>
      </div>`;

    case 'gallery':
      if (!block.files || !block.files.length) return '';
      return `${divider}<div class="inv-gallery ${animClass} ${shadowClass}">
        <div class="inv-gallery-grid${isCentered ? ' inv-gallery-grid--centered' : ''}">
          ${block.files.map(f => `<img src="${f}" alt="фото" onclick="openLightbox('${f}')">`).join('')}
        </div>
      </div>`;

    case 'video': {
      if (!block.value) return '';
      const isYT = block.value.includes('youtube') || block.value.includes('youtu.be');
      return `${divider}<div class="inv-block ${animClass} ${shadowClass}">
        ${isYT
          ? `<iframe width="100%" height="280" src="${ytEmbed(block.value)}" frameborder="0" allowfullscreen style="border-radius:var(--inv-radius)"></iframe>`
          : `<video src="${block.value}" controls style="width:100%;border-radius:var(--inv-radius)"></video>`}
      </div>`;
    }

    default:
      return '';
  }
}

// ===== Анимации появления при скролле =====
function initScrollAnimations(type) {
  document.querySelectorAll('.inv-animate').forEach((el, i) => {
    el.classList.add(`inv-anim--${type}`);
    el.style.animationDelay = (i * 0.1) + 's';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('inv-anim--visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.inv-animate').forEach(el => observer.observe(el));
}

// ===== Анкета гостя =====
function toggleMinorAge() {
  const checked = document.getElementById('isMinor').checked;
  document.getElementById('minorAgeGroup').style.display = checked ? 'block' : 'none';
}

async function submitGuest() {
  const alertBox = document.getElementById('guestAlert');
  alertBox.innerHTML = '';

  const fullName = document.getElementById('guestName').value.trim();
  if (!fullName) {
    alertBox.innerHTML = '<div class="alert alert-error">Введите ФИО</div>';
    return;
  }

  const email = document.getElementById('guestEmail').value.trim();
  const attending = document.querySelector('input[name="attending"]:checked')?.value || 'maybe';
  const isMinor = document.getElementById('isMinor').checked;
  const minorAge = isMinor ? parseInt(document.getElementById('minorAge').value) || null : null;
  const note = document.getElementById('guestNote').value.trim();

  const res = await fetch(`/api/invite/${slug}/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: fullName, email, attending, is_minor: isMinor, minor_age: minorAge, note })
  });

  const data = await res.json();
  if (data.success) {
    // Сохраняем ID гостя для отслеживания просмотров
    localStorage.setItem(`guest_${slug}`, data.guest_id);
    
    document.getElementById('guestFormFields').style.display = 'none';
    document.getElementById('guestSuccess').style.display = 'block';
  } else {
    alertBox.innerHTML = `<div class="alert alert-error">${data.error || 'Ошибка отправки'}</div>`;
  }
}

// ===== Лайтбокс =====
function openLightbox(src) {
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.innerHTML = '<img id="lbImg" src="" alt="">';
    lb.onclick = () => lb.classList.add('hidden');
    document.body.appendChild(lb);
  }
  document.getElementById('lbImg').src = src;
  lb.classList.remove('hidden');
}

// ===== Утилиты =====
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function formatDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}
function ytEmbed(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}
