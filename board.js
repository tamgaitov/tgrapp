// Whiteboards.
// 1) ToDo folders get a Board view: tasks show up as cards (new ones land automatically), subfolders become frames.
// 2) "Boards" in the sidebar: free whiteboards.
// Both share one canvas engine: select / move / scale, pen + marker with smoothing, pixel eraser, shapes,
// arrows (can stick to cards and objects), text, stickies, emoji, photos (crop + shape).
// Storage: 'boardCards' (card + frame positions, id = ctx__taskId / ctx__f_folderId), 'boardShapes' (objects, field folderId = ctx),
// 'freeBoards' (the free boards; their ctx is 'fb_' + id). Photo bytes go through window.TgrFiles (extras.js).
(function () {
  const css = `
  .bd-viewbar { display: flex; justify-content: flex-end; margin-bottom: 10px; }
  .bd-seg { display: inline-flex; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 9px; padding: 2px; gap: 2px; }
  .bd-seg button { border: 0; background: none; color: var(--text-dim); font: inherit; font-size: 12.5px; font-weight: 600;
    padding: 5px 11px; border-radius: 7px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
  .bd-seg button.on { background: var(--accent-soft); color: var(--accent); }
  #content.bd-on { padding: 12px 12px 0; overflow: hidden; }
  #content.bd-todo #page-todo { display: flex !important; flex-direction: column; max-width: none; height: 100%; }
  #content.bd-todo #add-row { margin-bottom: 10px; width: 100%; max-width: 560px; align-self: center; }
  #content.bd-todo .bd-viewbar { width: 100%; max-width: 560px; align-self: center; }
  #content.bd-todo #task-list, #content.bd-todo #empty-state { display: none !important; }
  #page-fboard { max-width: none; height: 100%; flex-direction: column; }
  #bd-board { position: relative; flex: 1; min-height: 0; overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none;
    border: 1px solid var(--border); border-bottom: 0; border-radius: 14px 14px 0 0; background-color: var(--bg-elevated);
    background-image: radial-gradient(circle, var(--border) 1.3px, transparent 1.4px); cursor: default; -webkit-touch-callout: none; }
  #bd-board.t-hand, #bd-board.space { cursor: grab; }
  #bd-board.panning { cursor: grabbing; }
  #bd-board.t-pen, #bd-board.t-marker, #bd-board.t-arrow, #bd-board.t-shape { cursor: crosshair; }
  #bd-board.t-text { cursor: text; }
  #bd-board.t-eraser { cursor: none; }
  #bd-board.t-sticky { cursor: copy; }
  .bd-world { position: absolute; left: 0; top: 0; transform-origin: 0 0; }
  .bd-svg { position: absolute; left: 0; top: 0; width: 1px; height: 1px; overflow: visible; pointer-events: none; }
  .bd-svg [data-sid] { pointer-events: auto; }
  .bd-svg .hit { stroke: transparent; fill: none; pointer-events: stroke; }
  .bd-svg .hitf { fill: transparent; stroke: transparent; pointer-events: all; }
  .bd-lay { position: absolute; left: 0; top: 0; }
  .bd-frames { z-index: 0; } .bd-low { z-index: 1; } .bd-cards { z-index: 2; } .bd-svg { z-index: 3; } .bd-up { z-index: 4; } .bd-sel { z-index: 5; }
  .bd-card { position: absolute; width: 220px; box-sizing: border-box; background: var(--bg); border: 1px solid var(--border);
    border-radius: 12px; padding: 10px 12px 9px 10px; display: flex; gap: 9px; align-items: flex-start;
    box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 4px 14px rgba(0,0,0,.05); font-size: 14px; line-height: 1.38; color: var(--text); }
  .bd-card.dragging { box-shadow: 0 10px 30px rgba(0,0,0,.18); z-index: 5; }
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
  .bd-frame { position: absolute; border-radius: 16px; border: 1.5px solid; box-sizing: border-box; }
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
  .bd-o { position: absolute; box-sizing: border-box; }
  .bd-text-o { font-weight: 600; line-height: 1.25; white-space: pre; padding: 2px 4px; border-radius: 4px; outline: none; min-width: 12px; min-height: 1.25em; }
  .bd-emoji { line-height: 1; white-space: nowrap; }
  .bd-sticky { border-radius: 6px; padding: 14px; box-shadow: 0 2px 4px rgba(0,0,0,.1), 0 8px 20px rgba(0,0,0,.08); color: #1a1b1e;
    font-size: 16px; line-height: 1.35; font-weight: 500; overflow: hidden; word-break: break-word; white-space: pre-wrap; outline: none; }
  .bd-img { overflow: hidden; background: rgba(127,127,127,.12); }
  .bd-img img { position: absolute; max-width: none; pointer-events: none; -webkit-user-drag: none; user-select: none; }
  [contenteditable="true"].bd-o { cursor: text; user-select: text; -webkit-user-select: text; box-shadow: 0 0 0 1.5px var(--accent); }
  .bd-text-o[contenteditable="true"] { background: var(--bg-elevated); }
  .bd-selbox { position: absolute; border: 1.5px solid var(--accent); pointer-events: none; box-sizing: border-box; z-index: 8; }
  .bd-selbox.multi { border-style: dashed; }
  .bd-h { position: absolute; width: 12px; height: 12px; margin: -6px 0 0 -6px; background: #fff; border: 1.5px solid var(--accent); border-radius: 3px;
    pointer-events: auto; box-sizing: border-box; transform: scale(var(--iz, 1)); }
  .bd-h.nw, .bd-h.se { cursor: nwse-resize; } .bd-h.ne, .bd-h.sw { cursor: nesw-resize; }
  .bd-h.n, .bd-h.s { cursor: ns-resize; } .bd-h.e, .bd-h.w { cursor: ew-resize; }
  .bd-hover { outline: 1.5px solid var(--accent); outline-offset: 2px; }
  .bd-cropghost { position: absolute; opacity: .35; pointer-events: none; z-index: 7; }
  .bd-cropbox { position: absolute; z-index: 8; box-sizing: border-box; border: 2px solid var(--accent); cursor: move; box-shadow: 0 0 0 9999px rgba(0,0,0,.0); }
  .bd-cropbox .bd-h { border-radius: 2px; background: var(--accent); border-color: #fff; }
  .bd-marq { position: absolute; border: 1px solid var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); pointer-events: none; z-index: 9; display: none; }
  .bd-ecur { position: absolute; border: 1.5px solid var(--text-dim); border-radius: 50%; pointer-events: none; z-index: 9; display: none; background: rgba(127,127,127,.12); }
  .bd-bar { position: absolute; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; align-items: center; gap: 2px; padding: 4px;
    background: var(--bg); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,.14);
    max-width: calc(100% - 16px); overflow-x: auto; scrollbar-width: none; }
  .bd-bar::-webkit-scrollbar { display: none; }
  .bd-tools { bottom: calc(12px + env(safe-area-inset-bottom, 0px)); }
  .bd-opts { bottom: calc(62px + env(safe-area-inset-bottom, 0px)); }
  .bd-ctx { top: 10px; }
  .bd-bar:empty { display: none; }
  .bd-bar button { border: 0; background: none; color: var(--text); min-width: 34px; height: 34px; flex-shrink: 0; border-radius: 8px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font: inherit; font-size: 12.5px; font-weight: 600; padding: 0 6px; gap: 5px; }
  .bd-bar button.on { background: var(--accent-soft); color: var(--accent); }
  .bd-bar button:disabled { opacity: .35; cursor: default; }
  .bd-bar .sep { width: 1px; height: 22px; background: var(--border); margin: 0 3px; flex-shrink: 0; }
  .bd-bar .sw { min-width: 26px; width: 26px; padding: 0; }
  .bd-bar .sw i { width: 16px; height: 16px; border-radius: 50%; display: block; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); }
  .bd-bar .sw.on { background: var(--accent-soft); }
  .bd-bar .em { font-size: 21px; min-width: 36px; padding: 0; }
  .bd-bar .lw i { display: block; background: currentColor; border-radius: 9px; width: 18px; }
  .bd-zoom { position: absolute; right: 10px; top: 10px; z-index: 11; font-size: 11.5px; color: var(--text-dim); background: var(--bg);
    border: 1px solid var(--border); border-radius: 8px; padding: 4px 8px; cursor: pointer; }
  .bd-drop { position: absolute; inset: 0; z-index: 12; border: 2px dashed var(--accent); border-radius: 14px 14px 0 0; display: none;
    align-items: center; justify-content: center; background: color-mix(in srgb, var(--accent) 8%, transparent); color: var(--accent); font-weight: 700; pointer-events: none; }
  .bd-toast { position: absolute; left: 50%; top: 54px; transform: translateX(-50%); z-index: 12; background: var(--popover-bg); color: #fff; font-size: 12.5px;
    padding: 7px 12px; border-radius: 9px; pointer-events: none; opacity: 0; transition: opacity .2s; white-space: nowrap; }
  @media (max-width: 640px) { .bd-bar button { min-width: 31px; height: 31px; } .bd-bar .sw { min-width: 24px; width: 24px; } .bd-bar .sw i { width: 14px; height: 14px; }
    .bd-tools { flex-wrap: wrap; justify-content: center; width: max-content; overflow: visible; } .bd-tools .sep { display: none; } }
  .fb-list { max-width: 560px; margin: 0 auto; }
  .bd-daily { position: absolute; border-radius: 16px; border: 1.5px solid color-mix(in srgb, var(--accent) 45%, transparent);
    background: color-mix(in srgb, var(--accent) 6%, transparent); color: var(--accent); box-sizing: border-box; padding: 0 10px 10px; }
  .bd-dhead { height: 44px; display: flex; align-items: center; gap: 8px; padding: 0 2px 0 4px; font-weight: 700; font-size: 15px; cursor: grab; white-space: nowrap; }
  .bd-dhead .ct { font-weight: 600; font-size: 11.5px; opacity: .7; }
  .bd-dhead .sp { flex: 1; }
  .bd-dbtn { border: 0; background: none; color: inherit; font: inherit; font-size: 12px; font-weight: 600; padding: 5px 9px; border-radius: 8px; cursor: pointer; opacity: .8; }
  .bd-dbtn:hover { background: rgba(127,127,127,.15); opacity: 1; }
  .bd-dcols { display: flex; gap: 8px; align-items: flex-start; }
  .bd-dcol { width: 228px; flex-shrink: 0; border-radius: 12px; padding: 0 4px 6px; box-sizing: border-box; min-height: 120px; background: rgba(127,127,127,.06);
    display: flex; flex-direction: column; gap: 6px; transition: box-shadow .12s; }
  .bd-dcol.today { background: color-mix(in srgb, var(--accent) 13%, transparent); }
  .bd-dcol.drop { box-shadow: 0 0 0 2.5px var(--accent); }
  .bd-dch { height: 30px; display: flex; align-items: center; gap: 6px; padding: 0 6px; font-size: 12.5px; font-weight: 700; color: var(--text-dim); }
  .bd-dcol.today .bd-dch { color: var(--accent); }
  .bd-dch .dt { font-weight: 500; opacity: .75; }
  .bd-dch .n { margin-left: auto; font-weight: 600; font-size: 11px; opacity: .7; }
  .bd-daily .bd-card { position: relative; width: 220px; cursor: grab; }
  .bd-daily .bd-card.dragging { z-index: 20; cursor: grabbing; }
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---------- data ----------
  const cardsCol = SyncDB.collection('boardCards');
  const shapesCol = SyncDB.collection('boardShapes');
  const fbCol = SyncDB.collection('freeBoards');
  let cardPos = {}, shapes = [], fboards = [], pendingShapes = null;
  cardsCol.orderBy('x', 'asc').onSnapshot(s => { cardPos = {}; s.docs.forEach(d => { cardPos[d.id] = d.data(); }); requestDraw(); });
  shapesCol.orderBy('createdAt', 'asc').onSnapshot(s => {
    const list = s.docs.map(d => ({ id: d.id, ...d.data() }));
    if (interacting) { pendingShapes = list; return; }
    shapes = list; requestDraw();
  });
  fbCol.orderBy('createdAt', 'asc').onSnapshot(s => { fboards = s.docs.map(d => ({ id: d.id, ...d.data() })); renderAll(); });

  const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const modes = lsGet('tgr_board_modes', {});
  const cams = lsGet('tgr_board_cams', {});
  let showDone = lsGet('tgr_board_showdone', false);
  const isBoard = fid => fid && modes[fid] === 'board';
  const fbState = { id: lsGet('tgr_fb_last', null) };

  // current board: a ToDo folder in Board view, or a free board
  function ctxId() {
    if (currentPage === 'todo' && isBoard(currentFolderId)) return currentFolderId;
    if (currentPage === 'fboard' && fbState.id && fboards.some(b => b.id === fbState.id)) return 'fb_' + fbState.id;
    return null;
  }
  const isFolderCtx = () => currentPage === 'todo';
  let CTX = null;

  // ---------- DOM ----------
  const pageTodo = document.getElementById('page-todo');
  const contentEl = document.getElementById('content');
  const addRow = document.getElementById('add-row');
  const viewbar = document.createElement('div'); viewbar.className = 'bd-viewbar';
  pageTodo.insertBefore(viewbar, addRow);
  const pageFB = document.createElement('div'); pageFB.id = 'page-fboard'; pageFB.className = 'page-wrap'; pageFB.style.display = 'none';
  contentEl.appendChild(pageFB);
  const fbEmpty = document.createElement('div'); fbEmpty.className = 'fb-list'; pageFB.appendChild(fbEmpty);

  const board = document.createElement('div'); board.id = 'bd-board';
  board.innerHTML = '<div class="bd-world"><div class="bd-lay bd-frames"></div><div class="bd-lay bd-low"></div><div class="bd-lay bd-cards"></div>' +
    '<svg class="bd-svg"></svg><div class="bd-lay bd-up"></div><div class="bd-lay bd-sel"></div></div>' +
    '<div class="bd-marq"></div><div class="bd-ecur"></div><div class="bd-zoom" title="Fit everything">100%</div>' +
    '<div class="bd-bar bd-ctx"></div><div class="bd-bar bd-opts"></div><div class="bd-bar bd-tools"></div><div class="bd-drop">Drop photos here</div><div class="bd-toast"></div>';
  const $ = s => board.querySelector(s);
  const world = $('.bd-world'), framesEl = $('.bd-frames'), lowEl = $('.bd-low'), cardsEl = $('.bd-cards'), svg = $('.bd-svg'), upEl = $('.bd-up'), selEl = $('.bd-sel');
  const marqEl = $('.bd-marq'), ecurEl = $('.bd-ecur'), zoomEl = $('.bd-zoom'), ctxBar = $('.bd-ctx'), optBar = $('.bd-opts'), toolsEl = $('.bd-tools'), dropEl = $('.bd-drop'), toastEl = $('.bd-toast');
  const fileIn = document.createElement('input'); fileIn.type = 'file'; fileIn.accept = 'image/*'; fileIn.multiple = true; fileIn.style.display = 'none'; fileIn.id = 'bd-file';
  document.body.appendChild(fileIn);

  function toast(t) { toastEl.textContent = t; toastEl.style.opacity = 1; clearTimeout(toast.t); toast.t = setTimeout(() => { toastEl.style.opacity = 0; }, 1800); }

  const SV = (p, sz) => `<svg width="${sz || 18}" height="${sz || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const IC = {
    list: SV('<path d="M8 6H20M8 12H20M8 18H20"/><circle cx="4" cy="6" r=".8"/><circle cx="4" cy="12" r=".8"/><circle cx="4" cy="18" r=".8"/>', 14),
    board: SV('<rect x="3" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M7 9V17H13"/>', 14),
    select: SV('<path d="M5 3L19 12L12.5 13.5L9.5 20L5 3Z"/>'),
    hand: SV('<path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 10V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M14 10.5V6a1.5 1.5 0 0 1 3 0v7"/><path d="M8 11V9a1.5 1.5 0 0 0-3 0v4c0 4 3 8 7.5 8S17 18 17 13"/>'),
    pen: SV('<path d="M4 20L5 15L16 4L20 8L9 19L4 20Z"/><path d="M14 6L18 10"/>'),
    marker: SV('<path d="M9 15L4 20H9L11 18"/><path d="M8 13L16 5L19 8L11 16Z"/><path d="M13 8L16 11"/>'),
    eraser: SV('<path d="M8 20H20"/><path d="M4.5 15.5L14 6L19 11L11 19H8L4.5 15.5Z"/><path d="M9 10.5L14 15.5"/>'),
    shape: SV('<rect x="3" y="10" width="11" height="11" rx="1.5"/><circle cx="16" cy="8" r="5"/>'),
    rect: SV('<rect x="4" y="5" width="16" height="14" rx="1.5"/>'),
    ellipse: SV('<ellipse cx="12" cy="12" rx="9" ry="7"/>'),
    diamond: SV('<path d="M12 3L21 12L12 21L3 12Z"/>'),
    fill: SV('<rect x="4" y="5" width="16" height="14" rx="1.5" fill="currentColor" fill-opacity=".35"/>'),
    arrow: SV('<path d="M5 19L19 5"/><path d="M10 5H19V14"/>'),
    line: SV('<path d="M5 19L19 5"/>'),
    arrow2: SV('<path d="M5 19L19 5"/><path d="M10 5H19V14"/><path d="M5 10V19H14"/>'),
    dash: SV('<path d="M5 19L7.5 16.5M10 14L12.5 11.5M15 9L19 5" /><path d="M12 5H19V12"/>'),
    curve: SV('<path d="M4 19C6 8 14 6 19 6"/><path d="M14 3L19 6L15 10"/>'),
    text: SV('<path d="M5 6V4H19V6"/><path d="M12 4V20"/><path d="M9 20H15"/>'),
    sticky: SV('<path d="M4 4H20V14L14 20H4Z"/><path d="M14 20V14H20"/>'),
    emoji: SV('<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5C9.3 15.8 10.6 16.5 12 16.5C13.4 16.5 14.7 15.8 15.5 14.5"/><circle cx="9" cy="10" r=".6" fill="currentColor"/><circle cx="15" cy="10" r=".6" fill="currentColor"/>'),
    image: SV('<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.7"/><path d="M21 15.5L16 10.5L6 20"/>'),
    undo: SV('<path d="M9 7L4 12L9 17"/><path d="M4 12H15C18 12 20 14 20 17V19"/>'),
    redo: SV('<path d="M15 7L20 12L15 17"/><path d="M20 12H9C6 12 4 14 4 17V19"/>'),
    trash: SV('<path d="M4 7H20"/><path d="M9 7V4H15V7"/><path d="M6 7L7 20H17L18 7"/>'),
    fit: SV('<path d="M4 9V4H9M15 4H20V9M20 15V20H15M9 20H4V15"/>'),
    done: SV('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 12.5L11 15.5L16.5 9"/>'),
    dup: SV('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5C16 4.7 15.3 4 14.5 4H5.5C4.7 4 4 4.7 4 5.5V14.5C4 15.3 4.7 16 5.5 16H8"/>'),
    front: SV('<rect x="9" y="9" width="11" height="11" rx="1.5" fill="currentColor" fill-opacity=".3"/><path d="M15 5H5V15"/>'),
    back: SV('<rect x="4" y="4" width="11" height="11" rx="1.5"/><path d="M9 19H19V9" opacity=".6"/>'),
    crop: SV('<path d="M6 2V18H22"/><path d="M2 6H18V22"/>'),
    sq: SV('<rect x="5" y="5" width="14" height="14"/>'),
    rnd: SV('<rect x="5" y="5" width="14" height="14" rx="4"/>'),
    circ: SV('<circle cx="12" cy="12" r="8"/>'),
    check: SV('<path d="M5 12.5L10 17L19 7"/>'),
    cal: SV('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10H20.5M8 3V7M16 3V7"/>')
  };
  const COLORS = ['ink', '#e03e3e', '#e0823e', '#e8b800', '#2fa36b', '#1d6fe0', '#8a4fd8', '#ffffff'];
  const STICKY_COLORS = ['#fff1a8', '#ffd6a5', '#ffc4d6', '#c8f0c8', '#c5e3ff', '#e2d4ff'];
  const EMOJI = ['➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↔️', '↕️', '🔄', '🔁', '✅', '❌', '⭐', '🔥', '❗', '❓', '💡', '📌', '🎯', '⚠️', '👍', '👎',
    '❤️', '💯', '🚀', '💰', '📅', '⏰', '🏁', '🔒', '😀', '😂', '🤔', '😎', '😡', '🥳', '👀', '🙏'];
  const colorOf = c => c === 'ink' || !c ? 'var(--text)' : c;

  // ---------- tool state ----------
  let tool = 'select', color = 'ink';
  const opt = lsGet('tgr_board_opts', { penW: 3, markW: 16, eraserR: 12, shape: 'rect', fill: false, head: 'end', dash: false, curve: false });
  const saveOpt = () => lsSet('tgr_board_opts', opt);
  let sel = new Set();          // selected object ids: shape ids, or 'c:' + taskId for cards
  let cropping = null;          // { id, F, W } while cropping a photo
  const undoStack = [], redoStack = [];

  // ---------- undo: every change is a list of {col, id, before, after} ----------
  const colOf = c => c === 'c' ? cardsCol : shapesCol;
  function writeDoc(c, id, data) { if (data) colOf(c).doc(id).set(data); else colOf(c).doc(id).delete(); }
  function commit(changes, noUndo) {
    changes = changes.filter(ch => JSON.stringify(ch.before || null) !== JSON.stringify(ch.after || null));
    if (!changes.length) return;
    changes.forEach(ch => writeDoc(ch.col, ch.id, ch.after));
    if (!noUndo) { undoStack.push(changes); if (undoStack.length > 100) undoStack.shift(); redoStack.length = 0; }
    renderTools();
  }
  function undo() { const ch = undoStack.pop(); if (!ch) return; ch.slice().reverse().forEach(c => writeDoc(c.col, c.id, c.before)); redoStack.push(ch); sel.clear(); renderTools(); renderCtx(); }
  function redo() { const ch = redoStack.pop(); if (!ch) return; ch.forEach(c => writeDoc(c.col, c.id, c.after)); undoStack.push(ch); renderTools(); }
  const strip = s => { if (!s) return null; const { id, ...d } = s; return JSON.parse(JSON.stringify(d)); };
  const newId = () => { const a = 'abcdefghijklmnopqrstuvwxyz0123456789'; let s = ''; const r = crypto.getRandomValues(new Uint8Array(20)); for (let i = 0; i < 20; i++) s += a[r[i] % a.length]; return s; };

  // ---------- camera ----------
  let cam = { x: 40, y: 40, z: 1 }, camFor = null;
  function applyCam() {
    world.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.z})`;
    world.style.setProperty('--iz', 1 / cam.z);
    board.style.backgroundSize = (24 * cam.z) + 'px ' + (24 * cam.z) + 'px';
    board.style.backgroundPosition = cam.x + 'px ' + cam.y + 'px';
    zoomEl.textContent = Math.round(cam.z * 100) + '%';
    clearTimeout(applyCam.t);
    applyCam.t = setTimeout(() => { if (camFor) { cams[camFor] = cam; lsSet('tgr_board_cams', cams); } }, 300);
  }
  function zoomAt(sx, sy, f) {
    const z = Math.min(4, Math.max(0.1, cam.z * f)), k = z / cam.z;
    cam = { x: sx - (sx - cam.x) * k, y: sy - (sy - cam.y) * k, z }; applyCam();
  }
  function local(e) { const r = board.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  const toW = p => ({ x: (p.x - cam.x) / cam.z, y: (p.y - cam.y) / cam.z });
  const toWorld = e => toW(local(e));
  function fit(initial) {
    const rs = [...cardsEl.children, ...framesEl.children].map(rectOf);
    ctxShapes().forEach(s => { const b = boxOf(s); if (b) rs.push(b); });
    if (!rs.length) { cam = { x: 40, y: 40, z: 1 }; applyCam(); return; }
    const x0 = Math.min(...rs.map(r => r.x)), y0 = Math.min(...rs.map(r => r.y)), x1 = Math.max(...rs.map(r => r.x + r.w)), y1 = Math.max(...rs.map(r => r.y + r.h));
    const W = board.clientWidth, H = board.clientHeight - 60, pad = 30;
    const z = Math.min(1.2, Math.max(0.1, Math.min((W - pad * 2) / (x1 - x0 || 1), (H - pad * 2) / (y1 - y0 || 1))));
    cam = { x: (W - (x1 - x0) * z) / 2 - x0 * z, y: pad + (H - pad * 2 - (y1 - y0) * z) / 2 - y0 * z, z };
    if (initial === true && z < 0.7) cam = { x: 16 - x0 * 0.7, y: 16 - y0 * 0.7, z: 0.7 };
    applyCam();
  }
  zoomEl.addEventListener('click', () => fit());
  const viewCenter = () => toW({ x: board.clientWidth / 2, y: board.clientHeight / 2 - 30 });

  // ---------- geometry helpers ----------
  const rectOf = el => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
  const inter = (a, b, m) => a.x < b.x + b.w + (m || 0) && a.x + a.w + (m || 0) > b.x && a.y < b.y + b.h + (m || 0) && a.y + a.h + (m || 0) > b.y;
  function distSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
    let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  }
  function rdp(p, eps) {         // Ramer–Douglas–Peucker on a flat [x,y,...] list
    const n = p.length / 2; if (n < 3) return p.slice();
    const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1;
    const stack = [[0, n - 1]];
    while (stack.length) {
      const [a, b] = stack.pop(); let md = 0, mi = -1;
      for (let i = a + 1; i < b; i++) { const d = distSeg(p[i * 2], p[i * 2 + 1], p[a * 2], p[a * 2 + 1], p[b * 2], p[b * 2 + 1]); if (d > md) { md = d; mi = i; } }
      if (md > eps) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
    }
    const out = []; for (let i = 0; i < n; i++) if (keep[i]) out.push(p[i * 2], p[i * 2 + 1]);
    return out;
  }
  function smoothPath(p) {       // Catmull-Rom through the points -> cubic beziers
    const n = p.length / 2, f = v => Math.round(v * 10) / 10;
    if (n === 1) return `M${p[0]} ${p[1]}l0.01 0`;
    if (n === 2) return `M${p[0]} ${p[1]}L${p[2]} ${p[3]}`;
    const P = i => { i = Math.max(0, Math.min(n - 1, i)); return [p[i * 2], p[i * 2 + 1]]; };
    let d = `M${f(p[0])} ${f(p[1])}`;
    for (let i = 0; i < n - 1; i++) {
      const [x0, y0] = P(i - 1), [x1, y1] = P(i), [x2, y2] = P(i + 1), [x3, y3] = P(i + 2);
      d += `C${f(x1 + (x2 - x0) / 6)} ${f(y1 + (y2 - y0) / 6)} ${f(x2 - (x3 - x1) / 6)} ${f(y2 - (y3 - y1) / 6)} ${f(x2)} ${f(y2)}`;
    }
    return d;
  }

  // ---------- context data ----------
  const cardKey = id => CTX + '__' + id;
  const ctxShapes = () => shapes.filter(s => s.folderId === CTX).sort((a, b) => (a.z || 0) - (b.z || 0) || (a.createdAt || 0) - (b.createdAt || 0));
  const shapeById = id => shapes.find(s => s.id === id);
  function scopeTasks() {
    if (!isFolderCtx()) return [];
    const ids = new Set([CTX]);
    (function kids(pid) { allFolders.forEach(f => { if (norm(f.parentId) === pid && !ids.has(f.id)) { ids.add(f.id); kids(f.id); } }); })(CTX);
    return allTasks.filter(t => ids.has(norm(t.folderId))).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }
  const recentDone = new Set();
  const htmlEls = new Map();     // shape id -> element (text, emoji, sticky, image)
  function boxOf(s) {
    if (!s) return null;
    if (s.type === 'pen' && s.pts && s.pts.length) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let i = 0; i < s.pts.length; i += 2) { x0 = Math.min(x0, s.pts[i]); x1 = Math.max(x1, s.pts[i]); y0 = Math.min(y0, s.pts[i + 1]); y1 = Math.max(y1, s.pts[i + 1]); }
      const h = (s.w || 3) / 2; return { x: x0 - h, y: y0 - h, w: x1 - x0 + 2 * h, h: y1 - y0 + 2 * h };
    }
    if (s.type === 'arrow') {
      const a = arrowEnds(s), xs = [a.x1, a.x2], ys = [a.y1, a.y2];
      if (a.cx != null) { xs.push((a.x1 + 2 * a.cx + a.x2) / 4); ys.push((a.y1 + 2 * a.cy + a.y2) / 4); }
      const x0 = Math.min(...xs), y0 = Math.min(...ys); return { x: x0, y: y0, w: Math.max(...xs) - x0, h: Math.max(...ys) - y0 };
    }
    if (s.w != null && s.h != null) return { x: s.x, y: s.y, w: s.w, h: s.h };
    const el = htmlEls.get(s.id);
    if (el && el.isConnected) return { x: s.x, y: s.y, w: el.offsetWidth, h: el.offsetHeight };
    return { x: s.x, y: s.y, w: 60, h: 30 };
  }
  function objRect(id) {         // cards (by task id) and objects, for arrows
    const c = cardEls.get(id); if (c && c.isConnected) return rectOf(c);
    const s = shapeById(id); if (s && s.type !== 'arrow' && s.type !== 'pen' && s.folderId === CTX) return boxOf(s);
    return null;
  }
  function edgePoint(r, tx, ty) {
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2, dx = tx - cx, dy = ty - cy;
    if (!dx && !dy) return { x: cx, y: cy };
    const k = Math.min(dx ? (r.w / 2 + 6) / Math.abs(dx) : Infinity, dy ? (r.h / 2 + 6) / Math.abs(dy) : Infinity);
    return { x: cx + dx * Math.min(k, 1), y: cy + dy * Math.min(k, 1) };
  }
  function arrowEnds(s) {
    const ra = s.from && objRect(s.from), rb = s.to && objRect(s.to);
    const a = ra ? { x: ra.x + ra.w / 2, y: ra.y + ra.h / 2 } : { x: s.x1, y: s.y1 };
    const b = rb ? { x: rb.x + rb.w / 2, y: rb.y + rb.h / 2 } : { x: s.x2, y: s.y2 };
    let cx = null, cy = null;
    if (s.curve) { const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y; cx = mx - dy * 0.25; cy = my + dx * 0.25; }
    const tA = cx != null ? { x: cx, y: cy } : b, tB = cx != null ? { x: cx, y: cy } : a;
    const a2 = ra ? edgePoint(ra, tA.x, tA.y) : a, b2 = rb ? edgePoint(rb, tB.x, tB.y) : b;
    return { x1: a2.x, y1: a2.y, x2: b2.x, y2: b2.y, cx, cy };
  }

  // ---------- drawing ----------
  let interacting = false, drawPending = false;
  const active = () => !!ctxId();
  function requestDraw() {
    if (!active()) return;
    if (interacting || window.__editing || editing) { drawPending = true; return; }
    draw();
  }
  const cardEls = new Map(), frameEls = new Map();
  function draw() {
    drawPending = false;
    CTX = ctxId();
    if (!CTX) return;
    if (camFor !== CTX) {
      camFor = CTX; sel.clear(); cropping = null; undoStack.length = 0; redoStack.length = 0;
      const c = cams[CTX];
      cam = c ? { ...c } : { x: 40, y: 40, z: 1 };
      applyCam(); renderTools();
      if (!c) setTimeout(() => fit(true), 0);
    }
    const scope = scopeTasks();
    const inDaily = new Set(isFolderCtx() && cardPos[dailyKey()] ? dailyAssigns().map(a => a.dl) : []);
    const tasks = scope.filter(t => !t.done || showDone || recentDone.has(t.id) || inDaily.has(t.id));
    renderFrames(tasks);
    renderDaily(scope);
    const seen = new Set(), unplaced = [];
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
    for (const id of [...sel]) if (id.startsWith('c:') ? !cardEls.has(id.slice(2)) : !shapes.some(s => s.id === id && s.folderId === CTX)) sel.delete(id);
    drawObjects();
    renderCtx();
  }

  function fillCard(el, t) {
    el.classList.toggle('done', !!t.done);
    const p = prioInfo(t.priority || 0);
    el.style.borderLeft = (t.priority || 0) !== 0 ? '3px solid ' + p.color : '';
    const subs = allSubtasks.filter(s => s.taskId === t.id), meta = [];
    if (norm(t.folderId) !== CTX && norm(t.folderId) !== topChild(t.folderId)) { const f = allFolders.find(x => x.id === norm(t.folderId)); if (f) meta.push('<span>' + esc(f.name) + '</span>'); }
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

  // ----- frames (subfolders of the board's folder) -----
  const childFolders = () => isFolderCtx() ? allFolders.filter(f => norm(f.parentId) === CTX).sort((a, b) => (a.order || a.createdAt || 0) - (b.order || b.createdAt || 0)) : [];
  function topChild(fid) {
    if (!isFolderCtx()) return null;
    fid = norm(fid);
    while (fid && fid !== CTX) { const f = allFolders.find(x => x.id === fid); if (!f) return null; if (norm(f.parentId) === CTX) return f.id; fid = norm(f.parentId); }
    return null;
  }
  const frameKey = fid => cardKey('f_' + fid);
  const FRAME_COLORS = ['#1d6fe0', '#2fa36b', '#e0823e', '#8a4fd8', '#d64545', '#0f9fb0', '#b58a00'];
  function frameAt(x, y) {
    const el = [...frameEls.values()].filter(e => e.isConnected).reverse().find(e => { const r = rectOf(e); return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; });
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
    const seen = new Set();
    childFolders().forEach((f, i) => {
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
  function placeFrames(tasks) {
    const rects = [...cardsEl.children].filter(el => el.style.visibility !== 'hidden').map(rectOf).concat([...frameEls.values()].filter(el => el._placed).map(rectOf));
    if (dailyEl && dailyEl.isConnected) rects.push(rectOf(dailyEl));
    const hit = r => rects.some(o => inter(r, o, 30));
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
      cardsCol.doc(frameKey(f.id)).set({ folderId: CTX, frameId: f.id, x: pos.x, y: pos.y, w, h });
    });
  }
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
  // New cards: first free grid slot (inside their frame, near the view for just-added tasks, else from the origin).
  function autoPlace(list) {
    const GW = 240, GH = 120, COLS = board.clientWidth && board.clientWidth < 700 ? 2 : 4;
    const rects = [...cardsEl.children].filter(el => el.style.visibility !== 'hidden').map(rectOf);
    const frameRects = [...frameEls.values()].filter(el => el._placed).map(rectOf);
    if (dailyEl && dailyEl.isConnected) frameRects.push(rectOf(dailyEl));
    const hit = r => rects.some(o => inter(r, o, 12));
    list.forEach(({ t, el }) => {
      const h = el.offsetHeight || 60;
      const fid = topChild(t.folderId), fp = fid && cardPos[frameKey(fid)];
      let pos = null;
      if (fp) {
        const fc = Math.max(1, Math.floor((fp.w - 32 + 20) / GW));
        for (let i = 0; i < 4000 && !pos; i++) { const r = { x: fp.x + 16 + (i % fc) * GW, y: fp.y + 52 + Math.floor(i / fc) * GH, w: 220, h }; if (!hit(r)) pos = r; }
      } else {
        const fresh = Date.now() - (t.createdAt || 0) < 15000 && board.clientWidth;
        const ox = fresh ? Math.round((24 - cam.x) / cam.z / 20) * 20 : 0, oy = fresh ? Math.round((24 - cam.y) / cam.z / 20) * 20 : 0;
        const cols = fresh ? Math.max(1, Math.floor((board.clientWidth / cam.z - 48) / GW)) : COLS;
        for (let i = 0; i < 4000 && !pos; i++) { const r = { x: ox + (i % cols) * GW, y: oy + Math.floor(i / cols) * GH, w: 220, h }; if (!hit(r) && !frameRects.some(o => inter(r, o, 12))) pos = r; }
      }
      rects.push(pos);
      el.style.left = pos.x + 'px'; el.style.top = pos.y + 'px'; el.style.visibility = '';
      cardPos[cardKey(t.id)] = { x: pos.x, y: pos.y };
      cardsCol.doc(cardKey(t.id)).set({ folderId: CTX, taskId: t.id, x: pos.x, y: pos.y });
    });
  }

  // ----- Daily: a week area (Mon..Sun). Cards dropped in are mirrored there, the task stays where it was. -----
  // Area: boardCards doc ctx__daily {x, y}. Day slots: ctx__dl_<taskId> {dl: taskId, day: 0..6, order}.
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyKey = () => cardKey('daily');
  const slotKey = tid => cardKey('dl_' + tid);
  const mirrorEls = new Map();
  let dailyEl = null;
  function dailyAssigns() {
    const out = [];
    for (const k in cardPos) { const p = cardPos[k]; if (p && p.dl && p.folderId === CTX) out.push(p); }
    return out.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  function buildDaily() {
    const el = document.createElement('div'); el.className = 'bd-daily';
    el.innerHTML = '<div class="bd-dhead">' + IC.cal + '<span>Daily</span><span class="ct"></span><span class="sp"></span>' +
      '<button class="bd-dbtn" data-a="clear" title="Remove done tasks from the week">Clear done</button></div><div class="bd-dcols"></div>';
    el.querySelector('[data-a="clear"]').addEventListener('click', e => { e.stopPropagation(); clearDoneDaily(); });
    const cols = el.querySelector('.bd-dcols');
    DAYS.forEach((d, i) => { const c = document.createElement('div'); c.className = 'bd-dcol'; c.dataset.day = i; c.innerHTML = '<div class="bd-dch"><span>' + d + '</span><span class="dt"></span><span class="n"></span></div>'; cols.appendChild(c); });
    return el;
  }
  function renderDaily(scope) {
    const dp = isFolderCtx() && cardPos[dailyKey()];
    if (!dp) { if (dailyEl) dailyEl.remove(); mirrorEls.forEach(m => m.remove()); mirrorEls.clear(); return; }
    if (!dailyEl) dailyEl = buildDaily();
    if (dailyEl.parentNode !== framesEl) framesEl.appendChild(dailyEl);
    dailyEl.style.left = dp.x + 'px'; dailyEl.style.top = dp.y + 'px';
    const now = new Date(), ti = (now.getDay() + 6) % 7;
    const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ti);
    const byId = new Map(scope.map(t => [t.id, t])), cols = DAYS.map(() => []);
    dailyAssigns().forEach(a => { const t = byId.get(a.dl); if (t) cols[Math.min(6, Math.max(0, a.day || 0))].push(t); });
    const seen = new Set();
    let open = 0;
    dailyEl.querySelectorAll('.bd-dcol').forEach((c, i) => {
      c.classList.toggle('today', i === ti);
      c.querySelector('.dt').textContent = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i).getDate();
      const left = cols[i].filter(t => !t.done).length; open += left;
      c.querySelector('.n').textContent = cols[i].length ? (left ? left : '✓') : '';
      cols[i].forEach(t => {
        seen.add(t.id);
        let m = mirrorEls.get(t.id);
        if (!m) { m = document.createElement('div'); m.className = 'bd-card'; m.dataset.tid = t.id; m.dataset.mirror = '1'; mirrorEls.set(t.id, m); }
        c.appendChild(m);       // keeps the order
        fillCard(m, t);
      });
    });
    for (const [id, m] of mirrorEls) if (!seen.has(id)) { m.remove(); mirrorEls.delete(id); }
    dailyEl.querySelector('.ct').textContent = open || '';
    dailyEl.querySelector('[data-a="clear"]').style.display = cols.some(l => l.some(t => t.done)) ? '' : 'none';
  }
  function dailyHit(x, y) {
    if (!dailyEl || !dailyEl.isConnected) return -1;
    const r = rectOf(dailyEl);
    if (x < r.x || x > r.x + r.w || y < r.y || y > r.y + r.h) return -1;
    const cols = [...dailyEl.querySelectorAll('.bd-dcol')];
    for (let i = 0; i < cols.length; i++) if (x < r.x + cols[i].offsetLeft + cols[i].offsetWidth + 4) return i;
    return cols.length - 1;
  }
  function markDailyDrop(day) { if (dailyEl) dailyEl.querySelectorAll('.bd-dcol').forEach((c, i) => c.classList.toggle('drop', i === day)); }
  function dropToDaily(tid, day, y) {
    const r = rectOf(dailyEl);
    const list = dailyAssigns().filter(a => (a.day || 0) === day && a.dl !== tid);
    let idx = list.findIndex(a => { const m = mirrorEls.get(a.dl); return m && m.isConnected && r.y + m.offsetTop + m.offsetHeight / 2 > y; });
    if (idx < 0) idx = list.length;
    list.splice(idx, 0, { dl: tid });
    const ch = [];
    list.forEach((a, i) => {
      const key = slotKey(a.dl), before = cardPos[key] ? { ...cardPos[key] } : null;
      if (before && before.day === day && before.order === i) return;
      const after = { folderId: CTX, dl: a.dl, day, order: i, x: 0 };
      cardPos[key] = after; ch.push({ col: 'c', id: key, before, after });
    });
    commit(ch);
  }
  function removeFromDaily(tids) {
    const ch = tids.map(tid => { const key = slotKey(tid), before = cardPos[key]; delete cardPos[key]; return before && { col: 'c', id: key, before: { ...before }, after: null }; }).filter(Boolean);
    commit(ch);
  }
  function clearDoneDaily() {
    const done = new Set(allTasks.filter(t => t.done).map(t => t.id));
    removeFromDaily(dailyAssigns().filter(a => done.has(a.dl)).map(a => a.dl));
    draw();
  }
  function toggleDaily() {
    const key = dailyKey(), dp = cardPos[key];
    if (dp) {
      if (!confirm('Remove the Daily area? Tasks stay on the board.')) return;
      const ch = dailyAssigns().map(a => { const k = slotKey(a.dl), b = { ...a }; delete cardPos[k]; return { col: 'c', id: k, before: b, after: null }; });
      delete cardPos[key]; ch.push({ col: 'c', id: key, before: { ...dp }, after: null });
      commit(ch);
    } else {
      const rs = [...cardsEl.children].filter(el => el.style.visibility !== 'hidden').map(rectOf).concat([...frameEls.values()].filter(el => el._placed).map(rectOf));
      const x = rs.length ? Math.min(...rs.map(r => r.x)) : 0, y = rs.length ? Math.max(...rs.map(r => r.y + r.h)) + 60 : 0;
      const after = { folderId: CTX, daily: true, x: Math.round(x), y: Math.round(y) };
      cardPos[key] = after; commit([{ col: 'c', id: key, before: null, after }]);
    }
    draw(); renderTools();
    if (!dp) setTimeout(() => fit(), 0);
  }

  // ----- objects -----
  function arrowSVG(s, a, col) {
    const w = s.w || 2.6, dash = s.dash ? ` stroke-dasharray="${w * 3} ${w * 2.5}"` : '';
    const d = a.cx != null ? `M${a.x1} ${a.y1}Q${a.cx} ${a.cy} ${a.x2} ${a.y2}` : `M${a.x1} ${a.y1}L${a.x2} ${a.y2}`;
    const head = (x, y, fx, fy) => {
      const ang = Math.atan2(y - fy, x - fx), L = 10 + w * 1.6, W = 0.45;
      return `<path class="vis" d="M${x - L * Math.cos(ang - W)} ${y - L * Math.sin(ang - W)}L${x} ${y}L${x - L * Math.cos(ang + W)} ${y - L * Math.sin(ang + W)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    };
    const hd = s.head || 'end';
    let out = `<path class="vis" d="${d}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none"${dash}/>`;
    if (hd === 'end' || hd === 'both') out += head(a.x2, a.y2, a.cx != null ? a.cx : a.x1, a.cy != null ? a.cy : a.y1);
    if (hd === 'both') out += head(a.x1, a.y1, a.cx != null ? a.cx : a.x2, a.cy != null ? a.cy : a.y2);
    return out + `<path class="hit" d="${d}" stroke-width="16"/>`;
  }
  function shapeSVG(s) {
    const col = colorOf(s.color);
    if (s.type === 'pen' && s.pts) {
      const d = smoothPath(s.pts);
      return `<g data-sid="${s.id}"${s.op ? ` opacity="${s.op}"` : ''}><path class="vis" d="${d}" stroke="${col}" stroke-width="${s.w || 3}" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path class="hit" d="${d}" stroke-width="${Math.max(16, (s.w || 3) + 8)}"/></g>`;
    }
    if (s.type === 'arrow') return `<g data-sid="${s.id}">${arrowSVG(s, arrowEnds(s), col)}</g>`;
    if (s.type === 'rect' || s.type === 'ellipse' || s.type === 'diamond') {
      const fill = s.fill ? col : 'none', fo = s.fill ? ' fill-opacity=".22"' : '', sw = s.sw || 2.5;
      let body;
      if (s.type === 'rect') body = `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="6"`;
      else if (s.type === 'ellipse') body = `<ellipse cx="${s.x + s.w / 2}" cy="${s.y + s.h / 2}" rx="${s.w / 2}" ry="${s.h / 2}"`;
      else body = `<path d="M${s.x + s.w / 2} ${s.y}L${s.x + s.w} ${s.y + s.h / 2}L${s.x + s.w / 2} ${s.y + s.h}L${s.x} ${s.y + s.h / 2}Z"`;
      return `<g data-sid="${s.id}">${body} class="vis" stroke="${col}" stroke-width="${sw}" fill="${fill}"${fo} stroke-linejoin="round"/>${body} class="${s.fill ? 'hitf' : 'hit'}" stroke-width="14"/></g>`;
    }
    return '';
  }
  let live = null;
  function drawObjects() {
    const list = ctxShapes();
    let html = '';
    const seen = new Set();
    let zi = 1;
    list.forEach(s => {
      if (s.type === 'text' || s.type === 'emoji' || s.type === 'sticky' || s.type === 'image') { seen.add(s.id); renderHtmlObj(s, zi++); }
      else html += shapeSVG(s);
    });
    if (live) html += live();
    svg.innerHTML = html;
    for (const [id, el] of htmlEls) if (!seen.has(id) && el !== editing) { el.remove(); htmlEls.delete(id); }
    renderSel();
  }
  function renderHtmlObj(s, zi) {
    let el = htmlEls.get(s.id);
    const kind = s.type;
    if (el && el._kind !== kind) { el.remove(); el = null; }
    if (!el) {
      el = document.createElement('div'); el.dataset.sid = s.id; el._kind = kind;
      el.className = 'bd-o ' + ({ text: 'bd-text-o', emoji: 'bd-emoji', sticky: 'bd-sticky', image: 'bd-img' }[kind]);
      if (kind === 'image') { const im = document.createElement('img'); im.alt = ''; im.draggable = false; el.appendChild(im); }
      htmlEls.set(s.id, el);
    }
    const parent = kind === 'sticky' || kind === 'image' ? lowEl : upEl;
    if (el.parentNode !== parent) parent.appendChild(el);
    el.style.zIndex = zi;
    el.style.left = s.x + 'px'; el.style.top = s.y + 'px';
    if (el === editing) return;
    if (kind === 'text') { el.style.fontSize = (s.size || 20) + 'px'; el.style.color = colorOf(s.color); if (el.textContent !== s.text) el.textContent = s.text; }
    else if (kind === 'emoji') { el.style.fontSize = (s.size || 48) + 'px'; el.textContent = s.emoji; }
    else if (kind === 'sticky') { el.style.width = s.w + 'px'; el.style.height = s.h + 'px'; el.style.background = s.bg || STICKY_COLORS[0]; el.style.fontSize = (s.size || 16) + 'px'; if (el.textContent !== (s.text || '')) el.textContent = s.text || ''; }
    else if (kind === 'image') {
      const c = s.crop || { x: 0, y: 0, w: 1, h: 1 }, im = el.firstChild;
      el.style.width = s.w + 'px'; el.style.height = s.h + 'px';
      el.style.borderRadius = s.shape === 'circle' ? '50%' : s.shape === 'round' ? Math.min(s.w, s.h) * 0.12 + 'px' : '0';
      const W = s.w / c.w, H = s.h / c.h;
      Object.assign(im.style, { width: W + 'px', height: H + 'px', left: -c.x * W + 'px', top: -c.y * H + 'px' });
      if (el._fid !== s.fid) {
        el._fid = s.fid; im.removeAttribute('src');
        if (window.TgrFiles) window.TgrFiles.url(s.fid).then(u => { if (u && el._fid === s.fid) im.src = u; });
      }
    }
  }

  // ----- selection box + handles -----
  function selItems() {
    return [...sel].map(id => id.startsWith('c:') ? { id, card: cardEls.get(id.slice(2)) } : { id, s: shapeById(id) }).filter(x => x.card || x.s);
  }
  function itemBox(it) { return it.card ? rectOf(it.card) : boxOf(it.s); }
  function selBounds() {
    const bs = selItems().map(itemBox).filter(Boolean);
    if (!bs.length) return null;
    const x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y)), x1 = Math.max(...bs.map(b => b.x + b.w)), y1 = Math.max(...bs.map(b => b.y + b.h));
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  function renderSel() {
    selEl.innerHTML = '';
    if (cropping) { renderCrop(); return; }
    const items = selItems();
    if (!items.length) return;
    const b = selBounds(); if (!b) return;
    const pad = 4 / cam.z;
    const box = document.createElement('div'); box.className = 'bd-selbox' + (items.length > 1 ? ' multi' : '');
    Object.assign(box.style, { left: b.x - pad + 'px', top: b.y - pad + 'px', width: b.w + pad * 2 + 'px', height: b.h + pad * 2 + 'px', borderWidth: 1.5 / cam.z + 'px' });
    const canScale = items.some(it => it.s && !(it.s.type === 'arrow' && (it.s.from || it.s.to)));
    if (canScale) {
      const hs = ['nw', 'ne', 'sw', 'se'];
      if (items.length === 1 && ['rect', 'ellipse', 'diamond', 'sticky', 'image'].includes(items[0].s && items[0].s.type)) hs.push('n', 's', 'e', 'w');
      const pos = { nw: [0, 0], n: [50, 0], ne: [100, 0], e: [100, 50], se: [100, 100], s: [50, 100], sw: [0, 100], w: [0, 50] };
      hs.forEach(h => { const d = document.createElement('div'); d.className = 'bd-h ' + h; d.dataset.h = h; d.style.left = pos[h][0] + '%'; d.style.top = pos[h][1] + '%'; box.appendChild(d); });
    }
    selEl.appendChild(box);
  }
  function renderCrop() {
    const { F, W } = cropping, s = shapeById(cropping.id); if (!s) { cropping = null; return; }
    const ghost = document.createElement('img'); ghost.className = 'bd-cropghost';
    const el = htmlEls.get(s.id); if (el && el.firstChild.src) ghost.src = el.firstChild.src;
    Object.assign(ghost.style, { left: F.x + 'px', top: F.y + 'px', width: F.w + 'px', height: F.h + 'px' });
    const box = document.createElement('div'); box.className = 'bd-cropbox';
    Object.assign(box.style, { left: W.x + 'px', top: W.y + 'px', width: W.w + 'px', height: W.h + 'px', borderWidth: 2 / cam.z + 'px' });
    const pos = { nw: [0, 0], n: [50, 0], ne: [100, 0], e: [100, 50], se: [100, 100], s: [50, 100], sw: [0, 100], w: [0, 50] };
    Object.keys(pos).forEach(h => { const d = document.createElement('div'); d.className = 'bd-h ' + h; d.dataset.ch = h; d.style.left = pos[h][0] + '%'; d.style.top = pos[h][1] + '%'; box.appendChild(d); });
    selEl.appendChild(ghost); selEl.appendChild(box);
    // live preview in the object itself
    if (el) {
      const im = el.firstChild;
      el.style.left = W.x + 'px'; el.style.top = W.y + 'px'; el.style.width = W.w + 'px'; el.style.height = W.h + 'px';
      Object.assign(im.style, { width: F.w + 'px', height: F.h + 'px', left: F.x - W.x + 'px', top: F.y - W.y + 'px' });
    }
  }
  function startCrop(s) {
    const c = s.crop || { x: 0, y: 0, w: 1, h: 1 };
    const F = { w: s.w / c.w, h: s.h / c.h }; F.x = s.x - c.x * F.w; F.y = s.y - c.y * F.h;
    cropping = { id: s.id, F, W: { x: s.x, y: s.y, w: s.w, h: s.h } };
    drawObjects(); renderCtx();
  }
  function endCrop(apply) {
    if (!cropping) return;
    const s = shapeById(cropping.id), { F, W } = cropping; cropping = null;
    if (s && apply) {
      const before = strip(s), after = { ...before, x: W.x, y: W.y, w: W.w, h: W.h, crop: { x: (W.x - F.x) / F.w, y: (W.y - F.y) / F.h, w: W.w / F.w, h: W.h / F.h } };
      Object.assign(s, after);
      commit([{ col: 's', id: s.id, before, after }]);
    }
    drawObjects(); renderCtx();
  }

  // ---------- toolbars ----------
  function mkBtn(bar, html, title, on, fn, cls) {
    const b = document.createElement('button'); b.innerHTML = html; b.title = title;
    if (on) b.classList.add('on'); if (cls) cls.split(' ').forEach(c => b.classList.add(c));
    b.addEventListener('click', e => { e.stopPropagation(); fn(); });
    bar.appendChild(b); return b;
  }
  const sepTo = bar => { const s = document.createElement('div'); s.className = 'sep'; bar.appendChild(s); };
  function renderTools() {
    toolsEl.innerHTML = '';
    [['select', 'Select (V)'], ['hand', 'Hand (H)'], ['pen', 'Pen (P)'], ['marker', 'Marker (M)'], ['eraser', 'Eraser (E)'], ['shape', 'Shapes (R)'], ['arrow', 'Arrow (A)'], ['text', 'Text (T)'], ['sticky', 'Sticky note (N)'], ['emoji', 'Emoji']]
      .forEach(([t, title]) => mkBtn(toolsEl, IC[t], title, tool === t, () => setTool(tool === t && t === 'emoji' ? 'select' : t)));
    mkBtn(toolsEl, IC.image, 'Add photo', false, () => fileIn.click());
    sepTo(toolsEl);
    COLORS.forEach(c => mkBtn(toolsEl, '<i style="background:' + colorOf(c) + '"></i>', 'Color', c === color, () => pickColor(c), 'sw'));
    sepTo(toolsEl);
    mkBtn(toolsEl, IC.undo, 'Undo (Ctrl+Z)', false, undo).disabled = !undoStack.length;
    mkBtn(toolsEl, IC.redo, 'Redo (Ctrl+Shift+Z)', false, redo).disabled = !redoStack.length;
    if (isFolderCtx() && CTX) mkBtn(toolsEl, IC.cal, cardPos[dailyKey()] ? 'Remove Daily area' : 'Add Daily area (Mon-Sun)', !!cardPos[dailyKey()], toggleDaily);
    if (isFolderCtx()) mkBtn(toolsEl, IC.done, showDone ? 'Hide done tasks' : 'Show done tasks', showDone, () => { showDone = !showDone; lsSet('tgr_board_showdone', showDone); draw(); renderTools(); });
    mkBtn(toolsEl, IC.fit, 'Fit everything', false, () => fit());
    renderOpts();
    requestAnimationFrame(() => { if (toolsEl.offsetHeight) optBar.style.bottom = 'calc(' + (toolsEl.offsetHeight + 20) + 'px + env(safe-area-inset-bottom, 0px))'; });
  }
  function renderOpts() {
    optBar.innerHTML = '';
    const lw = (w, cur, set) => mkBtn(optBar, `<i style="height:${Math.min(14, Math.max(2, w * (tool === 'marker' ? 0.6 : 1)))}px"></i>`, w + 'px', cur === w, () => { set(w); saveOpt(); renderOpts(); }, 'lw');
    if (tool === 'pen') [2, 3, 5, 8, 14].forEach(w => lw(w, opt.penW, v => opt.penW = v));
    else if (tool === 'marker') [10, 16, 26].forEach(w => lw(w, opt.markW, v => opt.markW = v));
    else if (tool === 'eraser') [['S', 6], ['M', 12], ['L', 26], ['XL', 50]].forEach(([l, r]) => mkBtn(optBar, l, 'Eraser size', opt.eraserR === r, () => { opt.eraserR = r; saveOpt(); renderOpts(); }));
    else if (tool === 'shape') {
      ['rect', 'ellipse', 'diamond'].forEach(k => mkBtn(optBar, IC[k], k, opt.shape === k, () => { opt.shape = k; saveOpt(); renderOpts(); }));
      sepTo(optBar); mkBtn(optBar, IC.fill, 'Fill', opt.fill, () => { opt.fill = !opt.fill; saveOpt(); renderOpts(); });
    } else if (tool === 'arrow') {
      [['line', 'none', false, false], ['arrow', 'end', false, false], ['arrow2', 'both', false, false], ['dash', 'end', true, false], ['curve', 'end', false, true]].forEach(([ic, head, dash, curve]) =>
        mkBtn(optBar, IC[ic], ic, opt.head === head && !!opt.dash === dash && !!opt.curve === curve, () => { Object.assign(opt, { head, dash, curve }); saveOpt(); renderOpts(); }));
    } else if (tool === 'sticky') STICKY_COLORS.forEach((c, i) => mkBtn(optBar, '<i style="background:' + c + ';border-radius:4px"></i>', 'Sticky color', (opt.sticky || 0) === i, () => { opt.sticky = i; saveOpt(); renderOpts(); }, 'sw'));
    else if (tool === 'emoji') EMOJI.forEach(em => mkBtn(optBar, em, 'Add ' + em, false, () => addEmoji(em), 'em'));
  }
  function renderCtx() {
    ctxBar.innerHTML = '';
    if (!CTX) return;
    if (cropping) {
      mkBtn(ctxBar, IC.check + 'Done', 'Apply crop (Enter)', true, () => endCrop(true));
      mkBtn(ctxBar, 'Cancel', 'Cancel (Esc)', false, () => endCrop(false));
      return;
    }
    const items = selItems(), objs = items.filter(i => i.s);
    if (!objs.length) return;
    if (objs.length === 1 && objs[0].s.type === 'image') {
      const s = objs[0].s;
      mkBtn(ctxBar, IC.crop, 'Crop', false, () => startCrop(s));
      [['sq', 'rect'], ['rnd', 'round'], ['circ', 'circle']].forEach(([ic, sh]) => mkBtn(ctxBar, IC[ic], 'Shape', (s.shape || 'rect') === sh, () => patchSel({ shape: sh }, x => x.type === 'image')));
      sepTo(ctxBar);
    }
    if (objs.some(i => ['rect', 'ellipse', 'diamond'].includes(i.s.type))) {
      const on = objs.every(i => !['rect', 'ellipse', 'diamond'].includes(i.s.type) || i.s.fill);
      mkBtn(ctxBar, IC.fill, 'Fill', on, () => patchSel({ fill: !on }, x => ['rect', 'ellipse', 'diamond'].includes(x.type)));
      sepTo(ctxBar);
    }
    if (objs.length === 1 && objs[0].s.type === 'arrow') {
      const s = objs[0].s;
      [['line', 'none', false, false], ['arrow', 'end', false, false], ['arrow2', 'both', false, false], ['dash', 'end', true, false], ['curve', 'end', false, true]].forEach(([ic, head, dash, curve]) =>
        mkBtn(ctxBar, IC[ic], ic, (s.head || 'end') === head && !!s.dash === dash && !!s.curve === curve, () => patchSel({ head, dash, curve }, x => x.type === 'arrow')));
      sepTo(ctxBar);
    }
    if (objs.length === 1 && objs[0].s.type === 'sticky') {
      STICKY_COLORS.forEach(c => mkBtn(ctxBar, '<i style="background:' + c + ';border-radius:4px"></i>', 'Color', objs[0].s.bg === c, () => patchSel({ bg: c }, x => x.type === 'sticky'), 'sw'));
      sepTo(ctxBar);
    }
    mkBtn(ctxBar, IC.front, 'Bring to front', false, () => restack(1));
    mkBtn(ctxBar, IC.back, 'Send to back', false, () => restack(-1));
    mkBtn(ctxBar, IC.dup, 'Duplicate (Ctrl+D)', false, duplicateSel);
    mkBtn(ctxBar, IC.trash, 'Delete (Del)', false, deleteSel);
  }
  function setTool(t) {
    if (cropping) endCrop(true);
    tool = t;
    if (t !== 'select') { sel.clear(); renderSel(); renderCtx(); }
    board.className = 't-' + t; ecurEl.style.display = 'none';
    renderTools();
  }
  function pickColor(c) {
    color = c;
    const objs = selItems().filter(i => i.s && ['pen', 'arrow', 'rect', 'ellipse', 'diamond', 'text'].includes(i.s.type));
    if (objs.length) patchSel({ color: c }, x => ['pen', 'arrow', 'rect', 'ellipse', 'diamond', 'text'].includes(x.type));
    else if (['select', 'hand', 'eraser', 'emoji', 'sticky'].includes(tool)) setTool('pen');
    renderTools();
  }
  function patchSel(patch, filter) {
    const ch = selItems().filter(i => i.s && (!filter || filter(i.s))).map(i => ({ col: 's', id: i.id, before: strip(i.s), after: { ...strip(i.s), ...patch } }));
    ch.forEach(c => Object.assign(shapeById(c.id), patch));
    commit(ch); drawObjects(); renderCtx();
  }
  function restack(dir) {
    const list = ctxShapes(), zs = list.map(s => s.z || 0);
    const z = dir > 0 ? Math.max(0, ...zs) + 1 : Math.min(0, ...zs) - 1;
    patchSel({ z });
  }
  function deleteSel() {
    const ch = selItems().filter(i => i.s).map(i => ({ col: 's', id: i.id, before: strip(i.s), after: null }));
    if (!ch.length) return;
    shapes = shapes.filter(s => !sel.has(s.id));
    sel.clear(); commit(ch); drawObjects(); renderCtx();
  }
  function duplicateSel() {
    const off = 24, ch = [], ids = [];
    selItems().filter(i => i.s).forEach(i => {
      const d = moveData(strip(i.s), off, off); d.createdAt = Date.now(); if (d.type === 'arrow') { d.from = null; d.to = null; const a = arrowEnds(i.s); Object.assign(d, { x1: a.x1 + off, y1: a.y1 + off, x2: a.x2 + off, y2: a.y2 + off }); }
      const id = newId(); ch.push({ col: 's', id, before: null, after: d }); ids.push(id); shapes.push({ id, ...d });
    });
    if (!ch.length) return;
    sel = new Set(ids); commit(ch); drawObjects(); renderCtx();
  }

  // ---------- object helpers ----------
  function moveData(d, dx, dy) {
    d = JSON.parse(JSON.stringify(d));
    if (d.type === 'pen') d.pts = d.pts.map((v, i) => Math.round((v + (i % 2 ? dy : dx)) * 10) / 10);
    else if (d.type === 'arrow') { d.x1 += dx; d.y1 += dy; d.x2 += dx; d.y2 += dy; }
    else { d.x += dx; d.y += dy; }
    return d;
  }
  function scaleData(d, from, to) {     // map shape from box 'from' to box 'to'
    d = JSON.parse(JSON.stringify(d));
    const kx = to.w / (from.w || 1), ky = to.h / (from.h || 1);
    const X = x => to.x + (x - from.x) * kx, Y = y => to.y + (y - from.y) * ky;
    if (d.type === 'pen') { d.pts = d.pts.map((v, i) => Math.round((i % 2 ? Y(v) : X(v)) * 10) / 10); }
    else if (d.type === 'arrow') { d.x1 = X(d.x1); d.y1 = Y(d.y1); d.x2 = X(d.x2); d.y2 = Y(d.y2); }
    else if (d.type === 'text' || d.type === 'emoji') { d.x = X(d.x); d.y = Y(d.y); d.size = Math.max(8, Math.round((d.size || (d.type === 'text' ? 20 : 48)) * Math.min(kx, ky) * 10) / 10); }
    else { d.x = X(d.x); d.y = Y(d.y); d.w = Math.max(8, d.w * kx); d.h = Math.max(8, d.h * ky); }
    return d;
  }
  function addShape(d, select) {
    const id = newId(); d = { folderId: CTX, createdAt: Date.now(), ...d };
    shapes.push({ id, ...d }); commit([{ col: 's', id, before: null, after: d }]);
    if (select) { sel = new Set([id]); }
    drawObjects(); renderCtx();
    return id;
  }
  function addEmoji(em) {
    const c = viewCenter(), n = ctxShapes().filter(s => s.type === 'emoji').length % 6;
    addShape({ type: 'emoji', emoji: em, x: Math.round(c.x - 24 + n * 14), y: Math.round(c.y - 24 + n * 14), size: 48 }, true);
  }

  // ---------- photos ----------
  async function addPhotos(list, at) {
    if (!window.TgrFiles) return;
    const pics = list.filter(f => window.TgrFiles.isPic(f));
    if (!pics.length) { toast('Only photos can be added'); return; }
    const myCtx = CTX;
    let c = at || viewCenter(), ids = [];
    toast('Adding photo' + (pics.length > 1 ? 's' : '') + '...');
    for (const f of pics) {
      let r; try { r = await window.TgrFiles.addImage(f); } catch (e) { toast("Couldn't read " + (f.name || 'photo')); continue; }
      if (CTX !== myCtx) return;
      const k = Math.min(1, 420 / Math.max(r.w, r.h)), w = Math.round(r.w * k), h = Math.round(r.h * k);
      const id = newId(), d = { folderId: CTX, createdAt: Date.now(), type: 'image', fid: r.id, x: Math.round(c.x - w / 2), y: Math.round(c.y - h / 2), w, h, crop: { x: 0, y: 0, w: 1, h: 1 }, shape: 'rect' };
      shapes.push({ id, ...d }); commit([{ col: 's', id, before: null, after: d }]); ids.push(id);
      c = { x: c.x + 30, y: c.y + 30 };
    }
    if (ids.length) { setTool('select'); sel = new Set(ids); drawObjects(); renderCtx(); toastEl.style.opacity = 0; }
  }
  fileIn.addEventListener('change', () => { const fl = [...(fileIn.files || [])]; fileIn.value = ''; if (fl.length) addPhotos(fl); });
  board.addEventListener('dragover', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { e.preventDefault(); dropEl.style.display = 'flex'; } });
  board.addEventListener('dragleave', e => { if (!board.contains(e.relatedTarget)) dropEl.style.display = 'none'; });
  board.addEventListener('drop', e => { e.preventDefault(); dropEl.style.display = 'none'; const fl = [...(e.dataTransfer.files || [])]; if (fl.length) addPhotos(fl, toWorld(e)); });
  document.addEventListener('paste', e => {
    if (!active() || !board.isConnected || board.offsetParent === null) return;
    const ae = document.activeElement; if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
    const fl = [...((e.clipboardData && e.clipboardData.files) || [])];
    if (fl.length) { e.preventDefault(); addPhotos(fl); }
  });

  // ---------- text editing (text, sticky) ----------
  let editing = null;
  function editObj(el, s, isNew) {
    if (!el.isConnected) return;
    editing = el; el.contentEditable = 'true'; el.focus();
    const r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
    const gs = getSelection(); gs.removeAllRanges(); gs.addRange(r);
    sel.clear(); renderSel(); renderCtx();
    const done = () => {
      el.removeEventListener('blur', done); el.removeEventListener('keydown', key);
      el.contentEditable = 'false'; editing = null;
      const text = el.innerText.replace(/\n+$/, '');
      const cur = shapeById(s.id);
      if (!text.trim() && s.type === 'text') {
        if (isNew) { el.remove(); htmlEls.delete(s.id); }
        else if (cur) { shapes = shapes.filter(x => x.id !== s.id); commit([{ col: 's', id: s.id, before: strip(cur), after: null }]); }
      } else if (isNew) {
        const d = { ...strip(s), text }; shapes.push({ id: s.id, ...d }); commit([{ col: 's', id: s.id, before: null, after: d }]);
      } else if (cur && text !== (cur.text || '')) { const before = strip(cur); cur.text = text; commit([{ col: 's', id: s.id, before, after: strip(cur) }]); }
      if (isNew && tool === 'text') setTool('select');
      if (drawPending) draw(); else drawObjects();
    };
    const key = e => { e.stopPropagation(); if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) { e.preventDefault(); el.blur(); } };
    el.addEventListener('blur', done); el.addEventListener('keydown', key);
  }
  function newTextAt(p) {
    const s = { id: newId(), folderId: CTX, type: 'text', x: Math.round(p.x), y: Math.round(p.y - 14), color, size: 20, text: '', createdAt: Date.now() };
    const el = document.createElement('div'); el.className = 'bd-o bd-text-o'; el.dataset.sid = s.id; el._kind = 'text';
    Object.assign(el.style, { left: s.x + 'px', top: s.y + 'px', fontSize: '20px', color: colorOf(color), zIndex: 999 });
    upEl.appendChild(el); htmlEls.set(s.id, el); editing = el;
    setTimeout(() => editObj(el, s, true), 0);
  }

  // ---------- pointer input ----------
  const pointers = new Map();
  let act = null, pinch = null, lastTap = { id: null, t: 0 }, spaceDown = false, longT = null;
  const isDouble = id => { const d = lastTap.id === id && Date.now() - lastTap.t < 380; lastTap = d ? { id: null, t: 0 } : { id, t: Date.now() }; return d; };
  function itemOf(target) {
    const card = target.closest('.bd-card'); if (card) return 'c:' + card.dataset.tid;
    const o = target.closest('.bd-svg [data-sid], .bd-o'); return o ? o.dataset.sid : null;
  }
  function startPan(sp) { act = { kind: 'pan', sx: sp.x, sy: sp.y, cx: cam.x, cy: cam.y }; board.classList.add('panning'); }
  function snapshotSel() {
    return selItems().map(it => it.card
      ? { id: it.id, card: it.card, tid: it.id.slice(2), ox: it.card.offsetLeft, oy: it.card.offsetTop }
      : { id: it.id, s: it.s, orig: strip(it.s), box: boxOf(it.s) });
  }
  board.addEventListener('pointerdown', e => {
    if (e.target.closest('.bd-bar, .bd-zoom, .inline-edit, [contenteditable="true"], .bd-fadd, .bd-finput, .bd-dbtn')) return;
    if (e.button && e.button !== 0 && e.button !== 1) return;
    if (editing) { editing.blur(); e.preventDefault(); return; }
    if (document.activeElement && document.activeElement !== document.body && !board.contains(document.activeElement)) document.activeElement.blur();
    pointers.set(e.pointerId, local(e));
    if (pointers.size === 2) {
      cancelAct();
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      return;
    }
    if (pointers.size > 2) return;
    try { board.setPointerCapture(e.pointerId); } catch (er) {}
    interacting = true;
    const p = toWorld(e), sp = local(e), touch = e.pointerType === 'touch';
    let t = e.button === 1 || spaceDown ? 'hand' : tool;

    if (cropping) {
      const ch = e.target.closest('[data-ch]');
      if (ch) { act = { kind: 'cropH', h: ch.dataset.ch, sx: p.x, sy: p.y, W0: { ...cropping.W } }; return; }
      if (e.target.closest('.bd-cropbox')) { act = { kind: 'cropPan', sx: p.x, sy: p.y, F0: { ...cropping.F } }; return; }
      endCrop(true); interacting = false; act = null; return;
    }
    if (t === 'select') {
      const mir = e.target.closest('.bd-daily .bd-card');
      if (mir) {
        if (e.target.closest('.bd-check')) { act = { kind: 'check', card: mir }; return; }
        sel.clear(); renderSel(); renderCtx();
        act = { kind: 'dmove', el: mir, tid: mir.dataset.tid, sx: p.x, sy: p.y, moved: false }; return;
      }
      if (e.target.closest('.bd-dhead') && cardPos[dailyKey()]) {
        sel.clear(); renderSel(); renderCtx();
        act = { kind: 'dframe', sx: p.x, sy: p.y, dp: { ...cardPos[dailyKey()] }, moved: false }; return;
      }
    }
    if (t === 'select' || t === 'hand') {
      const card = e.target.closest('.bd-card');
      if (t === 'select' && card && e.target.closest('.bd-check')) { act = { kind: 'check', card }; return; }
      const fhead = !card && e.target.closest('.bd-fhead'), fres = !card && e.target.closest('.bd-fresize');
      if (t === 'select' && (fhead || fres)) {
        const fel = (fhead || fres).parentNode, fid = fel.dataset.fid, fp = cardPos[frameKey(fid)];
        if (fp) {
          sel.clear(); renderSel(); renderCtx();
          if (fres) { act = { kind: 'fresize', fel, fid, sx: p.x, sy: p.y, ow: fel.offsetWidth, oh: fel.offsetHeight, fp: { ...fp } }; return; }
          const members = [...cardEls].filter(([tid, c]) => { const tk = allTasks.find(x => x.id === tid); return tk && topChild(tk.folderId) === fid && c.style.visibility !== 'hidden'; })
            .map(([tid, c]) => ({ tid, el: c, ox: c.offsetLeft, oy: c.offsetTop }));
          act = { kind: 'frame', fel, fid, sx: p.x, sy: p.y, fp: { ...fp }, members, moved: false };
          return;
        }
      }
      if (t === 'select') {
        const h = e.target.closest('.bd-h[data-h]');
        if (h) { const b = selBounds(); act = { kind: 'scale', h: h.dataset.h, b0: b, items: snapshotSel(), sx: p.x, sy: p.y }; return; }
        const id = itemOf(e.target);
        if (id) {
          if (e.shiftKey) { sel.has(id) ? sel.delete(id) : sel.add(id); renderSel(); renderCtx(); act = null; return; }
          if (!sel.has(id)) { sel = new Set([id]); renderSel(); renderCtx(); }
          act = { kind: 'move', id, items: snapshotSel(), sx: p.x, sy: p.y, moved: false, home: null };
          if (id.startsWith('c:')) { const tk = allTasks.find(x => x.id === id.slice(2)); act.home = tk ? topChild(tk.folderId) : null; act.card = cardEls.get(id.slice(2)); }
          return;
        }
        if (!e.shiftKey) { sel.clear(); renderSel(); renderCtx(); }
        if (touch) {    // finger on empty space: pan; hold still for a moment to start a selection box instead
          startPan(sp);
          longT = setTimeout(() => { if (act && act.kind === 'pan' && Math.hypot(act.cx - cam.x, act.cy - cam.y) < 6) { board.classList.remove('panning'); act = { kind: 'marq', sx: p.x, sy: p.y, add: false }; if (navigator.vibrate) navigator.vibrate(10); } }, 450);
          return;
        }
        act = { kind: 'marq', sx: p.x, sy: p.y, add: e.shiftKey, base: new Set(sel) };
        return;
      }
      startPan(sp); return;
    }
    if (t === 'pen' || t === 'marker') {
      const mk = t === 'marker';
      act = { kind: 'pen', mk, pts: [p.x, p.y], f: { x: p.x, y: p.y }, w: mk ? opt.markW : opt.penW };
      live = () => `<path d="${smoothPath(act.pts)}" stroke="${colorOf(color)}" stroke-width="${act.w}" stroke-linecap="round" stroke-linejoin="round" fill="none"${mk ? ' opacity=".35"' : ''}/>`;
      drawObjects(); return;
    }
    if (t === 'eraser') { act = { kind: 'erase', last: p, removed: new Map(), added: new Set() }; eraseSeg(p, p, e); return; }
    if (t === 'shape') {
      act = { kind: 'shape', sx: p.x, sy: p.y, x: p.x, y: p.y, w: 0, h: 0 };
      live = () => act.w > 2 || act.h > 2 ? shapeSVG({ id: 'live', type: opt.shape, x: act.x, y: act.y, w: act.w, h: act.h, color, fill: opt.fill }) : '';
      return;
    }
    if (t === 'arrow') {
      const from = attachTarget(e);
      act = { kind: 'arrow', from, x1: p.x, y1: p.y, x2: p.x, y2: p.y };
      live = () => { const s = { from: act.from, to: act.to, x1: act.x1, y1: act.y1, x2: act.x2, y2: act.y2, head: opt.head, dash: opt.dash, curve: opt.curve }; const a = arrowEnds(s); return Math.hypot(a.x2 - a.x1, a.y2 - a.y1) > 4 ? arrowSVG(s, a, colorOf(color)) : ''; };
      return;
    }
    if (t === 'text') {
      interacting = false; act = null; e.preventDefault();
      const o = e.target.closest('.bd-text-o'); const s = o && shapeById(o.dataset.sid);
      if (s) { setTimeout(() => editObj(o, s, false), 0); return; }
      newTextAt(p); return;
    }
    if (t === 'sticky') {
      interacting = false; act = null; e.preventDefault();
      const id = addShape({ type: 'sticky', x: Math.round(p.x - 90), y: Math.round(p.y - 90), w: 180, h: 180, bg: STICKY_COLORS[opt.sticky || 0], text: '', size: 16 });
      setTool('select');
      setTimeout(() => { const el = htmlEls.get(id); if (el) editObj(el, shapeById(id), false); }, 0);
      return;
    }
    if (t === 'emoji') { startPan(sp); return; }
  });
  function attachTarget(e) {
    for (const el of document.elementsFromPoint(e.clientX, e.clientY)) {
      if (el.closest('.bd-tools, .bd-ctx, .bd-opts')) return null;
      const c = el.closest('.bd-card'); if (c) return c.dataset.tid;
      const o = el.closest('.bd-o'); if (o) return o.dataset.sid;
      const g = el.closest('.bd-svg [data-sid]'); if (g) { const s = shapeById(g.dataset.sid); if (s && ['rect', 'ellipse', 'diamond'].includes(s.type)) return s.id; }
    }
    return null;
  }

  board.addEventListener('pointermove', e => {
    if (tool === 'eraser') {
      const sp = local(e), r = opt.eraserR;
      Object.assign(ecurEl.style, { display: 'block', left: sp.x - r + 'px', top: sp.y - r + 'px', width: r * 2 + 'px', height: r * 2 + 'px' });
    }
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, local(e));
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      cam.x += mx - pinch.mx; cam.y += my - pinch.my;
      zoomAt(mx, my, d / (pinch.d || 1)); pinch = { d, mx, my };
      return;
    }
    if (!act) return;
    const p = toWorld(e), sp = local(e);
    if (act.kind === 'pan') { cam.x = act.cx + sp.x - act.sx; cam.y = act.cy + sp.y - act.sy; applyCam(); if (longT && Math.hypot(sp.x - act.sx, sp.y - act.sy) > 6) { clearTimeout(longT); longT = null; } }
    else if (act.kind === 'move') {
      const dx = p.x - act.sx, dy = p.y - act.sy;
      if (!act.moved && Math.hypot(dx, dy) * cam.z < 4) return;
      act.moved = true; act.dx = dx; act.dy = dy;
      act.items.forEach(it => {
        if (it.card) { it.card.classList.add('dragging'); it.card.style.left = Math.round(it.ox + dx) + 'px'; it.card.style.top = Math.round(it.oy + dy) + 'px'; }
        else Object.assign(it.s, moveData(it.orig, dx, dy));
      });
      if (act.card) {
        const c = act.card, cx = c.offsetLeft + c.offsetWidth / 2, cy = c.offsetTop + c.offsetHeight / 2;
        const dd = act.items.length === 1 ? dailyHit(cx, cy) : -1, over = dd < 0 ? frameAt(cx, cy) : null;
        markDailyDrop(dd);
        frameEls.forEach((fe, id) => fe.classList.toggle('drop', id === over && over !== act.home));
      }
      drawObjects();
    } else if (act.kind === 'scale') {
      const b = act.b0, h = act.h, dx = p.x - act.sx, dy = p.y - act.sy;
      let x0 = b.x, y0 = b.y, x1 = b.x + b.w, y1 = b.y + b.h;
      if (h.includes('w')) x0 += dx; if (h.includes('e')) x1 += dx; if (h.includes('n')) y0 += dy; if (h.includes('s')) y1 += dy;
      const uniform = h.length === 2 && (act.items.length > 1 || act.items.some(it => it.s && ['image', 'text', 'emoji', 'pen'].includes(it.s.type))) !== !!e.shiftKey;
      if (uniform) {
        const k = Math.max((x1 - x0) / (b.w || 1), (y1 - y0) / (b.h || 1), 0.05);
        const nw = b.w * k, nh = b.h * k;
        if (h.includes('w')) x0 = x1 - nw; else x1 = x0 + nw;
        if (h.includes('n')) y0 = y1 - nh; else y1 = y0 + nh;
      }
      const to = { x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.max(4, Math.abs(x1 - x0)), h: Math.max(4, Math.abs(y1 - y0)) };
      act.to = to;
      act.items.forEach(it => {
        if (it.card) { const cx = to.x + (it.ox - b.x) * to.w / b.w, cy = to.y + (it.oy - b.y) * to.h / b.h; it.card.style.left = Math.round(cx) + 'px'; it.card.style.top = Math.round(cy) + 'px'; }
        else Object.assign(it.s, scaleData(it.orig, b, to));
      });
      drawObjects();
    } else if (act.kind === 'marq') {
      const x = Math.min(act.sx, p.x), y = Math.min(act.sy, p.y), w = Math.abs(p.x - act.sx), h = Math.abs(p.y - act.sy);
      Object.assign(marqEl.style, { display: 'block', left: x * cam.z + cam.x + 'px', top: y * cam.z + cam.y + 'px', width: w * cam.z + 'px', height: h * cam.z + 'px' });
      const r = { x, y, w, h }, s2 = new Set(act.add ? act.base : []);
      ctxShapes().forEach(s => { const b = boxOf(s); if (b && inter(b, r)) s2.add(s.id); });
      cardEls.forEach((c, tid) => { if (c.style.visibility !== 'hidden' && inter(rectOf(c), r)) s2.add('c:' + tid); });
      sel = s2; renderSel();
    } else if (act.kind === 'pen') {
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      (evs.length ? evs : [e]).forEach(ev => {
        const q = toWorld(ev), f = act.f, a = 0.42;        // light smoothing of the input
        f.x += (q.x - f.x) * a; f.y += (q.y - f.y) * a;
        const n = act.pts.length;
        if (Math.hypot(f.x - act.pts[n - 2], f.y - act.pts[n - 1]) * cam.z >= 1.5) act.pts.push(Math.round(f.x * 10) / 10, Math.round(f.y * 10) / 10);
      });
      act.raw = p;
      drawObjects();
    } else if (act.kind === 'erase') { eraseSeg(act.last, p, e); act.last = p; }
    else if (act.kind === 'shape') {
      let w = p.x - act.sx, h = p.y - act.sy;
      if (e.shiftKey) { const m = Math.max(Math.abs(w), Math.abs(h)); w = Math.sign(w || 1) * m; h = Math.sign(h || 1) * m; }
      act.x = Math.min(act.sx, act.sx + w); act.y = Math.min(act.sy, act.sy + h); act.w = Math.abs(w); act.h = Math.abs(h);
      drawObjects();
    } else if (act.kind === 'arrow') {
      act.x2 = p.x; act.y2 = p.y; const to = attachTarget(e); act.to = to && to !== act.from ? to : null;
      drawObjects();
    } else if (act.kind === 'frame') {
      const dx = Math.round(p.x - act.sx), dy = Math.round(p.y - act.sy);
      if (!act.moved && Math.hypot(dx, dy) * cam.z < 4) return;
      act.moved = true; act.dx = dx; act.dy = dy;
      act.fel.style.left = (act.fp.x + dx) + 'px'; act.fel.style.top = (act.fp.y + dy) + 'px';
      act.members.forEach(m => { m.el.style.left = (m.ox + dx) + 'px'; m.el.style.top = (m.oy + dy) + 'px'; });
      drawObjects();
    } else if (act.kind === 'dmove') {
      const dx = p.x - act.sx, dy = p.y - act.sy;
      if (!act.moved && Math.hypot(dx, dy) * cam.z < 4) return;
      act.moved = true;
      act.el.classList.add('dragging'); act.el.style.transform = `translate(${dx}px, ${dy}px)`;
      markDailyDrop(dailyHit(p.x, p.y));
    } else if (act.kind === 'dframe') {
      const dx = Math.round(p.x - act.sx), dy = Math.round(p.y - act.sy);
      if (!act.moved && Math.hypot(dx, dy) * cam.z < 4) return;
      act.moved = true; act.dx = dx; act.dy = dy;
      dailyEl.style.left = (act.dp.x + dx) + 'px'; dailyEl.style.top = (act.dp.y + dy) + 'px';
    } else if (act.kind === 'fresize') {
      act.w = Math.max(240, Math.round(act.ow + p.x - act.sx)); act.h = Math.max(110, Math.round(act.oh + p.y - act.sy));
      act.fel.style.width = act.w + 'px'; act.fel.style.height = act.h + 'px';
    } else if (act.kind === 'cropH') {
      const F = cropping.F, W0 = act.W0, h = act.h, dx = p.x - act.sx, dy = p.y - act.sy;
      let x0 = W0.x, y0 = W0.y, x1 = W0.x + W0.w, y1 = W0.y + W0.h;
      if (h.includes('w')) x0 = Math.max(F.x, Math.min(x1 - 10, x0 + dx));
      if (h.includes('e')) x1 = Math.min(F.x + F.w, Math.max(x0 + 10, x1 + dx));
      if (h.includes('n')) y0 = Math.max(F.y, Math.min(y1 - 10, y0 + dy));
      if (h.includes('s')) y1 = Math.min(F.y + F.h, Math.max(y0 + 10, y1 + dy));
      cropping.W = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; renderSel();
    } else if (act.kind === 'cropPan') {
      const W = cropping.W, F0 = act.F0;
      const fx = Math.min(W.x, Math.max(W.x + W.w - F0.w, F0.x + p.x - act.sx)), fy = Math.min(W.y, Math.max(W.y + W.h - F0.h, F0.y + p.y - act.sy));
      cropping.F = { ...F0, x: fx, y: fy }; renderSel();
    }
  });
  board.addEventListener('pointerleave', () => { ecurEl.style.display = 'none'; });

  // pixel eraser: cut the part of pen strokes under the eraser; other objects go whole
  function eraseSeg(a, b, e) {
    const r = opt.eraserR / cam.z;
    const segBox = { x: Math.min(a.x, b.x) - r, y: Math.min(a.y, b.y) - r, w: Math.abs(b.x - a.x) + 2 * r, h: Math.abs(b.y - a.y) + 2 * r };
    let changed = false;
    ctxShapes().forEach(s => {
      if (s.type === 'pen') {
        const bb = boxOf(s); if (!inter(bb, segBox)) return;
        const rr = r + (s.w || 3) / 2, step = Math.max(0.5, r / 2.5), P = s.pts, dense = [];
        for (let i = 0; i < P.length; i += 2) {
          if (i) { const px = P[i - 2], py = P[i - 1], L = Math.hypot(P[i] - px, P[i + 1] - py), n = Math.floor(L / step); for (let k = 1; k < n; k++) dense.push(px + (P[i] - px) * k / n, py + (P[i + 1] - py) * k / n); }
          dense.push(P[i], P[i + 1]);
        }
        const runs = []; let cur = [], hit = false;
        for (let i = 0; i < dense.length; i += 2) {
          if (distSeg(dense[i], dense[i + 1], a.x, a.y, b.x, b.y) < rr) { hit = true; if (cur.length >= 4) runs.push(cur); cur = []; }
          else cur.push(dense[i], dense[i + 1]);
        }
        if (cur.length >= 4) runs.push(cur);
        if (!hit) return;
        changed = true;
        shapes = shapes.filter(x => x.id !== s.id);
        if (act.added.has(s.id)) act.added.delete(s.id); else act.removed.set(s.id, strip(s));
        runs.forEach(run => { const id = 'n' + newId(); act.added.add(id); shapes.push({ ...s, id, pts: rdp(run, 0.3).map(v => Math.round(v * 10) / 10) }); });
      } else if (s.type === 'arrow' || s.type === 'rect' || s.type === 'ellipse' || s.type === 'diamond') {
        let near = false;
        if (s.type === 'arrow') {
          const q = arrowEnds(s);
          near = q.cx == null ? distSeg(b.x, b.y, q.x1, q.y1, q.x2, q.y2) < r + 4 : !!document.elementsFromPoint(e.clientX, e.clientY).find(el => el.closest && el.closest(`[data-sid="${s.id}"]`));
        }
        else { const bb = boxOf(s); near = inter(bb, segBox) && (s.fill ? true : !inter({ x: bb.x + r + 4, y: bb.y + r + 4, w: bb.w - 2 * r - 8, h: bb.h - 2 * r - 8 }, { x: b.x, y: b.y, w: 0, h: 0 })); }
        if (!near) return;
        changed = true; shapes = shapes.filter(x => x.id !== s.id);
        if (act.added.has(s.id)) act.added.delete(s.id); else act.removed.set(s.id, strip(s));
      }
    });
    for (const el of document.elementsFromPoint(e.clientX, e.clientY)) {
      const o = el.closest && el.closest('.bd-o'); if (!o) continue;
      const s = shapeById(o.dataset.sid); if (!s) continue;
      changed = true; shapes = shapes.filter(x => x.id !== s.id); act.removed.set(s.id, strip(s));
    }
    if (changed) drawObjects();
  }

  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    clearTimeout(longT); longT = null;
    if (pinch) { if (pointers.size < 2) pinch = null; if (!pointers.size) finish(); return; }
    const a = act; act = null;
    board.classList.remove('panning'); marqEl.style.display = 'none';
    frameEls.forEach(fe => fe.classList.remove('drop'));
    cardEls.forEach(c => c.classList.remove('dragging'));
    markDailyDrop(-1);
    if (a && a.kind === 'dmove') { a.el.classList.remove('dragging'); a.el.style.transform = ''; }
    if (a && a.kind === 'dframe' && e.type !== 'pointerup') { const dp = cardPos[dailyKey()]; if (dp && dailyEl) { dailyEl.style.left = dp.x + 'px'; dailyEl.style.top = dp.y + 'px'; } }
    if (a && e.type === 'pointerup') {
      const p = toWorld(e);
      if (a.kind === 'check') {
        const t = allTasks.find(x => x.id === a.card.dataset.tid);
        if (t) { if (!t.done) recentDone.add(t.id); toggleTask(t); }
      } else if (a.kind === 'dmove') {
        if (a.moved) { const d = dailyHit(p.x, p.y); if (d >= 0) dropToDaily(a.tid, d, p.y); else removeFromDaily([a.tid]); drawPending = true; }
      } else if (a.kind === 'dframe') {
        if (a.moved) {
          const key = dailyKey(), np = { ...a.dp, x: a.dp.x + a.dx, y: a.dp.y + a.dy };
          cardPos[key] = np; commit([{ col: 'c', id: key, before: a.dp, after: np }]);
        }
      } else if (a.kind === 'move' && a.moved && a.card && a.items.length === 1 &&
        dailyHit(a.card.offsetLeft + a.card.offsetWidth / 2, a.card.offsetTop + a.card.offsetHeight / 2) >= 0) {
        // dropped into Daily: the card goes back to its spot, a copy lands in that day
        const c = a.card, it = a.items[0], d = dailyHit(c.offsetLeft + c.offsetWidth / 2, c.offsetTop + c.offsetHeight / 2);
        c.style.left = it.ox + 'px'; c.style.top = it.oy + 'px';
        dropToDaily(it.tid, d, p.y); drawPending = true;
      } else if (a.kind === 'move') {
        if (a.moved) {
          const ch = [];
          a.items.forEach(it => {
            if (it.card) {
              const key = cardKey(it.tid), nx = it.card.offsetLeft, ny = it.card.offsetTop;
              cardPos[key] = { x: nx, y: ny };
              ch.push({ col: 'c', id: key, before: { folderId: CTX, taskId: it.tid, x: it.ox, y: it.oy }, after: { folderId: CTX, taskId: it.tid, x: nx, y: ny } });
            } else ch.push({ col: 's', id: it.id, before: it.orig, after: moveData(it.orig, a.dx, a.dy) });
          });
          commit(ch);
          if (a.card && sel.size === 1) {        // a single card dropped into another frame (or out): move the task
            const t = allTasks.find(x => x.id === a.id.slice(2)), c = a.card;
            const target = frameAt(c.offsetLeft + c.offsetWidth / 2, c.offsetTop + c.offsetHeight / 2);
            if (t && target !== a.home) {
              const oldF = t.folderId; setTaskFolder(t, target || CTX);
              const last = undoStack[undoStack.length - 1];
              if (last) last.push({ col: 'task', id: t.id, before: oldF, after: target || CTX });
            }
          }
        } else if (isDouble(a.id)) {
          finish();
          if (a.id.startsWith('c:')) {
            const t = allTasks.find(x => x.id === a.id.slice(2)), txt = a.card && a.card.querySelector('.bd-text');
            if (t && txt) { inlineEdit(txt, t.text, v => updateTaskText(t, v)); a.card._sig = null; }
          } else {
            const s = shapeById(a.id), el = htmlEls.get(a.id);
            if (s && el && (s.type === 'text' || s.type === 'sticky')) editObj(el, s, false);
            else if (s && s.type === 'image') startCrop(s);
          }
          return;
        }
      } else if (a.kind === 'scale' && a.to) {
        const ch = [];
        a.items.forEach(it => {
          if (it.card) { const key = cardKey(it.tid), nx = it.card.offsetLeft, ny = it.card.offsetTop; cardPos[key] = { x: nx, y: ny }; ch.push({ col: 'c', id: key, before: { folderId: CTX, taskId: it.tid, x: it.ox, y: it.oy }, after: { folderId: CTX, taskId: it.tid, x: nx, y: ny } }); }
          else ch.push({ col: 's', id: it.id, before: it.orig, after: scaleData(it.orig, a.b0, a.to) });
        });
        commit(ch);
      } else if (a.kind === 'pen') {
        if (a.raw) a.pts.push(Math.round(a.raw.x * 10) / 10, Math.round(a.raw.y * 10) / 10);
        const pts = rdp(a.pts, 0.35 / cam.z).map(v => Math.round(v * 10) / 10);
        const d = { type: 'pen', color, w: a.w, pts };
        if (a.mk) d.op = 0.35;
        live = null; addShape(d);
      } else if (a.kind === 'erase') {
        const ch = [];
        a.removed.forEach((before, id) => ch.push({ col: 's', id, before, after: null }));
        a.added.forEach(tmp => { const s = shapes.find(x => x.id === tmp); if (!s) return; const id = newId(); s.id = id; ch.push({ col: 's', id, before: null, after: strip(s) }); });
        commit(ch);
      } else if (a.kind === 'shape') {
        live = null; const ty = opt.shape, fl = opt.fill;
        setTool('select');
        if (a.w > 4 || a.h > 4) addShape({ type: ty, x: Math.round(a.x), y: Math.round(a.y), w: Math.round(a.w), h: Math.round(a.h), color, fill: fl }, true);
        else addShape({ type: ty, x: Math.round(p.x - 60), y: Math.round(p.y - 45), w: 120, h: 90, color, fill: fl }, true);
      } else if (a.kind === 'arrow') {
        live = null;
        const s = { type: 'arrow', color, w: 2.6, head: opt.head, dash: !!opt.dash, curve: !!opt.curve, from: a.from || null, to: a.to || null, x1: Math.round(a.x1), y1: Math.round(a.y1), x2: Math.round(p.x), y2: Math.round(p.y) };
        const en = arrowEnds(s);
        if (Math.hypot(en.x2 - en.x1, en.y2 - en.y1) > 12) addShape(s);
      } else if (a.kind === 'frame' || a.kind === 'fresize') {
        const fk = frameKey(a.fid), old = a.fp, ch = [];
        if (a.kind === 'fresize' && a.w) { const np = { ...old, w: a.w, h: a.h }; cardPos[fk] = np; ch.push({ col: 'c', id: fk, before: { folderId: CTX, frameId: a.fid, ...old }, after: { folderId: CTX, frameId: a.fid, ...np } }); }
        else if (a.kind === 'frame' && a.moved) {
          const np = { ...old, x: old.x + a.dx, y: old.y + a.dy }; cardPos[fk] = np;
          ch.push({ col: 'c', id: fk, before: { folderId: CTX, frameId: a.fid, ...old }, after: { folderId: CTX, frameId: a.fid, ...np } });
          a.members.forEach(m => { const k = cardKey(m.tid); cardPos[k] = { x: m.ox + a.dx, y: m.oy + a.dy }; ch.push({ col: 'c', id: k, before: { folderId: CTX, taskId: m.tid, x: m.ox, y: m.oy }, after: { folderId: CTX, taskId: m.tid, ...cardPos[k] } }); });
        } else if (a.kind === 'frame' && isDouble('f' + a.fid)) { finish(); navigateTo(a.fid); return; }
        commit(ch);
      } else if (a.kind === 'cropH' || a.kind === 'cropPan') { /* stays in crop mode */ }
    }
    if (!pointers.size) finish();
  }
  function cancelAct() {
    if (act && act.kind === 'move') act.items.forEach(it => { if (it.s) Object.assign(it.s, it.orig); else { it.card.style.left = it.ox + 'px'; it.card.style.top = it.oy + 'px'; } });
    clearTimeout(longT); longT = null;
    act = null; live = null; marqEl.style.display = 'none'; drawObjects();
  }
  function finish() {
    live = null; interacting = false; act = null;
    if (pendingShapes) { shapes = pendingShapes; pendingShapes = null; drawPending = true; }
    if (drawPending) draw(); else { drawObjects(); renderCtx(); }
  }
  board.addEventListener('pointerup', endPointer);
  board.addEventListener('pointercancel', endPointer);
  board.addEventListener('contextmenu', e => e.preventDefault());
  board.addEventListener('wheel', e => {
    e.preventDefault();
    const sp = local(e);
    if (e.ctrlKey || e.metaKey) {
      const dy = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
      zoomAt(sp.x, sp.y, Math.exp(-Math.max(-100, Math.min(100, dy)) * 0.001));
    } else { cam.x -= e.deltaX; cam.y -= e.deltaY; applyCam(); }
  }, { passive: false });
  let gz = 1;
  board.addEventListener('gesturestart', e => { e.preventDefault(); gz = 1; });
  board.addEventListener('gesturechange', e => { e.preventDefault(); const sp = local(e); zoomAt(sp.x, sp.y, e.scale / gz); gz = e.scale; });

  // task undo entries ('task' col) restore the folder
  const _writeDoc = writeDoc;
  writeDoc = function (c, id, data) {
    if (c === 'task') { const t = allTasks.find(x => x.id === id); if (t && data) setTaskFolder(t, data); return; }
    _writeDoc(c, id, data);
  };

  document.addEventListener('keydown', e => {
    if (!active() || board.offsetParent === null) return;
    const ae = document.activeElement;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
    const k = e.key.toLowerCase(), mod = e.metaKey || e.ctrlKey;
    if (k === ' ' && !spaceDown) { spaceDown = true; board.classList.add('space'); e.preventDefault(); return; }
    if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if (mod && k === 'y') { e.preventDefault(); redo(); return; }
    if (mod && k === 'd') { e.preventDefault(); duplicateSel(); return; }
    if (mod && k === 'a') { e.preventDefault(); setTool('select'); sel = new Set(ctxShapes().map(s => s.id)); cardEls.forEach((c, tid) => sel.add('c:' + tid)); renderSel(); renderCtx(); return; }
    if (mod || e.altKey) return;
    if (cropping) { if (k === 'enter') endCrop(true); else if (k === 'escape') endCrop(false); return; }
    if (k === 'delete' || k === 'backspace') { if (sel.size) { e.preventDefault(); deleteSel(); } return; }
    if (k === 'escape') { sel.clear(); renderSel(); renderCtx(); setTool('select'); return; }
    if (k === 'enter' && sel.size === 1) { const s = shapeById([...sel][0]), el = s && htmlEls.get(s.id); if (s && el && (s.type === 'text' || s.type === 'sticky')) { e.preventDefault(); editObj(el, s, false); } return; }
    if (k.startsWith('arrow') && sel.size) {
      e.preventDefault(); const st = e.shiftKey ? 10 : 1, dx = k === 'arrowleft' ? -st : k === 'arrowright' ? st : 0, dy = k === 'arrowup' ? -st : k === 'arrowdown' ? st : 0;
      const ch = selItems().filter(i => i.s).map(i => ({ col: 's', id: i.id, before: strip(i.s), after: moveData(strip(i.s), dx, dy) }));
      ch.forEach(c => Object.assign(shapeById(c.id), c.after)); commit(ch); drawObjects(); return;
    }
    const map = { v: 'select', h: 'hand', p: 'pen', m: 'marker', e: 'eraser', r: 'shape', o: 'shape', a: 'arrow', l: 'arrow', t: 'text', n: 'sticky' };
    if (map[k]) setTool(map[k]);
  });
  document.addEventListener('keyup', e => { if (e.key === ' ') { spaceDown = false; board.classList.remove('space'); } });

  // ---------- ToDo viewbar ----------
  function renderViewbar() {
    viewbar.innerHTML = '';
    if (currentFolderId === null) return;
    const seg = document.createElement('div'); seg.className = 'bd-seg';
    [['list', 'List'], ['board', 'Board']].forEach(([m, label]) => {
      const b = document.createElement('button');
      b.className = (isBoard(currentFolderId) ? m === 'board' : m === 'list') ? 'on' : '';
      b.innerHTML = IC[m] + label;
      b.addEventListener('click', () => {
        if (m === 'board') modes[currentFolderId] = 'board'; else delete modes[currentFolderId];
        lsSet('tgr_board_modes', modes); sel.clear(); renderAll();
      });
      seg.appendChild(b);
    });
    viewbar.appendChild(seg);
  }

  // ---------- free boards: sidebar, breadcrumbs, page ----------
  const BOARD_IC = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><rect x="3" y="4" width="18" height="15" rx="2.5"/><path d="M7 14C8.5 11 10 10 11.5 12S15 13 17 9"/><path d="M8 21H16"/></svg>';
  const PLUS_IC = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  function goFBoard(id) {
    fbState.id = id; lsSet('tgr_fb_last', id);
    currentPage = 'fboard'; renderAll();
    if (typeof autoCollapseOnMobile === 'function') autoCollapseOnMobile();
  }
  async function createFBoard() {
    const n = fboards.length + 1;
    const r = await fbCol.add({ name: 'Board ' + n, createdAt: Date.now(), order: Date.now() });
    expandBoards(); goFBoard(r.id);
    setTimeout(() => {
      const rowEl = document.querySelector(`.tree-row[data-fb="${r.id}"] .row-name`);
      if (rowEl) { inlineEdit(rowEl, 'Board ' + n, v => fbCol.doc(r.id).update({ name: v })); const ta = rowEl.querySelector('.inline-edit'); if (ta) ta.select(); }
    }, 50);
  }
  function deleteFBoard(b) {
    if (!confirm('Delete board "' + b.name + '"? Everything on it goes too.')) return;
    const ctx = 'fb_' + b.id;
    shapes.filter(s => s.folderId === ctx).forEach(s => shapesCol.doc(s.id).delete());
    fbCol.doc(b.id).delete();
    if (fbState.id === b.id) { fbState.id = null; if (currentPage === 'fboard') renderAll(); }
  }
  function expandBoards() { if (typeof MAIN_SECTIONS !== 'undefined' && !MAIN_SECTIONS.includes('__boards__')) MAIN_SECTIONS.push('__boards__'); openSection('__boards__'); saveExpanded(); }
  function sbRow(icon, name, opts) {
    const r = document.createElement('div'); r.className = 'tree-row' + (opts.active ? ' active' : ''); r.style.paddingLeft = (opts.indent || 6) + 'px';
    const ic = document.createElement('span'); ic.className = 'row-icon'; ic.innerHTML = icon; r.appendChild(ic);
    const nm = document.createElement('span'); nm.className = 'row-name'; nm.textContent = name; if (opts.bold) nm.style.fontWeight = '700'; r.appendChild(nm);
    r.addEventListener('click', opts.onClick);
    if (opts.menu && window.attachRowMenu) window.attachRowMenu(r, () => opts.menu(r));
    return r;
  }
  const prevSidebar = window.renderExtraSidebar;
  window.renderExtraSidebar = function (list) {
    if (prevSidebar) prevSidebar(list);
    if (typeof MAIN_SECTIONS !== 'undefined' && !MAIN_SECTIONS.includes('__boards__')) MAIN_SECTIONS.push('__boards__');
    const open = expanded.has('__boards__');
    const rows = [sbRow(BOARD_IC, 'Boards', {
      bold: true, active: currentPage === 'fboard' && !fbState.id,
      onClick: () => { if (open) expanded.delete('__boards__'); else expandBoards(); saveExpanded(); renderTree(); },
      menu: () => [{ label: 'New board', icon: 'board', action: createFBoard }]
    })];
    if (open) {
      fboards.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(b => {
        const r = sbRow(BOARD_IC, b.name, {
          indent: 27, active: currentPage === 'fboard' && fbState.id === b.id, onClick: () => goFBoard(b.id),
          menu: rowEl => [{ label: 'Rename', icon: 'edit', action: () => inlineEdit(rowEl.querySelector('.row-name'), b.name, v => fbCol.doc(b.id).update({ name: v })) },
            { label: 'Delete board', icon: 'trash', danger: true, action: () => deleteFBoard(b) }]
        });
        r.dataset.fb = b.id; rows.push(r);
      });
      rows.push(sbRow(PLUS_IC, 'New board', { indent: 27, onClick: createFBoard }));
    }
    // right under the ToDo section: before the Weight row
    const anchor = [...list.children].find(r => r.classList.contains('tree-row') && r.style.paddingLeft === '6px' && (r.querySelector('.row-name') || {}).textContent === 'Weight');
    rows.forEach(r => anchor ? list.insertBefore(r, anchor) : list.appendChild(r));
  };
  const prevCrumbs = window.renderExtraBreadcrumbs;
  window.renderExtraBreadcrumbs = function (bc) {
    if (currentPage !== 'fboard') return prevCrumbs ? prevCrumbs(bc) : false;
    bc.innerHTML = '';
    const b = fboards.find(x => x.id === fbState.id);
    const c1 = document.createElement('span'); c1.className = 'crumb' + (b ? '' : ' current'); c1.textContent = 'Boards';
    c1.addEventListener('click', () => { fbState.id = null; renderAll(); }); bc.appendChild(c1);
    if (b) {
      const sp = document.createElement('span'); sp.className = 'crumb-sep'; sp.textContent = '/'; bc.appendChild(sp);
      const c2 = document.createElement('span'); c2.className = 'crumb current'; c2.textContent = b.name; c2.title = 'Double-click to rename';
      c2.addEventListener('dblclick', () => inlineEdit(c2, b.name, v => fbCol.doc(b.id).update({ name: v })));
      bc.appendChild(c2);
    }
    return true;
  };
  function renderFBList() {
    fbEmpty.innerHTML = '';
    const h = document.createElement('h1'); h.className = 'x-title'; h.textContent = 'Boards'; h.style.margin = '6px 0 16px'; fbEmpty.appendChild(h);
    const wrap = document.createElement('div'); wrap.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px';
    fboards.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(b => {
      const t = document.createElement('div'); t.className = 'progress-ex-tile'; t.innerHTML = BOARD_IC + ' ';
      t.appendChild(document.createTextNode(b.name));
      const n = shapes.filter(s => s.folderId === 'fb_' + b.id).length;
      const m = document.createElement('div'); m.style.cssText = 'font-size:12px;font-weight:500;color:var(--text-dim);margin-top:6px'; m.textContent = n + ' object' + (n === 1 ? '' : 's'); t.appendChild(m);
      t.addEventListener('click', () => goFBoard(b.id)); wrap.appendChild(t);
    });
    const add = document.createElement('div'); add.className = 'progress-ex-tile'; add.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:6px;color:var(--accent)';
    add.innerHTML = PLUS_IC + ' New board'; add.addEventListener('click', createFBoard); wrap.appendChild(add);
    fbEmpty.appendChild(wrap);
  }

  // ---------- hook into the app's render ----------
  function syncLayout() {
    const id = ctxId();
    contentEl.classList.toggle('bd-on', !!id);
    contentEl.classList.toggle('bd-todo', !!id && currentPage === 'todo');
    pageFB.style.display = currentPage === 'fboard' ? (id ? 'flex' : 'block') : 'none';
    if (currentPage === 'todo') renderViewbar();
    if (currentPage === 'fboard' && !id) renderFBList();
    fbEmpty.style.display = currentPage === 'fboard' && !id ? 'block' : 'none';
    if (id) {
      const parent = currentPage === 'fboard' ? pageFB : pageTodo;
      if (board.parentNode !== parent) parent.appendChild(board);
      board.style.display = 'block';
      if (id !== CTX) { CTX = id; }
      requestDraw();
    } else {
      board.style.display = 'none';
      if (cropping) cropping = null;
      if (editing) editing.blur();
    }
  }
  const origRenderTasks = window.renderTasks;
  window.renderTasks = function () { origRenderTasks(); syncLayout(); };
  const prevPages = window.renderExtraPages;
  window.renderExtraPages = function () { if (prevPages) prevPages(); syncLayout(); };
  window.addEventListener('resize', () => { if (active()) drawObjects(); });

  // photos no longer on any board (and not in undo reach) are cleaned up once a day
  setTimeout(() => {
    try {
      if (!window.TgrFiles || lsGet('tgr_bimg_gc', 0) > Date.now() - 864e5) return;
      const used = new Set(shapes.filter(s => s.type === 'image').map(s => s.fid));
      window.TgrFiles.list().filter(f => !used.has(f.id) && (f.createdAt || 0) < Date.now() - 864e5).forEach(f => window.TgrFiles.remove(f.id));
      lsSet('tgr_bimg_gc', Date.now());
    } catch (e) {}
  }, 20000);

  window.__tgr = Object.assign(window.__tgr || {}, { goFBoard });
  setTool('select');
  renderAll();
})();
