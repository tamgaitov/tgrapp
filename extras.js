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
    cursor: pointer; transition: transform .35s cubic-bezier(.2,.9,.3,1.2), opacity .25s ease, visibility .35s; max-width: calc(100% - 24px);
    opacity: 0; visibility: hidden; }
  #a-toast.show { transform: translate(-50%, 0); opacity: 1; visibility: visible; }
  #a-toast small { display: block; color: #f5deb3; font-size: 11.5px; font-weight: 600; }
  #a-toast b { font-size: 15px; }
  @media (prefers-reduced-motion: reduce) { #a-toast, .trophy svg, .t-cell { transition: none; } }

  /* cabinet slots + arrange */
  .cab-bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; min-height: 38px; }
  .shelf-items { display: grid !important; grid-template-columns: repeat(6, 1fr); gap: 4px !important; align-items: end; min-height: 104px; position: relative; }
  .slot { display: flex; justify-content: center; align-items: flex-end; min-height: 100px; border-radius: 8px; position: relative; }
  .slot .trophy { width: 100%; max-width: 78px; }
  .slot .trophy svg { width: min(66px, 100%); height: auto; }
  .shelf-note { position: absolute; left: 0; right: 0; bottom: 34px; text-align: center; }
  .cab.arranging .slot { outline: 1px dashed rgba(245,222,179,.2); outline-offset: -3px; }
  .cab.arranging .trophy { touch-action: none; cursor: grab; }
  .cab.arranging .trophy-tip { display: none; }
  .slot.drop { background: rgba(245,222,179,.14); }
  .trophy.selected svg { filter: drop-shadow(0 0 10px rgba(255,220,150,.9)) drop-shadow(0 4px 3px rgba(0,0,0,.5)); transform: translateY(-4px); }
  .trophy.lifted { opacity: .25; }
  .drag-ghost { position: fixed; left: 0; top: 0; z-index: 3000; pointer-events: none; opacity: .92; }
  .drag-ghost svg { width: 66px; height: auto; filter: drop-shadow(0 10px 12px rgba(0,0,0,.5)); }

  /* builder */
  .cr-wrap { display: grid; grid-template-columns: 220px 1fr; gap: 22px; align-items: start; }
  .cr-preview { position: sticky; top: 0; background: radial-gradient(ellipse at 50% 0%, #4a3222 0%, #24170e 60%, #1a110a 100%);
    border-radius: 12px; padding: 22px 16px 16px; box-shadow: inset 0 0 30px rgba(0,0,0,.6); }
  .cr-stage { display: flex; justify-content: center; align-items: flex-end; min-height: 200px; }
  .cr-stage svg { filter: drop-shadow(0 6px 5px rgba(0,0,0,.55)); }
  .cr-prev-name { color: #f5deb3; text-align: center; font-weight: 700; font-size: 14px; margin-top: 12px; overflow-wrap: anywhere; }
  .cr-form { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  .cr-field { display: flex; flex-direction: column; gap: 5px; font-size: 12.5px; color: var(--text-dim); }
  .cr-field input { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; font-size: 15px;
    color: var(--text); outline: none; font-family: inherit; }
  .cr-field input:focus { border-color: var(--accent); }
  .cr-field input.err { border-color: var(--danger); }
  .cr-sec { font-size: 12.5px; color: var(--text-dim); font-weight: 600; margin-top: 6px; }
  .cr-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .cr-opt, .cr-mat { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 10px; padding: 8px 10px 6px; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--text); font-family: inherit; min-width: 64px; }
  .cr-opt small, .cr-mat small { font-size: 11.5px; color: var(--text-dim); }
  .cr-opt.on, .cr-mat.on, .cr-emb.on { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
  .cr-mat i { width: 26px; height: 26px; border-radius: 50%; display: block; box-shadow: inset 0 0 0 1px rgba(0,0,0,.25); }
  .cr-emblems { display: grid; grid-template-columns: repeat(auto-fill, minmax(42px, 1fr)); gap: 6px; }
  .cr-emb { aspect-ratio: 1; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 10px; color: var(--text); cursor: pointer;
    display: flex; align-items: center; justify-content: center; padding: 0; }
  .cr-emb:hover { border-color: var(--accent); color: var(--accent); }
  .cr-check { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--text); cursor: pointer; }
  .cr-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 6px; }
  @media (max-width: 640px) { .cr-wrap { grid-template-columns: 1fr; } .cr-preview { position: static; } .cr-stage { min-height: 170px; } }

  /* settings */
  #set-modal { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,.5); display: none; align-items: center; justify-content: center; padding: 20px; }
  #set-modal.open { display: flex; }
  .th-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .th-card { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 8px; cursor: pointer; display: flex; flex-direction: column;
    gap: 7px; color: var(--text); font-family: inherit; text-align: left; }
  .th-card b { font-size: 13.5px; padding-left: 2px; }
  .th-card.on { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
  .th-prev { display: flex; height: 58px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(128,128,128,.25); }
  .th-prev i { width: 28%; display: block; }
  .th-prev em { flex: 1; margin: 10px; border-radius: 5px; display: flex; align-items: flex-end; padding: 6px; }
  .th-prev u { display: block; width: 50%; height: 8px; border-radius: 4px; }
  .th-system { background: none; border: 1px dashed var(--border); border-radius: 10px; padding: 9px; color: var(--text-dim); cursor: pointer; font-family: inherit; font-size: 13px; }
  .th-system.on { border-style: solid; border-color: var(--accent); color: var(--accent); }

  /* themes */
  :root[data-theme="blood"] {
    --bg: #140708; --bg-elevated: #1e0b0d; --sidebar-bg: #0c0405; --sidebar-text: #ecd3d4; --sidebar-text-dim: #93646a;
    --sidebar-active: #3d0f15; --sidebar-hover: #220a0d; --text: #f6e9e9; --text-dim: #b3898c; --accent: #c8102e; --accent-soft: #3d0d14;
    --border: #3c171c; --danger: #ff6b6b; --popover-bg: #241013; color-scheme: dark;
  }
  :root[data-theme="blood"] body { background: radial-gradient(1100px 520px at 75% -12%, #3d0a12 0%, transparent 65%), var(--bg); }
  :root[data-theme="blood"] #sidebar { box-shadow: inset -1px 0 0 #3c0c12; }
  :root[data-theme="blood"] .t-cell:not(.filled) { border-color: #4a1a20; }

  :root[data-theme="skyrim"] {
    --bg: #16140f; --bg-elevated: #211e18; --sidebar-bg: #0e0d0a; --sidebar-text: #e6dcc6; --sidebar-text-dim: #8f8672;
    --sidebar-active: #2c271d; --sidebar-hover: #1b1914; --text: #ede5d1; --text-dim: #a59c86; --accent: #c4a468; --accent-soft: #2f2919;
    --border: #3b3529; --danger: #d9644a; --popover-bg: #1f1c16; color-scheme: dark;
  }
  :root[data-theme="skyrim"] body { font-family: 'Jost', 'Futura', 'Century Gothic', -apple-system, sans-serif;
    background: radial-gradient(1000px 600px at 50% -20%, #2b2518 0%, transparent 70%), radial-gradient(900px 500px at 50% 120%, #0a0907 0%, transparent 60%), var(--bg); }
  :root[data-theme="skyrim"] #sidebar { box-shadow: inset -1px 0 0 #3b3529, inset -3px 0 0 #0e0d0a, inset -4px 0 0 #2a2519; }
  :root[data-theme="skyrim"] .x-title, :root[data-theme="skyrim"] .pl-title, :root[data-theme="skyrim"] .a-m-name,
  :root[data-theme="skyrim"] .crumb, :root[data-theme="skyrim"] #sidebar-title, :root[data-theme="skyrim"] .tab-btn,
  :root[data-theme="skyrim"] .t-name-input, :root[data-theme="skyrim"] #sidebar .row-name[style*="700"] {
    font-family: 'Cinzel', 'Trajan Pro', Georgia, serif; letter-spacing: .04em; }
  :root[data-theme="skyrim"] #add-btn, :root[data-theme="skyrim"] #weight-add-btn, :root[data-theme="skyrim"] .x-btn.primary,
  :root[data-theme="skyrim"] .tab-btn.active, :root[data-theme="skyrim"] .pl-add, :root[data-theme="skyrim"] .sync-actions button.primary,
  :root[data-theme="skyrim"] button[style*="var(--accent)"] { color: #16140f !important; }
  :root[data-theme="skyrim"] .pl-card, :root[data-theme="skyrim"] .t-stats, :root[data-theme="skyrim"] .a-card, :root[data-theme="skyrim"] .t-card {
    box-shadow: inset 0 0 0 1px rgba(196,164,104,.08); }

  /* notes */
  #page-notes { max-width: 720px; }
  .n-head { display: flex; gap: 10px; align-items: center; }
  .n-title { flex: 1; min-width: 0; font-size: 26px; font-weight: 700; background: none; border: none; outline: none; color: var(--text);
    font-family: inherit; padding: 4px 0; }
  .n-title::placeholder { color: var(--text-dim); opacity: .6; }
  .n-meta { display: flex; gap: 10px; flex-wrap: wrap; font-size: 12.5px; color: var(--text-dim); margin: 2px 0 16px; }
  .n-meta em { font-style: normal; }
  .n-body { width: 100%; min-height: 260px; resize: none; background: none; border: none; outline: none; color: var(--text);
    font-family: inherit; font-size: 16px; line-height: 1.6; padding: 0; overflow: hidden; }
  .n-body::placeholder { color: var(--text-dim); opacity: .7; }
  #n-menu { position: fixed; z-index: 1000; background: var(--popover-bg); border: 1px solid rgba(255,255,255,.1); border-radius: 10px;
    padding: 5px; display: none; flex-direction: column; min-width: 160px; box-shadow: 0 8px 24px rgba(0,0,0,.35); }
  #n-menu.open { display: flex; }
  #n-menu button { display: flex; align-items: center; gap: 8px; background: none; border: none; color: #e6e7ea; font-size: 13.5px;
    padding: 8px 10px; border-radius: 7px; cursor: pointer; text-align: left; font-family: inherit; }
  #n-menu button:hover { background: rgba(255,255,255,.08); }
  @media (hover: none) { .row-actions { opacity: 1 !important; } }
  :root[data-theme="skyrim"] .n-title { font-family: 'Cinzel', Georgia, serif; }
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
  const customCol = SyncDB.collection('customTrophies');
  const settingsCol = SyncDB.collection('appSettings');
  let customs = [], shelfLayout = {};
  customCol.orderBy('createdAt', 'asc').onSnapshot(s => { customs = s.docs.map(d => ({ id: d.id, ...d.data() })); if (currentPage === 'achievements') renderAll(); });
  settingsCol.orderBy('k', 'asc').onSnapshot(s => {
    const d = s.docs.find(x => x.id === 'shelf'); shelfLayout = (d && d.data().slots) || {};
    if (currentPage === 'achievements' && aTab === 'mine' && !dragState) renderAchievements();
  });
  let draft = null, arranging = false, selectedKey = null, dragState = null;

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

  // ================= notes =================
  const nFoldersCol = SyncDB.collection('noteFolders');
  const notesCol = SyncDB.collection('notes');
  let nFolders = [], notes = [];
  let nState = { noteId: null, creatingIn: undefined };
  nFoldersCol.orderBy('createdAt', 'asc').onSnapshot(s => { nFolders = s.docs.map(d => ({ id: d.id, ...d.data() })); renderAll(); });
  notesCol.orderBy('createdAt', 'asc').onSnapshot(s => { notes = s.docs.map(d => ({ id: d.id, ...d.data() })); renderAll(); });

  const nMenu = el('div'); nMenu.id = 'n-menu'; document.body.appendChild(nMenu);
  document.addEventListener('click', e => { if (nMenu.classList.contains('open') && !nMenu.contains(e.target)) nMenu.classList.remove('open'); });
  function openNotesMenu(anchor, folderId) {
    nMenu.innerHTML = '';
    const a = el('button', null, I.note + '<span>New note</span>');
    a.addEventListener('click', e => { e.stopPropagation(); nMenu.classList.remove('open'); newNote(folderId); });
    const b = el('button', null, I.folder + '<span>New folder</span>');
    b.addEventListener('click', e => {
      e.stopPropagation(); nMenu.classList.remove('open');
      expanded.add('__notes__'); if (folderId) expanded.add('nf:' + folderId); saveExpanded();
      nState.creatingIn = folderId || null; renderTree();
    });
    nMenu.appendChild(a); nMenu.appendChild(b);
    const r = anchor.getBoundingClientRect();
    nMenu.style.top = Math.min(r.bottom + 4, window.innerHeight - 100) + 'px';
    nMenu.style.left = Math.max(8, Math.min(r.left - 120, window.innerWidth - 170)) + 'px';
    nMenu.classList.add('open');
  }
  function newNote(folderId) {
    const now = Date.now();
    expanded.add('__notes__'); if (folderId) expanded.add('nf:' + folderId); saveExpanded();
    notesCol.add({ title: '', body: '', folderId: folderId || null, createdAt: now, updatedAt: now }).then(r => { focusTitle = true; goNote(r.id); });
  }
  function nChildren(parentId) { return nFolders.filter(f => (f.parentId || null) === (parentId || null)).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ru')); }
  function nNotesIn(folderId) { return notes.filter(n => (n.folderId || null) === (folderId || null)); }
  function deleteNoteFolder(f) {
    const fids = [], walk = id => { fids.push(id); nChildren(id).forEach(c => walk(c.id)); };
    walk(f.id);
    const inside = notes.filter(n => fids.includes(n.folderId));
    if (!confirm('Delete folder "' + f.name + '"' + (inside.length ? ' and ' + inside.length + ' notes inside' : '') + '?')) return;
    inside.forEach(n => notesCol.doc(n.id).delete());
    fids.forEach(id => nFoldersCol.doc(id).delete());
    if (inside.some(n => n.id === nState.noteId)) nState.noteId = null;
  }
  function deleteNote(n) {
    if (!confirm('Delete note "' + (n.title || 'Untitled') + '"?')) return;
    notesCol.doc(n.id).delete();
    if (nState.noteId === n.id) { nState.noteId = null; renderAll(); }
  }
  function folderForm(parentId, indent) {
    const r = el('div', 'inline-form-row'); r.style.paddingLeft = indent + 'px';
    const inp = el('input', 'fname'); inp.placeholder = 'folder name...';
    const ok = el('button', 'fok', '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.2 11.5L13 4.5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    const done = () => {
      const name = inp.value.trim(); nState.creatingIn = undefined;
      if (name) nFoldersCol.add({ name, parentId: parentId || null, createdAt: Date.now() }).then(x => { expanded.add('nf:' + x.id); saveExpanded(); });
      renderTree();
    };
    ok.addEventListener('click', e => { e.stopPropagation(); done(); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') done(); if (e.key === 'Escape') { nState.creatingIn = undefined; renderTree(); } });
    inp.addEventListener('click', e => e.stopPropagation());
    r.appendChild(inp); r.appendChild(ok);
    setTimeout(() => inp.focus(), 30);
    return r;
  }
  function renderNotesTree(list, parentId, depth) {
    const indent = 6 + depth * 15;
    nChildren(parentId).forEach(f => {
      const key = 'nf:' + f.id, open = expanded.has(key);
      const hasKids = nChildren(f.id).length || nNotesIn(f.id).length;
      list.appendChild(row({
        icon: I.folder, name: f.name, indent, chevron: hasKids ? open : null,
        onClick: () => { if (open) expanded.delete(key); else expanded.add(key); saveExpanded(); renderTree(); },
        addTitle: 'New note or folder', onAdd: b => openNotesMenu(b, f.id), onDelete: () => deleteNoteFolder(f)
      }));
      if (open) renderNotesTree(list, f.id, depth + 1);
    });
    nNotesIn(parentId).forEach(n => {
      list.appendChild(row({
        icon: I.note, name: n.title || 'Untitled', indent: indent + 14,
        active: currentPage === 'notes' && nState.noteId === n.id,
        onClick: () => goNote(n.id), onDelete: () => deleteNote(n)
      }));
    });
    if (nState.creatingIn !== undefined && (nState.creatingIn || null) === (parentId || null)) list.appendChild(folderForm(parentId, indent + 14));
  }
  function goNote(id) { currentPage = 'notes'; nState.noteId = id; renderAll(); autoCollapseOnMobile(); }

  let focusTitle = false, saveTimer = null;
  const pageN = document.createElement('div'); pageN.id = 'page-notes'; pageN.className = 'page-wrap'; pageN.style.display = 'none';
  contentEl.appendChild(pageN);
  function notePath(n) {
    const chain = []; let fid = n.folderId;
    while (fid) { const f = nFolders.find(x => x.id === fid); if (!f) break; chain.unshift(f); fid = f.parentId; }
    return chain;
  }
  function fmtEdited(ts) {
    const d = new Date(ts), now = new Date();
    const t = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return dayStr(d) === dayStr(now) ? 'today, ' + t : fmtDay(dayStr(d)) + ', ' + t;
  }
  function renderNote() {
    const n = notes.find(x => x.id === nState.noteId);
    if (!n) {
      pageN.dataset.noteId = '';
      pageN.innerHTML = '';
      const e = el('div', 'x-empty'); e.textContent = notes.length ? 'Pick a note on the left.' : 'No notes yet.';
      const b = el('button', 'x-btn primary'); b.textContent = 'New note'; b.style.marginTop = '12px';
      b.addEventListener('click', () => newNote(null));
      e.appendChild(el('br')); e.appendChild(b);
      pageN.appendChild(e);
      return;
    }
    if (pageN.dataset.noteId === n.id && pageN.querySelector('.n-body')) {
      // same note already open: update only what the user is not editing
      const ti = pageN.querySelector('.n-title'), bo = pageN.querySelector('.n-body');
      if (document.activeElement !== ti && ti.value !== (n.title || '')) ti.value = n.title || '';
      if (document.activeElement !== bo && bo.value !== (n.body || '')) { bo.value = n.body || ''; grow(bo); }
      if (!saveTimer) pageN.querySelector('.n-meta span').textContent = 'Edited ' + fmtEdited(n.updatedAt || n.createdAt);
      return;
    }
    pageN.dataset.noteId = n.id;
    pageN.innerHTML = '';
    const head = el('div', 'n-head');
    const ti = el('input', 'n-title'); ti.placeholder = 'Untitled'; ti.value = n.title || ''; ti.maxLength = 120;
    const del = el('button', 'x-btn ghost-danger'); del.textContent = 'Delete';
    del.addEventListener('click', () => deleteNote(n));
    head.appendChild(ti); head.appendChild(del);
    const meta = el('div', 'n-meta');
    const path = notePath(n).map(f => esc(f.name)).join(' / ');
    meta.innerHTML = (path ? '<em>' + path + '</em>' : '') + '<span>Edited ' + fmtEdited(n.updatedAt || n.createdAt) + '</span>';
    const bo = el('textarea', 'n-body'); bo.placeholder = 'Start writing...'; bo.value = n.body || '';
    pageN.appendChild(head); pageN.appendChild(meta); pageN.appendChild(bo);
    const status = meta.querySelector('span');
    const save = () => {
      status.textContent = 'Saving...';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveTimer = null;
        notesCol.doc(n.id).update({ title: ti.value, body: bo.value, updatedAt: Date.now() });
        status.textContent = 'Saved';
      }, 500);
    };
    ti.addEventListener('input', save);
    bo.addEventListener('input', () => { grow(bo); save(); });
    ti.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); bo.focus(); } });
    requestAnimationFrame(() => grow(bo));
    if (focusTitle) { focusTitle = false; setTimeout(() => ti.focus(), 30); }
  }
  function grow(t) { t.style.height = 'auto'; t.style.height = Math.max(260, t.scrollHeight + 4) + 'px'; }

  // ================= navigation =================
  function goTerritory(boardId) { currentPage = 'territory'; tState.boardId = boardId || null; renderAll(); autoCollapseOnMobile(); }
  function goAch(tab) { currentPage = 'achievements'; aTab = tab; renderAll(); autoCollapseOnMobile(); }

  // ================= sidebar =================
  const I = {
    territory: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="vertical-align:-2px"><rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor"/><rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor"/></svg>',
    trophy: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M7 4H17V9C17 12 14.8 14 12 14C9.2 14 7 12 7 9V4Z"/><path d="M7 6H4.5C4.5 9 5.5 10.5 7.3 10.8"/><path d="M17 6H19.5C19.5 9 18.5 10.5 16.7 10.8"/><path d="M12 14V17.5"/><path d="M8.5 20.5H15.5L14.8 17.5H9.2L8.5 20.5Z"/></svg>',
    shelf: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" style="vertical-align:-2px"><rect x="2" y="1.5" width="12" height="13" rx="1.2"/><path d="M2 8H14"/><path d="M5 8V5.5M8 8V4.5M11 8V6"/><path d="M5.5 14.5V12M9.5 14.5V11.5"/></svg>',
    list: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" style="vertical-align:-2px"><circle cx="3.5" cy="4" r="1"/><circle cx="3.5" cy="8" r="1"/><circle cx="3.5" cy="12" r="1"/><path d="M6.5 4H13M6.5 8H13M6.5 12H13"/></svg>',
    brush: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M5 2.5H11V5.5C11 7.5 9.7 8.8 8 8.8C6.3 8.8 5 7.5 5 5.5Z"/><path d="M8 8.8V11M5.8 13.5H10.2L9.8 11H6.2Z"/><path d="M12.5 1.5L13 2.7L14.2 3.2L13 3.7L12.5 4.9L12 3.7L10.8 3.2L12 2.7Z" fill="currentColor"/></svg>',
    trash: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 4H13M6.5 4V2.7C6.5 2.3 6.8 2 7.2 2H8.8C9.2 2 9.5 2.3 9.5 2.7V4M5 4V12.5C5 13 5.4 13.4 5.9 13.4H10.1C10.6 13.4 11 13 11 12.5V4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    notes: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M6 3H15L19 7V21H6Z"/><path d="M15 3V7H19"/><path d="M9 11H16M9 14.5H16M9 18H13"/></svg>',
    note: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M4 1.8H10L12.5 4.3V14.2H4Z"/><path d="M6 7.5H10.5M6 10H10.5"/></svg>',
    folder: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" style="vertical-align:-2px"><path d="M3 6.5C3 5.7 3.7 5 4.5 5H9L11 7H19.5C20.3 7 21 7.7 21 8.5V17.5C21 18.3 20.3 19 19.5 19H4.5C3.7 19 3 18.3 3 17.5Z"/></svg>',
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
    if (opts.chevron !== undefined) {
      const ch = el('span', 'chevron' + (opts.chevron ? ' expanded' : '') + (opts.chevron === null ? ' spacer' : ''),
        '<svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M5 3L11 8L5 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
      r.insertBefore(ch, ic);
    }
    if (opts.onAdd || opts.onDelete) {
      const acts = el('div', 'row-actions');
      if (opts.onAdd) {
        const b = el('button', null, I.plus); b.title = opts.addTitle || 'Add';
        b.addEventListener('click', e => { e.stopPropagation(); opts.onAdd(b); });
        acts.appendChild(b);
      }
      if (opts.onDelete) {
        const d = el('button', 'del-action', I.trash); d.title = 'Delete';
        d.addEventListener('click', e => { e.stopPropagation(); opts.onDelete(); });
        acts.appendChild(d);
      }
      r.appendChild(acts);
    }
    r.addEventListener('click', opts.onClick);
    return r;
  }

  window.renderExtraSidebar = function (list) {
    scheduleAch();
    const nOpen = expanded.has('__notes__');
    list.appendChild(row({
      icon: I.notes, name: 'Notes', bold: true,
      onClick: () => { if (nOpen) expanded.delete('__notes__'); else expanded.add('__notes__'); saveExpanded(); renderTree(); },
      addTitle: 'New note or folder', onAdd: b => openNotesMenu(b, null)
    }));
    if (nOpen) renderNotesTree(list, null, 1);
    const tOpen = expanded.has('__terr__');
    list.appendChild(row({
      icon: I.territory, name: 'Territory progress', bold: true,
      active: currentPage === 'territory' && !tState.boardId,
      onClick: () => { if (tOpen) expanded.delete('__terr__'); else expanded.add('__terr__'); saveExpanded(); renderTree(); },
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
      onClick: () => { if (aOpen) expanded.delete('__ach__'); else expanded.add('__ach__'); saveExpanded(); renderTree(); }
    }));
    if (aOpen) {
      list.appendChild(row({ icon: I.shelf, name: 'My achievements', indent: 27, active: currentPage === 'achievements' && aTab === 'mine', onClick: () => goAch('mine') }));
      list.appendChild(row({ icon: I.list, name: 'All achievements', indent: 27, active: currentPage === 'achievements' && aTab === 'all', onClick: () => goAch('all') }));
      list.appendChild(row({ icon: I.brush, name: 'Create trophy', indent: 27, active: currentPage === 'achievements' && aTab === 'create', onClick: () => { draft = null; goAch('create'); } }));
    }
  };

  window.renderExtraBreadcrumbs = function (bc) {
    if (currentPage !== 'territory' && currentPage !== 'achievements' && currentPage !== 'notes') return false;
    bc.innerHTML = '';
    const crumb = (text, current, onClick) => {
      const c = el('span', 'crumb' + (current ? ' current' : '')); c.textContent = text;
      if (onClick && !current) c.addEventListener('click', onClick);
      bc.appendChild(c);
    };
    const sep = () => { const s = el('span', 'crumb-sep'); s.textContent = '/'; bc.appendChild(s); };
    if (currentPage === 'notes') {
      const n = notes.find(x => x.id === nState.noteId);
      crumb('Notes', !n);
      if (n) { notePath(n).forEach(f => { sep(); crumb(f.name, false); }); sep(); crumb(n.title || 'Untitled', true); }
      return true;
    }
    if (currentPage === 'territory') {
      const b = boards.find(x => x.id === tState.boardId);
      crumb('Territory progress', !b, () => goTerritory(null));
      if (b) { sep(); crumb(b.name, true); }
    } else {
      crumb('Achievements', false, () => goAch('all'));
      sep(); crumb({ mine: 'My achievements', all: 'All achievements', create: 'Create trophy' }[aTab], true);
    }
    return true;
  };

  window.renderExtraPages = function () {
    pageT.style.display = currentPage === 'territory' ? 'block' : 'none';
    pageA.style.display = currentPage === 'achievements' ? 'block' : 'none';
    pageN.style.display = currentPage === 'notes' ? 'block' : 'none';
    if (currentPage !== 'notes') pageN.dataset.noteId = '';
    if (currentPage === 'notes') renderNote();
    else if (currentPage === 'territory') renderTerritory();
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
    emerald: ['#c4f7da', '#36be72', '#155f36'],
    netherite: ['#a597ad', '#4d4552', '#19161b']
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
    target: (c) => `<circle r="9" stroke="${c}" stroke-width="2.6" fill="none"/><circle r="4" stroke="${c}" stroke-width="2.6" fill="none"/>`,
    book: (c) => `<path d="M-11 -8C-7 -9.5 -3 -8.5 0 -6C3 -8.5 7 -9.5 11 -8V8C7 6.5 3 7.5 0 9C-3 7.5 -7 6.5 -11 8Z M0 -6V9" stroke="${c}" stroke-width="2.4" fill="none" stroke-linejoin="round"/>`,
    run: (c) => `<circle cx="3" cy="-9" r="2.6" fill="${c}"/><path d="M-7 -2L0 -5.5L4 -1L8 0M0 -5.5L-2 3L3 6L2 11M-2 3L-7 7L-11 5.5" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    bike: (c) => `<circle cx="-6.5" cy="4" r="5" stroke="${c}" stroke-width="2.2" fill="none"/><circle cx="6.5" cy="4" r="5" stroke="${c}" stroke-width="2.2" fill="none"/><path d="M-6.5 4L-2 -5H5L6.5 4M-2 -5L1 4H-6.5M3 -8H6" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    swim: (c) => `<circle cx="5" cy="-7" r="2.6" fill="${c}"/><path d="M-9 -1L-1 -6L3 -1M-12 4C-9 1.5 -6 1.5 -3 4C0 6.5 3 6.5 6 4C9 1.5 12 4 12 4M-12 9.5C-9 7 -6 7 -3 9.5C0 12 3 12 6 9.5C9 7 12 9.5 12 9.5" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    mountain: (c) => `<path d="M-12 9L-3 -7L2 1L5 -3L12 9Z" fill="${c}"/><path d="M-5.5 -2.5L-3 -7L-0.5 -2.8" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" fill="none"/>`,
    heart: (c) => `<path d="M0 9.5C0 9.5 -10.5 3.5 -10.5 -3C-10.5 -7 -7.5 -9.5 -4.5 -9.5C-2.5 -9.5 -1 -8.5 0 -6.8C1 -8.5 2.5 -9.5 4.5 -9.5C7.5 -9.5 10.5 -7 10.5 -3C10.5 3.5 0 9.5 0 9.5Z" fill="${c}"/>`,
    cap: (c) => `<path d="M-12 -3L0 -9L12 -3L0 3Z" fill="${c}"/><path d="M-7 0.5V5.5C-4 8.5 4 8.5 7 5.5V0.5M12 -3V5" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    pen: (c) => `<path d="M-9 9.5L-7.5 3L5 -9.5L9.5 -5L-3 7.5Z M2.5 -7L7 -2.5" stroke="${c}" stroke-width="2.4" fill="none" stroke-linejoin="round"/>`,
    code: (c) => `<path d="M-5 -7L-11.5 0L-5 7M5 -7L11.5 0L5 7M2 -10L-2 10" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    briefcase: (c) => `<rect x="-11" y="-5" width="22" height="14" rx="2.5" stroke="${c}" stroke-width="2.4" fill="none"/><path d="M-4 -5V-8.5H4V-5M-11 1H11" stroke="${c}" stroke-width="2.4" fill="none"/>`,
    coin: (c) => `<circle r="10.5" stroke="${c}" stroke-width="2.4" fill="none"/><text y="1" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="800" fill="${c}" font-family="-apple-system,'Segoe UI',Roboto,sans-serif">₸</text>`,
    music: (c) => `<circle cx="-5" cy="6" r="3.8" fill="${c}"/><circle cx="7" cy="3.5" r="3.8" fill="${c}"/><path d="M-1.4 6V-8L10.6 -10.5V3.5" stroke="${c}" stroke-width="2.4" fill="none"/>`,
    plane: (c) => `<path d="M-11.5 0L11.5 -9.5L4.5 10L0.5 2.5Z M0.5 2.5L11.5 -9.5" stroke="${c}" stroke-width="2.3" fill="none" stroke-linejoin="round"/>`,
    home: (c) => `<path d="M-11 0L0 -9.5L11 0M-7.5 -2.5V9.5H7.5V-2.5M-2.5 9.5V3.5H2.5V9.5" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    moon: (c) => `<path d="M3 -10.5A10.5 10.5 0 1 0 10.5 5A8.5 8.5 0 0 1 3 -10.5Z" fill="${c}"/>`,
    chat: (c) => `<path d="M-11 -8H11V4.5H-1.5L-7 9.5V4.5H-11Z" stroke="${c}" stroke-width="2.4" fill="none" stroke-linejoin="round"/>`,
    star: (c) => `<path d="M0 -11L3.2 -3.5L11 -3L5 2.3L7 10.3L0 6L-7 10.3L-5 2.3L-11 -3L-3.2 -3.5Z" fill="${c}"/>`,
    fire: (c) => `<path d="M0 -11C4.5 -6 8.5 -3 8 2C7.5 7 4 10 0 10C-4 10 -7.5 7 -8 2C-8.5 -2 -5.5 -4.5 -3.5 -8C-3 -4.5 -1.5 -3.5 0 -3C1 -5.5 1 -8 0 -11Z" fill="${c}"/>`,
    medkit: (c) => `<rect x="-10.5" y="-7.5" width="21" height="16" rx="2.5" stroke="${c}" stroke-width="2.4" fill="none"/><path d="M0 -3.5V4.5M-4 0.5H4M-3.5 -7.5V-10H3.5V-7.5" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
  };
  const EMBLEM_LIST = [
    ['dumbbell', 'Gym'], ['run', 'Running'], ['bike', 'Cycling'], ['swim', 'Swimming'], ['mountain', 'Hiking'],
    ['heart', 'Health'], ['medkit', 'Recovery'], ['moon', 'Sleep'], ['scale', 'Weight'], ['book', 'Reading'],
    ['cap', 'Study'], ['pen', 'Writing'], ['chat', 'Languages'], ['code', 'Code'], ['briefcase', 'Work'],
    ['coin', 'Money'], ['music', 'Music'], ['plane', 'Travel'], ['home', 'Home'], ['fire', 'Fire'],
    ['bolt', 'Energy'], ['star', 'Star'], ['crown', 'Crown'], ['target', 'Goal'], ['check', 'Done'],
    ['clock', 'Time'], ['flag', 'Finish'], ['up', 'Growth']
  ];
  const MATERIALS = [['bronze', 'Bronze'], ['silver', 'Silver'], ['gold', 'Gold'], ['diamond', 'Diamond'], ['netherite', 'Netherite']];
  const RIBBONS = { bronze: ['#8a4b22', '#c47a3d'], silver: ['#3f5fd6', '#8fa3b8'], gold: ['#c8102e', '#f0bd2a'], diamond: ['#1f5fc8', '#62c9ff'],
    netherite: ['#3a2d44', '#7a4fa0'], ruby: ['#7d1717', '#e04848'], emerald: ['#155f36', '#36be72'], platinum: ['#3f7f97', '#a6dbe9'] };
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
      const rb = RIBBONS[o.metal] || ['#3f5fd6', '#e03e3e'];
      body = `<path d="M34 8H48L56 44H42Z" fill="${o.ribbon || rb[0]}"/><path d="M66 8H52L44 44H58Z" fill="${o.ribbon2 || rb[1]}"/>
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

    { id: 'pr', cat: 'Gym', name: 'New record', desc: 'Beat your best result in a tracked exercise.', art: { shape: 'cup', metal: 'ruby', label: 'PR' },
      calc: () => { const events = [];
        allGymPEx.forEach(ex => { let max = null;
          allGymPLogs.filter(l => l.exerciseId === ex.id).sort((a, b) => a.date - b.date).forEach(l => {
            const v = +l.value; if (max !== null && v > max) events.push({ day: tsDay(l.date), ctx: ex.name + ': ' + v }); if (max === null || v > max) max = v; }); });
        events.sort((a, b) => a.day < b.day ? -1 : 1);
        return { events, progress: { cur: 0, target: 1, label: 'Log a result above your best' } }; } }
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
  function renderAchievements() {
    const res = computeAll();
    pageA.innerHTML = '';
    const head = el('div', 'x-head');
    const tabs = el('div', 'tab-row'); tabs.style.margin = '0';
    [['mine', 'My achievements'], ['all', 'All achievements'], ['create', 'Create trophy']].forEach(([id, l]) => {
      const t = el('button', 'tab-btn' + (aTab === id ? ' active' : '')); t.textContent = l;
      t.addEventListener('click', () => { if (id === 'create') draft = null; goAch(id); }); tabs.appendChild(t);
    });
    head.appendChild(tabs);
    pageA.appendChild(head);
    if (aTab === 'mine') renderCabinet(res);
    else if (aTab === 'create') renderCreate();
    else renderCatalog(res);
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
        card.addEventListener('click', () => openDetail('a:' + r.a.id));
        list.appendChild(card);
      });
      g.appendChild(list);
      pageA.appendChild(g);
    });
  }

  // ---------- cabinet with free placement ----------
  const PER_SHELF = 6;
  function shelfItems(res) {
    const items = [];
    res.filter(r => r.events.length).forEach(r => items.push({ key: 'a:' + r.a.id, name: r.a.name, art: r.a.art, count: r.events.length, first: r.events[0].day }));
    customs.forEach(c => items.push({ key: 'c:' + c.id, name: c.name || 'Trophy', art: customArt(c), count: 1, first: c.date || tsDay(c.createdAt), custom: true }));
    items.sort((a, b) => (a.first < b.first ? -1 : a.first > b.first ? 1 : 0));
    const placed = {}, taken = new Set();
    items.forEach(it => { const s = shelfLayout[it.key]; if (Number.isInteger(s) && s >= 0 && !taken.has(s)) { placed[it.key] = s; taken.add(s); } });
    let next = 0;
    items.forEach(it => { if (placed[it.key] === undefined) { while (taken.has(next)) next++; placed[it.key] = next; taken.add(next); } });
    return { items, placed };
  }
  function saveLayout(placed) {
    shelfLayout = { ...placed };
    settingsCol.doc('shelf').set({ k: 'shelf', slots: shelfLayout });
  }
  function moveTo(key, slot) {
    const { placed } = shelfItems(achCache || computeAll());
    const from = placed[key];
    if (from === undefined || from === slot) return;
    const occupant = Object.keys(placed).find(k => placed[k] === slot);
    placed[key] = slot;
    if (occupant) placed[occupant] = from;
    saveLayout(placed);
  }

  function renderCabinet(res) {
    const { items, placed } = shelfItems(res);
    const bar = el('div', 'cab-bar');
    const info = el('span', 't-hint');
    info.textContent = arranging ? 'Drag a trophy to any spot, or tap a trophy and then tap where it should go.'
      : items.length + ' trophies on the shelf.';
    const arr = el('button', 'x-btn' + (arranging ? ' primary' : '')); arr.textContent = arranging ? 'Done' : 'Arrange';
    arr.addEventListener('click', () => { arranging = !arranging; selectedKey = null; renderAchievements(); });
    bar.appendChild(info); if (items.length) bar.appendChild(arr);
    pageA.appendChild(bar);

    const cab = el('div', 'cab' + (arranging ? ' arranging' : ''));
    cab.appendChild(el('div', 'cab-top'));
    const inner = el('div', 'cab-inner');
    cab.appendChild(inner);
    pageA.appendChild(cab);

    const maxSlot = Object.values(placed).reduce((m, v) => Math.max(m, v), -1);
    const shelves = Math.max(3, Math.ceil((maxSlot + 1) / PER_SHELF) + (arranging ? 1 : 0));
    const bySlot = {};
    items.forEach(it => { bySlot[placed[it.key]] = it; });
    for (let sh = 0; sh < shelves; sh++) {
      const shelf = el('div', 'shelf');
      const row = el('div', 'shelf-items');
      for (let k = 0; k < PER_SHELF; k++) {
        const idx = sh * PER_SHELF + k;
        const slot = el('div', 'slot'); slot.dataset.slot = idx;
        const it = bySlot[idx];
        if (it) {
          const t = el('button', 'trophy' + (selectedKey === it.key ? ' selected' : ''));
          t.dataset.key = it.key;
          t.setAttribute('aria-label', it.name + (it.count > 1 ? ', earned ' + it.count + ' times' : ''));
          t.innerHTML = (it.count > 1 ? '<span class="trophy-count">×' + it.count + '</span>' : '') +
            '<span class="trophy-tip">' + esc(it.name) + '</span>' + trophySVG(it.art, 66);
          t.addEventListener('click', () => { if (!arranging) openDetail(it.key); });
          slot.appendChild(t);
        }
        row.appendChild(slot);
      }
      if (!items.length && sh === 1) {
        const n = el('div', 'shelf-note'); n.textContent = 'Empty for now. Your trophies will stand here.'; row.appendChild(n);
      }
      shelf.appendChild(row);
      shelf.appendChild(el('div', 'plank'));
      inner.appendChild(shelf);
    }
    const earnedCount = res.filter(r => r.events.length).length;
    const foot = el('div', 't-hint'); foot.style.marginTop = '14px';
    foot.textContent = earnedCount + ' of ' + ACH.length + ' achievements earned' + (customs.length ? ', ' + customs.length + ' custom trophies' : '') + '.';
    pageA.appendChild(foot);
    if (arranging) bindArrange(cab);
  }

  function bindArrange(cab) {
    cab.addEventListener('pointerdown', e => {
      const slot = e.target.closest('.slot'); if (!slot) return;
      const t = e.target.closest('.trophy');
      if (!t) {
        if (selectedKey) { const k = selectedKey; selectedKey = null; moveTo(k, +slot.dataset.slot); renderAchievements(); }
        return;
      }
      e.preventDefault();
      dragState = { key: t.dataset.key, x: e.clientX, y: e.clientY, moved: false, el: t, ghost: null, over: null };
      try { t.setPointerCapture(e.pointerId); } catch (err) {}
    });
  }
  window.addEventListener('pointermove', e => {
    const d = dragState; if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return;
    if (!d.moved) {
      d.moved = true;
      d.ghost = el('div', 'drag-ghost', d.el.querySelector('svg').outerHTML);
      document.body.appendChild(d.ghost);
      d.el.classList.add('lifted');
    }
    d.ghost.style.transform = 'translate(' + (e.clientX - 33) + 'px,' + (e.clientY - 60) + 'px)';
    const under = document.elementFromPoint(e.clientX, e.clientY);
    const slot = under && under.closest && under.closest('.cab .slot');
    if (d.over && d.over !== slot) d.over.classList.remove('drop');
    if (slot) slot.classList.add('drop');
    d.over = slot;
  });
  function endDrag() {
    const d = dragState; if (!d) return;
    dragState = null;
    if (d.ghost) d.ghost.remove();
    if (d.moved) {
      if (d.over) moveTo(d.key, +d.over.dataset.slot);
      selectedKey = null;
    } else if (selectedKey === d.key) selectedKey = null;
    else if (selectedKey) { const target = shelfItems(achCache || computeAll()).placed[d.key]; const k = selectedKey; selectedKey = null; moveTo(k, target); }
    else selectedKey = d.key;
    renderAchievements();
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', () => { if (dragState) { if (dragState.ghost) dragState.ghost.remove(); dragState = null; renderAchievements(); } });

  // ---------- custom trophy builder ----------
  function customArt(c) {
    return { shape: c.shape || 'cup', metal: c.metal || 'gold', emblem: c.label ? null : (c.emblem || 'star'), label: c.label || '', flame: c.shape === 'cup' && c.flame ? 1 : 0 };
  }
  function renderCreate() {
    if (!draft) draft = { id: null, name: '', desc: '', date: dayStr(), shape: 'cup', emblem: 'dumbbell', label: '', metal: 'gold', flame: false };
    const wrap = el('div', 'cr-wrap');
    const prev = el('div', 'cr-preview');
    const stage = el('div', 'cr-stage');
    const plank = el('div', 'plank'); plank.style.margin = '0';
    prev.appendChild(stage); prev.appendChild(plank);
    const prevName = el('div', 'cr-prev-name');
    prev.appendChild(prevName);
    const form = el('div', 'cr-form');
    wrap.appendChild(prev); wrap.appendChild(form);
    pageA.appendChild(wrap);

    const refresh = () => {
      stage.innerHTML = trophySVG(customArt(draft), 150);
      prevName.textContent = draft.name || 'Your trophy';
      form.querySelectorAll('[data-shape]').forEach(b => b.classList.toggle('on', b.dataset.shape === draft.shape));
      form.querySelectorAll('[data-emblem]').forEach(b => b.classList.toggle('on', !draft.label && b.dataset.emblem === draft.emblem));
      form.querySelectorAll('[data-metal]').forEach(b => b.classList.toggle('on', b.dataset.metal === draft.metal));
      flameRow.style.display = draft.shape === 'cup' ? '' : 'none';
    };
    const field = (label, node) => { const l = el('label', 'cr-field'); const s = el('span'); s.textContent = label; l.appendChild(s); l.appendChild(node); form.appendChild(l); return node; };

    const nameIn = field('Name', el('input')); nameIn.maxLength = 40; nameIn.placeholder = 'e.g. First half marathon'; nameIn.value = draft.name;
    nameIn.addEventListener('input', () => { draft.name = nameIn.value; refresh(); });
    const descIn = field('What it is for (optional)', el('input')); descIn.maxLength = 120; descIn.value = draft.desc;
    descIn.addEventListener('input', () => { draft.desc = descIn.value; });
    const dateIn = field('Date', el('input')); dateIn.type = 'date'; dateIn.value = draft.date;
    dateIn.addEventListener('change', () => { draft.date = dateIn.value || dayStr(); });

    const sec = t => { const h = el('div', 'cr-sec'); h.textContent = t; form.appendChild(h); };
    sec('Shape');
    const shapes = el('div', 'cr-row');
    [['cup', 'Cup'], ['medal', 'Medal'], ['star', 'Star'], ['shield', 'Shield']].forEach(([id, l]) => {
      const b = el('button', 'cr-opt'); b.dataset.shape = id; b.title = l;
      b.innerHTML = trophySVG({ shape: id, metal: draft.metal }, 34) + '<small>' + l + '</small>';
      b.addEventListener('click', () => { draft.shape = id; refresh(); });
      shapes.appendChild(b);
    });
    form.appendChild(shapes);

    sec('Symbol');
    const embl = el('div', 'cr-emblems');
    EMBLEM_LIST.forEach(([id, l]) => {
      const b = el('button', 'cr-emb'); b.dataset.emblem = id; b.title = l; b.setAttribute('aria-label', l);
      b.innerHTML = `<svg width="26" height="26" viewBox="-14 -14 28 28">${EMBLEMS[id]('currentColor')}</svg>`;
      b.addEventListener('click', () => { draft.emblem = id; draft.label = ''; labelIn.value = ''; refresh(); });
      embl.appendChild(b);
    });
    form.appendChild(embl);
    const labelIn = field('Or text instead of a symbol (up to 3 characters)', el('input'));
    labelIn.maxLength = 3; labelIn.placeholder = '42'; labelIn.value = draft.label;
    labelIn.addEventListener('input', () => { draft.label = labelIn.value.trim(); refresh(); });

    sec('Material');
    const mats = el('div', 'cr-row');
    MATERIALS.forEach(([id, l]) => {
      const m = METALS[id];
      const b = el('button', 'cr-mat'); b.dataset.metal = id;
      b.innerHTML = `<i style="background:linear-gradient(135deg,${m[0]},${m[1]} 55%,${m[2]})"></i><small>${l}</small>`;
      b.addEventListener('click', () => {
        draft.metal = id;
        shapes.querySelectorAll('.cr-opt').forEach(o => { o.innerHTML = trophySVG({ shape: o.dataset.shape, metal: id }, 34) + '<small>' + o.title + '</small>'; });
        refresh();
      });
      mats.appendChild(b);
    });
    form.appendChild(mats);

    const flameRow = el('label', 'cr-check');
    const fl = el('input'); fl.type = 'checkbox'; fl.checked = !!draft.flame;
    fl.addEventListener('change', () => { draft.flame = fl.checked; refresh(); });
    flameRow.appendChild(fl); flameRow.appendChild(document.createTextNode(' Add a flame on top'));
    form.appendChild(flameRow);

    const actions = el('div', 'cr-actions');
    const save = el('button', 'x-btn primary'); save.textContent = draft.id ? 'Save changes' : 'Put on the shelf';
    save.addEventListener('click', () => {
      if (!draft.name.trim()) { nameIn.focus(); nameIn.classList.add('err'); return; }
      const data = { name: draft.name.trim(), desc: draft.desc.trim(), date: draft.date, shape: draft.shape, emblem: draft.emblem, label: draft.label, metal: draft.metal, flame: !!draft.flame };
      if (draft.id) customCol.doc(draft.id).update(data);
      else customCol.add({ ...data, createdAt: Date.now() });
      draft = null; goAch('mine');
    });
    actions.appendChild(save);
    if (draft.id) {
      const del = el('button', 'x-btn ghost-danger'); del.textContent = 'Delete';
      del.addEventListener('click', () => { if (confirm('Delete this trophy?')) { customCol.doc(draft.id).delete(); draft = null; goAch('mine'); } });
      const cancel = el('button', 'x-btn'); cancel.textContent = 'Cancel';
      cancel.addEventListener('click', () => { draft = null; goAch('mine'); });
      actions.appendChild(cancel); actions.appendChild(del);
    }
    form.appendChild(actions);
    refresh();
  }

  // ---------- detail ----------
  function openDetail(key) {
    if (key.startsWith('c:')) return openCustomDetail(key.slice(2));
    const id = key.replace(/^a:/, '');
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
  function openCustomDetail(id) {
    const c = customs.find(x => x.id === id); if (!c) return;
    modal.innerHTML = `<div class="a-m-card" role="dialog" aria-label="${esc(c.name)}">
      <div class="a-m-top">${trophySVG(customArt(c), 96)}<div><p class="a-m-name">${esc(c.name)}</p>
      <p class="a-m-desc">${esc(c.desc || 'Custom trophy')}</p></div></div>
      <div class="a-m-stats"><div><b>${fmtDay(c.date || tsDay(c.createdAt))}</b><span>Date</span></div>
      <div><b>${esc((MATERIALS.find(m => m[0] === c.metal) || ['', 'Gold'])[1])}</b><span>Material</span></div><div><b>Custom</b><span>Type</span></div></div>
      <div class="cr-actions"><button class="x-btn" id="a-m-edit">Edit</button><button class="x-btn ghost-danger" id="a-m-del">Delete</button><span style="flex:1"></span><button class="x-btn" id="a-m-close">Close</button></div></div>`;
    modal.querySelector('#a-m-close').addEventListener('click', () => modal.classList.remove('open'));
    modal.querySelector('#a-m-edit').addEventListener('click', () => {
      modal.classList.remove('open');
      draft = { id: c.id, name: c.name || '', desc: c.desc || '', date: c.date || dayStr(), shape: c.shape || 'cup', emblem: c.emblem || 'star', label: c.label || '', metal: c.metal || 'gold', flame: !!c.flame };
      goAch('create');
    });
    modal.querySelector('#a-m-del').addEventListener('click', () => { if (confirm('Delete this trophy?')) { customCol.doc(c.id).delete(); modal.classList.remove('open'); } });
    modal.classList.add('open');
  }

  // ================= settings + themes =================
  const THEMES = [
    { id: 'light', name: 'Light', c: ['#f6f5f2', '#ffffff', '#1c1e22', '#1d40c4'] },
    { id: 'dark', name: 'Dark', c: ['#121317', '#191b20', '#0e0f12', '#3f5fd6'] },
    { id: 'blood', name: 'Blood', c: ['#140708', '#1e0b0d', '#0c0405', '#c8102e'] },
    { id: 'skyrim', name: 'Skyrim', c: ['#16140f', '#201d17', '#0e0d0a', '#b8975a'] }
  ];
  function applyTheme(id) {
    if (id) document.documentElement.setAttribute('data-theme', id); else document.documentElement.removeAttribute('data-theme');
    try { id ? localStorage.setItem('tgr_theme', id) : localStorage.removeItem('tgr_theme'); } catch (e) {}
    if (id === 'skyrim' && !document.getElementById('skyrim-fonts')) {
      const l = document.createElement('link'); l.id = 'skyrim-fonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Jost:wght@400;500;600;700&display=swap';
      document.head.appendChild(l);
    }
    const t = THEMES.find(x => x.id === id);
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => { if (t) m.setAttribute('content', t.c[0]); else m.setAttribute('content', m.media && m.media.includes('dark') ? '#121317' : '#f6f5f2'); });
  }
  applyTheme((() => { try { return localStorage.getItem('tgr_theme'); } catch (e) { return null; } })());

  const APP_VERSION = '5';
  async function checkForUpdates(btn, msg) {
    btn.disabled = true; btn.textContent = 'Checking...';
    try {
      const r = await fetch('./index.html?check=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error();
    } catch (e) {
      btn.disabled = false; btn.textContent = 'Check for updates';
      msg.textContent = 'No connection. Try again when you are online.';
      return;
    }
    try {
      const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
      if (reg) await reg.update().catch(() => {});
      if (window.caches) { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); }
    } catch (e) {}
    btn.textContent = 'Reloading...';
    location.reload();
  }
  const setModal = el('div'); setModal.id = 'set-modal'; document.body.appendChild(setModal);
  setModal.addEventListener('click', e => { if (e.target === setModal) setModal.classList.remove('open'); });
  function openSettings() {
    const cur = document.documentElement.getAttribute('data-theme');
    setModal.innerHTML = `<div class="a-m-card" role="dialog" aria-label="Settings"><p class="a-m-name">Settings</p>
      <p class="a-m-sub" style="margin:0">Theme</p><div class="th-grid"></div>
      <button class="th-system${cur ? '' : ' on'}">Match my device (light or dark)</button>
      <p class="a-m-sub" style="margin:4px 0 0">Sync</p>
      <button class="x-btn" id="set-sync" style="text-align:left">Sync with GitHub</button>
      <p class="a-m-sub" style="margin:4px 0 0">App</p>
      <button class="x-btn" id="set-update" style="text-align:left">Check for updates</button>
      <span class="t-hint" id="set-update-msg">Version ${APP_VERSION}</span>
      <button class="x-btn" id="set-close">Close</button></div>`;
    const grid = setModal.querySelector('.th-grid');
    THEMES.forEach(t => {
      const b = el('button', 'th-card' + (cur === t.id ? ' on' : ''));
      b.innerHTML = `<span class="th-prev" style="background:${t.c[0]}"><i style="background:${t.c[2]}"></i><em style="background:${t.c[1]}"><u style="background:${t.c[3]}"></u></em></span><b>${t.name}</b>`;
      b.addEventListener('click', () => { applyTheme(t.id); openSettings(); });
      grid.appendChild(b);
    });
    setModal.querySelector('.th-system').addEventListener('click', () => { applyTheme(null); openSettings(); });
    setModal.querySelector('#set-sync').addEventListener('click', () => { setModal.classList.remove('open'); document.getElementById('sync-btn').click(); });
    setModal.querySelector('#set-close').addEventListener('click', () => setModal.classList.remove('open'));
    setModal.querySelector('#set-update').addEventListener('click', e => checkForUpdates(e.currentTarget, setModal.querySelector('#set-update-msg')));
    setModal.classList.add('open');
  }
  const gear = el('button', 'icon-btn', '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>');
  gear.id = 'settings-btn'; gear.title = 'Settings';
  gear.addEventListener('click', openSettings);
  const hb = document.querySelector('#sidebar-header .header-btns');
  if (hb) hb.insertBefore(gear, hb.firstChild);

  renderAll();
})();
