// ===== Редактор открыток =====

let selectedTemplateId = null;
let blocks = [];
let editingSlug = null;

const BLOCK_LABELS = {
  hero: '🎉 Заголовок',
  story: '📖 История',
  gallery: '📷 Фото',
  date: '📅 Дата',
  palette: '🎨 Палитра',
  details: '📌 Детали',
  wishes: '💌 Пожелания',
  video: '🎬 Видео'
};

function blockTypeLabel(type) {
  return BLOCK_LABELS[type] || type;
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
  // Проверка авторизации
  const authRes = await fetch('/api/auth/me');
  const auth = await authRes.json();
  if (!auth.loggedIn) return window.location.href = '/login.html';

  const params = new URLSearchParams(location.search);
  editingSlug = params.get('slug');

  if (editingSlug) {
    // Режим редактирования существующей
    await loadExistingCard(editingSlug);
  } else {
    // Режим создания — показываем выбор шаблона
    await loadTemplates();
  }
});

async function loadTemplates() {
  const res = await fetch('/api/cards/templates');
  const templates = await res.json();
  const list = document.getElementById('templatesList');

  list.innerHTML = `
    <div class="template-card ${selectedTemplateId === null ? 'selected' : ''}" onclick="selectTemplate(null)" id="tpl-null">
      <div style="height:160px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:3rem">✏️</div>
      <div class="template-name">С нуля</div>
    </div>
    ${templates.map(t => `
      <div class="template-card" onclick="selectTemplate(${t.id}, ${JSON.stringify(t.structure_json).replace(/"/g,'&quot;')})" id="tpl-${t.id}">
        <div style="height:160px;background:linear-gradient(135deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;font-size:3rem">
          ${t.name === 'Свадьба' ? '💍' : t.name === 'День рождения' ? '🎂' : '🎉'}
        </div>
        <div class="template-name">${t.name}</div>
      </div>
    `).join('')}
  `;
}

function selectTemplate(id, structure) {
  selectedTemplateId = id;
  document.querySelectorAll('.template-card').forEach(el => el.classList.remove('selected'));
  document.getElementById(`tpl-${id}`)?.classList.add('selected');

  if (structure && structure.blocks) {
    blocks = structure.blocks.map(b => ({
      type: b.type,
      label: b.label,
      value: '',
      files: []
    }));
  }
}

function startEditor() {
  document.getElementById('stepTemplate').style.display = 'none';
  document.getElementById('stepEditor').style.display = 'block';
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

  document.getElementById('stepTemplate').style.display = 'none';
  document.getElementById('stepEditor').style.display = 'block';
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
        <div>
          ${i > 0 ? `<button onclick="moveBlock(${i}, -1)" title="Вверх">↑</button>` : ''}
          ${i < blocks.length - 1 ? `<button onclick="moveBlock(${i}, 1)" title="Вниз">↓</button>` : ''}
          <button onclick="removeBlock(${i})" title="Удалить">🗑</button>
        </div>
      </div>
      ${renderBlockInput(block, i)}
    </div>
  `).join('');
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
        <input type="date" class="form-control" value="${block.value || ''}"
          oninput="updateBlock(${i}, 'value', this.value)">
        <input type="time" class="form-control mt-1" value="${block.time || ''}"
          oninput="updateBlock(${i}, 'time', this.value)" placeholder="Время">
        <input type="text" class="form-control mt-1" placeholder="Место проведения"
          value="${escAttr(block.place || '')}" oninput="updateBlock(${i}, 'place', this.value)">`;

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

function updateBlock(i, key, value) {
  blocks[i][key] = value;
  renderPreview();
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
  const textTypes = ['hero', 'story', 'details', 'wishes', 'date', 'palette'];
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
}

function renderPreviewBlock(block) {
  switch (block.type) {
    case 'hero':
      return `<div class="preview-hero">
        <h1>${escHtml(block.value || 'Заголовок мероприятия')}</h1>
        ${block.subtitle ? `<p>${escHtml(block.subtitle)}</p>` : ''}
      </div>`;

    case 'story':
      return `<div class="preview-block">
        <h2>📖 Наша история</h2>
        <p>${escHtml(block.value || '')}</p>
      </div>`;

    case 'details':
      return `<div class="preview-block">
        <h2>📌 Важные детали</h2>
        <p>${escHtml(block.value || '')}</p>
      </div>`;

    case 'wishes':
      return `<div class="preview-block">
        <h2>💌 Пожелания</h2>
        <p>${escHtml(block.value || '')}</p>
      </div>`;

    case 'date':
      return `<div class="preview-date">
        <div class="preview-date-icon">📅</div>
        <div class="preview-date-text">
          <h2>Дата и место</h2>
          <p>${block.value ? formatDate(block.value) : 'Дата не указана'}${block.time ? ' в ' + block.time : ''}</p>
          ${block.place ? `<p style="color:var(--text-muted);font-size:0.9rem">📍 ${escHtml(block.place)}</p>` : ''}
        </div>
      </div>`;

    case 'palette':
      return `<div class="preview-palette">
        <h2>🎨 Цветовая палитра</h2>
        <div class="color-palette">
          ${(block.colors || []).map(c => `<div class="color-swatch" style="background:${c}" title="${c}"></div>`).join('')}
        </div>
      </div>`;

    case 'gallery':
      if (!block.files || !block.files.length) return '';
      return `<div class="preview-gallery">
        <h2>📁 Медиа</h2>
        <div class="gallery-grid">
          ${block.files.map(f => `<img src="${f}" alt="фото">`).join('')}
        </div>
      </div>`;

    case 'video':
      if (!block.value) return '';
      const isYT = block.value.includes('youtube') || block.value.includes('youtu.be');
      return `<div class="preview-block">
        <h2>🎬 Видео</h2>
        ${isYT
          ? `<iframe width="100%" height="250" src="${ytEmbed(block.value)}" frameborder="0" allowfullscreen style="border-radius:8px"></iframe>`
          : `<video src="${block.value}" controls style="width:100%;border-radius:8px"></video>`}
      </div>`;

    default:
      return '';
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

  const body = { title, template_id: selectedTemplateId, content_json: { blocks } };

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
