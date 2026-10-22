(function () {
  const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
  const state = {
    posts: [],
    groups: [],
    activeGroup: '全部',
    view: 'both', // both | calendar | list
    year: null,
    month: null, // 0-11
  };

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  function parseDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function fmtMonth(y, m) {
    return `${y}年 ${m + 1}月`;
  }

  function shortTitle(title) {
    // "富老板一课 · 10/19｜xxx" -> keep after ｜ if present
    const i = title.indexOf('｜');
    return i >= 0 ? title.slice(i + 1) : title;
  }

  async function load() {
    const res = await fetch('content/manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('无法加载 content/manifest.json');
    const data = await res.json();
    state.posts = (data.posts || []).slice().sort((a, b) => b.date.localeCompare(a.date));
    const rawGroups = data.groups || [];
    state.groups = rawGroups.map(g => (typeof g === 'string' ? g : (g.name || g.id))).filter(Boolean);
    if (!state.groups.length) {
      state.groups = [...new Set(state.posts.map(p => p.group))];
    }
    if (state.posts.length) {
      const latest = parseDate(state.posts[0].date);
      state.year = latest.getFullYear();
      state.month = latest.getMonth();
    } else {
      const now = new Date();
      state.year = now.getFullYear();
      state.month = now.getMonth();
    }
    renderAll();
  }

  function filteredPosts() {
    if (state.activeGroup === '全部') return state.posts;
    return state.posts.filter(p => p.group === state.activeGroup);
  }

  function renderTabs() {
    const host = $('#group-tabs');
    const tabs = ['全部', ...state.groups];
    host.innerHTML = tabs.map(g =>
      `<button type="button" class="tab${g === state.activeGroup ? ' active' : ''}" data-group="${g}">${g}</button>`
    ).join('');
    $$('.tab', host).forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeGroup = btn.dataset.group;
        renderAll();
      });
    });
  }

  function renderStats() {
    const posts = filteredPosts();
    const groups = new Set(posts.map(p => p.group));
    $('#stat-lessons').textContent = String(posts.length);
    $('#stat-groups').textContent = String(groups.size || state.groups.length);
    const latest = posts[0];
    $('#stat-latest').textContent = latest ? latest.date.slice(5).replace('-', '/') : '—';
  }

  function renderCalendar() {
    const host = $('#calendar-panel');
    const grid = $('#cal-grid');
    const label = $('#cal-label');
    label.textContent = fmtMonth(state.year, state.month);

    const posts = filteredPosts();
    const byDay = new Map();
    posts.forEach(p => {
      const dt = parseDate(p.date);
      if (dt.getFullYear() === state.year && dt.getMonth() === state.month) {
        byDay.set(dt.getDate(), p);
      }
    });

    const first = new Date(state.year, state.month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
    const prevDays = new Date(state.year, state.month, 0).getDate();

    const today = new Date();
    const cells = [];
    WEEKDAYS.forEach(d => cells.push(`<div class="cal-dow">${d}</div>`));

    for (let i = 0; i < startPad; i++) {
      const day = prevDays - startPad + 1 + i;
      cells.push(`<div class="cal-cell muted"><span>${day}</span></div>`);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const post = byDay.get(d);
      const isToday = today.getFullYear() === state.year && today.getMonth() === state.month && today.getDate() === d;
      if (post) {
        cells.push(
          `<a class="cal-cell has-lesson${isToday ? ' today' : ''}" href="${post.path}" title="${post.title}">` +
          `<span>${d}</span><span class="cal-dot" aria-hidden="true"></span></a>`
        );
      } else {
        cells.push(`<div class="cal-cell${isToday ? ' today' : ''}"><span>${d}</span></div>`);
      }
    }
    const total = startPad + daysInMonth;
    const trail = (7 - (total % 7)) % 7;
    for (let i = 1; i <= trail; i++) {
      cells.push(`<div class="cal-cell muted"><span>${i}</span></div>`);
    }
    grid.innerHTML = cells.join('');

    host.hidden = !(state.view === 'both' || state.view === 'calendar');
  }

  function renderList() {
    const host = $('#list-panel');
    const list = $('#article-list');
    const posts = filteredPosts();
    if (!posts.length) {
      list.innerHTML = `<div class="empty">这一组暂时还没有文章。新课写入 content/manifest.json 后会自动出现。</div>`;
    } else {
      list.innerHTML = posts.map(p => {
        const dt = parseDate(p.date);
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        return (
          `<a class="article-card" href="${p.path}">` +
          `<div class="article-date"><b>${dd}</b>${dt.getFullYear()}.${mm}</div>` +
          `<div class="article-body">` +
          `<div class="article-meta"><span class="pill">${p.group}</span>` +
          (p.lesson != null ? `<span class="pill">课次 ${p.lesson}</span>` : '') +
          (p.vol ? `<span class="pill">${p.vol}</span>` : '') +
          `</div>` +
          `<h3>${shortTitle(p.title)}</h3>` +
          `<p class="article-blurb">${p.blurb || ''}</p>` +
          `</div><div class="article-arrow" aria-hidden="true">→</div></a>`
        );
      }).join('');
    }
    host.hidden = !(state.view === 'both' || state.view === 'list');
  }

  function renderAll() {
    renderTabs();
    renderStats();
    renderCalendar();
    renderList();
    $$('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === state.view));
  }

  function bind() {
    $('#cal-prev').addEventListener('click', () => {
      state.month -= 1;
      if (state.month < 0) { state.month = 11; state.year -= 1; }
      renderCalendar();
    });
    $('#cal-next').addEventListener('click', () => {
      state.month += 1;
      if (state.month > 11) { state.month = 0; state.year += 1; }
      renderCalendar();
    });
    $$('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.view = btn.dataset.view;
        renderAll();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind();
    load().catch(err => {
      $('#article-list').innerHTML = `<div class="empty">加载失败：${err.message}</div>`;
    });
  });
})();
