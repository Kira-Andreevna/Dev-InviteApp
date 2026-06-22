// ===== Редактор открыток =====

let selectedTemplateId = null;
let blocks = [];
let editingSlug = null;
window.design = {};
let eventType = ''; // тип мероприятия для открыток без шаблона

function updateEventType(val) {
  eventType = val;
}

const BLOCK_LABELS = {
  hero:         '✏️ Заголовок',
  story:        '🗒️ Текст',
  gallery:      '📷 Фото',
  date:         '📅 Дата',
  'event-time': '🕐 Время',
  'event-place':'📍 Место',
  palette:      '🎨 Палитра',
  details:      '📌 Детали',
  wishes:       '💌 Пожелания',
  video:        '🎬 Видео'
};

function blockTypeLabel(type) {
  return BLOCK_LABELS[type] || type;
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
  const authRes = await fetch('/api/auth/me');
  const auth = await authRes.json();
  if (!auth.loggedIn) return window.location.href = '/login.html';

  const params = new URLSearchParams(location.search);
  editingSlug = params.get('slug');

  if (editingSlug) {
    await loadExistingCard(editingSlug);
  } else {
    // Новая открытка — сразу открываем редактор, показываем поле типа мероприятия
    const eventTypeGroup = document.getElementById('eventTypeGroup');
    if (eventTypeGroup) eventTypeGroup.style.display = 'block';
    initDesignPanel(window.design);
    renderBlocksPanel();
    renderPreview();
    loadTemplatesIntoSidebar();
  }
});

async function loadTemplatesIntoSidebar() {
  const res = await fetch('/api/cards/templates');
  const templates = await res.json();
  const list = document.getElementById('templatePickerList');
  if (!list) return;

  list.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:0.4rem">
      <div class="sidebar-template-item ${selectedTemplateId === null ? 'selected' : ''}"
        onclick="sidebarSelectTemplate(null, null)" id="stpl-null">
        <span>✏️</span> С нуля
      </div>
      ${templates.map(t => `
        <div class="sidebar-template-item" id="stpl-${t.id}"
          onclick="sidebarSelectTemplate(${t.id}, ${JSON.stringify(t.structure_json).replace(/"/g,'&quot;')})">
          <span>${t.name === 'Свадьба' ? '💍' : t.name === 'День рождения' ? '🎂' : '🎉'}</span>
          ${t.name}
        </div>
      `).join('')}
    </div>
  `;
}

function toggleTemplatePicker() {
  const list = document.getElementById('templatePickerList');
  const isHidden = list.style.display === 'none';
  list.style.display = isHidden ? 'block' : 'none';
  if (isHidden && list.innerHTML.includes('spinner')) {
    loadTemplatesIntoSidebar();
  }
}

function sidebarSelectTemplate(id, structure) {
  selectedTemplateId = id;
  document.querySelectorAll('.sidebar-template-item').forEach(el => el.classList.remove('selected'));
  document.getElementById(`stpl-${id}`)?.classList.add('selected');

  const nameEl = document.getElementById('selectedTemplateName');
  if (nameEl) nameEl.textContent = id === null ? '' : document.getElementById(`stpl-${id}`)?.textContent?.trim() || '';

  if (structure && structure.blocks) {
    blocks = structure.blocks.map(b => ({ type: b.type, label: b.label, value: '', files: [] }));
    renderBlocksPanel();
    renderPreview();
  }

  // Скрываем список после выбора
  document.getElementById('templatePickerList').style.display = 'none';
}

// Оставляем для обратной совместимости
async function loadTemplates() { await loadTemplatesIntoSidebar(); }
function selectTemplate(id, structure) { sidebarSelectTemplate(id, structure); }
function startEditor() {
  initDesignPanel(window.design);
  renderBlocksPanel();
  renderPreview();
}

async function loadExistingCard(slug) {
  const res = await fetch(`/api/cards/${slug}`);
  if (!res.ok) return window.location.href = '/dashboard';
  const card = await res.json();

  document.getElementById('cardTitle').value = card.title;
  selectedTemplateId = card.template_id;

  const content = typeof card.content_json === 'string'
    ? JSON.parse(card.content_json)
    : card.content_json;

  blocks = content.blocks || [];
  window.design = content.design || {};

  // Загружаем тип мероприятия
  eventType = content.eventType || '';
  const eventTypeInput = document.getElementById('eventType');
  if (eventTypeInput) eventTypeInput.value = eventType;

  // Показываем поле типа мероприятия всегда при редактировании
  const eventTypeGroup = document.getElementById('eventTypeGroup');
  if (eventTypeGroup) eventTypeGroup.style.display = 'block';

  // Скрываем секцию выбора шаблона при редактировании
  const tplSection = document.getElementById('templatePickerSection');
  if (tplSection) tplSection.style.display = 'none';

  initDesignPanel(window.design);
  renderBlocksPanel();
  renderPreview();
}

// ===== Панель блоков =====
function renderBlocksPanel() {
  const panel = document.getElementById('blocksPanel');
  panel.innerHTML = blocks.map((block, i) => `
    <div class="editor-block" id="block-${i}">
      <div class="editor-block-header">
        <span class="editor-block-title">${blockTypeLabel(block.type)}</span>
        <div style="display:flex;align-items:center;gap:2px">
          <button onclick="toggleBlockLayout(${i})" title="Раскладка блока" class="layout-toggle-btn ${block.layoutLocked ? 'active' : ''}">📐</button>
          ${i > 0 ? `<button onclick="moveBlock(${i}, -1)" title="Вверх">↑</button>` : ''}
          ${i < blocks.length - 1 ? `<button onclick="moveBlock(${i}, 1)" title="Вниз">↓</button>` : ''}
          <button onclick="removeBlock(${i})" title="Удалить">🗑</button>
        </div>
      </div>
      ${block.layoutLocked ? renderLayoutPanel(block, i) : ''}
      ${renderBlockInput(block, i)}
    </div>
  `).join('');
}

// Панель раскладки блока
function renderLayoutPanel(block, i) {
  const layouts = [
    { id: 'stack',    icon: '☰',  label: 'Стопка' },
    { id: 'left',     icon: '◧',  label: 'Текст слева' },
    { id: 'right',    icon: '◨',  label: 'Текст справа' },
    { id: 'centered', icon: '⊡',  label: 'По центру' },
    { id: 'wide',     icon: '⬛', label: 'Во всю ширину' },
  ];
  return `
    <div class="block-layout-panel">
      <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem">Раскладка блока:</p>
      <div class="block-layout-btns">
        ${layouts.map(l => `
          <button class="block-layout-btn ${block.layout === l.id ? 'active' : ''}"
            onclick="setBlockLayout(${i}, '${l.id}')" title="${l.label}">
            ${l.icon}
          </button>`).join('')}
      </div>
      ${(block.type === 'gallery' || block.type === 'video') ? `
        <div class="design-row" style="margin-top:0.5rem">
          <label style="font-size:0.8rem">Размер медиа</label>
          <select class="form-control" style="font-size:0.8rem;padding:0.3rem 0.5rem"
            onchange="updateBlock(${i}, 'mediaSize', this.value)">
            <option value="small"  ${block.mediaSize==='small'  ? 'selected':''}>Маленький</option>
            <option value="medium" ${block.mediaSize==='medium' ? 'selected':''}>Средний</option>
            <option value="full"   ${block.mediaSize==='full'   ? 'selected':''}>Во всю ширину</option>
          </select>
        </div>` : ''}
    </div>`;
}

function toggleBlockLayout(i) {
  blocks[i].layoutLocked = !blocks[i].layoutLocked;
  if (!blocks[i].layout) blocks[i].layout = 'stack';
  renderBlocksPanel();
  renderPreview();
}

function setBlockLayout(i, layout) {
  blocks[i].layout = layout;
  renderBlocksPanel();
  renderPreview();
}

function renderBlockInput(block, i) {
  switch (block.type) {
    case 'hero':
      return `
        <input type="text" class="form-control" placeholder="${block.placeholder || 'Заголовок'}"
          value="${escAttr(block.value || '')}" oninput="updateBlock(${i}, 'value', this.value)">
        <textarea class="form-control mt-1" placeholder="Подзаголовок (необязательно)"
          oninput="updateBlock(${i}, 'subtitle', this.value)">${escHtml(block.subtitle || '')}</textarea>`;

    case 'story':
    case 'details':
    case 'wishes':
      return `<textarea class="form-control" placeholder="${block.placeholder || block.label}"
        oninput="updateBlock(${i}, 'value', this.value)">${escHtml(block.value || '')}</textarea>`;

    case 'date':
      return `
        <div style="margin-bottom:0.5rem">
          <input type="date" class="form-control" value="${block.value || ''}"
            oninput="updateBlock(${i}, 'value', this.value)">
        </div>`;

    case 'event-time':
      return `
        <div>
          <input type="time" class="form-control" value="${block.time || ''}"
            oninput="updateBlock(${i}, 'time', this.value)" placeholder="Время">
        </div>`;

    case 'event-place':
      return `
        <div>
          <input type="text" class="form-control" placeholder="Адрес или название места"
            value="${escAttr(block.place || '')}" oninput="updateBlock(${i}, 'place', this.value)">
        </div>`;

    case 'palette':
      return `
        <div class="palette-editor" id="palette-${i}">
          ${(block.colors || []).map((c, ci) => `
            <input type="color" value="${c}" onchange="updateColor(${i}, ${ci}, this.value)">
            <button class="remove-color" onclick="removeColor(${i}, ${ci})">×</button>
          `).join('')}
          <button class="btn btn-outline btn-sm" onclick="addColor(${i})">+ Цвет</button>
        </div>`;

    case 'gallery':
      return `
        <div class="upload-area" onclick="document.getElementById('galleryInput-${i}').click()">
          <input type="file" id="galleryInput-${i}" accept="image/*" multiple
            onchange="uploadFiles(${i}, this.files)">
          <p>📷 Нажмите для загрузки фото</p>
        </div>
        <div class="uploaded-files" id="gallery-files-${i}">
          ${(block.files || []).map((f, fi) => `
            <div class="uploaded-file">
              <img src="${f}" alt="">
              <button class="remove-file" onclick="removeFile(${i}, ${fi})">×</button>
            </div>`).join('')}
        </div>`;

    case 'video':
      return `
        <input type="text" class="form-control" placeholder="Ссылка на YouTube или загрузите файл"
          value="${escAttr(block.value || '')}" oninput="updateBlock(${i}, 'value', this.value)">
        <div class="upload-area mt-1" onclick="document.getElementById('videoInput-${i}').click()">
          <input type="file" id="videoInput-${i}" accept="video/*"
            onchange="uploadFiles(${i}, this.files, true)">
          <p>🎬 Загрузить видеофайл</p>
        </div>`;

    default:
      return `<input type="text" class="form-control" placeholder="${block.placeholder || block.label}"
        value="${escAttr(block.value || '')}" oninput="updateBlock(${i}, 'value', this.value)">`;
  }
}

let _blockTimer = null;
function updateBlock(i, key, value) {
  blocks[i][key] = value;
  clearTimeout(_blockTimer);
  _blockTimer = setTimeout(() => renderPreview(), 150);
}

function moveBlock(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= blocks.length) return;
  [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
  renderBlocksPanel();
  renderPreview();
}

function removeBlock(i) {
  blocks.splice(i, 1);
  renderBlocksPanel();
  renderPreview();
}

function toggleBlockPicker() {
  const picker = document.getElementById('blockTypePicker');
  const isHidden = picker.style.display === 'none';
  picker.style.display = isHidden ? 'block' : 'none';
  if (isHidden) renderBlockPicker();
}

function renderBlockPicker() {
  const textTypes = ['hero', 'story', 'details', 'wishes', 'date', 'event-time', 'event-place', 'palette'];
  const mediaTypes = ['gallery', 'video'];

  document.getElementById('textBlockBtns').innerHTML = textTypes.map(t => `
    <button class="btn btn-outline btn-sm" style="justify-content:flex-start" onclick="addBlockType('${t}')">
      ${blockTypeLabel(t)}
    </button>`).join('');

  document.getElementById('mediaBlockBtns').innerHTML = mediaTypes.map(t => `
    <button class="btn btn-outline btn-sm" style="justify-content:flex-start" onclick="addBlockType('${t}')">
      ${blockTypeLabel(t)}
    </button>`).join('');
}

function addBlockType(type) {
  blocks.push({ type, label: BLOCK_LABELS[type], value: '', files: [], colors: [] });
  document.getElementById('blockTypePicker').style.display = 'none';
  renderBlocksPanel();
  renderPreview();
}

// Цвета
function addColor(i) {
  if (!blocks[i].colors) blocks[i].colors = [];
  blocks[i].colors.push('#7c5cbf');
  renderBlocksPanel();
  renderPreview();
}
function updateColor(i, ci, val) {
  blocks[i].colors[ci] = val;
  renderPreview();
}
function removeColor(i, ci) {
  blocks[i].colors.splice(ci, 1);
  renderBlocksPanel();
  renderPreview();
}

// Загрузка файлов
async function uploadFiles(blockIndex, files, isVideo = false) {
  const slug = editingSlug || 'temp';
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);

    // Если открытка ещё не сохранена — сначала создаём черновик
    if (!editingSlug) {
      const title = document.getElementById('cardTitle').value || 'Черновик';
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, template_id: selectedTemplateId, content_json: { blocks } })
      });
      const data = await res.json();
      if (data.slug) {
        editingSlug = data.slug;
        history.replaceState(null, '', `/editor?slug=${editingSlug}`);
      }
    }

    const res = await fetch(`/api/cards/${editingSlug}/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.url) {
      if (!blocks[blockIndex].files) blocks[blockIndex].files = [];
      blocks[blockIndex].files.push(data.url);
      if (isVideo) blocks[blockIndex].value = data.url;
    } else if (data.error) {
      alert('Ошибка загрузки: ' + data.error);
    }
  }
  renderBlocksPanel();
  renderPreview();
}

function removeFile(blockIndex, fileIndex) {
  blocks[blockIndex].files.splice(fileIndex, 1);
  renderBlocksPanel();
  renderPreview();
}

// ===== Превью =====
function renderPreview() {
  const preview = document.getElementById('invitePreview');
  preview.innerHTML = blocks.map(block => renderPreviewBlock(block)).join('');
  if (typeof applyDesignVars === 'function') applyDesignVars();
  if (typeof updateDecorationOverlay === 'function') updateDecorationOverlay(preview, window.design.decoration);
}

function layoutStyle(block) {
  switch (block.layout) {
    case 'left':     return 'display:flex;flex-direction:row;align-items:flex-start;gap:1.2rem;';
    case 'right':    return 'display:flex;flex-direction:row-reverse;align-items:flex-start;gap:1.2rem;';
    case 'centered': return 'text-align:center;display:flex;flex-direction:column;align-items:center;';
    default:         return '';
  }
}

function textAlignStyle(block) {
  if (block.layout === 'centered') return 'text-align:center;';
  if (block.layout === 'left' || block.layout === 'right') return 'text-align:left;';
  return '';
}

function mediaSizeStyle(block) {
  switch (block.mediaSize) {
    case 'small':  return 'max-width:180px;';
    case 'medium': return 'max-width:340px;';
    default:       return 'width:100%;';
  }
}

function renderPreviewBlock(block) {
  const d   = window.design || {};
  const r   = (d.radius ?? 12) + 'px';
  const fh  = d.fontHeading || 'inherit';
  const fb  = d.fontBody    || 'inherit';
  const fs  = (d.fontSizeBase  || 16) + 'px';
  const fhs = Math.round((d.fontSizeBase || 16) * (d.fontSizeRatio || 1.8)) + 'px';
  const tc  = d.colorText    || 'inherit';
  const hc  = d.colorHeading || '#ffffff';
  const pc  = d.colorPrimary || 'var(--primary)';
  const h1  = d.colorHero1   || 'var(--primary)';
  const h2  = d.colorHero2   || 'var(--accent)';
  const bc  = d.colorBlock   || d.colorBg || '#ffffff';
  const ls  = layoutStyle(block);
  const ms  = mediaSizeStyle(block);

  // Тень блока
  const sc = d.shadowColor || '#000000';
  const sr = parseInt(sc.slice(1,3),16), sg = parseInt(sc.slice(3,5),16), sb = parseInt(sc.slice(5,7),16);
  const srgba = (a) => `rgba(${sr},${sg},${sb},${a})`;
  const shadowMap = {
    none:   'none',
    soft:   `0 4px 20px ${srgba(0.10)}`,
    lifted: `0 8px 32px ${srgba(0.18)}, 0 2px 8px ${srgba(0.08)}`,
    glow:   `0 0 28px ${srgba(0.45)}, 0 4px 16px ${srgba(0.12)}`,
  };
  const shadow = shadowMap[d.blockShadow] ?? shadowMap.soft;

  // Стиль Hero
  const heroStyleCSS = typeof getHeroStyle === 'function'
    ? getHeroStyle(d.heroStyle, h1, h2)
    : `background:linear-gradient(135deg,${h1},${h2});`;

  // Разделитель
  const divider = getDividerHTML(d.dividerStyle, pc);

  switch (block.type) {
    case 'hero':
      return `<div class="preview-hero preview-hero--${d.heroStyle || 'gradient'}" style="${heroStyleCSS}border-radius:${r} ${r} 0 0">
        ${d.heroStyle === 'wave' ? `<div class="hero-wave-shape"></div>` : ''}
        <h1 style="font-family:${fh};font-size:${fhs};color:${hc}">${escHtml(block.value || 'Заголовок мероприятия')}</h1>
        ${block.subtitle ? `<p style="font-family:${fb};font-size:${fs};color:${hc}">${escHtml(block.subtitle)}</p>` : ''}
      </div>`;

    case 'story':
      return `${divider}<div class="preview-block" style="${ls}border-radius:${r};box-shadow:${shadow};background:${bc};margin-bottom:var(--inv-block-gap,16px)">
        <div style="flex:1">

        <p style="font-family:${fb};font-size:${fs};color:${tc};${textAlignStyle(block)}">${escHtml(block.value || '')}</p></div>
      </div>`;

    case 'details':
      return `${divider}<div class="preview-block" style="${ls}border-radius:${r};box-shadow:${shadow};background:${bc};margin-bottom:var(--inv-block-gap,16px)">
        <div style="flex:1">

        <p style="font-family:${fb};font-size:${fs};color:${tc};${textAlignStyle(block)}">${escHtml(block.value || '')}</p></div>
      </div>`;

    case 'wishes':
      return `${divider}<div class="preview-block" style="${ls}border-radius:${r};box-shadow:${shadow};background:${bc};margin-bottom:var(--inv-block-gap,16px)">
        <div style="flex:1">
    
        <p style="font-family:${fb};font-size:${fs};color:${tc};font-weight:bold;font-style:italic;${textAlignStyle(block)}">${escHtml(block.value || '')}</p></div>
      </div>`;

    case 'date':
      return `${divider}<div class="preview-date" style="${ls}border-radius:${r};box-shadow:${shadow};background:${bc};margin-bottom:var(--inv-block-gap,16px)">
        <div class="preview-date-text" style="flex:1;${textAlignStyle(block)}">
          ${block.value ? `<p style="font-family:${fb};font-size:${fs};color:${tc};font-weight:bold;font-style:italic">${formatDate(block.value)}</p>` : '<p style="color:var(--text-muted)">Дата не указана</p>'}
        </div>
      </div>`;

    case 'event-time':
      return `${divider}<div class="preview-date" style="${ls}border-radius:${r};box-shadow:${shadow};background:${bc};margin-bottom:var(--inv-block-gap,16px)">
        <div class="preview-date-text" style="flex:1;${textAlignStyle(block)}">
          ${block.time ? `<p style="font-family:${fb};font-size:${fs};color:${tc};font-weight:bold;font-style:italic">${block.time}</p>` : '<p style="color:var(--text-muted)">Время не указано</p>'}
        </div>
      </div>`;

    case 'event-place':
      return `${divider}<div class="preview-date" style="${ls}border-radius:${r};box-shadow:${shadow};background:${bc};margin-bottom:var(--inv-block-gap,16px)">
        <div class="preview-date-text" style="flex:1;${textAlignStyle(block)}">
          ${block.place ? `<p style="font-family:${fb};font-size:${fs};color:${tc};font-weight:bold;font-style:italic">${escHtml(block.place)}</p>` : '<p style="color:var(--text-muted)">Место не указано</p>'}
        </div>
      </div>`;

    case 'palette':
      return `${divider}<div class="preview-palette" style="${ls}border-radius:${r};box-shadow:${shadow};background:${bc};margin-bottom:var(--inv-block-gap,16px)">
        <div style="flex:1;${textAlignStyle(block)}">
        <div class="color-palette">
          ${(block.colors || []).map(c => `<div class="color-swatch" style="background:${c}" title="${c}"></div>`).join('')}
        </div></div>
      </div>`;

    case 'gallery':
      if (!block.files || !block.files.length) return '';
      return `${divider}<div class="preview-gallery" style="${ls}border-radius:${r};box-shadow:${shadow};background:${bc};margin-bottom:var(--inv-block-gap,16px)">
        <div style="flex:1;${textAlignStyle(block)}">
        <div class="gallery-grid${block.layout === 'centered' ? ' gallery-grid--centered' : ''}" style="${ms}border-radius:${r}">
          ${block.files.map(f => `<img src="${f}" alt="фото" style="border-radius:${r}">`).join('')}
        </div></div>
      </div>`;

    case 'video': {
      if (!block.value) return '';
      const isYT = block.value.includes('youtube') || block.value.includes('youtu.be');
      return `${divider}<div class="preview-block" style="${ls}border-radius:${r};box-shadow:${shadow};background:${bc};margin-bottom:var(--inv-block-gap,16px)">
        <div style="flex:1">
      
        <div style="${ms}">
          ${isYT
            ? `<iframe width="100%" height="220" src="${ytEmbed(block.value)}" frameborder="0" allowfullscreen style="border-radius:${r}"></iframe>`
            : `<video src="${block.value}" controls style="width:100%;border-radius:${r}"></video>`}
        </div></div>
      </div>`;
    }

    default:
      return '';
  }
}

function getDividerHTML(style, color) {
  if (!style || style === 'none') return '';
  const c = color || '#7c5cbf';
  switch (style) {
    case 'line':    return `<div style="height:1px;background:${c}33;margin:0.5rem 2rem"></div>`;
    case 'dots':    return `<div style="text-align:center;color:${c};opacity:0.4;font-size:0.6rem;letter-spacing:6px;padding:0.3rem 0">● ● ●</div>`;
    case 'wave':    return `<div class="divider-wave" style="color:${c}55">〰〰〰〰〰〰〰〰〰〰</div>`;
    case 'diamond': return `<div style="text-align:center;color:${c};opacity:0.5;font-size:0.8rem;padding:0.3rem 0">◆ ◇ ◆</div>`;
    case 'floral':  return `<div style="text-align:center;color:${c};opacity:0.5;font-size:1rem;padding:0.3rem 0">❧ ✦ ❧</div>`;
    default:        return '';
  }
}

function togglePreviewMode(mode) {
  const wrapper = document.getElementById('previewWrapper');
  wrapper.style.maxWidth = mode === 'mobile' ? '390px' : '100%';
}

// ===== Сохранение =====
async function saveCard() {
  const title = document.getElementById('cardTitle').value.trim();
  if (!title) return alert('Укажите заголовок открытки');

  const btn = document.getElementById('saveBtn');
  btn.textContent = 'Сохранение...';
  btn.disabled = true;

  const body = { title, template_id: selectedTemplateId, content_json: { blocks, design: window.design, eventType: eventType || '' } };

  try {
    let res;
    if (editingSlug) {
      res = await fetch(`/api/cards/${editingSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } else {
      res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.slug) {
        editingSlug = data.slug;
        history.replaceState(null, '', `/editor?slug=${editingSlug}`);
      }
    }

    if (res.ok) {
      btn.textContent = '✓ Сохранено';
      setTimeout(() => { btn.textContent = 'Сохранить'; btn.disabled = false; }, 2000);
    } else {
      throw new Error();
    }
  } catch {
    alert('Ошибка при сохранении');
    btn.textContent = 'Сохранить';
    btn.disabled = false;
  }
}

// ===== Утилиты =====
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escAttr(str) {
  return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
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
