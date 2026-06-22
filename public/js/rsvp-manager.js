let currentSlug = '';
let cardData = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  currentSlug = params.get('slug');
  
  if (!currentSlug) {
    alert('Не указан slug приглашения');
    window.location.href = '/dashboard.html';
    return;
  }

  loadRsvpData();
  setupTabs();
  setupSettingsForm();
  loadSavedGuestList();
  // setupGuestSearch вызывается после загрузки данных
});

// Загрузка данных RSVP
async function loadRsvpData() {
  try {
    const res = await fetch(`/api/cards/${currentSlug}/rsvp`);
    
    // Проверка авторизации
    if (res.status === 401 || res.status === 403) {
      alert('Необходима авторизация');
      window.location.href = '/login.html';
      return;
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }
    
    const data = await res.json();
    cardData = { ...data.card, stats: data.stats };

    document.getElementById('statTotal').textContent = data.stats.total;
    document.getElementById('statYes').textContent = data.stats.attending;
    document.getElementById('statNo').textContent = data.stats.not_attending;
    document.getElementById('statMaybe').textContent = data.stats.maybe;
    document.getElementById('statMinors').textContent = data.stats.minors;

    renderGuestsTable(data.guests);
    setupGuestSearch();
    fillSettingsForm(data.card);
    loadNotifications();
  } catch (err) {
    console.error('Ошибка загрузки RSVP:', err);
    console.error('Stack:', err.stack);
    alert('Ошибка загрузки данных: ' + err.message);
    // window.location.href = '/dashboard.html';
  }
}

// Отрисовка таблицы гостей
function renderGuestsTable(guests) {
  allGuests = guests;
  allGuestsFull = guests; // сохраняем полный список для поиска

  const tbody = document.getElementById('guestsTableBody');
  tbody.innerHTML = '';

  if (!guests.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#999">Пока нет ответов</td></tr>';
    updateAnalytics(guests);
    return;
  }

  guests.forEach(g => {
    const statusMap = {
      yes:   '<span class="status-badge status-yes">✅ Придёт</span>',
      no:    '<span class="status-badge status-no">❌ Не придёт</span>',
      maybe: '<span class="status-badge status-maybe">❔ Не знает</span>'
    };

    const minorCell = g.is_minor
      ? `<span class="status-badge">🔞 ${g.minor_age ? g.minor_age + ' лет' : ''}</span>`
      : '<span style="color:#999">—</span>';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${g.full_name}</td>
      <td>${g.email || '<span style="color:#999">—</span>'}</td>
      <td>${statusMap[g.attending]}</td>
      <td>${minorCell}</td>
      <td>${g.viewed_at ? new Date(g.viewed_at).toLocaleString('ru') : '<span style="color:#999">—</span>'}</td>
      <td>${g.reminded_at ? new Date(g.reminded_at).toLocaleString('ru') : '<span style="color:#999">—</span>'}</td>
      <td>${g.note || '<span style="color:#999">—</span>'}</td>
    `;
    tbody.appendChild(row);
  });

  updateAnalytics(guests);
}

// Заполнение формы настроек
function fillSettingsForm(card) {
  const form = document.getElementById('settingsForm');
  form.notify_email.value      = card.notify_email      || '';
  form.notify_tg_chat_id.value = card.notify_tg_chat_id || '';
  form.tg_bot_token.value      = card.tg_bot_token      || '';
  form.reminder_days.value     = card.reminder_days     || 3;
  form.reminder_time.value     = card.reminder_time     || '10:00';

  // Дата: приоритет — event_date из БД, иначе берём из блока date в content_json
  let eventDate = card.event_date ? String(card.event_date).split('T')[0] : '';
  if (!eventDate) {
    try {
      const content = typeof card.content_json === 'string' ? JSON.parse(card.content_json) : (card.content_json || {});
      const dateBlock = (content.blocks || []).find(b => b.type === 'date');
      if (dateBlock?.value) eventDate = dateBlock.value;
    } catch (e) {}
  }
  form.event_date.value = eventDate;

  // Показываем подсказку если дата взята из открытки
  const hint = document.getElementById('eventDateHint');
  if (hint) hint.textContent = eventDate ? `Дата синхронизирована с блоком даты в открытке` : '';
}

// Сохранение настроек
function setupSettingsForm() {
  document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      const res = await fetch(`/api/cards/${currentSlug}/notify-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Ошибка сохранения');
      const result = await res.json();
      if (result.dateChanged) {
        alert('✅ Настройки сохранены.\n\n⚠️ Дата мероприятия изменена — она также обновлена в самом пригласительном.');
      } else {
        alert('✅ Настройки сохранены');
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  });
}

// Переключение вкладок
function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });
}

// Массовая рассылка
function loadSavedGuestList() {
  const saved = localStorage.getItem(`guestList_${currentSlug}`);
  if (!saved) return;
  
  try {
    const guests = JSON.parse(saved);
    if (!guests.length) return;
    
    const container = document.getElementById('guestInputs');
    container.innerHTML = '';
    
    guests.forEach(g => {
      const row = document.createElement('div');
      row.className = 'guest-input-row';
      row.innerHTML = `
        <input type="text" placeholder="Имя гостя" class="guest-name" value="${g.name || ''}">
        <input type="email" placeholder="Email" class="guest-email" value="${g.email || ''}">
        <button onclick="removeGuestRow(this)">✕</button>
      `;
      container.appendChild(row);
    });
  } catch (e) {
    console.error('Ошибка загрузки списка гостей', e);
  }
}

function saveGuestList() {
  const rows = document.querySelectorAll('.guest-input-row');
  const guests = [];
  
  rows.forEach(row => {
    const name = row.querySelector('.guest-name').value.trim();
    const email = row.querySelector('.guest-email').value.trim();
    if (name || email) guests.push({ name, email });
  });
  
  localStorage.setItem(`guestList_${currentSlug}`, JSON.stringify(guests));
  alert('✅ Список гостей сохранён');
}

function clearGuestList() {
  if (!confirm('Очистить список гостей?')) return;
  
  localStorage.removeItem(`guestList_${currentSlug}`);
  const container = document.getElementById('guestInputs');
  container.innerHTML = `
    <div class="guest-input-row">
      <input type="text" placeholder="Имя гостя" class="guest-name">
      <input type="email" placeholder="Email" class="guest-email">
      <button onclick="removeGuestRow(this)">✕</button>
    </div>
  `;
  alert('✅ Список очищен');
}

function addGuestRow() {
  const container = document.getElementById('guestInputs');
  const row = document.createElement('div');
  row.className = 'guest-input-row';
  row.innerHTML = `
    <input type="text" placeholder="Имя гостя" class="guest-name">
    <input type="email" placeholder="Email" class="guest-email">
    <button onclick="removeGuestRow(this)">✕</button>
  `;
  container.appendChild(row);
}

function removeGuestRow(btn) {
  const rows = document.querySelectorAll('.guest-input-row');
  if (rows.length > 1) btn.parentElement.remove();
}

async function sendBulkInvites() {
  const rows = document.querySelectorAll('.guest-input-row');
  const guests = [];
  
  rows.forEach(row => {
    const name = row.querySelector('.guest-name').value.trim();
    const email = row.querySelector('.guest-email').value.trim();
    if (name && email) guests.push({ name, email });
  });
  
  if (!guests.length) {
    alert('Добавьте хотя бы одного гостя');
    return;
  }
  
  try {
    const res = await fetch(`/api/cards/${currentSlug}/send-invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guests })
    });
    
    if (!res.ok) throw new Error('Ошибка отправки');
    
    const data = await res.json();
    const resultsDiv = document.getElementById('sendResults');
    resultsDiv.innerHTML = `
      <div style="padding:1rem;background:#d4edda;border-radius:8px;margin-top:1rem">
        <strong>✅ Отправлено: ${data.sent} из ${data.total}</strong>
        ${data.results.map(r => `
          <div style="margin-top:0.5rem;font-size:0.9rem">
            ${r.ok ? '✅' : '❌'} ${r.name} (${r.email}) ${r.reason ? '— ' + r.reason : ''}
          </div>
        `).join('')}
      </div>
    `;
    
    // Автосохранение списка после отправки
    saveGuestList();
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
}

// Просмотр анкеты гостя по клику на строку
function openGuestModal(g) {
  const statusMap = { yes: '✅ Придёт', no: '❌ Не придёт', maybe: '❓ Не знает' };
  const row = (label, value) => `
    <tr>
      <td style="padding:0.6rem 0;color:#888;width:45%;border-top:1px solid #f0f0f0">${label}</td>
      <td style="padding:0.6rem 0;border-top:1px solid #f0f0f0">${value}</td>
    </tr>`;

  document.getElementById('guestModalContent').innerHTML = `
    <table style="width:100%;border-collapse:collapse">
      ${row('ФИО', `<strong>${g.full_name}</strong>`)}
      ${row('Email', g.email || '—')}
      ${row('Присутствие', statusMap[g.attending] || g.attending)}
      ${row('Несовершеннолетний', g.is_minor ? `🔞 ${g.minor_age ? g.minor_age + ' лет' : 'да'}` : '—')}
      ${row('Заметка', g.note || '—')}
      ${row('Дата ответа', g.submitted_at ? new Date(g.submitted_at).toLocaleString('ru-RU') : '—')}
      ${row('Напоминание', g.reminded_at ? '✅ ' + new Date(g.reminded_at).toLocaleString('ru-RU') : '—')}
    </table>
  `;

  const overlay = document.getElementById('guestModalOverlay');
  overlay.style.display = 'flex';
}

function closeGuestModal() {
  document.getElementById('guestModalOverlay').style.display = 'none';
}

// Закрытие по клику на фон
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('guestModalOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeGuestModal();
  });
});
function setChannel(channel) {
  const emailBtn = document.getElementById('channelEmail');
  const tgBtn    = document.getElementById('channelTelegram');
  const emailDiv = document.getElementById('emailChannel');
  const tgDiv    = document.getElementById('telegramChannel');

  if (channel === 'email') {
    emailBtn.style.background = '#c0152a'; emailBtn.style.color = '#fff'; emailBtn.style.borderColor = '#c0152a';
    tgBtn.style.background = '#fff'; tgBtn.style.color = '#555'; tgBtn.style.borderColor = '#ddd';
    emailDiv.style.display = 'block'; tgDiv.style.display = 'none';
  } else {
    tgBtn.style.background = '#0088cc'; tgBtn.style.color = '#fff'; tgBtn.style.borderColor = '#0088cc';
    emailBtn.style.background = '#fff'; emailBtn.style.color = '#555'; emailBtn.style.borderColor = '#ddd';
    tgDiv.style.display = 'block'; emailDiv.style.display = 'none';
  }
}

function addTgGuestRow() {
  const container = document.getElementById('tgGuestInputs');
  const row = document.createElement('div');
  row.className = 'guest-input-row';
  row.innerHTML = `
    <input type="text" placeholder="Имя гостя" class="tg-guest-name">
    <input type="text" placeholder="Telegram Chat ID гостя" class="tg-guest-chatid">
    <button onclick="removeTgGuestRow(this)">✕</button>
  `;
  container.appendChild(row);
}

function removeTgGuestRow(btn) {
  const rows = document.querySelectorAll('#tgGuestInputs .guest-input-row');
  if (rows.length > 1) btn.parentElement.remove();
}

async function sendBulkTelegram() {
  const rows = document.querySelectorAll('#tgGuestInputs .guest-input-row');
  const guests = [];
  rows.forEach(row => {
    const name   = row.querySelector('.tg-guest-name').value.trim();
    const chatId = row.querySelector('.tg-guest-chatid').value.trim();
    if (name && chatId) guests.push({ name, chatId });
  });

  if (!guests.length) { alert('Добавьте хотя бы одного гостя с Chat ID'); return; }

  try {
    const res = await fetch(`/api/cards/${currentSlug}/send-invites-telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guests })
    });
    if (!res.ok) throw new Error('Ошибка отправки');
    const data = await res.json();
    document.getElementById('sendResults').innerHTML = `
      <div style="padding:1rem;background:#d4edda;border-radius:8px;margin-top:1rem">
        <strong>✅ Отправлено: ${data.sent} из ${data.total}</strong>
        ${data.results.map(r => `
          <div style="margin-top:0.5rem;font-size:0.9rem">
            ${r.ok ? '✅' : '❌'} ${r.name} (${r.chatId}) ${r.reason ? '— ' + r.reason : ''}
          </div>
        `).join('')}
      </div>`;
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
}
async function loadNotifications() {
  try {
    const res = await fetch(`/api/cards/${currentSlug}/notifications`);
    if (!res.ok) throw new Error('Ошибка загрузки логов');

    const logs = await res.json();
    const container = document.getElementById('notificationLog');

    if (!logs.length) {
      container.innerHTML = '<p style="text-align:center;color:#999;padding:2rem">Нет уведомлений</p>';
      return;
    }

    container.innerHTML = logs.map(log => {
      const channelLabels = { email: 'Email', telegram: 'Telegram' };
      const statusIcon = log.status === 'sent' ? '✅' : '❌';

      let typeLabel, recipientLabel;

      if (log.type === 'rsvp_alert') {
        typeLabel = 'Новый ответ гостя → уведомление организатору';
        recipientLabel = `организатору (${log.recipient})`;
      } else if (log.type === 'invite_sent') {
        typeLabel = 'Отправлено приглашение';
        recipientLabel = `гостю ${log.guest_name ? `<b>${log.guest_name}</b> ` : ''}(${log.recipient})`;
      } else if (log.type === 'reminder' && !log.guest_id) {
        typeLabel = 'Автоматическое напоминание организатору';
        recipientLabel = `организатору (${log.recipient})`;
      } else {
        typeLabel = 'Автоматическое напоминание гостю';
        recipientLabel = `гостю ${log.guest_name ? `<b>${log.guest_name}</b> ` : ''}(${log.recipient})`;
      }

      return `
        <div class="notification-item">
          <div>
            <div><strong>${typeLabel}</strong></div>
            <div style="margin-top:0.25rem;color:#555">
              ${channelLabels[log.channel]} → ${recipientLabel}
            </div>
            <div style="margin-top:0.25rem">
              <small style="color:#999">${new Date(log.sent_at).toLocaleString('ru')}</small>
            </div>
          </div>
          <div style="font-size:1.5rem;flex-shrink:0">${statusIcon}</div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
  }
}


// Поиск по гостям
let allGuests = [];
let allGuestsFull = []; // полный список, не затрагивается поиском

function setupGuestSearch() {
  const searchInput = document.getElementById('searchGuests');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
      // При очистке — восстанавливаем полный список
      renderGuestsTableFiltered(allGuestsFull);
      return;
    }
    const filtered = allGuestsFull.filter(g =>
      g.full_name.toLowerCase().includes(query) ||
      (g.email && g.email.toLowerCase().includes(query))
    );
    renderGuestsTableFiltered(filtered);
  });
}

// Рендер без перезаписи allGuestsFull
function renderGuestsTableFiltered(guests) {
  allGuests = guests;

  const tbody = document.getElementById('guestsTableBody');
  tbody.innerHTML = '';

  if (!guests.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#999">Ничего не найдено</td></tr>';
    return;
  }

  guests.forEach(g => {
    const statusMap = {
      yes:   '<span class="status-badge status-yes">✅ Придёт</span>',
      no:    '<span class="status-badge status-no">❌ Не придёт</span>',
      maybe: '<span class="status-badge status-maybe">❔ Не знает</span>'
    };
    const minorCell = g.is_minor
      ? `<span class="status-badge" style="background:#e8d5ff;color:#5a2d8a">🔞 ${g.minor_age ? g.minor_age + ' лет' : ''}</span>`
      : '<span style="color:#999">—</span>';

    const row = document.createElement('tr');
    row.style.cursor = 'pointer';
    row.title = 'Нажмите для просмотра анкеты';
    row.addEventListener('click', () => openGuestModal(g));
    row.innerHTML = `
      <td>${g.full_name}</td>
      <td>${g.email || '<span style="color:#999">—</span>'}</td>
      <td>${statusMap[g.attending]}</td>
      <td>${minorCell}</td>
      <td>${g.viewed_at ? new Date(g.viewed_at).toLocaleString('ru') : '<span style="color:#999">—</span>'}</td>
      <td>${g.reminded_at ? '✅ ' + new Date(g.reminded_at).toLocaleString('ru') : '<span style="color:#999">—</span>'}</td>
      <td>${g.note ? '📎 ' + g.note : '<span style="color:#999">—</span>'}</td>
    `;
    tbody.appendChild(row);
  });
}

// Аналитика — считаем всегда от полного списка allGuestsFull
function updateAnalytics(guests) {
  const full = allGuestsFull.length ? allGuestsFull : guests;

  // Email — только те, кто придёт и ещё не получил напоминание
  const attendingWithEmail   = full.filter(g => g.attending === 'yes' && g.email).length;
  const reminded             = full.filter(g => g.reminded_at).length;
  const pendingReminders     = full.filter(g => g.attending === 'yes' && g.email && !g.reminded_at).length;

  const els = {
    analyticsAttendingEmail:   attendingWithEmail,
    analyticsReminded:         reminded,
    analyticsPendingReminders: pendingReminders,
  };

  Object.entries(els).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });

  renderChart(full);
  renderTimeline(full);
  renderAgePie(full);
}

// Распределение ответов — каждый вид на своей строке, заливка начинается с позиции предыдущего
function renderChart(guests) {
  const chartEl = document.getElementById('analyticsChart');
  if (!chartEl) return;

  const yes   = guests.filter(g => g.attending === 'yes').length;
  const no    = guests.filter(g => g.attending === 'no').length;
  const maybe = guests.filter(g => g.attending === 'maybe').length;
  const total = guests.length || 1;
  const pct   = v => Math.round((v / total) * 100);

  // Накопленные позиции: каждый следующий начинается там, где закончился предыдущий
  const segments = [
    { label: '✅ Придут',    count: yes,   color: '#c0fa85ff', pct: pct(yes),   offset: 0 },
    { label: '❌ Не придут', count: no,    color: '#fd6279ff', pct: pct(no),    offset: pct(yes) },
    { label: '❔ Не знают',  count: maybe, color: '#fffca0ff', pct: pct(maybe), offset: pct(yes) + pct(no) },
  ];

  chartEl.innerHTML = segments.map(s => `
    <div style="margin-bottom:0.75rem">
      <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;font-size:0.9rem">
        <span>${s.label}</span>
        <span><b>${s.count}</b> (${s.pct}%)</span>
      </div>
      <div style="background:#e5d4da42;border-radius:6px;height:16px;position:relative;overflow:hidden">
        <div style="position:absolute;left:${s.offset}%;width:${s.pct}%;background:${s.color};height:100%;border-radius:3px"></div>
      </div>
    </div>
  `).join('');
}

// Круговая диаграмма: взрослые vs дети среди подтвердивших
function renderAgePie(guests) {
  const el = document.getElementById('analyticsAgePie');
  if (!el) return;

  const attending = guests.filter(g => g.attending === 'yes');
  const adults = attending.filter(g => !g.is_minor).length;
  const minors = attending.filter(g => g.is_minor).length;
  const total  = adults + minors;

  if (!total) { el.innerHTML = '<p style="color:#999">Нет подтвердивших участие</p>'; return; }

  const size = 110, cx = size/2, cy = size/2, r = 42;
  const adultAngle = (adults / total) * 2 * Math.PI;

  let slices = '';
  if (adults > 0 && minors > 0) {
    const ax1 = cx + r * Math.cos(-Math.PI/2);
    const ay1 = cy + r * Math.sin(-Math.PI/2);
    const ax2 = cx + r * Math.cos(-Math.PI/2 + adultAngle);
    const ay2 = cy + r * Math.sin(-Math.PI/2 + adultAngle);
    const large = adultAngle > Math.PI ? 1 : 0;
    slices = `
      <path d="M${cx},${cy} L${ax1},${ay1} A${r},${r} 0 ${large},1 ${ax2},${ay2} Z" fill="#bcbcbcff" opacity="0.85"/>
      <path d="M${cx},${cy} L${ax2},${ay2} A${r},${r} 0 ${1-large},1 ${ax1},${ay1} Z" fill="#eba0ffff" opacity="0.85"/>
    `;
  } else {
    slices = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${adults > 0 ? '#bcbcbcff' : '#eba0ffff'}" opacity="0.85"/>`;
  }

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${slices}</svg>
      <div>
        <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.4rem">
          <div style="width:12px;height:12px;border-radius:3px;background:#bcbcbcff"></div>
          <span style="font-size:0.85rem">Взрослые: <b>${adults}</b> (${Math.round(adults/total*100)}%)</span>
        </div>
        <div style="display:flex;align-items:center;gap:0.4rem">
          <div style="width:12px;height:12px;border-radius:3px;background:#eba0ffff"></div>
          <span style="font-size:0.85rem">Дети: <b>${minors}</b> (${Math.round(minors/total*100)}%)</span>
        </div>
      </div>
    </div>
  `;
}

// Экспорт в CSV
function exportGuestsCSV() {
  if (!allGuests.length) {
    alert('Нет данных для экспорта');
    return;
  }

  const statusLabel = s => s === 'yes' ? 'Придёт' : s === 'no' ? 'Не придёт' : 'Не знает';

  // Заголовки с разделителем ;  (Excel открывает корректно)
  const headers = ['№', 'ФИО', 'Email', 'Статус', 'Невосвершеннолетний', 'Возраст', 'Заметка', 'Дата ответа', 'Напоминание'];

  const rows = allGuests.map((g, i) => [
    i + 1,
    g.full_name,
    g.email || '',
    statusLabel(g.attending),
    g.is_minor ? 'Да' : 'Нет',
    g.is_minor && g.minor_age ? g.minor_age : '',
    g.note || '',
    g.viewed_at  ? new Date(g.viewed_at).toLocaleString('ru-RU')  : '',
    g.reminded_at ? new Date(g.reminded_at).toLocaleString('ru-RU') : ''
  ]);

  // Используем ; как разделитель — Excel на русской локали открывает без настроек
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\r\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `guests_${cardData?.title || currentSlug}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.csv`;
  link.click();
}

// Печать списка гостей
function printGuestList() {
  if (!allGuests.length) {
    alert('Нет данных для печати');
    return;
  }
  
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html>
    <head>
      <title>Список гостей - ${cardData.title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 24px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f8f8f8; font-weight: bold; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <h1>Список гостей: ${cardData.title}</h1>
      <p>Дата: ${new Date().toLocaleDateString('ru')}</p>
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Имя</th>
            <th>Email</th>
            <th>Статус</th>
            <th>Заметка</th>
          </tr>
        </thead>
        <tbody>
          ${allGuests.map((g, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${g.full_name}${g.is_minor ? ` (${g.minor_age} лет)` : ''}</td>
              <td>${g.email || '—'}</td>
              <td>${g.attending === 'yes' ? '✅ Придёт' : g.attending === 'no' ? '❌ Не придёт' : '❓ Не знает'}</td>
              <td>${g.note || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <button onclick="window.print()" style="margin-top:20px;padding:10px 20px;background:#c0152a;color:#fff;border:none;border-radius:8px;cursor:pointer">🖨️ Печать</button>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// Активность ответов — компактная гистограмма
function renderTimeline(guests) {
  const el = document.getElementById('analyticsTimeline');
  if (!el) return;
  if (!guests.length) { el.innerHTML = '<p style="color:#999; margin-top:-1px">Нет данных</p>'; return; }

  const byDate = {};
  guests.forEach(g => {
    if (!g.submitted_at) return;
    const date = new Date(g.submitted_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    byDate[date] = (byDate[date] || 0) + 1;
  });

  const entries = Object.entries(byDate);
  if (!entries.length) { el.innerHTML = '<p style="color:#999; margin-top:-1px">Нет данных</p>'; return; }

  const max   = Math.max(...entries.map(([, v]) => v));
  const barW  = 28;
  const gap   = 8;
  const chartH = 70;
  const svgW  = entries.length * (barW + gap) + 10;

  const bars = entries.map(([date, count], i) => {
    const h = Math.max(4, Math.round((count / max) * chartH));
    const x = 5 + i * (barW + gap);
    const y = chartH - h;
    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="#bdf7ffff" opacity="0.8"/>
      <text x="${x + barW/2}" y="${y - 3}" text-anchor="middle" font-size="10" fill="#333" font-weight="600">${count}</text>
      <text x="${x + barW/2}" y="${chartH + 13}" text-anchor="middle" font-size="10" fill="#666">${date}</text>
    `;
  }).join('');

  el.innerHTML = `<svg width="100%" viewBox="0 0 ${svgW} ${chartH + 20}" style="overflow:visible;max-height:110px">${bars}</svg>`;
}
