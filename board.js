// Board view for ToDo folders: an infinite canvas where the folder's tasks show up as cards
// (new tasks land on it automatically), cards can be moved anywhere, and you can draw, add arrows and text.
// Card positions live in 'boardCards' (id = folderId__taskId), drawings in 'boardShapes'.
(function () {
  const css = `
  .bd-viewbar { display: flex; justify-content: flex-end; margin-bottom: 10px; }
  .bd-seg { display: inline-flex; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 9px; padding: 2px; gap: 2px; }
  .bd-seg button { border: 0; background: none; color: var(--text-dim); font: inherit; font-size: 12.5px; font-weight: 600;
    padding: 5px 11px; border-radius: 7px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
  .bd-seg button.on { background: var(--accent-soft); color: var(--accent); }
  #content.bd-on { padding: 12px 12px 0; overflow: hidden; }
  #content.bd-on #page-todo { display: flex !important; flex-direction: column; max-width: none; height: 100%; }
  #content.bd-on #add-row { margin-bottom: 10px; width: 100%; max-width: 560px; align-self: center; }
  #content.bd-on .bd-viewbar { width: 100%; max-width: 560px; align-self: center; }
  #content.bd-on #task-list, #content.bd-on #empty-state { display: none !important; }
  #bd-board { display: none; position: relative; flex: 1; min-height: 0; overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none;
    border: 1px solid var(--border); border-bottom: 0; border-radius: 14px 14px 0 0; background-color: var(--bg-elevated);
    background-image: radial-gradient(circle, var(--border) 1.3px, transparent 1.4px); cursor: grab; }
  #content.bd-on #bd-board { display: block; }
  #bd-board.panning { cursor: grabbing; }
  #bd-board.t-pen, #bd-board.t-arrow { cursor: crosshair; }
  #bd-board.t-text { cursor: text; }
  #bd-board.t-eraser { cursor: cell; }
  .bd-frame { position: absolute; z-index: 0; border-radius: 16px; border: 1.5px solid; box-sizing: border-box; }
  .bd-fhead { position: absolute; left: 0; right: 0; top: 0; height: 42px; display: flex; align-items: center; gap: 7px; padding: 0 8px 0 14px;
    font-weight: 700; font-size: 14.5px; cursor: grab; white-space: nowrap; overflow: hidden; }
  .bd-fhead .nm { overflow: hidden; text-overflow: ellipsis; }
  .bd-fhead .ct { font-weight: 600; font-size: 11.5px; opacity: .7; }
  .bd-fhead .sp { flex: 1; }
  .bd-fadd { border: 0; background: none; color: inherit; width: 28px; height: 28px; border-radius: 8px; cursor: pointer; font-size: 20px; line-height: 1; flex-shrink: 0; }
  .bd-fadd:hover { background: rgba(127,127,127,.15); }
  .bd-finput { flex: 1; min-width: 60px; font: inherit; font-size: 13.5px; font-weight: 500; padding: 5px 8px; border-radius: 8px; border: 1px solid var(--accent);
    background: var(--bg); color: var(--text); outline: none; }
  .bd-fresize { position: absolute; right: 0; bottom: 0; width: 22px; height: 22px; cursor: nwse-resize; border-radius: 0 0 14px 0;
    background: linear-gradient(135deg, transparent 55%, currentColor 55%, currentColor 62%, transparent 62%, transparent 72%, currentColor 72%, currentColor 79%, transparent 79%); opacity: .5; }
  .bd-frame.drop { box-shadow: 0 0 0 3px var(--accent); }
  .bd-world { position: absolute; left: 0; top: 0; transform-origin: 0 0; }
  .bd-svg { position: absolute; left: 0; top: 0; width: 1px; height: 1px; overflow: visible; z-index: 2; pointer-events: none; }
  .bd-svg [data-sid] { pointer-events: auto; }
  .bd-svg .hit { stroke: transparent; fill: none; pointer-events: stroke; }
  .bd-svg g.sel .vis { filter: drop-shadow(0 0 3px var(--accent)); }
  .bd-card { position: absolute; width: 220px; box-sizing: border-box; background: var(--bg); border: 1px solid var(--border);
    border-radius: 12px; padding: 10px 12px 9px 10px; display: flex; gap: 9px; align-items: flex-start; z-index: 1;
    box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 4px 14px rgba(0,0,0,.05); cursor: grab; font-size: 14px; line-height: 1.38; color: var(--text); }
  .bd-card.dragging { cursor: grabbing; box-shadow: 0 10px 30px rgba(0,0,0,.18); z-index: 5; }
  .bd-card.done .bd-text { text-decoration: line-through; color: var(--text-dim); }
  .bd-card.done { opacity: .62; }
  .bd-card .bd-check { width: 18px; height: 18px; flex-shrink: 0; border-radius: 6px; border: 1.6px solid var(--text-dim); margin-top: 1px;
    display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; }
  .bd-card .bd-check svg { width: 12px; height: 12px; opacity: 0; }
  .bd-card.done .bd-check { background: #33c27a; border-color: #33c27a; }
  .bd-card.done .bd-check svg { opacity: 1; }
  .bd-card .bd-body { flex: 1; min-width: 0; }
  .bd-card .bd-text { word-break: break-word; }
  .bd-card .bd-meta { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; font-size: 11px; color: var(--text-dim); }
  .bd-card .bd-meta span { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 6px; padding: 1px 6px; }
  .bd-card .bd-meta .od { color: var(--danger); border-color: var(--danger); }
  .bd-note { position: absolute; z-index: 3; font-size: 18px; line-height: 1.3; font-weight: 600; white-space: pre-wrap; min-width: 20px;
    padding: 2px 4px; border-radius: 6px; outline: none; cursor: move; max-width: 420px; word-break: break-word; }
  .bd-note.sel { box-shadow: 0 0 0 1.5px var(--accent); }
  .bd-note[contenteditable="true"] { cursor: text; box-shadow: 0 0 0 1.5px var(--accent); background: var(--bg-elevated); user-select: text; -webkit-user-select: text; }
  .bd-tools { position: absolute; left: 50%; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); z-index: 10;
    display: flex; align-items: center; gap: 2px; padding: 4px; background: var(--bg); border: 1px solid var(--border); border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0,0,0,.14); max-width: calc(100% - 16px); overflow-x: auto; scrollbar-width: none; }
  .bd-tools::-webkit-scrollbar { display: none; }
  .bd-tools button { border: 0; background: none; color: var(--text); width: 34px; height: 34px; flex-shrink: 0; border-radius: 8px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; }
  .bd-tools button.on { background: var(--accent-soft); color: var(--accent); }
  .bd-tools button:disabled { opacity: .35; cursor: default; }
  .bd-tools .sep { width: 1px; height: 22px; background: var(--border); margin: 0 3px; flex-shrink: 0; }
  .bd-tools .sw { width: 26px; height: 26px; }
  .bd-tools .sw i { width: 16px; height: 16px; border-radius: 50%; display: block; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); }
  .bd-tools .sw.on { background: var(--accent-soft); }
  @media (max-width: 640px) { .bd-tools button { width: 31px; height: 31px; } .bd-tools .sw { width: 24px; } .bd-tools .sw i { width: 14px; height: 14px; } }
  .bd-zoom { position: absolute; right: 10px; top: 10px; z-index: 10; font-size: 11.5px; color: var(--text-dim); background: var(--bg);
    border: 1px solid var(--border); border-radius: 8px; padding: 4px 8px; cursor: pointer; }
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const cardsCol = SyncDB.collection('boardCards');
  const shapesCol = SyncDB.collection('boardShapes');
  let cardPos = {};   // key -> {x, y}
  let shapes = [];    // {id, folderId, type: 'pen'|'arrow'|'text', color, pts | x1.. | x,y,text, from, to}
  cardsCol.orderBy('x', 'asc').onSnapshot(s => { cardPos = {}; s.docs.forEach(d => { cardPos[d.id] = d.data(); }); requestDraw(); });
  shapesCol.orderBy('createdAt', 'asc').onSnapshot(s => { shapes = s.docs.map(d => ({ id: d.id, ...d.data() })); requestDraw(); });

  // ---------- per-device prefs ----------
  const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const modes = lsGet('tgr_board_modes', {});
  const cams = lsGet('tgr_board_cams', {});
  let showDone = lsGet('tgr_board_showdone', false);
  const isBoard = fid => fid && modes[fid] === 'board';

  // ---------- DOM ----------
  const pageTodo = document.getElementById('page-todo');
  const contentEl = document.getElementById('content');
  const addRow = document.getElementById('add-row');
  const viewbar = document.createElement('div'); viewbar.className = 'bd-viewbar';
  pageTodo.insertBefore(viewbar, addRow);
  const board = document.createElement('div'); board.id = 'bd-board';
  board.innerHTML = '<div class="bd-world"><div class="bd-frames"></div><div class="bd-cards"></div><svg class="bd-svg"></svg><div class="bd-notes"></div></div><div class="bd-zoom" title="Fit everything">100%</div><div class="bd-tools"></div>';
  pageTodo.appendChild(board);
  const world = board.querySelector('.bd-world');
  const cardsEl = board.querySelector('.bd-cards');
  const framesEl = board.querySelector('.bd-frames');
  const svg = board.querySelector('.bd-svg');
  const notesEl = board.querySelector('.bd-notes');
  const zoomEl = board.querySelector('.bd-zoom');
  const toolsEl = board.querySelector('.bd-tools');
  const NS = 'http://www.w3.org/2000/svg';

  const SV = p => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const IC = {
    list: SV('<path d="M8 6H20M8 12H20M8 18H20"/><circle cx="4" cy="6" r=".8"/><circle cx="4" cy="12" r=".8"/><circle cx="4" cy="18" r=".8"/>'),
    board: SV('<rect x="3" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M7 9V17H13"/>'),
    select: SV('<path d="M5 3L19 12L12.5 13.5L9.5 20L5 3Z"/>'),
    pen: SV('<path d="M4 20L5 15L16 4L20 8L9 19L4 20Z"/><path d="M14 6L18 10"/>'),
    arrow: SV('<path d="M5 19L19 5"/><path d="M10 5H19V14"/>'),
    text: SV('<path d="M5 6V4H19V6"/><path d="M12 4V20"/><path d="M9 20H15"/>'),
    eraser: SV('<path d="M8 20H20"/><path d="M4.5 15.5L14 6L19 11L11 19H8L4.5 15.5Z"/><path d="M9 10.5L14 15.5"/>'),
    undo: SV('<path d="M9 7L4 12L9 17"/><path d="M4 12H15C18 12 20 14 20 17V19"/>'),
    trash: SV('<path d="M4 7H20"/><path d="M9 7V4H15V7"/><path d="M6 7L7 20H17L18 7"/>'),
    fit: SV('<path d="M4 9V4H9M15 4H20V9M20 15V20H15M9 20H4V15"/>'),
    done: SV('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 12.5L11 15.5L16.5 9"/>')
  };
  const COLORS = ['ink', '#e03e3e', '#e0823e', '#2fa36b', '#1d6fe0', '#8a4fd8'];
  const colorOf = c => c === 'ink' ? 'var(--text)' : c;

  let tool = 'select', color = 'ink', selected = null;
  const undoStack = [];
  function pushUndo(fn) { undoStack.push(fn); if (undoStack.length > 60) undoStack.shift(); renderTools(); }

  function renderViewbar() {
    viewbar.innerHTML = '';
    if (currentFolderId === null) return;
    const seg = document.createElement('div'); seg.className = 'bd-seg';
    [['list', 'List'], ['board', 'Board']].forEach(([m, label]) => {
      const b = document.createElement('button');
      b.className = (isBoard(currentFolderId) ? m === 'board' : m === 'list') ? 'on' : '';
      b.innerHTML = IC[m].replace(/18/g, '14') + label;
      b.addEventListener('click', () => {
        if (m === 'board') modes[currentFolderId] = 'board'; else delete modes[currentFolderId];
        lsSet('tgr_board_modes', modes); selected = null; renderAll();
      });
      seg.appendChild(b);
    });
    viewbar.appendChild(seg);
  }

  function renderTools() {
    toolsEl.innerHTML = '';
    const btn = (html, title, on, fn, dis) => {
      const b = document.createElement('button'); b.innerHTML = html; b.title = title;
      if (on) b.className = 'on'; if (dis) b.disabled = true;
      b.addEventListener('click', e => { e.stopPropagation(); fn(); }); toolsEl.appendChild(b); return b;
    };
    const sep = () => { const s = document.createElement('div'); s.className = 'sep'; toolsEl.appendChild(s); };
    [['select', 'Move (V)'], ['pen', 'Draw (P)'], ['arrow', 'Arrow (A)'], ['text', 'Text (T)'], ['eraser', 'Eraser (E)']]
      .forEach(([t, title]) => btn(IC[t], title, tool === t, () => setTool(t)));
    sep();
    COLORS.forEach(c => {
      const b = btn('<i style="background:' + colorOf(c) + '"></i>', 'Color', false, () => {
        color = c;
        const s = selected && shapes.find(x => x.id === selected);
        if (s && s.color !== c) { const prev = s.color; shapesCol.doc(s.id).update({ color: c }); pushUndo(() => shapesCol.doc(s.id).update({ color: prev })); }
        if (tool === 'select' || tool === 'eraser') { if (!s) setTool('pen'); }
        renderTools();
      });
      b.classList.add('sw'); if (c === color) b.classList.add('on');
    });
    sep();
    btn(IC.undo, 'Undo (Ctrl+Z)', false, undo, !undoStack.length);
    if (selected) btn(IC.trash, 'Delete (Del)', false, deleteSelected);
    btn(IC.done, showDone ? 'Hide done tasks' : 'Show done tasks', showDone, () => { showDone = !showDone; lsSet('tgr_board_showdone', showDone); draw(); renderTools(); });
    btn(IC.fit, 'Fit everything', false, () => fit());
  }
  function setTool(t) { tool = t; if (t !== 'select') selectShape(null); board.className = 't-' + t; renderTools(); }
  function undo() { const fn = undoStack.pop(); if (fn) fn(); renderTools(); }

  // ---------- camera ----------
  let cam = { x: 40, y: 40, z: 1 }, camFolder = null;
  function applyCam() {
    world.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.z})`;
    board.style.backgroundSize = (24 * cam.z) + 'px ' + (24 * cam.z) + 'px';
    board.style.backgroundPosition = cam.x + 'px ' + cam.y + 'px';
    zoomEl.textContent = Math.round(cam.z * 100) + '%';
    clearTimeout(applyCam.t);
    applyCam.t = setTimeout(() => { if (camFolder) { cams[camFolder] = cam; lsSet('tgr_board_cams', cams); } }, 300);
  }
  function zoomAt(sx, sy, factor) {
    const z = Math.min(3, Math.max(0.15, cam.z * factor));
    const k = z / cam.z;
    cam = { x: sx - (sx - cam.x) * k, y: sy - (sy - cam.y) * k, z };
    applyCam();
  }
  function local(e) { const r = board.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function toWorld(e) { const p = local(e); return { x: (p.x - cam.x) / cam.z, y: (p.y - cam.y) / cam.z }; }
  function fit(initial) {
    const rs = [...cardsEl.children, ...framesEl.children].map(el => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }));
    boardShapes().forEach(s => { const b = shapeBox(s); if (b) rs.push(b); });
    if (!rs.length) { cam = { x: 40, y: 40, z: 1 }; applyCam(); return; }
    const x0 = Math.min(...rs.map(r => r.x)), y0 = Math.min(...rs.map(r => r.y));
    const x1 = Math.max(...rs.map(r => r.x + r.w)), y1 = Math.max(...rs.map(r => r.y + r.h));
    const W = board.clientWidth, H = board.clientHeight - 60, pad = 30;
    const z = Math.min(1.2, Math.max(0.15, Math.min((W - pad * 2) / (x1 - x0 || 1), (H - pad * 2) / (y1 - y0 || 1))));
    cam = { x: (W - (x1 - x0) * z) / 2 - x0 * z, y: pad + (H - pad * 2 - (y1 - y0) * z) / 2 - y0 * z, z };
    if (initial === true && z < 0.7) cam = { x: 16 - x0 * 0.7, y: 16 - y0 * 0.7, z: 0.7 };   // first open: readable, from the top-left
    applyCam();
  }
  zoomEl.addEventListener('click', () => fit());

  // ---------- data helpers ----------
  const cardKey = id => currentFolderId + '__' + id;
  const boardShapes = () => shapes.filter(s => s.folderId === currentFolderId);
  function scopeTasks() {
    const ids = new Set([currentFolderId]);
    (function kids(pid) { allFolders.forEach(f => { if (norm(f.parentId) === pid && !ids.has(f.id)) { ids.add(f.id); kids(f.id); } }); })(currentFolderId);
    return allTasks.filter(t => ids.has(norm(t.folderId))).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }
  // Subfolders of the board's folder become frames; a task belongs to the frame of its top-level subfolder.
  const childFolders = () => allFolders.filter(f => norm(f.parentId) === currentFolderId).sort((a, b) => (a.order || a.createdAt || 0) - (b.order || b.createdAt || 0));
  function topChild(fid) {
    fid = norm(fid);
    while (fid && fid !== currentFolderId) { const f = allFolders.find(x => x.id === fid); if (!f) return null; if (norm(f.parentId) === currentFolderId) return f.id; fid = norm(f.parentId); }
    return null;
  }
  const frameKey = fid => cardKey('f_' + fid);
  const FRAME_COLORS = ['#1d6fe0', '#2fa36b', '#e0823e', '#8a4fd8', '#d64545', '#0f9fb0', '#b58a00'];
  const frameEls = new Map();
  function frameRect(el) { return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }; }
  function frameAt(x, y, skip) {
    const els = [...frameEls.values()].filter(el => el.isConnected && el !== skip).reverse();
    const el = els.find(el => { const r = frameRect(el); return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; });
    return el ? el.dataset.fid : null;
  }
  function setTaskFolder(t, folderId) {
    if (usingLocal) { t.folderId = folderId; saveLocal(); renderTasks(); }
    else tasksCol.doc(t.id).update({ folderId }).catch(() => {});
  }
  function addTaskTo(folderId, text) {
    const data = { text, done: false, createdAt: Date.now(), folderId, priority: 0, deadline: null, completedAt: null, order: Date.now() };
    if (usingLocal) { allTasks.push({ id: 'l' + Date.now() + Math.random(), ...data }); saveLocal(); renderTasks(); }
    else tasksCol.add(data).catch(() => {});
  }
  function renderFrames(tasks) {
    const kids = childFolders(), seen = new Set();
    kids.forEach((f, i) => {
      seen.add(f.id);
      let el = frameEls.get(f.id);
      if (!el) {
        el = document.createElement('div'); el.className = 'bd-frame'; el.dataset.fid = f.id;
        el.innerHTML = '<div class="bd-fhead"><span class="ic"></span><span class="nm"></span><span class="ct"></span><span class="sp"></span><button class="bd-fadd" title="Add task here">+</button></div><div class="bd-fresize"></div>';
        el.querySelector('.bd-fadd').addEventListener('click', e => { e.stopPropagation(); openFrameInput(el, f.id); });
        frameEls.set(f.id, el);
      }
      if (el.parentNode !== framesEl) framesEl.appendChild(el);
      const c = FRAME_COLORS[i % FRAME_COLORS.length];
      el.style.borderColor = c + '66'; el.style.background = c + '12'; el.style.color = c;
      el.querySelector('.ic').innerHTML = iconSVG(f.icon || 'folder', 15);
      el.querySelector('.nm').textContent = f.name;
      const n = tasks.filter(t => !t.done && topChild(t.folderId) === f.id).length;
      el.querySelector('.ct').textContent = n ? n : '';
      const p = cardPos[frameKey(f.id)];
      if (p) { Object.assign(el.style, { left: p.x + 'px', top: p.y + 'px', width: p.w + 'px', height: p.h + 'px', visibility: '' }); el._placed = true; }
      else { el.style.visibility = 'hidden'; el._placed = false; }
    });
    for (const [id, el] of frameEls) if (!seen.has(id)) { el.remove(); frameEls.delete(id); }
  }
  // Frames not on the board yet: two per row, sized for their tasks, below/next to everything already there.
  function placeFrames(tasks) {
    const rects = [...cardsEl.children].filter(el => el.style.visibility !== 'hidden').map(frameRect)
      .concat([...frameEls.values()].filter(el => el._placed).map(frameRect));
    const hit = r => rects.some(o => r.x < o.x + o.w + 30 && r.x + r.w + 30 > o.x && r.y < o.y + o.h + 30 && r.y + r.h + 30 > o.y);
    childFolders().forEach(f => {
      const el = frameEls.get(f.id);
      if (!el || el._placed) return;
      const n = tasks.filter(t => topChild(t.folderId) === f.id).length;
      const w = 512, h = 60 + Math.max(1, Math.ceil(n / 2)) * 120;
      let pos = null;
      for (let i = 0; i < 4000 && !pos; i++) { const r = { x: (i % 2) * (w + 40), y: Math.floor(i / 2) * 40, w, h }; if (!hit(r)) pos = r; }
      rects.push(pos);
      Object.assign(el.style, { left: pos.x + 'px', top: pos.y + 'px', width: w + 'px', height: h + 'px', visibility: '' }); el._placed = true;
      cardPos[frameKey(f.id)] = { x: pos.x, y: pos.y, w, h };
      cardsCol.doc(frameKey(f.id)).set({ folderId: currentFolderId, frameId: f.id, x: pos.x, y: pos.y, w, h });
    });
  }
  // Frames grow (on screen) to keep their cards inside.
  function growFrames() {
    for (const [fid, el] of frameEls) {
      const p = cardPos[frameKey(fid)]; if (!p) continue;
      let w = p.w, h = p.h;
      for (const [tid, c] of cardEls) {
        const t = allTasks.find(x => x.id === tid);
        if (!t || topChild(t.folderId) !== fid || c.style.visibility === 'hidden') continue;
        w = Math.max(w, c.offsetLeft + c.offsetWidth + 16 - p.x); h = Math.max(h, c.offsetTop + c.offsetHeight + 16 - p.y);
      }
      el.style.width = w + 'px'; el.style.height = h + 'px';
    }
  }
  function openFrameInput(el, fid) {
    const head = el.querySelector('.bd-fhead');
    if (head.querySelector('.bd-finput')) return;
    const inp = document.createElement('input'); inp.className = 'bd-finput'; inp.placeholder = 'new task...';
    head.insertBefore(inp, head.querySelector('.bd-fadd'));
    head.querySelector('.sp').style.display = 'none';
    window.__editing = true;
    const close = () => { inp.remove(); head.querySelector('.sp').style.display = ''; window.__editing = false;
      if (window.__renderPending) { window.__renderPending = false; renderAll(); } else if (drawPending) draw(); };
    inp.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Enter' && inp.value.trim()) { const v = inp.value.trim(); inp.value = ''; addTaskTo(fid, v); }
      else if (e.key === 'Escape') inp.blur();
    });
    inp.addEventListener('blur', close);
    inp.focus();
  }
  const recentDone = new Set();   // ticked on the board this session: keep them visible
  function shapeBox(s) {
    if (s.type === 'pen' && s.pts && s.pts.length) {
      const xs = s.pts.filter((_, i) => i % 2 === 0), ys = s.pts.filter((_, i) => i % 2 === 1);
      return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    }
    if (s.type === 'arrow') { const a = arrowEnds(s); return { x: Math.min(a.x1, a.x2), y: Math.min(a.y1, a.y2), w: Math.abs(a.x2 - a.x1), h: Math.abs(a.y2 - a.y1) }; }
    if (s.type === 'text') return { x: s.x, y: s.y, w: 120, h: 30 };
    return null;
  }

  // ---------- drawing ----------
  let interacting = false, drawPending = false;
  function requestDraw() {
    if (!active()) return;
    if (interacting || window.__editing || editingNote) { drawPending = true; return; }
    draw();
  }
  const active = () => currentPage === 'todo' && isBoard(currentFolderId);

  const cardEls = new Map();
  function draw() {
    drawPending = false;
    if (!active()) return;
    if (camFolder !== currentFolderId) {
      camFolder = currentFolderId; selected = null;
      const c = cams[camFolder];
      cam = c ? { ...c } : { x: 40, y: 40, z: 1 };
      applyCam(); renderTools();
      if (!c) setTimeout(() => fit(true), 0);
    }
    const tasks = scopeTasks().filter(t => !t.done || showDone || recentDone.has(t.id));
    renderFrames(tasks);
    const seen = new Set();
    const unplaced = [];
    tasks.forEach(t => {
      seen.add(t.id);
      let el = cardEls.get(t.id);
      if (!el) { el = document.createElement('div'); el.className = 'bd-card'; el.dataset.tid = t.id; cardEls.set(t.id, el); }
      if (el.parentNode !== cardsEl) cardsEl.appendChild(el);
      fillCard(el, t);
      const p = cardPos[cardKey(t.id)];
      if (p) { el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; el.style.visibility = ''; }
      else { el.style.visibility = 'hidden'; unplaced.push({ t, el }); }
    });
    for (const [id, el] of cardEls) if (!seen.has(id)) { el.remove(); cardEls.delete(id); }
    const loose = unplaced.filter(u => !topChild(u.t.folderId)), framed = unplaced.filter(u => topChild(u.t.folderId));
    if (loose.length) autoPlace(loose);
    placeFrames(tasks);
    if (framed.length) autoPlace(framed);
    growFrames();
    drawShapes();
  }

  function fillCard(el, t) {
    el.classList.toggle('done', !!t.done);
    const p = prioInfo(t.priority || 0);
    el.style.borderLeft = (t.priority || 0) !== 0 ? '3px solid ' + p.color : '';
    const subs = allSubtasks.filter(s => s.taskId === t.id);
    const meta = [];
    if (norm(t.folderId) !== currentFolderId && norm(t.folderId) !== topChild(t.folderId)) { const f = allFolders.find(x => x.id === norm(t.folderId)); if (f) meta.push('<span>' + esc(f.name) + '</span>'); }
    if (subs.length) meta.push('<span>' + subs.filter(s => s.done).length + '/' + subs.length + '</span>');
    if (t.deadline) meta.push('<span class="' + (isOverdue(t.deadline, t.done) ? 'od' : '') + '">' + fmtDeadline(t.deadline) + '</span>');
    const sig = [t.text, t.done, t.priority, t.deadline, meta.join('')].join('|');
    if (el._sig === sig) return;
    el._sig = sig;
    el.innerHTML = '<div class="bd-check"><svg viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.2 11.5L13 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
      '<div class="bd-body"><div class="bd-text"></div>' + (meta.length ? '<div class="bd-meta">' + meta.join('') + '</div>' : '') + '</div>';
    el.querySelector('.bd-text').textContent = t.text;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // New cards go into the first free grid slot: near the current view for just-added tasks, else from the origin.
  function autoPlace(list) {
    const GW = 240, GH = 120, COLS = board.clientWidth && board.clientWidth < 700 ? 2 : 4;
    const rects = [...cardsEl.children].filter(el => el.style.visibility !== 'hidden').map(frameRect);
    const frameRects = [...frameEls.values()].filter(el => el._placed).map(frameRect);
    const hit = r => rects.some(o => r.x < o.x + o.w + 12 && r.x + r.w + 12 > o.x && r.y < o.y + o.h + 12 && r.y + r.h + 12 > o.y);
    list.forEach(({ t, el }) => {
      const h = el.offsetHeight || 60;
      const fid = topChild(t.folderId), fp = fid && cardPos[frameKey(fid)];
      if (fp) {      // goes inside its folder's frame
        const fc = Math.max(1, Math.floor((fp.w - 32 + 20) / GW));
        let pos = null;
        for (let i = 0; i < 4000 && !pos; i++) { const r = { x: fp.x + 16 + (i % fc) * GW, y: fp.y + 52 + Math.floor(i / fc) * GH, w: 220, h }; if (!hit(r)) pos = r; }
        rects.push(pos); setPos(t, el, pos); return;
      }
      const fresh = Date.now() - (t.createdAt || 0) < 15000 && board.clientWidth;
      const ox = fresh ? Math.round((24 - cam.x) / cam.z / 20) * 20 : 0;
      const oy = fresh ? Math.round((24 - cam.y) / cam.z / 20) * 20 : 0;
      const cols = fresh ? Math.max(1, Math.floor((board.clientWidth / cam.z - 48) / GW)) : COLS;
      let pos = null;
      for (let i = 0; i < 4000 && !pos; i++) {
        const r = { x: ox + (i % cols) * GW, y: oy + Math.floor(i / cols) * GH, w: 220, h };
        if (!hit(r) && !frameRects.some(o => r.x < o.x + o.w + 12 && r.x + r.w + 12 > o.x && r.y < o.y + o.h + 12 && r.y + r.h + 12 > o.y)) pos = r;
      }
      rects.push(pos); setPos(t, el, pos);
    });
  }
  function setPos(t, el, pos) {
    el.style.left = pos.x + 'px'; el.style.top = pos.y + 'px'; el.style.visibility = '';
    cardPos[cardKey(t.id)] = { x: pos.x, y: pos.y };
    cardsCol.doc(cardKey(t.id)).set({ folderId: currentFolderId, taskId: t.id, x: pos.x, y: pos.y });
  }

  function cardRect(tid) {
    const el = cardEls.get(tid);
    if (!el || !el.isConnected) return null;
    return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
  }
  // Point where the ray from the rect center towards (tx, ty) leaves the rect.
  function edgePoint(r, tx, ty) {
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2, dx = tx - cx, dy = ty - cy;
    if (!dx && !dy) return { x: cx, y: cy };
    const s = Math.min(dx ? (r.w / 2 + 6) / Math.abs(dx) : Infinity, dy ? (r.h / 2 + 6) / Math.abs(dy) : Infinity);
    return { x: cx + dx * Math.min(s, 1), y: cy + dy * Math.min(s, 1) };
  }
  function arrowEnds(s) {
    const ra = s.from && cardRect(s.from), rb = s.to && cardRect(s.to);
    let a = ra ? { x: ra.x + ra.w / 2, y: ra.y + ra.h / 2 } : { x: s.x1, y: s.y1 };
    let b = rb ? { x: rb.x + rb.w / 2, y: rb.y + rb.h / 2 } : { x: s.x2, y: s.y2 };
    const a2 = ra ? edgePoint(ra, b.x, b.y) : a, b2 = rb ? edgePoint(rb, a.x, a.y) : b;
    return { x1: a2.x, y1: a2.y, x2: b2.x, y2: b2.y };
  }
  function penPath(p) {
    if (p.length < 4) return 'M' + p[0] + ' ' + p[1] + 'l0.1 0';
    let d = 'M' + p[0] + ' ' + p[1];
    for (let i = 2; i < p.length - 2; i += 2) {
      const mx = (p[i] + p[i + 2]) / 2, my = (p[i + 1] + p[i + 3]) / 2;
      d += 'Q' + p[i] + ' ' + p[i + 1] + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1);
    }
    return d + 'L' + p[p.length - 2] + ' ' + p[p.length - 1];
  }
  function arrowSVG(a, col) {
    const ang = Math.atan2(a.y2 - a.y1, a.x2 - a.x1), L = 13, W = 0.45;
    const h1 = (a.x2 - L * Math.cos(ang - W)) + ' ' + (a.y2 - L * Math.sin(ang - W));
    const h2 = (a.x2 - L * Math.cos(ang + W)) + ' ' + (a.y2 - L * Math.sin(ang + W));
    const line = `M${a.x1} ${a.y1}L${a.x2} ${a.y2}`;
    return `<path class="vis" d="${line}" stroke="${col}" stroke-width="2.6" stroke-linecap="round" fill="none"/>` +
      `<path class="vis" d="M${h1}L${a.x2} ${a.y2}L${h2}" stroke="${col}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
      `<path class="hit" d="${line}" stroke-width="16"/>`;
  }
  function drawShapes() {
    let html = '';
    const notes = [];
    boardShapes().forEach(s => {
      const col = colorOf(s.color || 'ink'), cls = s.id === selected ? ' class="sel"' : '';
      if (s.type === 'pen' && s.pts) {
        const d = penPath(s.pts);
        html += `<g data-sid="${s.id}"${cls}><path class="vis" d="${d}" stroke="${col}" stroke-width="${s.w || 3}" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path class="hit" d="${d}" stroke-width="16"/></g>`;
      } else if (s.type === 'arrow') {
        html += `<g data-sid="${s.id}"${cls}>${arrowSVG(arrowEnds(s), col)}</g>`;
      } else if (s.type === 'text') notes.push(s);
    });
    if (live) html += live();
    svg.innerHTML = html;
    // notes: keep the one being edited untouched
    [...notesEl.children].forEach(n => { if (n !== editingNote && !notes.some(s => s.id === n.dataset.sid)) n.remove(); });
    notes.forEach(s => {
      let n = notesEl.querySelector(`[data-sid="${s.id}"]`);
      if (n && n === editingNote) return;
      if (!n) { n = document.createElement('div'); n.className = 'bd-note'; n.dataset.sid = s.id; notesEl.appendChild(n); }
      n.textContent = s.text; n.style.left = s.x + 'px'; n.style.top = s.y + 'px'; n.style.color = colorOf(s.color || 'ink');
      n.classList.toggle('sel', s.id === selected);
    });
  }
  let live = null;   // function returning svg markup of the shape being drawn

  function selectShape(id) { if (selected === id) return; selected = id; drawShapes(); renderTools(); }
  function deleteSelected() {
    const s = selected && shapes.find(x => x.id === selected);
    if (!s) return;
    const { id, ...data } = s;
    shapesCol.doc(id).delete(); pushUndo(() => shapesCol.doc(id).set(data));
    selected = null; renderTools();
  }

  // ---------- text notes ----------
  let editingNote = null;
  function editNote(n, s, isNew) {
    if (!n.isConnected) { editingNote = null; return; }
    editingNote = n; n.contentEditable = 'true'; n.focus();
    const r = document.createRange(); r.selectNodeContents(n); r.collapse(false);
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    const done = () => {
      n.removeEventListener('blur', done); n.contentEditable = 'false'; editingNote = null;
      const text = n.innerText.replace(/\n+$/, '');
      if (!text.trim()) { n.remove(); if (!isNew) { const { id, ...d } = s; shapesCol.doc(id).delete(); pushUndo(() => shapesCol.doc(id).set(d)); } }
      else if (isNew) { shapesCol.add({ ...s, text, createdAt: Date.now() }).then(r2 => { n.dataset.sid = r2.id; pushUndo(() => shapesCol.doc(r2.id).delete()); }); }
      else if (text !== s.text) { const prev = s.text; shapesCol.doc(s.id).update({ text }); pushUndo(() => shapesCol.doc(s.id).update({ text: prev })); }
      if (isNew) setTool('select');
      if (drawPending) draw();
    };
    n.addEventListener('blur', done);
    n.addEventListener('keydown', e => { if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) { e.preventDefault(); n.blur(); } e.stopPropagation(); });
  }

  // ---------- pointer input ----------
  const pointers = new Map();
  let act = null, pinch = null, lastTap = { id: null, t: 0 };
  board.addEventListener('pointerdown', e => {
    if (e.target.closest('.bd-tools, .bd-zoom, .inline-edit, [contenteditable="true"], .bd-fadd, .bd-finput')) return;
    if (e.button && e.button !== 0 && e.button !== 1) return;
    if (editingNote) { editingNote.blur(); e.preventDefault(); return; }   // a tap outside just finishes the text
    if (document.activeElement && document.activeElement !== document.body && !board.contains(document.activeElement)) document.activeElement.blur();
    pointers.set(e.pointerId, local(e));
    if (pointers.size === 2) {           // two fingers: pinch-zoom + pan, cancel whatever one finger started
      cancelAct();
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      return;
    }
    if (pointers.size > 2) return;
    try { board.setPointerCapture(e.pointerId); } catch (er) {}
    interacting = true;
    const p = toWorld(e), sp = local(e);
    const card = e.target.closest('.bd-card'), note = e.target.closest('.bd-note'), g = e.target.closest('.bd-svg [data-sid]');
    const t = e.button === 1 ? 'pan' : tool;
    if (t === 'select' && card && e.target.closest('.bd-check')) { act = { kind: 'check', card }; return; }
    const fhead = !card && e.target.closest('.bd-fhead'), fres = !card && e.target.closest('.bd-fresize');
    if (t === 'select' && (fhead || fres)) {
      const fel = (fhead || fres).parentNode, fid = fel.dataset.fid, fp = cardPos[frameKey(fid)];
      if (fp) {
        selectShape(null);
        if (fres) { act = { kind: 'fresize', fel, fid, sx: p.x, sy: p.y, ow: fel.offsetWidth, oh: fel.offsetHeight, fp: { ...fp } }; return; }
        const members = [...cardEls].filter(([tid, c]) => { const tk = allTasks.find(x => x.id === tid); return tk && topChild(tk.folderId) === fid && c.style.visibility !== 'hidden'; })
          .map(([tid, c]) => ({ tid, el: c, ox: c.offsetLeft, oy: c.offsetTop }));
        act = { kind: 'frame', fel, fid, sx: p.x, sy: p.y, fp: { ...fp }, members, moved: false };
        return;
      }
    }
    if (t === 'select' && card) {
      const pos = cardPos[cardKey(card.dataset.tid)] || { x: card.offsetLeft, y: card.offsetTop };
      const tk = allTasks.find(x => x.id === card.dataset.tid);
      act = { kind: 'card', el: card, tid: card.dataset.tid, sx: p.x, sy: p.y, ox: pos.x, oy: pos.y, moved: false, home: tk ? topChild(tk.folderId) : null };
      selectShape(null);
    } else if (t === 'select' && (note || g)) {
      const s = shapes.find(x => x.id === (note || g).dataset.sid);
      if (!s) { act = { kind: 'pan', sx: sp.x, sy: sp.y, cx: cam.x, cy: cam.y }; return; }
      selectShape(s.id);
      act = { kind: 'shape', s, orig: JSON.parse(JSON.stringify(s)), sx: p.x, sy: p.y, moved: false, note };
    } else if (t === 'pen') {
      act = { kind: 'pen', pts: [Math.round(p.x), Math.round(p.y)] };
      live = () => `<path d="${penPath(act.pts)}" stroke="${colorOf(color)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      drawShapes();
    } else if (t === 'arrow') {
      act = { kind: 'arrow', from: card ? card.dataset.tid : null, x1: p.x, y1: p.y, x2: p.x, y2: p.y };
      live = () => { const a = arrowEnds({ from: act.from, x1: act.x1, y1: act.y1, x2: act.x2, y2: act.y2 }); return Math.hypot(a.x2 - a.x1, a.y2 - a.y1) > 4 ? arrowSVG(a, colorOf(color)) : ''; };
    } else if (t === 'text') {
      act = null; interacting = false;
      const s = { folderId: currentFolderId, type: 'text', x: Math.round(p.x), y: Math.round(p.y - 12), color, text: '' };
      const n = document.createElement('div'); n.className = 'bd-note'; n.style.left = s.x + 'px'; n.style.top = s.y + 'px'; n.style.color = colorOf(color);
      notesEl.appendChild(n); editingNote = n;
      e.preventDefault();
      setTimeout(() => editNote(n, s, true), 0);
    } else if (t === 'eraser') {
      act = { kind: 'erase', gone: [] }; eraseAt(e);
    } else {
      act = { kind: 'pan', sx: sp.x, sy: sp.y, cx: cam.x, cy: cam.y };
      if (t === 'select') selectShape(null);
      board.classList.add('panning');
    }
  });
  board.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, local(e));
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      cam.x += mx - pinch.mx; cam.y += my - pinch.my;
      zoomAt(mx, my, d / (pinch.d || 1));
      pinch = { d, mx, my };
      return;
    }
    if (!act) return;
    const p = toWorld(e), sp = local(e);
    if (act.kind === 'pan') { cam.x = act.cx + sp.x - act.sx; cam.y = act.cy + sp.y - act.sy; applyCam(); }
    else if (act.kind === 'frame') {
      const dx = Math.round(p.x - act.sx), dy = Math.round(p.y - act.sy);
      if (!act.moved && Math.hypot(dx, dy) * cam.z < 4) return;
      act.moved = true; act.dx = dx; act.dy = dy;
      act.fel.style.left = (act.fp.x + dx) + 'px'; act.fel.style.top = (act.fp.y + dy) + 'px';
      act.members.forEach(m => { m.el.style.left = (m.ox + dx) + 'px'; m.el.style.top = (m.oy + dy) + 'px'; });
      drawShapes();
    } else if (act.kind === 'fresize') {
      act.w = Math.max(240, Math.round(act.ow + p.x - act.sx)); act.h = Math.max(110, Math.round(act.oh + p.y - act.sy));
      act.fel.style.width = act.w + 'px'; act.fel.style.height = act.h + 'px';
    }
    else if (act.kind === 'card') {
      const dx = p.x - act.sx, dy = p.y - act.sy;
      if (!act.moved && Math.hypot(dx, dy) * cam.z < 4) return;
      act.moved = true; act.el.classList.add('dragging');
      act.nx = Math.round(act.ox + dx); act.ny = Math.round(act.oy + dy);
      act.el.style.left = act.nx + 'px'; act.el.style.top = act.ny + 'px';
      const over = frameAt(act.nx + act.el.offsetWidth / 2, act.ny + act.el.offsetHeight / 2);
      frameEls.forEach((fe, id) => fe.classList.toggle('drop', id === over && over !== act.home));
      drawShapes();   // attached arrows follow
    } else if (act.kind === 'shape') {
      const dx = p.x - act.sx, dy = p.y - act.sy;
      if (!act.moved && Math.hypot(dx, dy) * cam.z < 4) return;
      act.moved = true; act.dx = dx; act.dy = dy;
      Object.assign(act.s, moveShape(act.orig, dx, dy));
      drawShapes();
    } else if (act.kind === 'pen') {
      const x = Math.round(p.x), y = Math.round(p.y), n = act.pts.length;
      if (Math.hypot(x - act.pts[n - 2], y - act.pts[n - 1]) * cam.z < 2) return;
      act.pts.push(x, y); drawShapes();
    } else if (act.kind === 'arrow') { act.x2 = p.x; act.y2 = p.y; drawShapes(); }
    else if (act.kind === 'erase') eraseAt(e);
  });
  function moveShape(s, dx, dy) {
    if (s.type === 'pen') return { pts: s.pts.map((v, i) => Math.round(v + (i % 2 ? dy : dx))) };
    if (s.type === 'text') return { x: Math.round(s.x + dx), y: Math.round(s.y + dy) };
    if (s.type === 'arrow') return { x1: s.x1 + dx, y1: s.y1 + dy, x2: s.x2 + dx, y2: s.y2 + dy };
    return {};
  }
  function eraseAt(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const g = el && el.closest('.bd-svg [data-sid], .bd-note');
    if (!g) return;
    const s = shapes.find(x => x.id === g.dataset.sid);
    if (!s || act.gone.some(x => x.id === s.id)) return;
    act.gone.push(s); shapesCol.doc(s.id).delete();
    shapes = shapes.filter(x => x.id !== s.id); drawShapes();
  }
  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pinch) { if (pointers.size < 2) pinch = null; if (!pointers.size) finish(); return; }
    const a = act; act = null;
    board.classList.remove('panning');
    if (a && e.type === 'pointerup') {
      const p = toWorld(e);
      if (a.kind === 'check') {
        const t = allTasks.find(x => x.id === a.card.dataset.tid);
        if (t) { if (!t.done) recentDone.add(t.id); toggleTask(t); }
      } else if (a.kind === 'card') {
        a.el.classList.remove('dragging');
        if (a.moved) {
          const key = cardKey(a.tid), prev = { x: a.ox, y: a.oy };
          cardPos[key] = { x: a.nx, y: a.ny };
          cardsCol.doc(key).set({ folderId: currentFolderId, taskId: a.tid, x: a.nx, y: a.ny });
          frameEls.forEach(fe => fe.classList.remove('drop'));
          const t = allTasks.find(x => x.id === a.tid);
          const target = frameAt(a.nx + a.el.offsetWidth / 2, a.ny + a.el.offsetHeight / 2);
          if (t && target !== a.home) {       // dropped into another frame (or out of one): move the task to that folder
            const oldF = t.folderId, fid = currentFolderId;
            setTaskFolder(t, target || currentFolderId);
            pushUndo(() => { cardsCol.doc(key).set({ folderId: fid, taskId: a.tid, ...prev }); const tt = allTasks.find(x => x.id === a.tid); if (tt) setTaskFolder(tt, oldF); });
          } else pushUndo(() => cardsCol.doc(key).set({ folderId: currentFolderId, taskId: a.tid, ...prev }));
        } else if (lastTap.id === a.tid && Date.now() - lastTap.t < 350) {     // double tap: edit text
          lastTap = { id: null, t: 0 };
          const t = allTasks.find(x => x.id === a.tid), txt = a.el.querySelector('.bd-text');
          if (t && txt) { finish(); inlineEdit(txt, t.text, v => updateTaskText(t, v)); a.el._sig = null; return; }
        } else lastTap = { id: a.tid, t: Date.now() };
      } else if (a.kind === 'frame' || a.kind === 'fresize') {
        const fk = frameKey(a.fid), fid = currentFolderId, old = a.fp;
        if (a.kind === 'fresize' && a.w) {
          const np = { ...old, w: a.w, h: a.h }; cardPos[fk] = np;
          cardsCol.doc(fk).set({ folderId: fid, frameId: a.fid, ...np });
          pushUndo(() => cardsCol.doc(fk).set({ folderId: fid, frameId: a.fid, ...old }));
        } else if (a.kind === 'frame' && a.moved) {
          const np = { ...old, x: old.x + a.dx, y: old.y + a.dy }; cardPos[fk] = np;
          cardsCol.doc(fk).set({ folderId: fid, frameId: a.fid, ...np });
          a.members.forEach(m => { const k = cardKey(m.tid); cardPos[k] = { x: m.ox + a.dx, y: m.oy + a.dy }; cardsCol.doc(k).set({ folderId: fid, taskId: m.tid, ...cardPos[k] }); });
          pushUndo(() => {
            cardsCol.doc(fk).set({ folderId: fid, frameId: a.fid, ...old });
            a.members.forEach(m => cardsCol.doc(cardKey(m.tid)).set({ folderId: fid, taskId: m.tid, x: m.ox, y: m.oy }));
          });
        } else if (a.kind === 'frame') {
          if (lastTap.id === a.fid && Date.now() - lastTap.t < 350) { lastTap = { id: null, t: 0 }; finish(); navigateTo(a.fid); return; }
          lastTap = { id: a.fid, t: Date.now() };
        }
      } else if (a.kind === 'shape') {
        if (a.moved) {
          const patch = moveShape(a.orig, a.dx, a.dy), back = moveShape(a.orig, 0, 0);
          shapesCol.doc(a.s.id).update(patch); pushUndo(() => shapesCol.doc(a.s.id).update(back));
        } else if (a.note && lastTap.id === a.s.id && Date.now() - lastTap.t < 350) {
          lastTap = { id: null, t: 0 }; finish(); editNote(a.note, a.s, false); return;
        } else lastTap = { id: a.s.id, t: Date.now() };
      } else if (a.kind === 'pen' && a.pts.length >= 2) {
        const data = { folderId: currentFolderId, type: 'pen', color, w: 3, pts: a.pts, createdAt: Date.now() };
        shapesCol.add(data).then(r => pushUndo(() => shapesCol.doc(r.id).delete()));
      } else if (a.kind === 'arrow') {
        const card = document.elementsFromPoint(e.clientX, e.clientY).map(x => x.closest('.bd-card')).find(Boolean);
        const to = card && card.dataset.tid !== a.from ? card.dataset.tid : null;
        const en = arrowEnds({ from: a.from, to, x1: a.x1, y1: a.y1, x2: p.x, y2: p.y });
        if (Math.hypot(en.x2 - en.x1, en.y2 - en.y1) > 12) {
          const data = { folderId: currentFolderId, type: 'arrow', color, from: a.from, to, x1: Math.round(a.x1), y1: Math.round(a.y1), x2: Math.round(p.x), y2: Math.round(p.y), createdAt: Date.now() };
          shapesCol.add(data).then(r => pushUndo(() => shapesCol.doc(r.id).delete()));
        }
      } else if (a.kind === 'erase' && a.gone.length) {
        const gone = a.gone;
        pushUndo(() => gone.forEach(({ id, ...d }) => shapesCol.doc(id).set(d)));
      }
    } else if (a && a.kind === 'card') { a.el.classList.remove('dragging'); frameEls.forEach(fe => fe.classList.remove('drop')); }
    if (!pointers.size) finish();
  }
  function cancelAct() { if (act && act.kind === 'card') act.el.classList.remove('dragging'); act = null; live = null; drawShapes(); }
  function finish() {
    live = null; interacting = false; act = null;
    if (drawPending) draw(); else drawShapes();
  }
  board.addEventListener('pointerup', endPointer);
  board.addEventListener('pointercancel', endPointer);
  board.addEventListener('wheel', e => {
    e.preventDefault();
    const sp = local(e);
    if (e.ctrlKey || e.metaKey) zoomAt(sp.x, sp.y, Math.exp(-e.deltaY * 0.01));
    else { cam.x -= e.deltaX; cam.y -= e.deltaY; applyCam(); }
  }, { passive: false });
  // Safari trackpad pinch
  let gz = 1;
  board.addEventListener('gesturestart', e => { e.preventDefault(); gz = 1; });
  board.addEventListener('gesturechange', e => { e.preventDefault(); const sp = local(e); zoomAt(sp.x, sp.y, e.scale / gz); gz = e.scale; });

  document.addEventListener('keydown', e => {
    if (!active() || board.offsetParent === null) return;
    const ae = document.activeElement;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
    const k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && k === 'z') { e.preventDefault(); undo(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (k === 'delete' || k === 'backspace') { if (selected) { e.preventDefault(); deleteSelected(); } }
    else if (k === 'escape') { selectShape(null); setTool('select'); }
    else if ({ v: 'select', p: 'pen', a: 'arrow', t: 'text', e: 'eraser' }[k]) setTool({ v: 'select', p: 'pen', a: 'arrow', t: 'text', e: 'eraser' }[k]);
  });

  // ---------- hook into the app's render ----------
  function syncLayout() {
    const on = active();
    contentEl.classList.toggle('bd-on', on);
    if (currentPage === 'todo') renderViewbar();
    if (on) requestDraw();
  }
  const origRenderTasks = window.renderTasks;
  window.renderTasks = function () { origRenderTasks(); syncLayout(); };
  const prevPages = window.renderExtraPages;
  window.renderExtraPages = function () { if (prevPages) prevPages(); syncLayout(); };
  window.addEventListener('resize', () => { if (active()) drawShapes(); });
  setTool('select');
  syncLayout();
})();
