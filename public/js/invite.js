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
  if (d.colorText)    root.style.setProperty('--inv-text', d.colorText);
  if (d.colorHero1)   root.style.setProperty('--inv-hero1', d.colorHero1);
  if (d.colorHero2)   root.style.setProperty('--inv-hero2', d.colorHero2);
  if (d.fontHeading)  root.style.setProperty('--inv-font-h', d.fontHeading);
  if (d.fontBody)     root.style.setProperty('--inv-font-b', d.fontBody);
  if (d.fontSize)     root.style.setProperty('--inv-fsize', d.fontSize + 'px');
  if (d.radius != null) root.style.setProperty('--inv-radius', d.radius + 'px');

  // Загружаем Google Fonts если нужно
  const GFONTS = {
    "'Playfair Display', serif":   'Playfair+Display',
    "'Montserrat', sans-serif":    'Montserrat',
    "'Lobster', cursive":          'Lobster',
    "'Pacifico', cursive":         'Pacifico',
    "'Raleway', sans-serif":       'Raleway',
    "'Cormorant Garamond', serif": 'Cormorant+Garamond',
    "'Nunito', sans-serif":        'Nunito',
    "'Lato', sans-serif":          'Lato',
    "'Open Sans', sans-serif":     'Open+Sans',
    "'Roboto', sans-serif":        'Roboto',
    "'Merriweather', serif":       'Merriweather',
    "'PT Serif', serif":           'PT+Serif'
  };
  [d.fontHeading, d.fontBody].forEach(f => {
    if (f && GFONTS[f]) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${GFONTS[f]}:wght@400;600;700&display=swap`;
      document.head.appendChild(link);
    }
  });

  // Декорации
  if (d.decoration) addDecorationOverlay(d.decoration);
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
  container.innerHTML = blocks.map(renderBlock).join('');
}

function renderBlock(block) {
  switch (block.type) {
    case 'hero':
      return `<div class="inv-hero">
        <h1>${escHtml(block.value || 'Вы приглашены!')}</h1>
        ${block.subtitle ? `<p>${escHtml(block.subtitle)}</p>` : ''}
      </div>`;

    case 'story':
      return `<div class="inv-block">
        <h2>📖 Наша история</h2>
        <p>${escHtml(block.value || '')}</p>
      </div>`;

    case 'details':
      return `<div class="inv-block">
        <h2>📍 ${escHtml(block.label || 'Детали')}</h2>
        <p>${escHtml(block.value || '')}</p>
      </div>`;

    case 'wishes':
      return `<div class="inv-block">
        <h2>💌 Пожелания</h2>
        <p>${escHtml(block.value || '')}</p>
      </div>`;

    case 'date':
      return `<div class="inv-date">
        <div class="inv-date-icon">📅</div>
        <div class="inv-date-info">
          <h2>Дата и место</h2>
          <div class="date-val">${block.value ? formatDate(block.value) : 'Дата уточняется'}${block.time ? ' в ' + block.time : ''}</div>
          ${block.place ? `<div class="place-val">📍 ${escHtml(block.place)}</div>` : ''}
        </div>
      </div>`;

    case 'palette':
      if (!block.colors || !block.colors.length) return '';
      return `<div class="inv-palette">
        <h2>🎨 Цветовая палитра мероприятия</h2>
        <div class="color-palette">
          ${block.colors.map(c => `<div class="color-swatch" style="background:${c}" title="${c}"></div>`).join('')}
        </div>
      </div>`;

    case 'gallery':
      if (!block.files || !block.files.length) return '';
      return `<div class="inv-gallery">
        <h2>🖼 Фотогалерея</h2>
        <div class="inv-gallery-grid">
          ${block.files.map(f => `<img src="${f}" alt="фото" onclick="openLightbox('${f}')">`).join('')}
        </div>
      </div>`;

    case 'video':
      if (!block.value) return '';
      const isYT = block.value.includes('youtube') || block.value.includes('youtu.be');
      return `<div class="inv-block">
        <h2>🎬 Видео</h2>
        ${isYT
          ? `<iframe width="100%" height="280" src="${ytEmbed(block.value)}" frameborder="0" allowfullscreen style="border-radius:8px"></iframe>`
          : `<video src="${block.value}" controls style="width:100%;border-radius:8px"></video>`}
      </div>`;

    default:
      return '';
  }
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
    alertBox.innerHTML = '<div class="alert alert-error">Укажите ФИО</div>';
    return;
  }

  const attending = document.querySelector('input[name="attending"]:checked')?.value || 'maybe';
  const isMinor = document.getElementById('isMinor').checked;
  const minorAge = isMinor ? parseInt(document.getElementById('minorAge').value) || null : null;
  const note = document.getElementById('guestNote').value.trim();

  const res = await fetch(`/api/invite/${slug}/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: fullName, attending, is_minor: isMinor, minor_age: minorAge, note })
  });

  const data = await res.json();
  if (data.success) {
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
