// Territory progress (100-cell habit boards) + Achievements (catalog, trophy cabinet, unlock toasts).
(function () {
  // ================= styles =================
  const css = `
  #page-territory, #page-ach { max-width: 720px; }
  .x-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
  .x-title { font-size: 22px; font-weight: 700; margin: 0; flex: 1; min-width: 0; }
  .x-btn { background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text); border-radius: 10px;
    padding: 9px 14px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .x-btn:hover { border-color: var(--accent); color: var(--accent); }
  .x-btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
  .x-btn.primary:disabled { opacity: .55; cursor: default; }
  .x-btn.ghost-danger { color: var(--danger); }
  .x-btn.ghost-danger:hover { border-color: var(--danger); color: var(--danger); }
  .x-empty { color: var(--text-dim); font-size: 14px; padding: 36px 10px; text-align: center; }
  .x-form { display: flex; gap: 8px; margin-bottom: 18px; }
  .x-form input { flex: 1; min-width: 0; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 10px;
    padding: 10px 13px; font-size: 15px; color: var(--text); outline: none; font-family: inherit; }
  .x-form input:focus { border-color: var(--accent); }

  /* territory overview */
  .t-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
  .t-card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 14px; cursor: pointer;
    display: flex; flex-direction: column; gap: 10px; }
  .t-card:hover { border-color: var(--accent); }
  .t-card-name { display: flex; align-items: center; gap: 7px; font-weight: 700; font-size: 14.5px; }
  .t-card-meta { font-size: 12.5px; color: var(--text-dim); display: flex; justify-content: space-between; }
  .t-mini { display: grid; grid-template-columns: repeat(10, 1fr); gap: 2px; }
  .t-mini i { aspect-ratio: 1; border-radius: 2px; background: var(--border); display: block; }

  /* board */
  .t-name-input { font-size: 22px; font-weight: 700; background: none; border: 1px solid transparent; border-radius: 8px;
    color: var(--text); padding: 2px 6px; margin-left: -6px; flex: 1; min-width: 0; font-family: inherit; outline: none; }
  .t-name-input:hover { border-color: var(--border); }
  .t-name-input:focus { border-color: var(--accent); }
  .t-icon-btn { background: none; border: none; color: var(--text); cursor: pointer; padding: 4px; border-radius: 7px; display: flex; }
  .t-icon-btn:hover { background: var(--accent-soft); }
  .t-controls { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; margin-bottom: 18px; }
  .t-chips { display: flex; gap: 5px; flex-wrap: wrap; }
  .t-chip { background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-dim); border-radius: 999px;
    padding: 5px 11px; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .t-chip.on { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
  .t-colors { display: flex; gap: 6px; }
  .t-color { width: 20px; height: 20px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; }
  .t-color.on { border-color: var(--text); }
  .t-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden; margin-bottom: 18px; }
  .t-stat { background: var(--bg-elevated); padding: 11px 12px; }
  .t-stat b { display: block; font-size: 20px; font-variant-numeric: tabular-nums; }
  .t-stat span { font-size: 12px; color: var(--text-dim); }
  .t-mark-row { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
  .t-hint { font-size: 12.5px; color: var(--text-dim); }
  .t-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 5px; max-width: 460px; }
  .t-cell { aspect-ratio: 1; border-radius: 6px; border: 1.5px dashed var(--border); background: transparent; cursor: pointer; padding: 0;
    transition: transform .12s ease, background .15s ease; }
  .t-cell:hover { transform: scale(1.08); border-color: var(--board); }
  .t-cell.filled { border: none; background: var(--board); }
  .t-cell.today { box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--board); }
  .t-done-banner { margin-top: 18px; padding: 14px; border-radius: 12px; background: var(--accent-soft); display: flex;
    align-items: center; gap: 12px; flex-wrap: wrap; font-size: 14px; }
  #t-cell-pop { position: fixed; z-index: 1000; background: var(--popover-bg); border: 1px solid rgba(255,255,255,.1);
    border-radius: 10px; padding: 10px; display: none; flex-direction: column; gap: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.35); }
  #t-cell-pop.open { display: flex; }
  #t-cell-pop input { background: #242629; border: 1px solid #2a2d33; border-radius: 6px; color: #fff; font-size: 13px; padding: 6px 8px;
    color-scheme: dark; font-family: inherit; }
  #t-cell-pop button { background: none; border: none; color: #ef6a6a; font-size: 12.5px; cursor: pointer; text-align: left; padding: 4px 2px; }

  /* achievements: catalog */
  .a-group { margin-bottom: 22px; }
  .a-group h3 { font-size: 13px; color: var(--text-dim); font-weight: 600; margin: 0 0 8px; }
  .a-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 8px; }
  .a-card { display: flex; gap: 12px; align-items: center; background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: 12px; padding: 10px 12px; cursor: pointer; text-align: left; font-family: inherit; color: var(--text); }
  .a-card:hover { border-color: var(--accent); }
  .a-card svg { flex-shrink: 0; }
  .a-card.locked svg { filter: grayscale(1); opacity: .38; }
  .a-card-body { flex: 1; min-width: 0; }
  .a-card-name { font-weight: 700; font-size: 14px; display: flex; justify-content: space-between; gap: 8px; }
  .a-card-name em { font-style: normal; color: var(--accent); font-size: 13px; }
  .a-card-desc { font-size: 12.5px; color: var(--text-dim); margin: 2px 0 7px; }
  .a-bar { height: 5px; border-radius: 3px; background: var(--border); overflow: hidden; }
  .a-bar i { display: block; height: 100%; background: var(--accent); border-radius: 3px; }
  .a-bar-label { font-size: 11.5px; color: var(--text-dim); margin-top: 4px; }

  /* achievements: cabinet */
  .cab { background: linear-gradient(160deg, #6b4428, #3f2715 60%, #34200f); border-radius: 12px; padding: 14px 14px 18px;
    box-shadow: 0 14px 34px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.12); }
  .cab-top { height: 10px; margin: -6px 4px 10px; border-radius: 4px; background: linear-gradient(#8a5a35, #5d3a20); }
  .cab-inner { background: radial-gradient(ellipse at 50% -10%, #4a3222 0%, #24170e 55%, #1a110a 100%); border-radius: 4px;
    padding: 0 12px; box-shadow: inset 0 0 40px rgba(0,0,0,.7), inset 0 0 0 1px rgba(0,0,0,.4); }
  .shelf { position: relative; padding-top: 34px; }
  .shelf-items { display: flex; align-items: flex-end; gap: 8px; min-height: 104px; padding: 0 4px; }
  .plank { height: 13px; margin: 0 -12px; background: linear-gradient(#9a6a41, #6c4526 55%, #4a2d17); border-radius: 1px;
    box-shadow: 0 7px 10px -2px rgba(0,0,0,.65); position: relative; z-index: 1; }
  .shelf-note { color: rgba(245, 222, 179, .45); font-size: 13px; align-self: center; padding: 0 6px 30px; }
  .trophy { position: relative; width: 78px; display: flex; flex-direction: column; align-items: center; cursor: pointer;
    background: none; border: none; padding: 0; margin-bottom: -2px; font-family: inherit; }
  .trophy svg { display: block; transition: transform .16s ease; filter: drop-shadow(0 4px 3px rgba(0,0,0,.5)); }
  .trophy:hover svg, .trophy:focus-visible svg { transform: translateY(-4px); }
  .trophy-count { position: absolute; top: -22px; left: 50%; transform: translateX(-50%); background: rgba(245,222,179,.14);
    color: #f5deb3; font-size: 11.5px; font-weight: 700; padding: 1px 7px; border-radius: 999px; white-space: nowrap; }
  .trophy-tip { position: absolute; bottom: calc(100% + 26px); left: 50%; transform: translate(-50%, 4px); background: #111214;
    color: #fff; font-size: 12px; font-weight: 600; padding: 5px 9px; border-radius: 7px; white-space: nowrap; pointer-events: none;
    opacity: 0; transition: opacity .12s ease, transform .12s ease; z-index: 5; }
  .trophy:hover .trophy-tip, .trophy:focus-visible .trophy-tip { opacity: 1; transform: translate(-50%, 0); }
  @media (hover: none) { .trophy-tip { display: none; } }

  /* modal + toast */
  #a-modal { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,.5); display: none; align-items: center;
    justify-content: center; padding: 20px; }
  #a-modal.open { display: flex; }
  .a-m-card { background: var(--bg-elevated); color: var(--text); border: 1px solid var(--border); border-radius: 16px; width: 100%;
    max-width: 400px; max-height: 100%; overflow-y: auto; padding: 22px; display: flex; flex-direction: column; gap: 12px; }
  .a-m-top { display: flex; gap: 16px; align-items: center; }
  .a-m-top.locked svg { filter: grayscale(1); opacity: .38; }
  .a-m-name { font-size: 19px; font-weight: 700; margin: 0 0 4px; }
  .a-m-desc { font-size: 13.5px; color: var(--text-dim); margin: 0; }
  .a-m-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border);
    border-radius: 10px; overflow: hidden; }
  .a-m-stats div { background: var(--bg); padding: 9px 10px; }
  .a-m-stats b { display: block; font-size: 15px; }
  .a-m-stats span { font-size: 11.5px; color: var(--text-dim); }
  .a-m-hist { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
  .a-m-hist div { display: flex; justify-content: space-between; gap: 10px; padding: 8px 11px; font-size: 13px;
    border-bottom: 1px solid var(--border); }
  .a-m-hist div:last-child { border-bottom: none; }
  .a-m-hist span { color: var(--text-dim); }
  .a-m-sub { font-size: 12.5px; color: var(--text-dim); font-weight: 600; margin: 4px 0 -4px; }
  #a-toast { position: fixed; left: 50%; bottom: calc(22px + env(safe-area-inset-bottom, 0px)); transform: translate(-50%, 140%);
    z-index: 2100; background: #16171a; color: #fff; border: 1px solid rgba(245,222,179,.25); border-radius: 14px;
    padding: 10px 16px 10px 10px; display: flex; align-items: center; gap: 12px; box-shadow: 0 12px 30px rgba(0,0,0,.45);
    cursor: pointer; transition: transform .35s cubic-bezier(.2,.9,.3,1.2); max-width: calc(100% - 24px); }
  #a-toast.show { transform: translate(-50%, 0); }
  #a-toast small { display: block; color: #f5deb3; font-size: 11.5px; font-weight: 600; }
  #a-toast b { font-size: 15px; }
  @media (prefers-reduced-motion: reduce) { #a-toast, .trophy svg, .t-cell { transition: none; } }
  @media (max-width: 520px) { .t-stats { grid-template-columns: repeat(2, 1fr); } .t-grid { gap: 4px; } }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ================= DOM =================
  const contentEl = document.getElementById('content');
  const pageT = document.createElement('div'); pageT.id = 'page-territory'; pageT.className = 'page-wrap'; pageT.style.display = 'none';
  const pageA = document.createElement('div'); pageA.id = 'page-ach'; pageA.className = 'page-wrap'; pageA.style.display = 'none';
  contentEl.appendChild(pageT); contentEl.appendChild(pageA);
  const cellPop = document.createElement('div'); cellPop.id = 't-cell-pop'; document.body.appendChild(cellPop);
  const modal = document.createElement('div'); modal.id = 'a-modal'; document.body.appendChild(modal);
  const toast = document.createElement('div'); toast.id = 'a-toast'; document.body.appendChild(toast);
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
  document.addEventListener('click', e => { if (cellPop.classList.contains('open') && !cellPop.contains(e.target)) cellPop.classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { modal.classList.remove('open'); cellPop.classList.remove('open'); } });

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  // ================= dates =================
  const pad = n => String(n).padStart(2, '0');
  const dayStr = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const dayNum = s => { const [y, m, d] = s.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };
  const numToStr = n => { const d = new Date(n * 86400000); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); };
  const fmtDay = s => { const [y, m, d] = s.split('-').map(Number);
    const o = { day: 'numeric', month: 'short' }; if (y !== new Date().getFullYear()) o.year = 'numeric';
    return new Date(y, m - 1, d).toLocaleDateString('ru-RU', o).replace(/\.$/, ''); };
  const tsDay = ts => dayStr(new Date(ts));

  // runs of consecutive marks where the gap between marks is <= maxGap days
  function runsOf(dayNums, maxGap) {
    const u = [...new Set(dayNums)].sort((a, b) => a - b);
    const runs = [];
    u.forEach(n => {
      const r = runs[runs.length - 1];
      if (r && n - r.days[r.days.length - 1] <= maxGap) r.days.push(n);
      else runs.push({ days: [n] });
    });
    return runs;
  }

  // ================= data =================
  const boardsCol = SyncDB.collection('habitBoards');
  const cellsCol = SyncDB.collection('habitCells');
  let boards = [], cells = [];
  boardsCol.orderBy('createdAt', 'asc').onSnapshot(s => { boards = s.docs.map(d => ({ id: d.id, ...d.data() })); renderAll(); });
  cellsCol.orderBy('filledAt', 'asc').onSnapshot(s => { cells = s.docs.map(d => ({ id: d.id, ...d.data() })); renderAll(); });

  const RHYTHMS = [
    { id: 'daily', label: 'Every day', gap: 1 },
    { id: 'few', label: 'Few times a week', gap: 3 },
    { id: 'weekly', label: 'Once a week', gap: 7 }
  ];
  const COLORS = ['#3f8de0', '#33c27a', '#e0823e', '#e03e3e', '#9b5de5', '#e0b83e'];
  const rhythmOf = b => RHYTHMS.find(r => r.id === b.rhythm) || RHYTHMS[0];
  const cellsOf = id => cells.filter(c => c.boardId === id);

  function boardStats(b) {
    const cs = cellsOf(b.id);
    const gap = rhythmOf(b).gap;
    const runs = runsOf(cs.map(c => dayNum(c.date)), gap);
    const today = dayNum(dayStr());
    const last = runs[runs.length - 1];
    const current = last && today - last.days[last.days.length - 1] <= gap ? last.days.length : 0;
    const best = runs.reduce((m, r) => Math.max(m, r.days.length), 0);
    const month = dayStr().slice(0, 7);
    return { filled: cs.length, current, best, month: new Set(cs.filter(c => c.date.startsWith(month)).map(c => c.date)).size,
      markedToday: cs.some(c => c.date === dayStr()), runs, cs };
  }

  let tState = { boardId: null, creating: false };
  let aTab = 'mine';

  function createBoard(name, icon, extra) {
    const now = Date.now();
    return boardsCol.add({ name, icon: icon || 'target', rhythm: 'daily', color: COLORS[boards.length % COLORS.length], createdAt: now, order: now, ...(extra || {}) });
  }
  function deleteBoard(b) {
    if (!confirm('Delete "' + b.name + '" and all its marks?')) return;
    cellsOf(b.id).forEach(c => cellsCol.doc(c.id).delete());
    boardsCol.doc(b.id).delete();
    tState.boardId = null;
    renderAll();
  }
  function fillCell(b, idx, date) {
    if (cellsOf(b.id).some(c => c.idx === idx)) return;
    cellsCol.add({ boardId: b.id, idx, date: date || dayStr(), filledAt: Date.now() });
  }
  function markToday(b) {
    const used = new Set(cellsOf(b.id).map(c => c.idx));
    for (let i = 0; i < 100; i++) if (!used.has(i)) return fillCell(b, i);
  }

  // ================= navigation =================
  function goTerritory(boardId) { currentPage = 'territory'; tState.boardId = boardId || null; renderAll(); autoCollapseOnMobile(); }
  function goAch(tab) { currentPage = 'achievements'; aTab = tab; renderAll(); autoCollapseOnMobile(); }

  // ================= sidebar =================
  const I = {
    territory: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="vertical-align:-2px"><rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor"/><rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor"/></svg>',
    trophy: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M7 4H17V9C17 12 14.8 14 12 14C9.2 14 7 12 7 9V4Z"/><path d="M7 6H4.5C4.5 9 5.5 10.5 7.3 10.8"/><path d="M17 6H19.5C19.5 9 18.5 10.5 16.7 10.8"/><path d="M12 14V17.5"/><path d="M8.5 20.5H15.5L14.8 17.5H9.2L8.5 20.5Z"/></svg>',
    shelf: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" style="vertical-align:-2px"><rect x="2" y="1.5" width="12" height="13" rx="1.2"/><path d="M2 8H14"/><path d="M5 8V5.5M8 8V4.5M11 8V6"/><path d="M5.5 14.5V12M9.5 14.5V11.5"/></svg>',
    list: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" style="vertical-align:-2px"><circle cx="3.5" cy="4" r="1"/><circle cx="3.5" cy="8" r="1"/><circle cx="3.5" cy="12" r="1"/><path d="M6.5 4H13M6.5 8H13M6.5 12H13"/></svg>',
    plus: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };
  function row(opts) {
    const r = el('div', 'tree-row' + (opts.active ? ' active' : ''));
    r.style.paddingLeft = (opts.indent || 6) + 'px';
    const ic = el('span', 'row-icon', opts.icon);
    const nm = el('span', 'row-name'); nm.textContent = opts.name;
    if (opts.bold) nm.style.fontWeight = '700';
    r.appendChild(ic); r.appendChild(nm);
    if (opts.meta != null) { const m = el('span', null); m.textContent = opts.meta; m.style.cssText = 'font-size:11.5px;color:var(--sidebar-text-dim);padding-right:4px'; r.appendChild(m); }
    if (opts.onAdd) {
      const acts = el('div', 'row-actions');
      const b = el('button', null, I.plus); b.title = opts.addTitle || 'Add';
      b.addEventListener('click', e => { e.stopPropagation(); opts.onAdd(); });
      acts.appendChild(b); r.appendChild(acts);
    }
    r.addEventListener('click', opts.onClick);
    return r;
  }

  window.renderExtraSidebar = function (list) {
    scheduleAch();
    const tOpen = expanded.has('__terr__');
    list.appendChild(row({
      icon: I.territory, name: 'Territory progress', bold: true,
      active: currentPage === 'territory' && !tState.boardId,
      onClick: () => { if (tOpen && currentPage === 'territory' && !tState.boardId) expanded.delete('__terr__'); else expanded.add('__terr__'); saveExpanded(); goTerritory(null); },
      addTitle: 'New board',
      onAdd: () => { expanded.add('__terr__'); saveExpanded(); tState.creating = true; goTerritory(null); }
    }));
    if (tOpen) {
      boards.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(b => {
        list.appendChild(row({
          icon: iconSVG(b.icon || 'target', 14), name: b.name, indent: 27, meta: cellsOf(b.id).length,
          active: currentPage === 'territory' && tState.boardId === b.id,
          onClick: () => goTerritory(b.id)
        }));
      });
    }
    const aOpen = expanded.has('__ach__');
    list.appendChild(row({
      icon: I.trophy, name: 'Achievements', bold: true,
      onClick: () => { if (aOpen) expanded.delete('__ach__'); else expanded.add('__ach__'); saveExpanded(); goAch(aTab); }
    }));
    if (aOpen) {
      list.appendChild(row({ icon: I.shelf, name: 'My achievements', indent: 27, active: currentPage === 'achievements' && aTab === 'mine', onClick: () => goAch('mine') }));
      list.appendChild(row({ icon: I.list, name: 'All achievements', indent: 27, active: currentPage === 'achievements' && aTab === 'all', onClick: () => goAch('all') }));
    }
  };

  window.renderExtraBreadcrumbs = function (bc) {
    if (currentPage !== 'territory' && currentPage !== 'achievements') return false;
    bc.innerHTML = '';
    const crumb = (text, current, onClick) => {
      const c = el('span', 'crumb' + (current ? ' current' : '')); c.textContent = text;
      if (onClick && !current) c.addEventListener('click', onClick);
      bc.appendChild(c);
    };
    const sep = () => { const s = el('span', 'crumb-sep'); s.textContent = '/'; bc.appendChild(s); };
    if (currentPage === 'territory') {
      const b = boards.find(x => x.id === tState.boardId);
      crumb('Territory progress', !b, () => goTerritory(null));
      if (b) { sep(); crumb(b.name, true); }
    } else {
      crumb('Achievements', false, () => goAch('all'));
      sep(); crumb(aTab === 'mine' ? 'My achievements' : 'All achievements', true);
    }
    return true;
  };

  window.renderExtraPages = function () {
    pageT.style.display = currentPage === 'territory' ? 'block' : 'none';
    pageA.style.display = currentPage === 'achievements' ? 'block' : 'none';
    if (currentPage === 'territory') renderTerritory();
    else if (currentPage === 'achievements') renderAchievements();
  };

  // ================= territory pages =================
  function renderTerritory() {
    const b = boards.find(x => x.id === tState.boardId);
    if (tState.boardId && !b) tState.boardId = null;
    if (b) renderBoard(b); else renderOverview();
  }

  function renderOverview() {
    pageT.innerHTML = '';
    const head = el('div', 'x-head');
    const h = el('h1', 'x-title'); h.textContent = 'Territory progress';
    const nb = el('button', 'x-btn primary'); nb.textContent = 'New board';
    nb.addEventListener('click', () => { tState.creating = true; renderOverview(); });
    head.appendChild(h); head.appendChild(nb);
    pageT.appendChild(head);

    if (tState.creating) {
      const f = el('div', 'x-form');
      const inp = el('input'); inp.placeholder = 'Board name, e.g. Gym'; inp.maxLength = 40;
      const ok = el('button', 'x-btn primary'); ok.textContent = 'Create';
      const cancel = el('button', 'x-btn'); cancel.textContent = 'Cancel';
      const submit = () => {
        const name = inp.value.trim();
        if (!name) return;
        tState.creating = false;
        createBoard(name).then(r => goTerritory(r.id));
      };
      ok.addEventListener('click', submit);
      cancel.addEventListener('click', () => { tState.creating = false; renderOverview(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') cancel.click(); });
      f.appendChild(inp); f.appendChild(ok); f.appendChild(cancel);
      pageT.appendChild(f);
      setTimeout(() => inp.focus(), 30);
    }

    if (!boards.length) {
      const e = el('div', 'x-empty'); e.textContent = 'Create a board for any habit. Every time you do it, fill one of 100 squares.';
      pageT.appendChild(e);
      return;
    }
    const grid = el('div', 't-cards');
    boards.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(b => {
      const st = boardStats(b);
      const card = el('div', 't-card');
      card.style.setProperty('--board', b.color || COLORS[0]);
      const name = el('div', 't-card-name', iconSVG(b.icon || 'target', 15) + '<span>' + esc(b.name) + '</span>');
      const mini = el('div', 't-mini');
      const filled = new Set(st.cs.map(c => c.idx));
      for (let i = 0; i < 100; i++) { const c = el('i'); if (filled.has(i)) c.style.background = b.color || COLORS[0]; mini.appendChild(c); }
      const meta = el('div', 't-card-meta', '<span>' + st.filled + ' / 100</span><span>' + (st.current ? 'Streak ' + st.current : 'No active streak') + '</span>');
      card.appendChild(name); card.appendChild(mini); card.appendChild(meta);
      card.addEventListener('click', () => goTerritory(b.id));
      grid.appendChild(card);
    });
    pageT.appendChild(grid);
  }

  function renderBoard(b) {
    pageT.innerHTML = '';
    pageT.style.setProperty('--board', b.color || COLORS[0]);
    const st = boardStats(b);

    const head = el('div', 'x-head');
    const iconBtn = el('button', 't-icon-btn', iconSVG(b.icon || 'target', 22)); iconBtn.title = 'Change icon';
    iconBtn.addEventListener('click', e => { e.stopPropagation(); openIconPopover(iconBtn, ic => boardsCol.doc(b.id).update({ icon: ic })); });
    const nameIn = el('input', 't-name-input'); nameIn.value = b.name; nameIn.maxLength = 40;
    const saveName = () => { const v = nameIn.value.trim(); if (v && v !== b.name) boardsCol.doc(b.id).update({ name: v }); else nameIn.value = b.name; };
    nameIn.addEventListener('blur', saveName);
    nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') nameIn.blur(); });
    const del = el('button', 'x-btn ghost-danger'); del.textContent = 'Delete';
    del.addEventListener('click', () => deleteBoard(b));
    head.appendChild(iconBtn); head.appendChild(nameIn); head.appendChild(del);
    pageT.appendChild(head);

    const controls = el('div', 't-controls');
    const chips = el('div', 't-chips');
    RHYTHMS.forEach(r => {
      const c = el('button', 't-chip' + (rhythmOf(b).id === r.id ? ' on' : '')); c.textContent = r.label;
      c.title = 'Streak continues if the gap between marks is at most ' + r.gap + (r.gap === 1 ? ' day' : ' days');
      c.addEventListener('click', () => boardsCol.doc(b.id).update({ rhythm: r.id }));
      chips.appendChild(c);
    });
    const colors = el('div', 't-colors');
    COLORS.forEach(col => {
      const c = el('button', 't-color' + ((b.color || COLORS[0]) === col ? ' on' : '')); c.style.background = col; c.title = 'Color';
      c.addEventListener('click', () => boardsCol.doc(b.id).update({ color: col }));
      colors.appendChild(c);
    });
    controls.appendChild(chips); controls.appendChild(colors);
    pageT.appendChild(controls);

    const stats = el('div', 't-stats');
    [[st.filled + '<small style="font-size:13px;color:var(--text-dim)"> / 100</small>', 'Filled'], [st.current, 'Current streak'], [st.best, 'Best streak'], [st.month, 'This month']]
      .forEach(([v, l]) => stats.appendChild(el('div', 't-stat', '<b>' + v + '</b><span>' + l + '</span>')));
    pageT.appendChild(stats);

    const markRow = el('div', 't-mark-row');
    const mark = el('button', 'x-btn primary'); mark.textContent = st.markedToday ? 'Marked today' : 'Mark today';
    mark.disabled = st.markedToday || st.filled >= 100;
    mark.addEventListener('click', () => markToday(b));
    const hint = el('span', 't-hint'); hint.textContent = 'Tap an empty square to fill it, tap a filled one to change its date.';
    markRow.appendChild(mark); markRow.appendChild(hint);
    pageT.appendChild(markRow);

    const grid = el('div', 't-grid');
    const byIdx = new Map(st.cs.map(c => [c.idx, c]));
    const today = dayStr();
    for (let i = 0; i < 100; i++) {
      const c = byIdx.get(i);
      const cell = el('button', 't-cell' + (c ? ' filled' : '') + (c && c.date === today ? ' today' : ''));
      cell.title = c ? fmtDay(c.date) : 'Square ' + (i + 1);
      cell.setAttribute('aria-label', c ? 'Filled ' + fmtDay(c.date) : 'Empty square ' + (i + 1));
      cell.addEventListener('click', e => {
        e.stopPropagation();
        if (!c) fillCell(b, i);
        else openCellPop(cell, c);
      });
      grid.appendChild(cell);
    }
    pageT.appendChild(grid);

    if (st.filled >= 100) {
      const done = el('div', 't-done-banner', '<span style="flex:1">All 100 squares filled. This territory is yours.</span>');
      const again = el('button', 'x-btn primary'); again.textContent = 'Start the next 100';
      again.addEventListener('click', () => {
        const m = b.name.match(/^(.*?)(?:\s+(\d+))?$/);
        const next = (m[1] || b.name) + ' ' + ((+m[2] || 1) + 1);
        createBoard(next, b.icon, { rhythm: b.rhythm, color: b.color }).then(r => goTerritory(r.id));
      });
      done.appendChild(again);
      pageT.appendChild(done);
    }
  }

  function openCellPop(anchor, c) {
    cellPop.innerHTML = '';
    const inp = el('input'); inp.type = 'date'; inp.value = c.date; inp.max = dayStr();
    inp.addEventListener('change', () => { if (inp.value) cellsCol.doc(c.id).update({ date: inp.value }); cellPop.classList.remove('open'); });
    const clr = el('button'); clr.textContent = 'Clear square';
    clr.addEventListener('click', () => { cellsCol.doc(c.id).delete(); cellPop.classList.remove('open'); });
    cellPop.appendChild(inp); cellPop.appendChild(clr);
    const r = anchor.getBoundingClientRect();
    cellPop.style.top = Math.min(r.bottom + 6, window.innerHeight - 110) + 'px';
    cellPop.style.left = Math.max(8, Math.min(r.left - 60, window.innerWidth - 190)) + 'px';
    cellPop.classList.add('open');
  }

  // ================= trophy art =================
  const METALS = {
    bronze: ['#f3c08f', '#c47a3d', '#6e3d1a'],
    silver: ['#ffffff', '#b9c2cc', '#5f6975'],
    gold: ['#fff4b0', '#f0bd2a', '#9a6a05'],
    platinum: ['#f0fdff', '#a6dbe9', '#3f7f97'],
    diamond: ['#e6f9ff', '#62c9ff', '#1f5fc8'],
    ruby: ['#ffc2c2', '#e04848', '#7d1717'],
    emerald: ['#c4f7da', '#36be72', '#155f36']
  };
  let gid = 0;
  const EMBLEMS = {
    check: (c) => `<path d="M-8 0L-2.5 5.5L8.5 -6" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    clock: (c) => `<circle r="9" stroke="${c}" stroke-width="3" fill="none"/><path d="M0 -5V0L4 3" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    bolt: (c) => `<path d="M2 -11L-7 2H0L-2 11L7 -2H0Z" fill="${c}"/>`,
    flag: (c) => `<path d="M-6 10V-10M-6 -9H7L3.5 -4L7 1H-6" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    scale: (c) => `<path d="M0 -9V9M-8 9H8M-10 -5H10M-10 -5L-13 3H-7ZM10 -5L7 3H13Z" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    dumbbell: (c) => `<path d="M-11 -4V4M-7 -7V7M7 -7V7M11 -4V4M-7 0H7" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`,
    up: (c) => `<path d="M0 10V-8M-7 -1L0 -9L7 -1" stroke="${c}" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    crown: (c) => `<path d="M-10 6L-11 -6L-4 -1L0 -9L4 -1L11 -6L10 6Z" fill="${c}"/>`,
    target: (c) => `<circle r="9" stroke="${c}" stroke-width="2.6" fill="none"/><circle r="4" stroke="${c}" stroke-width="2.6" fill="none"/>`
  };
  function flameSVG(cx, baseY, s, id) {
    return `<g transform="translate(${cx} ${baseY}) scale(${s})">
      <path d="M0 -26C7 -18 13 -13 12 -5C11 1 6 4 0 4C-6 4 -11 1 -12 -5C-13 -11 -8 -14 -5 -20C-4 -15 -2 -13 0 -12C1 -16 1 -21 0 -26Z" fill="url(#${id}f)"/>
      <path d="M0 -12C3 -8 6 -5 5 -1C4 2 2 3 0 3C-2 3 -4 2 -5 -1C-5 -4 -2 -6 0 -12Z" fill="#fff3b0"/></g>`;
  }
  function center(o, cy, m, size) {
    if (o.label) {
      const fs = size || (o.label.length >= 3 ? 15 : o.label.length === 2 ? 20 : 24);
      return `<text x="50" y="${cy}" text-anchor="middle" dominant-baseline="central" font-family="-apple-system,'Segoe UI',Roboto,sans-serif"
        font-weight="800" font-size="${fs}" fill="${m[2]}" stroke="${m[0]}" stroke-width=".6" paint-order="stroke">${esc(o.label)}</text>`;
    }
    if (o.emblem && EMBLEMS[o.emblem]) return `<g transform="translate(50 ${cy})">${EMBLEMS[o.emblem](m[2])}</g>`;
    return '';
  }
  function plinth(m) {
    return `<rect x="27" y="104" width="46" height="14" rx="2" fill="#2e1d11"/><rect x="27" y="104" width="46" height="3" rx="1.5" fill="#4a3020"/>
      <rect x="40" y="109" width="20" height="5" rx="1" fill="${m[1]}" opacity=".85"/>`;
  }
  function trophySVG(o, w) {
    const m = METALS[o.metal] || METALS.gold;
    const id = 'tg' + (++gid);
    const defs = `<defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${m[1]}"/><stop offset=".35" stop-color="${m[0]}"/><stop offset=".7" stop-color="${m[1]}"/><stop offset="1" stop-color="${m[2]}"/></linearGradient>
      <linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m[0]}"/><stop offset="1" stop-color="${m[2]}"/></linearGradient>
      <linearGradient id="${id}f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff4d1f"/><stop offset=".6" stop-color="#ff9a1f"/><stop offset="1" stop-color="#ffd54a"/></linearGradient>
    </defs>`;
    let body = '';
    if (o.shape === 'cup') {
      const fl = o.flame ? flameSVG(50, 22, o.flame, id) : '';
      body = `${fl}
        <path d="M29 30C15 30 14 54 33 57" stroke="${m[2]}" stroke-width="5" fill="none"/><path d="M71 30C85 30 86 54 67 57" stroke="${m[2]}" stroke-width="5" fill="none"/>
        <path d="M27 24H73V42C73 60 62 70 50 72C38 70 27 60 27 42Z" fill="url(#${id})"/>
        <rect x="24" y="19" width="52" height="8" rx="3" fill="url(#${id}v)"/>
        <path d="M33 30C33 50 38 60 44 66" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>
        <rect x="46" y="71" width="8" height="15" fill="${m[2]}"/><ellipse cx="50" cy="78" rx="7" ry="3" fill="${m[1]}"/>
        <path d="M36 86H64L67 104H33Z" fill="url(#${id})"/>
        ${center(o, 45, m)}`;
    } else if (o.shape === 'medal') {
      body = `<path d="M34 8H48L56 44H42Z" fill="${o.ribbon || '#3f5fd6'}"/><path d="M66 8H52L44 44H58Z" fill="${o.ribbon2 || '#e03e3e'}"/>
        <path d="M34 8H48L50 16Z" fill="#000" opacity=".15"/>
        <circle cx="50" cy="64" r="27" fill="url(#${id})"/><circle cx="50" cy="64" r="21" fill="none" stroke="${m[0]}" stroke-width="2" opacity=".7"/>
        <rect x="46" y="90" width="8" height="14" fill="#3a2616"/>
        ${center(o, 64, m)}`;
    } else if (o.shape === 'star') {
      const pts = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 15 : 34, a = -Math.PI / 2 + i * Math.PI / 5; pts.push((50 + r * Math.cos(a)).toFixed(1) + ',' + (56 + r * Math.sin(a)).toFixed(1)); }
      body = `<polygon points="${pts.join(' ')}" fill="url(#${id})" stroke="${m[2]}" stroke-width="1.5" stroke-linejoin="round"/>
        <rect x="46" y="84" width="8" height="20" fill="${m[2]}"/>${center(o, 58, m, o.label && o.label.length > 1 ? 15 : 19)}`;
    } else {
      body = `<path d="M50 14L78 24V50C78 72 64 86 50 92C36 86 22 72 22 50V24Z" fill="url(#${id})" stroke="${m[2]}" stroke-width="2"/>
        <path d="M50 20L72 28V50C72 68 61 80 50 85" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>
        <rect x="46" y="92" width="8" height="12" fill="${m[2]}"/>${center(o, 52, m)}`;
    }
    const top = o.flame ? -16 : 0, vh = 120 - top;
    return `<svg width="${w}" height="${Math.round(w * vh / 100)}" viewBox="0 ${top} 100 ${vh}" aria-hidden="true">${defs}${body}${plinth(m)}</svg>`;
  }

  // ================= achievements =================
  const every = (list, n) => { const out = []; for (let k = n; k <= list.length; k += n) out.push(list[k - 1]); return out; };

  function habitData() {
    return boards.map(b => ({ b, st: boardStats(b), gap: rhythmOf(b).gap }));
  }
  function streakAch(n) {
    return () => {
      const hd = habitData();
      const events = [];
      hd.forEach(({ b, st }) => st.runs.forEach(r => { for (let k = n; k <= r.days.length; k += n) events.push({ day: numToStr(r.days[k - 1]), ctx: b.name + ', ' + k + ' in a row' }); }));
      const cur = hd.reduce((m, x) => Math.max(m, x.st.current), 0);
      return { events, progress: { cur: cur % n, target: n, label: cur ? 'Current best streak: ' + cur : 'No active streak' } };
    };
  }

  const ACH = [
    { id: 'first_mark', cat: 'Habits', name: 'First step', desc: 'Fill the first square on a board.', art: { shape: 'medal', metal: 'bronze', emblem: 'flag', ribbon: '#33c27a', ribbon2: '#1d8a52' },
      calc: () => { const hd = habitData().filter(x => x.st.filled);
        return { events: hd.map(({ b, st }) => ({ day: st.cs.map(c => c.date).sort()[0], ctx: b.name })), progress: { cur: hd.length ? 1 : 0, target: 1 } }; } },
    { id: 'streak5', cat: 'Habits', name: 'Warming up', desc: '5 marks in a row on one board. Earned again for every 5.', art: { shape: 'cup', metal: 'bronze', label: '5', flame: .7 }, calc: streakAch(5) },
    { id: 'streak10', cat: 'Habits', name: 'On fire', desc: '10 marks in a row on one board. Earned again for every 10.', art: { shape: 'cup', metal: 'gold', label: '10', flame: 1 }, calc: streakAch(10) },
    { id: 'streak30', cat: 'Habits', name: 'Iron will', desc: '30 marks in a row on one board.', art: { shape: 'cup', metal: 'platinum', label: '30', flame: 1.15 }, calc: streakAch(30) },
    { id: 'streak100', cat: 'Habits', name: 'Unstoppable', desc: '100 marks in a row on one board.', art: { shape: 'cup', metal: 'diamond', label: '100', flame: 1.3 }, calc: streakAch(100) },
    { id: 'perfect_week', cat: 'Habits', name: 'Perfect week', desc: 'Mark a daily board every day from Monday to Sunday.', art: { shape: 'star', metal: 'gold', label: '7' },
      calc: () => {
        const events = []; let best = 0;
        const monday = n => n - ((new Date(n * 86400000).getUTCDay() + 6) % 7);
        const thisMon = monday(dayNum(dayStr()));
        habitData().filter(x => x.gap === 1).forEach(({ b, st }) => {
          const weeks = {};
          new Set(st.cs.map(c => dayNum(c.date))).forEach(n => { const w = monday(n); weeks[w] = (weeks[w] || 0) + 1; });
          Object.keys(weeks).forEach(w => { if (weeks[w] >= 7) events.push({ day: numToStr(+w + 6), ctx: b.name }); });
          best = Math.max(best, weeks[thisMon] || 0);
        });
        return { events, progress: { cur: best, target: 7, label: 'This week: ' + best + ' of 7 days' } };
      } },
    { id: 'half', cat: 'Habits', name: 'Halfway there', desc: 'Fill 50 squares on one board.', art: { shape: 'medal', metal: 'silver', label: '50', ribbon: '#3f8de0', ribbon2: '#1d40c4' },
      calc: () => { const hd = habitData(); const events = [];
        hd.forEach(({ b, st }) => { if (st.filled >= 50) events.push({ day: st.cs.map(c => c.date).sort()[49], ctx: b.name }); });
        const cur = hd.filter(x => x.st.filled < 50).reduce((m, x) => Math.max(m, x.st.filled), 0);
        return { events, progress: { cur, target: 50 } }; } },
    { id: 'conquered', cat: 'Habits', name: 'Territory conquered', desc: 'Fill all 100 squares on a board.', art: { shape: 'shield', metal: 'gold', emblem: 'crown' },
      calc: () => { const hd = habitData(); const events = [];
        hd.forEach(({ b, st }) => { if (st.filled >= 100) events.push({ day: st.cs.map(c => c.date).sort()[99], ctx: b.name }); });
        const cur = hd.filter(x => x.st.filled < 100).reduce((m, x) => Math.max(m, x.st.filled), 0);
        return { events, progress: { cur, target: 100 } }; } },
    { id: 'comeback', cat: 'Habits', name: 'Comeback', desc: 'Lose a streak, then get 3 marks in a row again.', art: { shape: 'medal', metal: 'ruby', emblem: 'up', ribbon: '#e0823e', ribbon2: '#e03e3e' },
      calc: () => { const events = [];
        habitData().forEach(({ b, st }) => st.runs.forEach((r, i) => { if (i > 0 && r.days.length >= 3) events.push({ day: numToStr(r.days[2]), ctx: b.name }); }));
        return { events, progress: { cur: 0, target: 1, label: 'Unlocks after a break' } }; } },

    { id: 'tasks10', cat: 'Tasks', name: 'Getting things done', desc: 'Complete 10 tasks. Earned again for every 10.', art: { shape: 'cup', metal: 'silver', emblem: 'check' },
      calc: () => { const d = allTasks.filter(t => t.done && t.completedAt).sort((a, b) => a.completedAt - b.completedAt);
        return { events: every(d, 10).map(t => ({ day: tsDay(t.completedAt), ctx: t.text })), progress: { cur: d.length % 10, target: 10, label: d.length + ' tasks done' } }; } },
    { id: 'deadline10', cat: 'Tasks', name: 'Right on time', desc: 'Complete 10 tasks before their deadline.', art: { shape: 'medal', metal: 'gold', emblem: 'clock', ribbon: '#1d40c4', ribbon2: '#3f8de0' },
      calc: () => { const d = allTasks.filter(t => t.done && t.completedAt && t.deadline && tsDay(t.completedAt) <= t.deadline).sort((a, b) => a.completedAt - b.completedAt);
        return { events: every(d, 10).map(t => ({ day: tsDay(t.completedAt), ctx: t.text })), progress: { cur: d.length % 10, target: 10 } }; } },
    { id: 'productive_day', cat: 'Tasks', name: 'Productive day', desc: 'Complete 5 tasks in one day.', art: { shape: 'star', metal: 'gold', emblem: 'bolt' },
      calc: () => { const by = {}; allTasks.filter(t => t.done && t.completedAt).forEach(t => { const d = tsDay(t.completedAt); by[d] = (by[d] || 0) + 1; });
        return { events: Object.keys(by).filter(d => by[d] >= 5).sort().map(d => ({ day: d, ctx: by[d] + ' tasks' })), progress: { cur: Math.min(by[dayStr()] || 0, 5), target: 5, label: 'Today: ' + (by[dayStr()] || 0) + ' of 5' } }; } },
    { id: 'big_fish', cat: 'Tasks', name: 'Big fish', desc: 'Complete 5 tasks with the highest priority.', art: { shape: 'shield', metal: 'ruby', emblem: 'target' },
      calc: () => { const d = allTasks.filter(t => t.done && t.completedAt && t.priority === 2).sort((a, b) => a.completedAt - b.completedAt);
        return { events: every(d, 5).map(t => ({ day: tsDay(t.completedAt), ctx: t.text })), progress: { cur: d.length % 5, target: 5 } }; } },

    { id: 'weighin7', cat: 'Body and gym', name: 'Scale regular', desc: 'Log your weight 7 days in a row.', art: { shape: 'medal', metal: 'emerald', emblem: 'scale', ribbon: '#33c27a', ribbon2: '#9b5de5' },
      calc: () => { const runs = runsOf(allWeights.map(w => dayNum(tsDay(w.date))), 1); const events = [];
        runs.forEach(r => { for (let k = 7; k <= r.days.length; k += 7) events.push({ day: numToStr(r.days[k - 1]), ctx: k + ' days in a row' }); });
        const last = runs[runs.length - 1]; const cur = last && dayNum(dayStr()) - last.days[last.days.length - 1] <= 1 ? last.days.length : 0;
        return { events, progress: { cur: cur % 7, target: 7 } }; } },
    { id: 'pr', cat: 'Body and gym', name: 'New record', desc: 'Beat your best result in a tracked exercise.', art: { shape: 'cup', metal: 'ruby', label: 'PR' },
      calc: () => { const events = [];
        allGymPEx.forEach(ex => { let max = null;
          allGymPLogs.filter(l => l.exerciseId === ex.id).sort((a, b) => a.date - b.date).forEach(l => {
            const v = +l.value; if (max !== null && v > max) events.push({ day: tsDay(l.date), ctx: ex.name + ': ' + v }); if (max === null || v > max) max = v; }); });
        events.sort((a, b) => a.day < b.day ? -1 : 1);
        return { events, progress: { cur: 0, target: 1, label: 'Log a result above your best' } }; } },
    { id: 'logbook', cat: 'Body and gym', name: 'Logbook', desc: 'Log 10 workouts in the gym plan.', art: { shape: 'medal', metal: 'bronze', emblem: 'dumbbell', ribbon: '#6b6dae', ribbon2: '#3f5fd6' },
      calc: () => { const d = allGymLogs.slice().sort((a, b) => a.date - b.date);
        return { events: every(d, 10).map(l => ({ day: tsDay(l.date), ctx: 'Workout #' + (d.indexOf(l) + 1) })), progress: { cur: d.length % 10, target: 10 } }; } }
  ];

  let achCache = null;
  function computeAll() {
    achCache = ACH.map(a => { let r; try { r = a.calc(); } catch (e) { r = { events: [], progress: { cur: 0, target: 1 } }; }
      r.events.sort((x, y) => (x.day < y.day ? -1 : x.day > y.day ? 1 : 0));
      return { a, events: r.events, progress: r.progress }; });
    return achCache;
  }

  // ---- unlock toasts ----
  const SEEN_KEY = 'tgr_ach_seen';
  let achTimer = null, toastQueue = [], toastBusy = false;
  function scheduleAch() { clearTimeout(achTimer); achTimer = setTimeout(checkUnlocks, 900); }
  function checkUnlocks() {
    if (SyncDB.isReady && !SyncDB.isReady()) { scheduleAch(); return; }
    const res = computeAll();
    let seen = null;
    try { seen = JSON.parse(localStorage.getItem(SEEN_KEY) || 'null'); } catch (e) {}
    const counts = {}; res.forEach(r => counts[r.a.id] = r.events.length);
    if (seen) {
      const fresh = res.filter(r => r.events.length > (seen[r.a.id] || 0));
      if (fresh.length > 3) toastQueue.push({ many: fresh.length, art: fresh[fresh.length - 1].a.art });
      else fresh.forEach(r => toastQueue.push(r));
    }
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(counts)); } catch (e) {}
    showNextToast();
  }
  function showNextToast() {
    if (toastBusy || !toastQueue.length) return;
    const r = toastQueue.shift(); toastBusy = true;
    if (r.many) {
      toast.innerHTML = trophySVG(r.art, 40) + '<div><small>Achievements unlocked</small><b>' + r.many + ' new trophies on your shelf</b></div>';
      toast.onclick = () => { toast.classList.remove('show'); goAch('mine'); };
    } else {
      toast.innerHTML = trophySVG(r.a.art, 40) + '<div><small>Achievement unlocked</small><b>' + esc(r.a.name) + '</b></div>';
      toast.onclick = () => { toast.classList.remove('show'); openDetail(r.a.id); };
    }
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => { toastBusy = false; showNextToast(); }, 400); }, 4200);
  }

  // ---- pages ----
  let resizeObs = null, lastShelfWidth = 0;
  function renderAchievements() {
    const res = computeAll();
    pageA.innerHTML = '';
    const head = el('div', 'x-head');
    const tabs = el('div', 'tab-row'); tabs.style.margin = '0';
    [['mine', 'My achievements'], ['all', 'All achievements']].forEach(([id, l]) => {
      const t = el('button', 'tab-btn' + (aTab === id ? ' active' : '')); t.textContent = l;
      t.addEventListener('click', () => goAch(id)); tabs.appendChild(t);
    });
    head.appendChild(tabs);
    pageA.appendChild(head);
    if (aTab === 'mine') renderCabinet(res); else renderCatalog(res);
  }

  function renderCatalog(res) {
    const cats = [...new Set(ACH.map(a => a.cat))];
    cats.forEach(cat => {
      const g = el('div', 'a-group');
      const h = el('h3'); h.textContent = cat; g.appendChild(h);
      const list = el('div', 'a-list');
      res.filter(r => r.a.cat === cat).forEach(r => {
        const n = r.events.length;
        const card = el('button', 'a-card' + (n ? '' : ' locked'));
        const p = r.progress || { cur: 0, target: 1 };
        const pct = Math.max(0, Math.min(100, Math.round((p.cur / p.target) * 100)));
        card.innerHTML = trophySVG(r.a.art, 50) + `<div class="a-card-body">
          <div class="a-card-name"><span>${esc(r.a.name)}</span>${n ? '<em>×' + n + '</em>' : ''}</div>
          <div class="a-card-desc">${esc(r.a.desc)}</div>
          <div class="a-bar"><i style="width:${pct}%"></i></div>
          <div class="a-bar-label">${esc(p.label || (p.cur + ' / ' + p.target))}</div></div>`;
        card.addEventListener('click', () => openDetail(r.a.id));
        list.appendChild(card);
      });
      g.appendChild(list);
      pageA.appendChild(g);
    });
  }

  function renderCabinet(res) {
    const earned = res.filter(r => r.events.length).sort((x, y) => (x.events[0].day < y.events[0].day ? -1 : 1));
    const cab = el('div', 'cab');
    cab.appendChild(el('div', 'cab-top'));
    const inner = el('div', 'cab-inner');
    cab.appendChild(inner);
    pageA.appendChild(cab);

    const width = inner.clientWidth || pageA.clientWidth || 600;
    lastShelfWidth = width;
    const perShelf = Math.max(3, Math.floor((width - 24) / 86));
    const shelves = Math.max(3, Math.ceil(earned.length / perShelf));
    for (let s = 0; s < shelves; s++) {
      const shelf = el('div', 'shelf');
      const items = el('div', 'shelf-items');
      const slice = earned.slice(s * perShelf, (s + 1) * perShelf);
      if (!earned.length && s === 1) { const n = el('div', 'shelf-note'); n.textContent = 'Empty for now. Your trophies will stand here.'; items.appendChild(n); }
      slice.forEach(r => {
        const t = el('button', 'trophy');
        t.setAttribute('aria-label', r.a.name + (r.events.length > 1 ? ', earned ' + r.events.length + ' times' : ''));
        t.innerHTML = (r.events.length > 1 ? '<span class="trophy-count">×' + r.events.length + '</span>' : '') +
          '<span class="trophy-tip">' + esc(r.a.name) + '</span>' + trophySVG(r.a.art, 66);
        t.addEventListener('click', () => openDetail(r.a.id));
        items.appendChild(t);
      });
      shelf.appendChild(items);
      shelf.appendChild(el('div', 'plank'));
      inner.appendChild(shelf);
    }
    const foot = el('div', 't-hint'); foot.style.marginTop = '14px';
    foot.textContent = earned.length + ' of ' + ACH.length + ' achievements earned, ' + earned.reduce((s, r) => s + r.events.length, 0) + ' trophies in total.';
    pageA.appendChild(foot);

    if (!resizeObs && window.ResizeObserver) {
      resizeObs = new ResizeObserver(() => {
        if (currentPage !== 'achievements' || aTab !== 'mine') return;
        const w = pageA.clientWidth;
        if (Math.abs(w - lastShelfWidth) > 40) renderAchievements();
      });
      resizeObs.observe(pageA);
    }
  }

  function openDetail(id) {
    const r = (achCache || computeAll()).find(x => x.a.id === id);
    if (!r) return;
    const n = r.events.length;
    const p = r.progress || { cur: 0, target: 1 };
    const first = n ? fmtDay(r.events[0].day) : '—';
    const last = n ? fmtDay(r.events[n - 1].day) : '—';
    const hist = r.events.slice(-12).reverse().map(e => `<div><b style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.ctx || '')}</b><span>${fmtDay(e.day)}</span></div>`).join('');
    modal.innerHTML = `<div class="a-m-card" role="dialog" aria-label="${esc(r.a.name)}">
      <div class="a-m-top${n ? '' : ' locked'}">${trophySVG(r.a.art, 96)}<div><p class="a-m-name">${esc(r.a.name)}</p><p class="a-m-desc">${esc(r.a.desc)}</p></div></div>
      <div class="a-m-stats"><div><b>${n}</b><span>Times earned</span></div><div><b>${first}</b><span>First</span></div><div><b>${last}</b><span>Latest</span></div></div>
      <div><div class="a-bar"><i style="width:${Math.max(0, Math.min(100, Math.round(p.cur / p.target * 100)))}%"></i></div>
      <div class="a-bar-label">${esc(p.label || ('Next: ' + p.cur + ' / ' + p.target))}</div></div>
      ${n ? '<p class="a-m-sub">History</p><div class="a-m-hist">' + hist + '</div>' : ''}
      <button class="x-btn" id="a-m-close">Close</button></div>`;
    modal.querySelector('#a-m-close').addEventListener('click', () => modal.classList.remove('open'));
    modal.classList.add('open');
  }

  renderAll();
})();
