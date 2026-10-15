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
  .wg-card { max-width: 440px; }
  .wg-folders { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: 10px; max-height: 230px; overflow-y: auto; flex-shrink: 0; }
  .wg-f { display: flex; align-items: center; gap: 10px; padding: 9px 10px; font-size: 14px; border-bottom: 1px solid var(--border); cursor: pointer; min-width: 0; }
  .wg-f:last-child { border-bottom: none; }
  .wg-f input { width: 17px; height: 17px; margin: 0; flex-shrink: 0; accent-color: var(--accent); }
  .wg-f span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .wg-all { font-weight: 600; }
  .wg-steps { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 7px; font-size: 13.5px; line-height: 1.45; }
  .wg-steps a { color: var(--accent); }
  .wg-manual { width: 100%; height: 130px; flex-shrink: 0; resize: vertical; font: 11px/1.35 ui-monospace, Menlo, monospace; background: var(--bg); color: var(--text);
    border: 1px solid var(--border); border-radius: 8px; padding: 8px; }
  .wg-manual[hidden] { display: none; }

  /* themes */
  :root[data-theme="blood"] {
    --bg: #0b0b0c; --bg-elevated: #141416; --sidebar-bg: #060607; --sidebar-text: #d9d9dc; --sidebar-text-dim: #6c6c72;
    --sidebar-active: #1c1c1f; --sidebar-hover: #111113; --text: #ececee; --text-dim: #8a8a90; --accent: #c8102e; --accent-soft: #2a0d12;
    --border: #232326; --danger: #ff6b6b; --popover-bg: #18181b; color-scheme: dark;
  }
  :root[data-theme="blood"] #sidebar { box-shadow: inset -1px 0 0 #1c1c1f; }

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
  #page-notes { position: relative; }
  .n-tools { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
  .n-photo-btn { display: inline-flex; align-items: center; gap: 7px; }
  .n-photo-btn svg { flex-shrink: 0; }
  .n-body { position: relative; display: flow-root; min-height: 260px; padding: 0 0 72px; outline: none; color: var(--text); cursor: text;
    font-family: inherit; font-size: 16px; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; -webkit-tap-highlight-color: transparent; }
  .n-body.empty::before { content: attr(data-ph); position: absolute; left: 0; top: 0; color: var(--text-dim); opacity: .7; pointer-events: none; }
  .n-img { display: block; position: relative; clear: both; line-height: 0; cursor: grab; border-radius: 10px; max-width: 100%;
    user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }
  .n-img.fl { float: left; clear: none; }
  .n-img.fr { float: right; clear: none; }
  .n-img img { display: block; width: 100%; height: auto; border-radius: 10px; pointer-events: none;
    user-select: none; -webkit-user-select: none; -webkit-user-drag: none; -webkit-touch-callout: none; }
  .n-img.loading, .n-img.missing { background: color-mix(in srgb, var(--text) 7%, transparent); }
  .n-img.missing img { visibility: hidden; }
  .n-img.missing::after { content: 'Photo is not downloaded yet'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    padding: 6px; font-size: 12px; line-height: 1.3; text-align: center; color: var(--text-dim); }
  .n-img.sel { touch-action: none; }
  .n-img.ghosted { opacity: .28; pointer-events: none; }
  .n-sel { position: absolute; z-index: 6; pointer-events: none; border: 2px solid var(--accent); border-radius: 12px; }
  .n-h { position: absolute; width: 16px; height: 16px; border-radius: 50%; background: #fff; border: 2px solid var(--accent);
    box-shadow: 0 1px 4px rgba(0,0,0,.35); pointer-events: auto; touch-action: none; }
  .n-h::after { content: ''; position: absolute; inset: -12px; border-radius: 50%; }
  .n-h.tl { left: -9px; top: -9px; cursor: nwse-resize; }
  .n-h.tr { right: -9px; top: -9px; cursor: nesw-resize; }
  .n-h.bl { left: -9px; bottom: -9px; cursor: nesw-resize; }
  .n-h.br { right: -9px; bottom: -9px; cursor: nwse-resize; }
  .n-tb { position: absolute; left: 0; top: 10px; display: flex; align-items: center; gap: 2px; padding: 4px;
    border-radius: 11px; background: rgba(22,23,27,.9); border: 1px solid rgba(255,255,255,.1); box-shadow: 0 6px 18px rgba(0,0,0,.32);
    pointer-events: auto; white-space: nowrap; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
  .n-tb.out { top: auto; bottom: -50px; }
  .n-tb button { width: 36px; height: 34px; border: none; background: none; color: #d9dbe0; border-radius: 8px; padding: 0; cursor: pointer;
    display: flex; align-items: center; justify-content: center; }
  .n-tb button:hover { background: rgba(255,255,255,.12); color: #fff; }
  .n-tb button.on { background: rgba(255,255,255,.2); color: #fff; }
  .n-tb button.danger { color: #ff7b7b; }
  .n-tb i { width: 1px; align-self: stretch; margin: 6px 3px; background: rgba(255,255,255,.18); }
  .n-size { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); padding: 5px 10px; border-radius: 8px;
    background: rgba(22,23,27,.88); color: #fff; font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; pointer-events: none; }
  .n-ghost { position: fixed; left: 0; top: 0; z-index: 2000; pointer-events: none; border-radius: 8px; opacity: .92;
    box-shadow: 0 14px 34px rgba(0,0,0,.38); object-fit: cover; background: var(--bg-elevated); }
  .n-drop { position: fixed; z-index: 1999; pointer-events: none; border: 2px dashed var(--accent); border-radius: 10px;
    background: color-mix(in srgb, var(--accent) 14%, transparent); }
  .n-fcaret { position: fixed; z-index: 1999; height: 3px; border-radius: 2px; background: var(--accent); pointer-events: none; }
  body.n-dragging, body.n-dragging * { cursor: grabbing !important; user-select: none !important; -webkit-user-select: none !important; }
  @media (max-width: 520px) { .n-photo-btn span { display: none; } .n-photo-btn { padding: 9px 11px; } }
  #n-menu { position: fixed; z-index: 1000; background: var(--popover-bg); border: 1px solid rgba(255,255,255,.1); border-radius: 10px;
    padding: 5px; display: none; flex-direction: column; min-width: 160px; box-shadow: 0 8px 24px rgba(0,0,0,.35); }
  #n-menu.open { display: flex; }
  #n-menu button { display: flex; align-items: center; gap: 8px; background: none; border: none; color: #e6e7ea; font-size: 13.5px;
    padding: 8px 10px; border-radius: 7px; cursor: pointer; text-align: left; font-family: inherit; }
  #n-menu button:hover { background: rgba(255,255,255,.08); }
  .tree-row .row-actions { display: none !important; }
  .tree-row { -webkit-touch-callout: none; }
  #n-menu button.danger { color: #ef6a6a; }
  .row-more { background: none; border: none; color: var(--sidebar-text-dim); width: 24px; height: 22px; border-radius: 6px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: .45; padding: 0; margin-left: 2px; }
  .tree-row:hover .row-more, .row-more:focus-visible { opacity: 1; }
  .row-more:hover { background: rgba(255,255,255,.12); color: #fff; }
  #n-menu button svg { flex-shrink: 0; opacity: .8; }
  :root[data-theme="skyrim"] .n-title { font-family: 'Cinzel', Georgia, serif; }

  /* levels */
  #page-levels { max-width: 720px; }
  .lv-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
  .lv-card { display: flex; gap: 12px; align-items: center; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 14px;
    padding: 12px 14px; cursor: pointer; text-align: left; color: var(--text); font-family: inherit; }
  .lv-card:hover { border-color: var(--accent); }
  .lv-card-body { flex: 1; min-width: 0; }
  .lv-card-name { display: flex; gap: 6px; align-items: center; font-weight: 700; font-size: 15px; }
  .lv-rank { font-size: 12px; color: var(--text-dim); font-weight: 600; letter-spacing: .04em; text-transform: uppercase; margin: 2px 0 7px; }
  .lv-rank.big { font-size: 13px; margin: 0 0 8px; }
  .lv-hero { display: flex; gap: 20px; align-items: center; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 16px;
    padding: 18px 20px; margin-bottom: 14px; }
  .lv-hero-body { flex: 1; min-width: 0; }
  .lv-bar { height: 10px; border-radius: 6px; background: var(--border); overflow: hidden; }
  .lv-bar i { display: block; height: 100%; border-radius: 6px; background: var(--lv); transition: width .4s ease; }
  .lv-next { font-size: 13px; color: var(--text-dim); margin: 6px 0 12px; font-variant-numeric: tabular-nums; }
  .lv-mini { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .lv-mini div { background: var(--bg); border-radius: 10px; padding: 8px 10px; }
  .lv-mini b { display: block; font-size: 17px; font-variant-numeric: tabular-nums; }
  .lv-mini span { font-size: 11.5px; color: var(--text-dim); }
  .lv-sec { font-size: 13px; font-weight: 600; color: var(--text-dim); margin: 0 0 8px; }
  .lv-srcs { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
  .lv-src { display: flex; gap: 12px; align-items: center; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; }
  .lv-src-main { flex: 1; min-width: 0; }
  .lv-src-main b { display: block; font-size: 14px; }
  .lv-src-main span { font-size: 12px; color: var(--text-dim); }
  .lv-xp { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .lv-xp input { width: 58px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 6px 8px; color: var(--text);
    font-size: 14px; font-weight: 700; font-family: inherit; outline: none; text-align: center; }
  .lv-xp input:focus { border-color: var(--accent); }
  .lv-xp small { font-size: 11.5px; color: var(--text-dim); max-width: 64px; line-height: 1.2; }
  .lv-earned { font-weight: 700; font-size: 13.5px; min-width: 64px; text-align: right; font-variant-numeric: tabular-nums; }
  .lv-rm { background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 6px; border-radius: 6px; display: flex; }
  .lv-rm:hover { color: var(--danger); background: var(--accent-soft); }
  .lv-add { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; background: var(--bg-elevated); border: 1px dashed var(--border);
    border-radius: 12px; padding: 12px; margin-bottom: 22px; }
  .lv-add select { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; color: var(--text);
    font-size: 14px; font-family: inherit; max-width: 100%; }
  .lv-plus { font-style: normal; color: #33c27a; font-weight: 700; }
  @media (max-width: 560px) {
    .lv-hero { flex-direction: column; align-items: stretch; text-align: left; }
    .lv-hero > svg { align-self: center; }
    .lv-src { flex-wrap: wrap; }
    .lv-src-main { flex-basis: 100%; }
    .lv-earned { margin-left: auto; }
  }

  /* profile */
  #prof-card { display: flex; align-items: center; gap: 10px; margin: 12px 8px 2px; padding: 8px 8px; border-radius: 10px; cursor: pointer; flex-shrink: 0; }
  #prof-card:hover, #prof-card.active { background: var(--sidebar-active); }
  #prof-card + #sidebar-header { padding-top: 8px; }
  .prof-av { border-radius: 50%; object-fit: cover; flex-shrink: 0; display: block; }
  .prof-av-empty { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--accent), #9b5de5);
    color: #fff; font-weight: 800; }
  .prof-meta { display: flex; flex-direction: column; min-width: 0; }
  .prof-meta b { color: var(--sidebar-text); font-size: 14.5px; }
  .prof-meta span { color: var(--sidebar-text-dim); font-size: 11.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  #page-profile { max-width: 640px; }
  .prof-top { display: flex; gap: 22px; align-items: center; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 18px; padding: 22px; }
  .prof-av-btn { position: relative; background: none; border: none; padding: 0; cursor: pointer; border-radius: 50%; flex-shrink: 0; }
  .prof-av-btn .prof-av { box-shadow: 0 0 0 3px var(--bg-elevated), 0 0 0 5px var(--accent); }
  .prof-cam { position: absolute; right: -2px; bottom: -2px; width: 32px; height: 32px; border-radius: 50%; background: var(--accent); color: #fff;
    display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 3px var(--bg-elevated); }
  .prof-info { flex: 1; min-width: 0; }
  .prof-info h1 { margin: 0 0 2px; font-size: 28px; }
  .prof-stats { display: flex; gap: 8px; margin-top: 4px; }
  .prof-stats div { background: var(--bg); border-radius: 10px; padding: 7px 12px; }
  .prof-stats b { display: block; font-size: 16px; font-variant-numeric: tabular-nums; }
  .prof-stats span { font-size: 11.5px; color: var(--text-dim); }
  .prof-rm { background: none; border: none; color: var(--text-dim); font-size: 12.5px; cursor: pointer; margin-top: 8px; padding: 4px 2px; font-family: inherit; }
  .prof-rm:hover { color: var(--danger); }
  .prof-levels { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; }
  .prof-lv { display: flex; gap: 12px; align-items: center; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 14px; padding: 12px 14px; }
  :root[data-theme="skyrim"] .prof-info h1, :root[data-theme="skyrim"] .prof-meta b { font-family: 'Cinzel', Georgia, serif; letter-spacing: .05em; }
  @media (max-width: 520px) { .prof-top { flex-direction: column; text-align: center; } .prof-stats { justify-content: center; } }

  :root[data-theme="wayne"] {
    --bg: #0a0b0d; --bg-elevated: #131518; --sidebar-bg: #050607; --sidebar-text: #d6d9de; --sidebar-text-dim: #6a7079;
    --sidebar-active: #1a1d22; --sidebar-hover: #0f1114; --text: #e4e7eb; --text-dim: #868c95; --accent: #9fb0c3; --accent-soft: #1b2129;
    --border: #22262c; --danger: #d9534f; --popover-bg: #15171b; color-scheme: dark;
  }
  :root[data-theme="wayne"] #main { background: radial-gradient(1000px 500px at 50% -15%, #1a1e24 0%, transparent 60%), linear-gradient(180deg, #0c0d10, #070809); }
  :root[data-theme="wayne"] #sidebar { box-shadow: inset -1px 0 0 #1a1d22; }
  :root[data-theme="wayne"] .x-title, :root[data-theme="wayne"] .pl-title, :root[data-theme="wayne"] .prof-info h1,
  :root[data-theme="wayne"] .crumb.current, :root[data-theme="wayne"] #sidebar-title { letter-spacing: .06em; text-transform: uppercase; }
  :root[data-theme="wayne"] #add-btn, :root[data-theme="wayne"] #weight-add-btn, :root[data-theme="wayne"] .x-btn.primary,
  :root[data-theme="wayne"] .tab-btn.active, :root[data-theme="wayne"] .pl-add, :root[data-theme="wayne"] .sync-actions button.primary,
  :root[data-theme="wayne"] .prof-cam, :root[data-theme="wayne"] button[style*="var(--accent)"] { color: #0a0b0d !important; }
  :root[data-theme="wayne"] .pl-card, :root[data-theme="wayne"] .lv-hero, :root[data-theme="wayne"] .prof-top, :root[data-theme="wayne"] .t-card,
  :root[data-theme="wayne"] .task { background: linear-gradient(160deg, #16191d, #101215); box-shadow: inset 0 1px 0 rgba(255,255,255,.035); }

  /* background image setting */
  body.has-bgimg #main { background: var(--bg); }
  #bg-layer { opacity: var(--bg-img-op, .16); }
  body.has-bgimg #bg-layer::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, var(--bg) 100%); }
  body.has-bgimg .task, body.has-bgimg .pl-card, body.has-bgimg .lv-hero, body.has-bgimg .prof-top, body.has-bgimg #weight-chart-wrap {
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
  .bg-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .bg-row input[type=range] { flex: 1; min-width: 120px; accent-color: var(--accent); }

  /* finance + excel viewer */
  #page-finance { max-width: 720px; }
  #page-xls { max-width: 1100px; }
  .xv-title { overflow-wrap: anywhere; font-size: 20px; }
  .fin-folders { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; margin-bottom: 14px; }
  .fin-folder { display: flex; align-items: center; gap: 8px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px;
    padding: 12px; color: var(--text); font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; text-align: left; }
  .fin-folder span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .fin-folder small { color: var(--text-dim); font-weight: 500; }
  .fin-folder:hover, .fin-file:hover { border-color: var(--accent); }
  .fin-files { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .fin-file { display: flex; align-items: center; gap: 12px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px;
    padding: 10px 12px; color: var(--text); font-family: inherit; cursor: pointer; text-align: left; }
  .fin-ic { width: 34px; height: 34px; border-radius: 9px; background: rgba(51,194,122,.14); color: #33c27a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .fin-n { display: flex; flex-direction: column; min-width: 0; }
  .fin-n b { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .fin-n small { font-size: 12px; color: var(--text-dim); }
  .fin-drop { border: 1.5px dashed var(--border); border-radius: 14px; padding: 26px 16px; display: flex; flex-direction: column; align-items: center;
    gap: 6px; color: var(--text-dim); cursor: pointer; text-align: center; }
  .fin-drop b { color: var(--text); font-size: 14px; }
  .fin-drop span { font-size: 12px; }
  .fin-drop:hover, .fin-drop.drop-hover { border-color: var(--accent); background: var(--accent-soft); }
  .tree-row.drop-hover, .fin-folder.drop-hover { background: var(--accent-soft) !important; box-shadow: inset 0 0 0 1.5px var(--accent); }
  #drop-ov { position: absolute; inset: 10px; z-index: 50; border: 2px dashed var(--accent); border-radius: 16px; background: color-mix(in srgb, var(--bg) 82%, transparent);
    display: none; align-items: center; justify-content: center; pointer-events: none; }
  #drop-ov.show { display: flex; }
  #drop-ov div { display: flex; align-items: center; gap: 10px; color: var(--text); font-size: 16px; }
  .xv-bar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 8px; }
  .xv-tabs { display: flex; gap: 5px; flex-wrap: wrap; flex: 1; min-width: 0; }
  .xv-tab { background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-dim); border-radius: 8px; padding: 6px 11px; font-size: 13px;
    font-weight: 600; cursor: pointer; font-family: inherit; }
  .xv-tab.on { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
  .xv-search { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 9px; padding: 8px 11px; color: var(--text); font-size: 14px;
    font-family: inherit; outline: none; min-width: 180px; margin-left: auto; }
  .xv-search:focus { border-color: var(--accent); }
  .xv-info { margin-bottom: 8px; }
  .xv-wrap { overflow: auto; max-height: calc(100vh - 230px); max-height: calc(100dvh - 230px); border: 1px solid var(--border); border-radius: 10px; background: var(--bg-elevated); }
  table.xv { border-collapse: separate; border-spacing: 0; font-size: 13px; font-variant-numeric: tabular-nums; }
  table.xv th, table.xv td { padding: 5px 9px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); white-space: nowrap;
    max-width: 340px; overflow: hidden; text-overflow: ellipsis; text-align: left; }
  table.xv thead th { position: sticky; top: 0; z-index: 2; background: var(--bg); color: var(--text-dim); font-weight: 600; font-size: 11.5px; text-align: center; }
  table.xv .xv-rn { position: sticky; left: 0; z-index: 1; background: var(--bg); color: var(--text-dim); font-size: 11.5px; text-align: right; min-width: 34px; }
  table.xv thead .xv-rn { z-index: 3; }
  table.xv td.n { text-align: right; }
  table.xv tbody tr:hover td { background: var(--accent-soft); }
  table.xv tbody tr:hover td.xv-rn { background: var(--bg); }

  /* 9x9 */
  #page-mandala { max-width: 980px; }
  .md-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
  .md-card { display: flex; gap: 14px; align-items: center; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 14px;
    padding: 12px 14px; cursor: pointer; text-align: left; color: var(--text); font-family: inherit; }
  .md-card:hover { border-color: var(--accent); }
  .md-card-b { display: flex; flex-direction: column; min-width: 0; gap: 2px; }
  .md-card-b b { font-size: 15px; }
  .md-card-b span { font-size: 13px; color: var(--text-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .md-card-b small { font-size: 11.5px; color: var(--text-dim); }
  .md-mini { display: grid; grid-template-columns: repeat(3, 14px); gap: 3px; flex-shrink: 0; }
  .md-mini i { width: 14px; height: 14px; border-radius: 3px; background: var(--border); display: block; }
  .md-mini i[data-on] { background: color-mix(in srgb, var(--a) 70%, transparent); }
  .md-mini i.g { background: var(--accent); opacity: .35; }
  .md-mini i.g[data-on] { opacity: 1; }
  .md-sub { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
  .md-views { display: flex; gap: 6px; }
  .md-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .md-block { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
  .md-grid.ro .md-block { cursor: pointer; border-radius: 8px; }
  .md-grid.ro .md-block:hover { outline: 2px solid var(--accent); outline-offset: 2px; }
  .md-cell { position: relative; aspect-ratio: 1; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 7px;
    display: flex; align-items: center; justify-content: center; padding: 4px; overflow: hidden; cursor: text; min-width: 0; }
  .md-grid.ro .md-cell { cursor: pointer; }
  .md-cell.area { background: color-mix(in srgb, var(--a) 16%, var(--bg-elevated)); border-color: color-mix(in srgb, var(--a) 45%, var(--border)); }
  .md-cell.goal { background: var(--accent); border-color: var(--accent); color: #fff; }
  .md-t { width: 100%; max-height: 100%; overflow: auto; text-align: center; font-size: 11px; line-height: 1.25; outline: none; overflow-wrap: anywhere;
    white-space: pre-wrap; scrollbar-width: none; }
  .md-t::-webkit-scrollbar { display: none; }
  .md-cell.area .md-t { font-weight: 600; }
  .md-cell.goal .md-t { font-weight: 800; font-size: 12px; }
  .md-cell:focus-within { box-shadow: 0 0 0 2px var(--accent); }
  .md-cell.goal:focus-within { box-shadow: 0 0 0 2px var(--text); }
  .md-cell[data-ph]:not([data-ph=""])::before { content: attr(data-ph); position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-size: 10.5px; color: var(--text-dim); opacity: .7; pointer-events: none; text-align: center; padding: 4px; }
  .md-cell.goal[data-ph]:not([data-ph=""])::before { color: #fff; opacity: .75; }
  .md-cell:focus-within::before { display: none; }
  .md-focus { display: grid; grid-template-columns: minmax(0, 520px) 200px; gap: 18px; align-items: start; }
  .md-block.big { gap: 6px; }
  .md-cell.big { border-radius: 12px; padding: 8px; }
  .md-cell.big .md-t { font-size: 14px; line-height: 1.3; }
  .md-cell.big.goal .md-t { font-size: 16px; }
  .md-cell.big[data-ph]:not([data-ph=""])::before { font-size: 13px; }
  .md-open { position: absolute; right: 4px; bottom: 4px; width: 22px; height: 22px; border-radius: 50%; border: none; cursor: pointer;
    background: color-mix(in srgb, var(--a, var(--accent)) 30%, var(--bg)); color: var(--text); display: flex; align-items: center; justify-content: center; padding: 0; }
  .md-open.back { left: 4px; right: auto; }
  .md-open:hover { background: var(--a, var(--accent)); color: #fff; }
  .md-nav { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
  .md-nav-b { aspect-ratio: 1; border-radius: 8px; border: 1px solid var(--border); background: color-mix(in srgb, var(--a, transparent) 14%, var(--bg-elevated));
    color: var(--text-dim); font-size: 10px; line-height: 1.2; padding: 4px; cursor: pointer; overflow: hidden; font-family: inherit;
    display: flex; align-items: center; justify-content: center; text-align: center; overflow-wrap: anywhere; }
  .md-nav-b.g { background: color-mix(in srgb, var(--accent) 20%, var(--bg-elevated)); }
  .md-nav-b.on { border-color: var(--a, var(--accent)); box-shadow: 0 0 0 1.5px var(--a, var(--accent)); color: var(--text); font-weight: 700; }
  @media (max-width: 759px) {
    .md-grid { gap: 5px; }
    .md-block { gap: 2px; }
    .md-cell { border-radius: 4px; padding: 1px; }
    .md-t { font-size: 7px; line-height: 1.15; }
    .md-cell.goal .md-t { font-size: 8px; }
    .md-focus { grid-template-columns: 1fr; }
    .md-nav { max-width: 240px; }
  }
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
  let customs = [], shelfLayout = {}, profile = {}, widgetCfg = {};
  customCol.orderBy('createdAt', 'asc').onSnapshot(s => { customs = s.docs.map(d => ({ id: d.id, ...d.data() })); if (currentPage === 'achievements') renderAll(); });
  settingsCol.orderBy('k', 'asc').onSnapshot(s => {
    const wg = s.docs.find(x => x.id === 'widget'); widgetCfg = wg ? wg.data() : {};
    const d = s.docs.find(x => x.id === 'shelf'); shelfLayout = (d && d.data().slots) || {};
    const pr = s.docs.find(x => x.id === 'profile'); profile = pr ? pr.data() : {};
    if (window.renderProfileCard) window.renderProfileCard();
    if (currentPage === 'profile' && window.renderProfilePage) window.renderProfilePage();
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

  // ---------- context menu (right click on desktop, long press on phone) ----------
  const ctxMenu = el('div'); ctxMenu.id = 'n-menu'; document.body.appendChild(ctxMenu);
  const closeCtx = () => ctxMenu.classList.remove('open');
  let ctxOpenedAt = 0;
  document.addEventListener('click', e => { if (ctxMenu.classList.contains('open') && !ctxMenu.contains(e.target) && !e.target.closest('.row-more') && Date.now() - ctxOpenedAt > 450) closeCtx(); }, true);
  document.addEventListener('scroll', closeCtx, true);
  window.addEventListener('resize', closeCtx);
  const MENU_ICONS = {
    folder: () => I.folder, note: () => I.note, trash: () => I.trash,
    icon: () => '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M8 1.8L9.8 5.7L14 6.1L10.8 8.9L11.8 13L8 10.8L4.2 13L5.2 8.9L2 6.1L6.2 5.7Z"/></svg>',
    board: () => I.territory,
    edit: () => '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M3 13L3.6 10.4L11 3L13 5L5.6 12.4Z"/><path d="M9.5 4.5L11.5 6.5"/></svg>',
    level: () => I.level,
    grid9: () => I.grid9,
    sheet: () => I.sheet,
    down: () => '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5V10.5M4.5 7L8 10.5L11.5 7M3 13.5H13"/></svg>'
  };
  function openCtxMenu(x, y, items) {
    ctxMenu.innerHTML = ''; ctxMenu.dataset.owner = '';
    items.forEach(it => {
      const b = el('button', it.danger ? 'danger' : null, (MENU_ICONS[it.icon] ? MENU_ICONS[it.icon]() : '') + '<span>' + esc(it.label) + '</span>');
      b.addEventListener('click', e => { e.stopPropagation(); closeCtx(); it.action(); });
      ctxMenu.appendChild(b);
    });
    ctxMenu.classList.add('open');
    const w = ctxMenu.offsetWidth, h = ctxMenu.offsetHeight;
    ctxMenu.style.left = Math.max(8, Math.min(x, window.innerWidth - w - 8)) + 'px';
    ctxMenu.style.top = Math.max(8, Math.min(y, window.innerHeight - h - 8)) + 'px';
  }
  const isTouch = window.matchMedia('(hover: none)').matches;
  let moreSeq = 0;
  const sidebarEl = document.getElementById('sidebar');
  if (sidebarEl) sidebarEl.addEventListener('contextmenu', e => { if (!e.target.closest('input, textarea')) e.preventDefault(); });
  function attachRowMenu(rowEl, getItems) {
    const items = () => (typeof getItems === 'function' ? getItems(rowEl) : getItems);
    if (isTouch) rowEl.draggable = false;
    const more = el('button', 'row-more', '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="3.5" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="12.5" cy="8" r="1.4"/></svg>');
    more.title = 'Actions'; more.setAttribute('aria-label', 'Actions');
    more.addEventListener('click', e => {
      e.stopPropagation();
      if (ctxMenu.classList.contains('open') && ctxMenu.dataset.owner === String(moreId)) { closeCtx(); return; }
      const r = more.getBoundingClientRect();
      openCtxMenu(r.right - 170, r.bottom + 4, items());
      ctxMenu.dataset.owner = String(moreId);
    });
    const moreId = ++moreSeq;
    rowEl.appendChild(more);
    rowEl.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); openCtxMenu(e.clientX, e.clientY, items()); });
    let timer = null, sx = 0, sy = 0, fired = false;
    rowEl.addEventListener('touchstart', e => {
      const t = e.touches[0]; sx = t.clientX; sy = t.clientY; fired = false;
      clearTimeout(timer);
      timer = setTimeout(() => { fired = true; if (navigator.vibrate) navigator.vibrate(12); openCtxMenu(sx, sy, items()); ctxOpenedAt = Date.now(); }, 480);
    }, { passive: true });
    rowEl.addEventListener('touchmove', e => { const t = e.touches[0]; if (Math.hypot(t.clientX - sx, t.clientY - sy) > 10) clearTimeout(timer); }, { passive: true });
    rowEl.addEventListener('touchend', e => { clearTimeout(timer); if (fired) e.preventDefault(); });
    rowEl.addEventListener('touchcancel', () => clearTimeout(timer));
    rowEl.addEventListener('click', e => { if (fired) { fired = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  }
  window.attachRowMenu = attachRowMenu;
  function notesMenuItems(folderId) {
    return [
      { label: 'New note', icon: 'note', action: () => newNote(folderId) },
      { label: 'Add Excel file', icon: 'sheet', action: () => pickFiles('notes', folderId) },
      { label: 'New folder', icon: 'folder', action: () => {
        openSection('__notes__'); if (folderId) expanded.add('nf:' + folderId); saveExpanded();
        nState.creatingIn = folderId || null; renderTree();
      } }
    ];
  }
  function newNote(folderId) {
    const now = Date.now();
    openSection('__notes__'); if (folderId) expanded.add('nf:' + folderId); saveExpanded();
    notesCol.add({ title: '', body: '', folderId: folderId || null, createdAt: now, updatedAt: now }).then(r => { focusTitle = true; goNote(r.id); });
  }
  function nChildren(parentId) { return nFolders.filter(f => (f.parentId || null) === (parentId || null)).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ru')); }
  function nNotesIn(folderId) { return notes.filter(n => (n.folderId || null) === (folderId || null)); }
  function deleteNoteFolder(f) {
    const fids = [], walk = id => { fids.push(id); nChildren(id).forEach(c => walk(c.id)); };
    walk(f.id);
    const inside = notes.filter(n => fids.includes(n.folderId));
    if (!confirm('Delete folder "' + f.name + '"' + (inside.length ? ' and ' + inside.length + ' notes inside' : '') + '?')) return;
    const nids = inside.map(n => n.id);
    if (edState && nids.includes(edState.noteId)) edState.dead = true;
    inside.forEach(n => notesCol.doc(n.id).delete());
    fids.forEach(id => nFoldersCol.doc(id).delete());
    if (inside.some(n => n.id === nState.noteId)) nState.noteId = null;
    if (nids.length) gcPhotos(new Set(nids), nids, '', null);
  }
  function deleteNote(n) {
    if (!confirm('Delete note "' + (n.title || 'Untitled') + '"?')) return;
    if (edState && edState.noteId === n.id) edState.dead = true;
    notesCol.doc(n.id).delete();
    if (nState.noteId === n.id) { nState.noteId = null; renderAll(); }
    gcPhotos(new Set([n.id]), [n.id], '', null);
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
      const hasKids = nChildren(f.id).length || nNotesIn(f.id).length || filesIn('notes', f.id).length;
      const nfRow = (row({
        icon: I.folder, name: f.name, indent, chevron: hasKids ? open : null,
        onClick: () => { if (open) expanded.delete(key); else expanded.add(key); saveExpanded(); renderTree(); },
        menu: rowEl => [{ label: 'Rename', icon: 'edit', action: () => inlineEdit(rowEl.querySelector('.row-name'), f.name, v => nFoldersCol.doc(f.id).update({ name: v })) }]
          .concat(notesMenuItems(f.id), [{ label: 'Delete folder', icon: 'trash', danger: true, action: () => deleteNoteFolder(f) }])
      }));
      dropTarget(nfRow, () => ({ scope: 'notes', folderId: f.id }));
      list.appendChild(nfRow);
      if (open) renderNotesTree(list, f.id, depth + 1);
    });
    nNotesIn(parentId).forEach(n => {
      list.appendChild(row({
        icon: I.note, name: n.title || 'Untitled', indent: indent + 14,
        active: currentPage === 'notes' && nState.noteId === n.id,
        onClick: () => goNote(n.id), menu: () => [{ label: 'Delete note', icon: 'trash', danger: true, action: () => deleteNote(n) }]
      }));
    });
    fileRows(list, 'notes', parentId, indent + 14);
    if (nState.creatingIn !== undefined && (nState.creatingIn || null) === (parentId || null)) list.appendChild(folderForm(parentId, indent + 14));
  }
  function goNote(id) { currentPage = 'notes'; nState.noteId = id; renderAll(); autoCollapseOnMobile(); }

  let focusTitle = false, saveTimer = null, pendingSave = null;
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

  // ================= note body: text + photos =================
  // note.html  - clean html: <div>, <br>, b/i/u/s and <img data-id data-w data-x data-r> photo tokens
  // note.body  - the same text without photos (levels, older app versions)
  // note.hbh   - hash of body: if an older app version edits the text, the note is rebuilt from it
  // Photos are stored like Excel files: a doc in "files" (scope nimg), the bytes in IndexedDB and in files/ of the data repo.
  // Width (w) and left offset (x) are in % of the note width, r = height / width.
  const NIMG = 'nimg';
  const IMG_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp' };
  const BLOCK_TAGS = new Set(['DIV', 'P', 'LI', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'TABLE', 'TBODY', 'THEAD', 'TR', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'FIGURE']);
  const DROP_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'HEAD', 'META', 'LINK', 'TEMPLATE', 'NOSCRIPT', 'TITLE', 'SVG', 'MATH', 'CANVAS', 'VIDEO', 'AUDIO', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'FORM']);
  const FMT_TAGS = { B: 'b', STRONG: 'b', I: 'i', EM: 'i', U: 'u', S: 's', STRIKE: 's', DEL: 's' };
  const ID_RE = /^[a-z0-9]{6,40}$/;
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const r1 = v => Math.round(v * 10) / 10;
  const isPicFile = f => /^image\//.test(f.type || '') || /\.(jpe?g|png|gif|webp|heic|heif|bmp|avif)$/i.test(f.name || '');
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  const NI = {
    photo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.7"/><path d="M21 15.5L16 10.5L6 20"/></svg>',
    left: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="2.5" y="3.5" width="7" height="7" rx="1.4" fill="currentColor" fill-opacity=".3"/><path d="M12.5 5H17.5M12.5 9H17.5M2.5 14H17.5M2.5 17H12"/></svg>',
    center: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="6.5" y="3.5" width="7" height="7" rx="1.4" fill="currentColor" fill-opacity=".3"/><path d="M2.5 14H17.5M2.5 17H12"/></svg>',
    right: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="10.5" y="3.5" width="7" height="7" rx="1.4" fill="currentColor" fill-opacity=".3"/><path d="M2.5 5H7.5M2.5 9H7.5M2.5 14H17.5M2.5 17H12"/></svg>',
    trash: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4H13M6.5 4V2.7C6.5 2.3 6.8 2 7.2 2H8.8C9.2 2 9.5 2.3 9.5 2.7V4M5 4V12.5C5 13 5.4 13.4 5.9 13.4H10.1C10.6 13.4 11 13 11 12.5V4"/></svg>'
  };

  let edState = null;                       // the open note editor
  let selImg = null, imgOp = null, suppressClick = 0, asRaf = 0, photoRange = null;
  const selBox = el('div', 'n-sel');
  const fileCaret = el('div', 'n-fcaret');
  const imgURLs = new Map(), imgPending = new Map(), imgTried = new Map();

  function photoToast(t) { toastQueue.push({ html: '<div><small>Photos</small><b>' + esc(t) + '</b></div>', open: () => {} }); showNextToast(); }

  // ---------- photo bytes ----------
  function imgURL(id) {
    if (imgURLs.has(id)) return Promise.resolve(imgURLs.get(id));
    if (imgPending.has(id)) return imgPending.get(id);
    const p = (async () => {
      const meta = files.find(f => f.id === id);
      let buf = await idbGet(id);
      if (!buf) {
        const cfg = ghCfg();
        if (!meta || !meta.uploaded || !cfg || !navigator.onLine) return null;
        buf = await ghGet(cfg, filePath(meta));
        idbPut(id, buf).catch(() => {});
      }
      const url = URL.createObjectURL(new Blob([buf], { type: (meta && meta.mime) || 'image/jpeg' }));
      imgURLs.set(id, url);
      return url;
    })().catch(() => null).finally(() => imgPending.delete(id));
    imgPending.set(id, p);
    return p;
  }
  function loadImgInto(s) {
    const id = s.getAttribute('data-id'), im = s.firstChild;
    if (imgURLs.has(id)) { if (im.getAttribute('src') !== imgURLs.get(id)) im.src = imgURLs.get(id); s.classList.remove('loading', 'missing'); return; }
    s.classList.add('loading'); imgTried.set(id, Date.now());
    imgURL(id).then(url => {
      s.classList.remove('loading');
      if (url) { im.src = url; s.classList.remove('missing'); } else s.classList.add('missing');
    });
  }
  function retryMissing() {
    if (!edState) return;
    edState.ed.querySelectorAll('.n-img.missing').forEach(s => {
      const id = s.getAttribute('data-id'), meta = files.find(f => f.id === id);
      if (imgURLs.has(id) || (meta && meta.uploaded && navigator.onLine && Date.now() - (imgTried.get(id) || 0) > 8000)) loadImgInto(s);
    });
  }
  window.addEventListener('online', () => setTimeout(retryMissing, 1500));

  // make a phone photo light enough to sync: max 2048px, jpeg (png if it has transparency)
  async function prepImage(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('decode')); i.src = url; });
      const w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) throw new Error('decode');
      const type = (file.type || '').toLowerCase();
      if (IMG_EXT[type] && file.size <= 1.5 * 1024 * 1024 && Math.max(w, h) <= 2560) return { buf: await file.arrayBuffer(), mime: type, ext: IMG_EXT[type], w, h };
      const k = Math.min(1, 2048 / Math.max(w, h)), cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
      let alpha = false;
      if (/png|webp|gif|avif/.test(type)) {
        const t = document.createElement('canvas'); t.width = t.height = 40;
        const tc = t.getContext('2d'); tc.drawImage(img, 0, 0, 40, 40);
        const d = tc.getImageData(0, 0, 40, 40).data;
        for (let i = 3; i < d.length; i += 4) if (d[i] < 250) { alpha = true; break; }
      }
      const c = document.createElement('canvas'); c.width = cw; c.height = ch;
      const ctx = c.getContext('2d');
      if (!alpha) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch); }
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, cw, ch);
      const mime = alpha ? 'image/png' : 'image/jpeg';
      const blob = await new Promise(res => c.toBlob(res, mime, 0.86));
      if (!blob) throw new Error('encode');
      return { buf: await blob.arrayBuffer(), mime, ext: IMG_EXT[mime], w: cw, h: ch };
    } finally { URL.revokeObjectURL(url); }
  }

  // ---------- photo nodes ----------
  function imgAttrs(n) {
    const num = (k, d) => { const v = parseFloat(n.getAttribute(k)); return isFinite(v) ? v : d; };
    const w = clampN(num('data-w', 100), 5, 100);
    return { id: String(n.getAttribute('data-id') || ''), w, x: clampN(num('data-x', (100 - w) / 2), 0, 100 - w), r: clampN(num('data-r', 0.75), 0.05, 20) };
  }
  // photos on the side (and not too wide) get the text around them, centred or wide ones sit on their own line
  function imgMode(w, x) { if (w > 70) return 'b'; const c = x + w / 2; return c < 38 ? 'l' : c > 62 ? 'r' : 'b'; }
  function setImgAttrs(s, a) {
    const w = clampN(+a.w, 5, 100), x = clampN(+a.x, 0, 100 - w);
    s.setAttribute('data-w', r1(w)); s.setAttribute('data-x', r1(x)); s.setAttribute('data-r', clampN(+a.r, 0.05, 20).toFixed(4));
    const b = imgAttrs(s), m = imgMode(b.w, b.x);
    s.classList.toggle('fl', m === 'l'); s.classList.toggle('fr', m === 'r');
    s.style.width = b.w + '%';
    s.style.margin = m === 'l' ? '4px 16px 8px ' + b.x + '%' : m === 'r' ? '4px ' + Math.max(0, r1(100 - b.x - b.w)) + '% 8px 16px' : '8px 0 8px ' + b.x + '%';
    s.firstChild.style.aspectRatio = String(+(1 / b.r).toFixed(4));
  }
  function makeImgNode(a) {
    const s = document.createElement('span');
    s.className = 'n-img'; s.contentEditable = 'false'; s.setAttribute('data-id', a.id);
    const im = document.createElement('img'); im.alt = ''; im.draggable = false;
    s.appendChild(im);
    setImgAttrs(s, a);
    loadImgInto(s);
    return s;
  }
  function closestImg(n) {
    const ed = edState && edState.ed;
    while (n && n !== ed) { if (n.nodeType === 1 && n.classList.contains('n-img')) return n; n = n.parentNode; }
    return null;
  }

  // ---------- html in / out ----------
  function buildBody(html, onlyKnown) {
    const frag = document.createDocumentFragment();
    if (!html) return frag;
    let doc;
    try { doc = new DOMParser().parseFromString('<!doctype html><html><body>' + html + '</body></html>', 'text/html'); } catch (e) { return frag; }
    const walk = (src, dst) => {
      [...src.childNodes].forEach(c => {
        if (c.nodeType === 3) { dst.appendChild(document.createTextNode(c.nodeValue)); return; }
        if (c.nodeType !== 1) return;
        const t = c.tagName.toUpperCase();
        if (DROP_TAGS.has(t)) return;
        if (c.hasAttribute('data-id') && (t === 'IMG' || c.classList.contains('n-img'))) {
          const a = imgAttrs(c);
          if (ID_RE.test(a.id) && (!onlyKnown || files.some(f => f.id === a.id && f.scope === NIMG))) dst.appendChild(makeImgNode(a));
          return;
        }
        if (t === 'IMG') return;
        if (t === 'BR') { dst.appendChild(document.createElement('br')); return; }
        if (BLOCK_TAGS.has(t)) { const d = document.createElement('div'); walk(c, d); dst.appendChild(d); return; }
        if (FMT_TAGS[t]) { const f = document.createElement(FMT_TAGS[t]); walk(c, f); dst.appendChild(f); return; }
        walk(c, dst);
      });
    };
    walk(doc.body, frag);
    return frag;
  }
  function serializeBody(root) {
    let out = '';
    const walk = node => {
      node.childNodes.forEach(c => {
        if (c.nodeType === 3) { out += esc(c.nodeValue); return; }
        if (c.nodeType !== 1) return;
        if (c.classList.contains('n-img')) {
          const a = imgAttrs(c);
          if (ID_RE.test(a.id)) out += '<img data-id="' + a.id + '" data-w="' + r1(a.w) + '" data-x="' + r1(a.x) + '" data-r="' + a.r.toFixed(4) + '">';
          return;
        }
        const t = c.tagName;
        if (t === 'BR') { out += '<br>'; return; }
        if (DROP_TAGS.has(t)) return;
        if (BLOCK_TAGS.has(t)) { out += '<div>'; walk(c); out += '</div>'; return; }
        const f = FMT_TAGS[t];
        if (f) { out += '<' + f + '>'; walk(c); out += '</' + f + '>'; return; }
        walk(c);
      });
    };
    walk(root);
    return out;
  }
  function textOf(root) {
    let out = '';
    const walk = node => {
      node.childNodes.forEach(c => {
        if (c.nodeType === 3) { out += c.nodeValue; return; }
        if (c.nodeType !== 1 || c.classList.contains('n-img') || DROP_TAGS.has(c.tagName)) return;
        if (c.tagName === 'BR') { out += '\n'; return; }
        const blk = BLOCK_TAGS.has(c.tagName);
        if (blk && out && !out.endsWith('\n')) out += '\n';
        walk(c);
        if (blk && out && !out.endsWith('\n')) out += '\n';
      });
    };
    walk(root);
    return out.replace(/\n$/, '');
  }
  const textToHtml = t => String(t || '').split('\n').map(l => '<div>' + (l ? esc(l) : '<br>') + '</div>').join('');
  function noteHtml(n) {
    const body = n.body || '';
    if (typeof n.html === 'string' && n.hbh === hashStr(body)) return n.html;
    let html = body ? textToHtml(body) : '';
    const imgs = typeof n.html === 'string' ? n.html.match(/<img [^>]*>/g) : null;   // keep the photos if an older app version edited the text
    if (imgs && imgs.length) html += '<div>' + imgs.join('') + '</div>';
    return html;
  }

  // ---------- saving, history ----------
  function noteSave(now) {
    const st = edState; if (!st) return;
    st.status.textContent = 'Saving...';
    clearTimeout(saveTimer);
    pendingSave = () => {
      saveTimer = null; pendingSave = null;
      if (st.dead) return;
      const text = textOf(st.ed), html = serializeBody(st.ed);
      st.loadedHtml = html;
      notesCol.doc(st.noteId).update({ title: st.ti.value, body: text, html, hbh: hashStr(text), updatedAt: Date.now() }).catch(() => {});
      if (st.status.isConnected) st.status.textContent = 'Saved';
    };
    if (now) pendingSave(); else saveTimer = setTimeout(pendingSave, 500);
  }
  function flushSave() { if (pendingSave) { clearTimeout(saveTimer); pendingSave(); } }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushSave(); });
  window.addEventListener('pagehide', flushSave);
  function updateEmpty() { const ed = edState.ed; ed.classList.toggle('empty', !ed.textContent.replace(/[\s​]/g, '') && !ed.querySelector('.n-img')); }
  function contentChanged(hist) {
    if (!edState) return;
    updateEmpty(); noteSave();
    if (hist) pushHist(); else histSchedule();
    positionSel();
  }
  function setEditorHtml(html) {
    const st = edState, sc = contentEl.scrollTop;
    deselectImg();
    st.ed.innerHTML = '';
    st.ed.appendChild(buildBody(html));
    st.loadedHtml = html;
    updateEmpty();
    contentEl.scrollTop = sc;
  }
  function getCaretOffset() {
    const st = edState, s = window.getSelection();
    if (!s || !s.rangeCount || !st.ed.contains(s.anchorNode)) return null;
    const r = s.getRangeAt(0), pre = document.createRange();
    pre.selectNodeContents(st.ed);
    try { pre.setEnd(r.startContainer, r.startOffset); } catch (e) { return null; }
    return pre.toString().length;
  }
  function setCaretOffset(off) {
    const ed = edState.ed;
    if (off == null || document.activeElement !== ed) return;
    const tw = document.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
    let n, left = off, last = null;
    while ((n = tw.nextNode())) { last = n; if (left <= n.nodeValue.length) break; left -= n.nodeValue.length; }
    const r = document.createRange();
    if (n) r.setStart(n, left); else if (last) r.setStart(last, last.nodeValue.length); else r.setStart(ed, 0);
    r.collapse(true);
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  // own undo/redo: photo moves are not something the browser can undo
  function pushHist() {
    const st = edState; if (!st) return;
    clearTimeout(st.histTimer); st.histTimer = null;
    const h = { html: serializeBody(st.ed), caret: getCaretOffset() };
    if (st.hi >= 0 && st.hist[st.hi].html === h.html) { st.hist[st.hi].caret = h.caret; return; }
    st.hist.length = st.hi + 1; st.hist.push(h);
    if (st.hist.length > 150) st.hist.shift();
    st.hi = st.hist.length - 1;
  }
  function histSchedule() { const st = edState; clearTimeout(st.histTimer); st.histTimer = setTimeout(() => { if (edState === st) pushHist(); }, 700); }
  function histFlush() { if (edState && edState.histTimer) pushHist(); }
  function restoreHist(h) { setEditorHtml(h.html); edState.loadedHtml = ''; setCaretOffset(h.caret); noteSave(); }
  function noteUndo() { const st = edState; if (!st) return; histFlush(); if (st.hi <= 0) return; st.hi--; restoreHist(st.hist[st.hi]); }
  function noteRedo() { const st = edState; if (!st) return; histFlush(); if (st.hi >= st.hist.length - 1) return; st.hi++; restoreHist(st.hist[st.hi]); }

  // photos that are no longer in any note are deleted when you leave the note (or delete it)
  function gcPhotos(noteIds, skipNotes, extraHtml, fresh) {
    const used = new Set(), grab = h => { String(h || '').replace(/data-id="([a-z0-9]+)"/g, (m, id) => { used.add(id); return m; }); };
    notes.forEach(n => { if (!skipNotes.includes(n.id)) grab(n.html); });
    grab(extraHtml);
    const old = Date.now() - 120000;
    files.filter(f => f.scope === NIMG && noteIds.has(f.noteId) && !used.has(f.id) && (!fresh || fresh.has(f.id) || (f.createdAt || 0) < old)).forEach(f => {
      deleteFile(f, false);
      const u = imgURLs.get(f.id); if (u) { URL.revokeObjectURL(u); imgURLs.delete(f.id); }
    });
  }
  function closeEditor() {
    const st = edState; if (!st) return;
    flushSave();
    if (imgOp && imgOp.type === 'drag') finishDrag(true, true);
    deselectImg(); fileCaret.remove();
    if (st.ro) st.ro.disconnect();
    clearTimeout(st.histTimer);
    edState = null;
    if (!st.dead) gcPhotos(new Set([st.noteId]), [st.noteId], st.loadedHtml, st.added);
  }

  // ---------- page ----------
  function renderNote() {
    const n = notes.find(x => x.id === nState.noteId);
    if (edState && (!n || edState.noteId !== n.id)) closeEditor();
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
    if (edState && pageN.dataset.noteId === n.id && edState.ed.isConnected) {
      // same note already open: update only what the user is not editing
      const st = edState;
      if (!saveTimer && document.activeElement !== st.ti && st.ti.value !== (n.title || '')) st.ti.value = n.title || '';
      if (!saveTimer && !imgOp && document.activeElement !== st.ed) {
        const html = noteHtml(n);
        if (html !== st.loadedHtml) { setEditorHtml(html); pushHist(); }
      }
      retryMissing();
      if (!saveTimer) st.status.textContent = 'Edited ' + fmtEdited(n.updatedAt || n.createdAt);
      return;
    }
    pageN.dataset.noteId = n.id;
    pageN.innerHTML = '';
    const head = el('div', 'n-head');
    const ti = el('input', 'n-title'); ti.placeholder = 'Untitled'; ti.value = n.title || ''; ti.maxLength = 120;
    const tools = el('div', 'n-tools');
    const ph = el('button', 'x-btn n-photo-btn', NI.photo + '<span>Photo</span>'); ph.title = 'Add photo'; ph.setAttribute('aria-label', 'Add photo');
    ph.addEventListener('mousedown', e => e.preventDefault());
    ph.addEventListener('click', () => pickNotePhotos());
    const del = el('button', 'x-btn ghost-danger'); del.textContent = 'Delete';
    del.addEventListener('click', () => deleteNote(notes.find(x => x.id === n.id) || n));
    tools.appendChild(ph); tools.appendChild(del);
    head.appendChild(ti); head.appendChild(tools);
    const meta = el('div', 'n-meta');
    const path = notePath(n).map(f => esc(f.name)).join(' / ');
    meta.innerHTML = (path ? '<em>' + path + '</em>' : '') + '<span>Edited ' + fmtEdited(n.updatedAt || n.createdAt) + '</span>';
    const ed = el('div', 'n-body'); ed.contentEditable = 'true'; ed.spellcheck = true; ed.dataset.ph = 'Start writing...';
    ed.setAttribute('role', 'textbox'); ed.setAttribute('aria-multiline', 'true');
    pageN.appendChild(head); pageN.appendChild(meta); pageN.appendChild(ed);
    const st = edState = { noteId: n.id, ed, ti, status: meta.querySelector('span'), loadedHtml: '', hist: [], hi: -1, histTimer: null,
      lastRange: null, added: new Set(), dead: false, innerDrag: false, ro: null };
    setEditorHtml(noteHtml(n));
    pushHist();
    ed.addEventListener('input', () => { if (edState === st) contentChanged(false); });
    ed.addEventListener('beforeinput', e => {
      if (e.inputType === 'historyUndo') { e.preventDefault(); noteUndo(); }
      else if (e.inputType === 'historyRedo') { e.preventDefault(); noteRedo(); }
    });
    ed.addEventListener('paste', onNotePaste);
    ed.addEventListener('mousedown', onImgMouseDown);
    ed.addEventListener('touchstart', onImgTouchStart, { passive: true });
    ed.addEventListener('touchmove', e => { if (touchT && touchT.armed && e.cancelable) e.preventDefault(); }, { passive: false });
    ed.addEventListener('dragstart', e => { if (closestImg(e.target)) { e.preventDefault(); return; } st.innerDrag = true; });
    ed.addEventListener('dragend', () => { st.innerDrag = false; });
    ed.addEventListener('dragover', onEdDragOver);
    ed.addEventListener('dragleave', () => fileCaret.remove());
    ed.addEventListener('drop', onEdDrop);
    if (window.ResizeObserver) { st.ro = new ResizeObserver(() => positionSel()); st.ro.observe(ed); }
    ti.addEventListener('input', () => noteSave());
    ti.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ed.focus(); } });
    if (focusTitle) { focusTitle = false; setTimeout(() => ti.focus(), 30); }
  }

  // ---------- adding photos ----------
  const photoInput = el('input'); photoInput.type = 'file'; photoInput.accept = 'image/*'; photoInput.multiple = true; photoInput.style.display = 'none';
  document.body.appendChild(photoInput);
  photoInput.addEventListener('change', () => { const fl = [...(photoInput.files || [])]; photoInput.value = ''; if (fl.length && edState) insertPhotos(fl, photoRange); });
  function curRange() {
    const st = edState; if (!st) return null;
    if (selImg) { const r = document.createRange(); r.setStartAfter(selImg); r.collapse(true); return r; }
    const s = window.getSelection();
    if (s && s.rangeCount && st.ed.contains(s.getRangeAt(0).startContainer)) return s.getRangeAt(0).cloneRange();
    return st.lastRange && st.ed.contains(st.lastRange.startContainer) ? st.lastRange.cloneRange() : null;
  }
  function pickNotePhotos() { if (!edState) return; photoRange = curRange(); photoInput.click(); }
  function placeNode(node, range) {
    const ed = edState.ed;
    if (range && (range.startContainer === ed || ed.contains(range.startContainer))) {
      const rg = range.cloneRange(); rg.collapse(false);
      const inside = closestImg(rg.startContainer);
      if (inside) { rg.setStartAfter(inside); rg.collapse(true); }
      rg.insertNode(node);
      return;
    }
    const d = document.createElement('div'); d.appendChild(node); ed.appendChild(d);
  }
  // keep a line after a photo at the very end, so there is a place to keep writing
  function ensureLineAfter(node) {
    const ed = edState.ed;
    for (let n = node; n && n !== ed; n = n.parentNode) {
      let sib = n.nextSibling;
      while (sib && sib.nodeType === 3 && !sib.nodeValue.length) sib = sib.nextSibling;
      if (sib) return;
    }
    const d = document.createElement('div'); d.appendChild(document.createElement('br')); ed.appendChild(d);
  }
  function tidyAfterRemove(parent) {
    const ed = edState.ed;
    if (!parent || parent === ed || !parent.isConnected || parent.childNodes.length || !BLOCK_TAGS.has(parent.tagName)) return;
    if (ed.childNodes.length > 1) parent.remove(); else parent.appendChild(document.createElement('br'));
  }
  async function insertPhotos(list, range) {
    const st = edState; if (!st) return;
    const pics = list.filter(isPicFile);
    if (!pics.length) { photoToast('Only photos and pictures can go into a note'); return; }
    histFlush();
    let prev = null, bad = null;
    for (const f of pics) {
      let p;
      try { p = await prepImage(f); } catch (e) { bad = bad || f.name || 'photo'; continue; }
      if (edState !== st) return;
      const base = (f.name || 'photo').replace(/\.[^.]+$/, '').slice(0, 60) || 'photo';
      const r = await filesCol.add({ name: base + p.ext, ext: p.ext, mime: p.mime, size: p.buf.byteLength, scope: NIMG, noteId: st.noteId,
        folderId: null, w: p.w, h: p.h, createdAt: Date.now(), uploaded: false });
      imgURLs.set(r.id, URL.createObjectURL(new Blob([p.buf], { type: p.mime })));
      try { await idbPut(r.id, p.buf); } catch (e) {}
      st.added.add(r.id);
      if (edState !== st) return;
      const ew = st.ed.clientWidth || 600, ratio = p.h / p.w;
      const px = Math.min(ew, p.w, Math.max(160, 440 / ratio));
      const w = clampN(Math.round(px / ew * 100), 10, 100);
      const node = makeImgNode({ id: r.id, w, x: (100 - w) / 2, r: ratio });
      if (prev) prev.after(node); else placeNode(node, range);
      prev = node;
    }
    if (bad) photoToast("Couldn't read " + bad);
    if (!prev) return;
    ensureLineAfter(prev);
    pumpUploads();
    selectImg(prev);
    contentChanged(true);
    try { prev.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
  }
  function insertFragment(frag) {
    const st = edState, ed = st.ed, s = window.getSelection();
    histFlush();
    let rg = s && s.rangeCount && ed.contains(s.getRangeAt(0).startContainer) ? s.getRangeAt(0) : curRange();
    if (!rg) { rg = document.createRange(); rg.selectNodeContents(ed); rg.collapse(false); }
    rg.deleteContents();
    const last = frag.lastChild, ids = [...frag.querySelectorAll('.n-img')].map(x => x.getAttribute('data-id'));
    rg.insertNode(frag);
    if (last && last.isConnected) { const r2 = document.createRange(); r2.setStartAfter(last); r2.collapse(true); s.removeAllRanges(); s.addRange(r2); }
    ids.forEach(id => { const f = files.find(x => x.id === id); if (f && f.noteId !== st.noteId) filesCol.doc(id).update({ noteId: st.noteId }); });
    contentChanged(true);
  }
  function onNotePaste(e) {
    const st = edState, cd = e.clipboardData; if (!st || !cd) return;
    const pics = [...(cd.files || [])].filter(isPicFile);
    if (pics.length) { e.preventDefault(); insertPhotos(pics, curRange()); return; }
    const html = cd.getData('text/html');
    if (html && /data-id="?[a-z0-9]{6,40}/.test(html)) {
      const frag = buildBody(html, true);
      if (frag.querySelector('.n-img')) { e.preventDefault(); insertFragment(frag); return; }
    }
    // everything else goes in as plain text (no styles from websites)
    const text = cd.getData('text/plain');
    e.preventDefault();
    if (text) document.execCommand('insertText', false, text);
  }
  document.addEventListener('paste', e => {
    if (!edState || currentPage !== 'notes' || edState.ed.contains(e.target) || isField(document.activeElement)) return;
    const pics = [...((e.clipboardData && e.clipboardData.files) || [])].filter(isPicFile);
    if (pics.length) { e.preventDefault(); insertPhotos(pics, curRange()); }
  });

  // ---------- drag files / text in from outside ----------
  function dragHasImages(e) {
    const dt = e.dataTransfer; if (!dt) return false;
    const items = [...(dt.items || [])];
    if (items.length) return items.some(it => it.kind === 'file' && /^image\//.test(it.type));
    return [...(dt.types || [])].includes('Files');
  }
  function caretPos(x, y) {
    if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); return r ? { node: r.startContainer, off: r.startOffset } : null; }
    if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); return p ? { node: p.offsetNode, off: p.offset } : null; }
    return null;
  }
  const inEd = p => p && edState && (p.node === edState.ed || edState.ed.contains(p.node));
  function posRect(p) {
    const r = document.createRange();
    try { r.setStart(p.node, p.off); r.collapse(true); } catch (e) { return null; }
    const rs = r.getClientRects();
    let rc = rs.length ? rs[0] : null;
    if (!rc || (!rc.height && !rc.top)) {
      let n = p.node.nodeType === 1 ? (p.node.childNodes[p.off] || p.node.childNodes[p.off - 1] || p.node) : p.node.parentNode;
      if (n && n.nodeType === 3) n = n.parentNode;
      rc = n && n.getBoundingClientRect ? n.getBoundingClientRect() : null;
    }
    return rc;
  }
  function onEdDragOver(e) {
    const st = edState; if (!st || !e.dataTransfer) return;
    if ([...(e.dataTransfer.types || [])].includes('Files')) {
      if (!dragHasImages(e)) return;                       // Excel files: the page takes them
      e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy';
      const er = st.ed.getBoundingClientRect(), slot = lineSlot(e.clientY, true, null);
      if (!fileCaret.parentNode) document.body.appendChild(fileCaret);
      Object.assign(fileCaret.style, { left: er.left + 'px', width: er.width + 'px', top: (slot.top - 1.5) + 'px' });
      return;
    }
    if (!st.innerDrag) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }
  }
  function onEdDrop(e) {
    const st = edState, dt = e.dataTransfer; if (!st || !dt) return;
    fileCaret.remove();
    const p = caretPos(e.clientX, e.clientY);
    if ([...(dt.types || [])].includes('Files')) {
      const pics = [...(dt.files || [])].filter(isPicFile);
      if (!pics.length) return;
      e.preventDefault(); e.stopPropagation();
      insertPhotos(pics, rangeAt(lineSlot(e.clientY, true, null).p));   // between lines, not in the middle of a word
      return;
    }
    if (st.innerDrag) return;                               // moving text inside the note: the browser does it
    e.preventDefault();
    const text = dt.getData('text/plain'); if (!text) return;
    st.ed.focus();
    if (inEd(p)) { const r = document.createRange(); r.setStart(p.node, p.off); r.collapse(true); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
    document.execCommand('insertText', false, text);
  }
  document.addEventListener('dragend', () => fileCaret.remove());
  document.addEventListener('drop', () => fileCaret.remove());

  // ---------- selecting a photo ----------
  function selectImg(s) {
    if (selImg && selImg !== s) selImg.classList.remove('sel');
    selImg = s; s.classList.add('sel');
    buildSelBox();
    positionSel();
  }
  function deselectImg() {
    if (selImg) selImg.classList.remove('sel');
    selImg = null;
    if (selBox.parentNode) selBox.remove();
  }
  function buildSelBox() {
    selBox.innerHTML = '';
    ['tl', 'tr', 'bl', 'br'].forEach(h => {
      const k = el('i', 'n-h ' + h);
      k.addEventListener('mousedown', e => { if (e.button !== 0) return; e.preventDefault(); e.stopPropagation(); beginResize(h, e.clientX, e.clientY, false); });
      k.addEventListener('touchstart', e => { if (e.cancelable) e.preventDefault(); e.stopPropagation(); const t = e.touches[0]; beginResize(h, t.clientX, t.clientY, true); }, { passive: false });
      selBox.appendChild(k);
    });
    const tb = el('div', 'n-tb');
    const btn = (k, title, fn, cls) => {
      const b = el('button', cls || null, NI[k]); b.type = 'button'; b.title = title; b.setAttribute('aria-label', title); b.dataset.k = k;
      b.addEventListener('mousedown', e => e.preventDefault());
      b.addEventListener('click', e => { e.stopPropagation(); fn(); });
      tb.appendChild(b);
    };
    btn('left', 'Left, text around it', () => alignImg('l'));
    btn('center', 'Center', () => alignImg('c'));
    btn('right', 'Right, text around it', () => alignImg('r'));
    tb.appendChild(el('i'));
    btn('trash', 'Delete photo', () => { if (selImg) removeImg(selImg); }, 'danger');
    selBox.appendChild(tb);
  }
  function positionSel() {
    if (!selImg) return;
    if (!edState || !selImg.isConnected || !edState.ed.contains(selImg)) { deselectImg(); return; }
    if (imgOp && imgOp.type === 'drag') { if (selBox.parentNode) selBox.remove(); return; }
    if (selBox.parentNode !== pageN) pageN.appendChild(selBox);
    const pr = pageN.getBoundingClientRect(), r = selImg.getBoundingClientRect(), pad = 3;
    Object.assign(selBox.style, { left: (r.left - pr.left - pad) + 'px', top: (r.top - pr.top - pad) + 'px', width: (r.width + pad * 2) + 'px', height: (r.height + pad * 2) + 'px' });
    const tb = selBox.querySelector('.n-tb'); if (!tb) return;
    tb.classList.toggle('out', r.width < 196 || r.height < 96);
    // keep the toolbar on screen when a small photo sits at the edge
    const tw = tb.offsetWidth, bw = r.width + pad * 2, boxLeft = r.left - pr.left - pad;
    tb.style.left = clampN((bw - tw) / 2, -boxLeft, pr.width - boxLeft - tw) + 'px';
    const a = imgAttrs(selImg), c = Math.abs(a.x - (100 - a.w) / 2) < 0.6;
    tb.querySelectorAll('button').forEach(b => b.classList.toggle('on',
      (b.dataset.k === 'center' && c) || (b.dataset.k === 'left' && !c && a.x < 0.6) || (b.dataset.k === 'right' && !c && a.x + a.w > 99.4)));
  }
  function alignImg(where) {
    const s = selImg; if (!s) return;
    histFlush();
    const a = imgAttrs(s);
    setImgAttrs(s, { ...a, x: where === 'l' ? 0 : where === 'r' ? 100 - a.w : (100 - a.w) / 2 });
    contentChanged(true);
  }
  function removeImg(s) {
    histFlush();
    const parent = s.parentNode;
    deselectImg();
    s.remove();
    tidyAfterRemove(parent);
    contentChanged(true);
  }
  const isField = a => !!a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || (a.isContentEditable && !(edState && a === edState.ed)));
  document.addEventListener('keydown', e => {
    const st = edState; if (!st || currentPage !== 'notes') return;
    const ae = document.activeElement, mod = e.metaKey || e.ctrlKey;
    if (mod && !e.altKey && (e.code === 'KeyZ' || e.code === 'KeyY') && (ae === st.ed || (selImg && !isField(ae)))) {
      e.preventDefault();
      if (e.code === 'KeyY' || e.shiftKey) noteRedo(); else noteUndo();
      return;
    }
    if (!selImg || isField(ae)) return;
    if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); removeImg(selImg); }
    else if (e.key === 'Escape' || e.key === 'Enter' || e.key === 'Tab' || e.key.startsWith('Arrow') || (e.key.length === 1 && !mod)) deselectImg();
  }, true);
  document.addEventListener('click', e => {
    if (Date.now() - suppressClick < 350) { e.preventDefault(); e.stopPropagation(); return; }
    if (selImg && !selImg.contains(e.target) && !selBox.contains(e.target)) deselectImg();
  }, true);
  document.addEventListener('selectionchange', () => {
    if (!edState) return;
    const s = window.getSelection();
    if (s && s.rangeCount && edState.ed.contains(s.anchorNode)) edState.lastRange = s.getRangeAt(0).cloneRange();
  });
  window.addEventListener('resize', () => positionSel());

  // ---------- mouse / touch on a photo ----------
  function trackPointer(touch, onMove, onEnd) {
    const mv = touch ? 'touchmove' : 'mousemove', up = touch ? 'touchend' : 'mouseup';
    const pos = ev => { const t = touch ? ((ev.touches && ev.touches[0]) || (ev.changedTouches && ev.changedTouches[0])) : ev; return t && t.clientX != null ? [t.clientX, t.clientY] : [null, null]; };
    const opts = { passive: false, capture: true };
    const move = ev => { const [x, y] = pos(ev); if (x != null) onMove(x, y, ev); };
    const done = cancel => ev => {
      document.removeEventListener(mv, move, opts); document.removeEventListener(up, endOk, true);
      document.removeEventListener('touchcancel', endCancel, true); window.removeEventListener('blur', endCancel);
      const [x, y] = pos(ev); onEnd(x, y, ev, cancel);
    };
    const endOk = done(false), endCancel = done(true);
    document.addEventListener(mv, move, opts); document.addEventListener(up, endOk, true);
    if (touch) document.addEventListener('touchcancel', endCancel, true);
    window.addEventListener('blur', endCancel);
  }
  function onImgMouseDown(e) {
    const s = closestImg(e.target); if (!s || e.button !== 0) return;
    e.preventDefault();
    const x0 = e.clientX, y0 = e.clientY;
    let dragging = false;
    trackPointer(false, (x, y) => {
      if (!dragging && Math.hypot(x - x0, y - y0) > 4) { dragging = true; beginDrag(s, x0, y0); }
      if (dragging) dragMove(x, y);
    }, (x, y, ev, cancel) => { if (dragging) finishDrag(cancel, false); else if (!cancel) selectImg(s); });
  }
  // phone: tap = select, drag a selected photo = move it, long press on any photo = select and move
  let touchT = null;   // the touch that started on a photo (the editor's touchmove blocks scrolling once it is armed)
  function onImgTouchStart(e) {
    const s = closestImg(e.target); if (!s || e.touches.length !== 1 || imgOp) return;
    const t0 = e.touches[0];
    const T = touchT = { x0: t0.clientX, y0: t0.clientY, armed: s === selImg, moved: false, dragging: false, timer: 0 };
    if (!T.armed) T.timer = setTimeout(() => { if (T.moved || touchT !== T) return; T.armed = true; selectImg(s); if (navigator.vibrate) navigator.vibrate(10); }, 380);
    trackPointer(true, (x, y, ev) => {
      const d = Math.hypot(x - T.x0, y - T.y0);
      if (!T.armed) { if (d > 8) { T.moved = true; clearTimeout(T.timer); } return; }   // the page is scrolling
      if (ev.cancelable) ev.preventDefault();
      if (!T.dragging && d > 4) { T.dragging = true; beginDrag(s, T.x0, T.y0, true); }
      if (T.dragging) dragMove(x, y);
    }, (x, y, ev, cancel) => {
      clearTimeout(T.timer);
      if (touchT === T) touchT = null;
      if (T.dragging) { if (ev.cancelable) ev.preventDefault(); finishDrag(cancel, true); return; }
      if (cancel || T.moved) return;
      if (ev.cancelable) ev.preventDefault();                 // a tap on a photo: no keyboard, no caret
      selectImg(s);
    });
  }

  // ---------- moving a photo ----------
  function beginDrag(s, x0, y0, touch) {
    const ir = s.getBoundingClientRect();
    if (!ir.width) return;
    if (selBox.parentNode) selBox.remove();
    const gw = Math.min(ir.width, 200, window.innerWidth * 0.34), gh = ir.height * gw / ir.width;
    const ghost = document.createElement('img'); ghost.className = 'n-ghost'; ghost.alt = '';
    if (s.firstChild.src) ghost.src = s.firstChild.src;
    ghost.style.width = gw + 'px'; ghost.style.height = gh + 'px';
    const box = el('div', 'n-drop'); box.style.display = 'none';
    document.body.appendChild(box); document.body.appendChild(ghost);
    s.classList.add('ghosted');
    document.body.classList.add('n-dragging');
    imgOp = { type: 'drag', s, a: imgAttrs(s), ghost, box, gx: (x0 - ir.left) / ir.width, gy: (y0 - ir.top) / ir.height, gw, gh, cx: x0, cy: y0, target: null,
      // with a finger the small copy floats above it, so the finger does not hide it
      ox: touch ? gw / 2 : null, oy: touch ? gh + 18 : null };
    dragMove(x0, y0);
    if (!asRaf) asRaf = requestAnimationFrame(autoScrollTick);
  }
  function dragMove(x, y) {
    const op = imgOp; if (!op || op.type !== 'drag') return;
    op.cx = x; op.cy = y;
    const gx = op.ox != null ? x - op.ox : x - op.gx * op.gw, gy = op.oy != null ? y - op.oy : y - op.gy * op.gh;
    op.ghost.style.transform = 'translate(' + Math.round(gx) + 'px,' + Math.round(gy) + 'px)';
    const t = op.target = photoDropTarget(x, y, op);
    if (!t) { op.box.style.display = 'none'; return; }
    Object.assign(op.box.style, { display: 'block', left: t.box.left + 'px', top: t.box.top + 'px', width: t.box.width + 'px', height: t.box.height + 'px' });
  }
  // the text position at the start (or end) of the line at height y, stepping over photos that float there
  function probeLine(px, py, dragged) {
    const ed = edState.ed;
    for (let i = 0; i < 4; i++) {
      const p = caretPos(px, py);
      if (!inEd(p)) return null;
      const im = closestImg(p.node);
      if (!im) return p;
      if (im === dragged) return { self: true };
      const ir = im.getBoundingClientRect();
      if (im.classList.contains('fl') && px < ir.right) { px = ir.right + 2; continue; }
      if (im.classList.contains('fr') && px > ir.left) { px = ir.left - 2; continue; }
      return { img: im, before: py < ir.top + ir.height / 2 };
    }
    return null;
  }
  // where a photo lands for height y: at the start of that line (floating photos), or between lines (photos on their own line:
  // before the line, or after it when the finger is in its lower half). Returns the text position and the y where the photo's top goes.
  function lineSlot(py, between, dragged) {
    const ed = edState.ed, er = ed.getBoundingClientRect();
    py = clampN(py, er.top + 2, er.bottom - 2);
    let p = probeLine(er.left + 2, py, dragged), end = false;
    if (p && !p.img && !p.self && between) {
      const rc = posRect(p);
      if (rc && rc.height && py > rc.top + rc.height / 2) {
        const q = probeLine(er.right - 2, rc.top + rc.height / 2, dragged);
        if (q && !q.img && !q.self) { p = q; end = true; }
      }
    }
    if (p && !p.img && !p.self && between && !end) {
      // photos floating at the start of this line stay with their text: a photo on its own line goes in before them
      let n = p.node, off = p.off;
      if (n.nodeType === 3 && off === 0 && n.parentNode) { off = [...n.parentNode.childNodes].indexOf(n); n = n.parentNode; }
      if (n.nodeType === 1) {
        while (off > 0) {
          const prev = n.childNodes[off - 1];
          if (prev && ((prev.nodeType === 1 && (prev.classList.contains('fl') || prev.classList.contains('fr'))) || (prev.nodeType === 3 && !prev.nodeValue.length))) off--;
          else break;
        }
        p = { node: n, off };
      }
    }
    if (!p) p = { node: ed, off: ed.childNodes.length };
    let top;
    if (p.self) top = dragged.getBoundingClientRect().top;
    else if (p.img) { const ir = p.img.getBoundingClientRect(); top = p.before ? ir.top : ir.bottom; }
    else if (p.node === ed && p.off >= ed.childNodes.length) { const lc = ed.lastChild; top = lc && lc.getBoundingClientRect ? lc.getBoundingClientRect().bottom : er.top; }
    else { const rc = posRect(p); top = rc ? (end ? rc.bottom : rc.top) : er.top; }
    return { p, top };
  }
  function rangeAt(p) {
    const ed = edState.ed, rg = document.createRange();
    if (!p) { rg.selectNodeContents(ed); rg.collapse(false); return rg; }
    if (p.img) { if (p.before) rg.setStartBefore(p.img); else rg.setStartAfter(p.img); }
    else rg.setStart(p.node, p.off);
    rg.collapse(true);
    return rg;
  }
  function photoDropTarget(cx, cy, op) {
    const ed = edState.ed, er = ed.getBoundingClientRect(), ew = ed.clientWidth;
    if (!ew) return null;
    const wpx = op.a.w / 100 * ew, hpx = wpx * op.a.r;
    let x = clampN(((cx - er.left) - op.gx * wpx) / ew * 100, 0, 100 - op.a.w);
    for (const sx of [0, (100 - op.a.w) / 2, 100 - op.a.w]) if (Math.abs(x - sx) < 2.5) { x = sx; break; }
    const mode = imgMode(op.a.w, x);
    const { p, top } = lineSlot(cy, mode === 'b', op.s);
    return { p, x, mode, box: { left: er.left + x / 100 * ew, top, width: wpx, height: hpx } };
  }
  function autoScrollTick() {
    asRaf = 0;
    const op = imgOp; if (!op || op.type !== 'drag') return;
    const r = contentEl.getBoundingClientRect(), edge = 60;
    let v = 0;
    if (op.cy < r.top + edge) v = -(r.top + edge - op.cy) / 3;
    else if (op.cy > r.bottom - edge) v = (op.cy - (r.bottom - edge)) / 3;
    if (v) { const b = contentEl.scrollTop; contentEl.scrollTop = b + clampN(v, -22, 22); if (contentEl.scrollTop !== b) dragMove(op.cx, op.cy); }
    asRaf = requestAnimationFrame(autoScrollTick);
  }
  contentEl.addEventListener('scroll', () => { if (imgOp && imgOp.type === 'drag') dragMove(imgOp.cx, imgOp.cy); }, { passive: true });
  function finishDrag(cancel, touch) {
    const op = imgOp; if (!op || op.type !== 'drag') return;
    imgOp = null;
    if (asRaf) { cancelAnimationFrame(asRaf); asRaf = 0; }
    op.ghost.remove(); op.box.remove();
    op.s.classList.remove('ghosted');
    document.body.classList.remove('n-dragging');
    if (!touch) suppressClick = Date.now();
    const t = op.target, s = op.s;
    if (!edState || !s.isConnected) return;
    if (cancel || !t) { selectImg(s); return; }
    histFlush();
    if (!t.p.self) {
      try {
        const rg = rangeAt(t.p);
        const oldParent = s.parentNode;
        s.remove();
        rg.insertNode(s);
        tidyAfterRemove(oldParent);
        ensureLineAfter(s);
      } catch (e) { console.warn(e); }
    }
    setImgAttrs(s, { ...op.a, x: t.x });
    selectImg(s);
    contentChanged(true);
  }

  // ---------- resizing ----------
  function beginResize(h, x0, y0, touch) {
    const s = selImg; if (!s || !edState || imgOp) return;
    histFlush();
    const a = imgAttrs(s), ew = edState.ed.clientWidth || 1;
    const centered = Math.abs(a.x - (100 - a.w) / 2) < 0.6;
    const sx = h[1] === 'r' ? 1 : -1, sy = h[0] === 'b' ? 1 : -1;
    const lab = el('div', 'n-size'); lab.textContent = Math.round(a.w) + '%'; selBox.appendChild(lab);
    imgOp = { type: 'resize', s };
    trackPointer(touch, (x, y, ev) => {
      if (touch && ev.cancelable) ev.preventDefault();
      const gx = (x - x0) * sx * (centered ? 2 : 1), gy = (y - y0) * sy / a.r;
      const g = Math.abs(gy) > Math.abs(gx) ? gy : gx;
      let w = clampN(a.w + g / ew * 100, Math.max(8, 48 / ew * 100), 100);
      for (const sw of [25, 33.3, 50, 66.7, 75, 100]) if (Math.abs(w - sw) < 1.2) { w = sw; break; }
      const nx = centered ? (100 - w) / 2 : sx > 0 ? Math.min(a.x, 100 - w) : clampN(a.x + a.w - w, 0, 100 - w);
      setImgAttrs(s, { id: a.id, w, x: nx, r: a.r });
      lab.textContent = Math.round(w) + '%';
      positionSel();
    }, (x, y, ev, cancel) => {
      imgOp = null; lab.remove();
      if (!touch) suppressClick = Date.now();
      else if (ev && ev.cancelable) ev.preventDefault();
      if (cancel) setImgAttrs(s, a);
      contentChanged(true);
    });
  }

  // ================= levels =================
  const levelsCol = SyncDB.collection('levels');
  let levels = [];
  let lState = { id: null, creating: false, adding: false };
  levelsCol.orderBy('createdAt', 'asc').onSnapshot(s => {
    levels = s.docs.map(d => ({ id: d.id, ...d.data() }));
    levels.forEach(lv => {
      if (!lv.balance2 && (lv.sources || []).length) {
        const sources = lv.sources.map(x => x.type === 'board' && +x.xp === 20 ? { ...x, xp: 35 } : x);
        levelsCol.doc(lv.id).update({ sources, balance2: true });
      }
    });
    renderAll();
  });

  const SRC = {
    folder: { label: 'ToDo folder', unit: 'per task', def: 10, pick: 'folder', hint: 'This is for Medium or no difficulty. Easy gives half, Hard gives double, a deadline adds +5. Subfolders count too.' },
    board: { label: 'Territory board', unit: 'per square', def: 35, pick: 'board', hint: '+100 XP for every 10 in a row, +300 XP when the board is full.' },
    gymRecords: { label: 'Gym records', unit: 'per record', def: 40, hint: 'Every time you beat your best in Gym → Progress.' }
  };
  const PRIO_MULT = { 2: 2, 1: 1.5, 0: 1, '-1': 0.75, '-2': 0.5 };
  const RANKS = [[1, 'Novice'], [5, 'Apprentice'], [10, 'Adept'], [15, 'Expert'], [20, 'Master'], [30, 'Grandmaster'], [40, 'Legend']];
  const needFor = L => Math.round(60 * Math.pow(L, 1.5) / 5) * 5;
  function levelOf(total) {
    let L = 1, rest = total;
    while (rest >= needFor(L)) { rest -= needFor(L); L++; }
    return { level: L, into: rest, need: needFor(L), total };
  }
  const rankOf = L => RANKS.filter(r => L >= r[0]).pop()[1];

  function folderTree(id) {
    const out = [id];
    const walk = fid => allFolders.filter(f => (f.parentId || null) === fid).forEach(c => { out.push(c.id); walk(c.id); });
    walk(id);
    return out;
  }
  function srcTargetName(src) {
    if (src.type === 'folder') { const f = allFolders.find(x => x.id === src.id); return f ? f.name : 'Deleted folder'; }
    if (src.type === 'board') { const b = boards.find(x => x.id === src.id); return b ? b.name : 'Deleted board'; }
    return '';
  }
  function srcEvents(src) {
    const xp = Math.max(0, +src.xp || 0), ev = [];
    if (src.type === 'folder') {
      const ids = new Set(folderTree(src.id));
      allTasks.filter(t => t.done && t.completedAt && ids.has(t.folderId || null)).forEach(t => {
        const mult = t.difficulty === 'easy' ? 0.5 : t.difficulty === 'hard' ? 2 : 1;
        const tag = [t.difficulty ? t.difficulty : '', t.deadline ? 'deadline' : ''].filter(Boolean).join(', ');
        ev.push({ day: tsDay(t.completedAt), ts: t.completedAt, xp: Math.round(xp * mult) + (t.deadline ? 5 : 0), label: t.text + (tag ? ' (' + tag + ')' : '') });
      });
    } else if (src.type === 'board') {
      const b = boards.find(x => x.id === src.id); if (!b) return ev;
      const st = boardStats(b);
      st.cs.forEach(c => ev.push({ day: c.date, ts: c.filledAt, xp, label: b.name + ' square' }));
      st.runs.forEach(r => { for (let k = 10; k <= r.days.length; k += 10) ev.push({ day: numToStr(r.days[k - 1]), xp: 100, label: b.name + ': ' + k + ' in a row' }); });
      if (st.filled >= 100) ev.push({ day: st.cs.map(c => c.date).sort()[99], xp: 300, label: b.name + ' conquered' });
    } else if (src.type === 'gymWorkouts') {
      allGymLogs.forEach(l => ev.push({ day: tsDay(l.date), ts: l.date, xp, label: 'Workout' }));
    } else if (src.type === 'gymRecords') {
      allGymPEx.forEach(ex => { let max = null;
        allGymPLogs.filter(l => l.exerciseId === ex.id).sort((a, b) => a.date - b.date).forEach(l => {
          const v = +l.value; if (max !== null && v > max) ev.push({ day: tsDay(l.date), ts: l.date, xp, label: 'Record: ' + ex.name + ' ' + v + ' kg' });
          if (max === null || v > max) max = v; }); });
    } else if (src.type === 'weight') {
      [...new Set(allWeights.map(w => tsDay(w.date)))].forEach(d => ev.push({ day: d, xp, label: 'Weight logged' }));
    } else if (src.type === 'notes') {
      notes.filter(n => (n.body || '').length >= 50).forEach(n => ev.push({ day: tsDay(n.createdAt), ts: n.createdAt, xp, label: 'Note: ' + (n.title || 'Untitled') }));
    }
    return ev;
  }
  function levelData(lv) {
    const perSrc = (lv.sources || []).map((src, idx) => ({ src, idx })).filter(x => SRC[x.src.type]).map(({ src, idx }) => { const e = srcEvents(src); return { src, idx, events: e, xp: e.reduce((a, x) => a + x.xp, 0) }; });
    const events = perSrc.flatMap(p => p.events).sort((a, b) => (a.day === b.day ? (a.ts || 0) - (b.ts || 0) : a.day < b.day ? -1 : 1));
    const total = events.reduce((a, e) => a + e.xp, 0);
    const today = dayStr();
    const weekAgo = numToStr(dayNum(today) - 6);
    return { ...levelOf(total), perSrc, events, today: events.filter(e => e.day === today).reduce((a, e) => a + e.xp, 0),
      week: events.filter(e => e.day >= weekAgo).reduce((a, e) => a + e.xp, 0) };
  }

  function ringSVG(d, size, color) {
    const r = 44, c = 2 * Math.PI * r, pct = d.need ? d.into / d.need : 0;
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--border)" stroke-width="7"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"
        stroke-dasharray="${(c * pct).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 50 50)"/>
      <text x="50" y="44" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-dim)" letter-spacing="1.5">LVL</text>
      <text x="50" y="67" text-anchor="middle" font-size="${d.level >= 100 ? 22 : 28}" font-weight="800" fill="var(--text)">${d.level}</text></svg>`;
  }

  function goLevel(id) { currentPage = 'levels'; lState.id = id || null; lState.adding = false; renderAll(); autoCollapseOnMobile(); }
  function createLevel(name) {
    const now = Date.now();
    return levelsCol.add({ name, icon: 'star', color: COLORS[levels.length % COLORS.length], sources: [], createdAt: now, order: now });
  }
  function deleteLevel(lv) {
    if (!confirm('Delete level "' + lv.name + '"? Your tasks and boards stay, only this level goes.')) return;
    levelsCol.doc(lv.id).delete(); lState.id = null; renderAll();
  }

  const pageL = document.createElement('div'); pageL.id = 'page-levels'; pageL.className = 'page-wrap'; pageL.style.display = 'none';
  contentEl.appendChild(pageL);

  function renderLevels() {
    const lv = levels.find(x => x.id === lState.id);
    if (lState.id && !lv) lState.id = null;
    if (lv) renderLevel(lv); else renderLevelsOverview();
  }
  function renderLevelsOverview() {
    pageL.innerHTML = '';
    const head = el('div', 'x-head');
    const h = el('h1', 'x-title'); h.textContent = 'Levels';
    const nb = el('button', 'x-btn primary'); nb.textContent = 'New level';
    nb.addEventListener('click', () => { lState.creating = true; renderLevelsOverview(); });
    head.appendChild(h); head.appendChild(nb); pageL.appendChild(head);
    if (lState.creating) {
      const f = el('div', 'x-form');
      const inp = el('input'); inp.placeholder = 'Level name, e.g. Personal, Work, Gym'; inp.maxLength = 30;
      const ok = el('button', 'x-btn primary'); ok.textContent = 'Create';
      const cancel = el('button', 'x-btn'); cancel.textContent = 'Cancel';
      const submit = () => { const v = inp.value.trim(); if (!v) return; lState.creating = false; createLevel(v).then(r => { lState.adding = true; currentPage = 'levels'; lState.id = r.id; renderAll(); }); };
      ok.addEventListener('click', submit);
      cancel.addEventListener('click', () => { lState.creating = false; renderLevelsOverview(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') cancel.click(); });
      f.appendChild(inp); f.appendChild(ok); f.appendChild(cancel); pageL.appendChild(f);
      setTimeout(() => inp.focus(), 30);
    }
    if (!levels.length) {
      const e = el('div', 'x-empty'); e.textContent = 'Create a level and link it to a ToDo folder, a Territory board or your gym. Doing things there gives it XP.';
      pageL.appendChild(e); return;
    }
    const grid = el('div', 'lv-cards');
    levels.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(lv => {
      const d = levelData(lv), col = lv.color || COLORS[0];
      const card = el('button', 'lv-card');
      card.innerHTML = ringSVG(d, 64, col) + `<div class="lv-card-body"><div class="lv-card-name">${iconSVG(lv.icon || 'star', 14)}<span>${esc(lv.name)}</span></div>
        <div class="lv-rank">${rankOf(d.level)}</div>
        <div class="a-bar"><i style="width:${Math.round(d.into / d.need * 100)}%;background:${col}"></i></div>
        <div class="a-bar-label">${d.into} / ${d.need} XP</div></div>`;
      card.addEventListener('click', () => goLevel(lv.id));
      grid.appendChild(card);
    });
    pageL.appendChild(grid);
  }

  function renderLevel(lv) {
    const d = levelData(lv), col = lv.color || COLORS[0];
    pageL.innerHTML = '';
    const head = el('div', 'x-head');
    const iconBtn = el('button', 't-icon-btn', iconSVG(lv.icon || 'star', 22)); iconBtn.title = 'Change icon';
    iconBtn.addEventListener('click', e => { e.stopPropagation(); openIconPopover(iconBtn, ic => levelsCol.doc(lv.id).update({ icon: ic })); });
    const nameIn = el('input', 't-name-input'); nameIn.value = lv.name; nameIn.maxLength = 30;
    const saveName = () => { const v = nameIn.value.trim(); if (v && v !== lv.name) levelsCol.doc(lv.id).update({ name: v }); else nameIn.value = lv.name; };
    nameIn.addEventListener('blur', saveName);
    nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') nameIn.blur(); });
    const del = el('button', 'x-btn ghost-danger'); del.textContent = 'Delete';
    del.addEventListener('click', () => deleteLevel(lv));
    head.appendChild(iconBtn); head.appendChild(nameIn); head.appendChild(del);
    pageL.appendChild(head);

    const hero = el('div', 'lv-hero');
    hero.style.setProperty('--lv', col);
    hero.innerHTML = ringSVG(d, 116, col) + `<div class="lv-hero-body">
      <div class="lv-rank big">${rankOf(d.level)}</div>
      <div class="lv-bar"><i style="width:${Math.round(d.into / d.need * 100)}%"></i></div>
      <div class="lv-next">${d.into} / ${d.need} XP to level ${d.level + 1}</div>
      <div class="lv-mini"><div><b>${d.total}</b><span>Total XP</span></div><div><b>+${d.week}</b><span>Last 7 days</span></div><div><b>+${d.today}</b><span>Today</span></div></div></div>`;
    pageL.appendChild(hero);

    const colors = el('div', 't-colors'); colors.style.margin = '0 0 20px';
    COLORS.forEach(c => {
      const b = el('button', 't-color' + (col === c ? ' on' : '')); b.style.background = c; b.title = 'Color';
      b.addEventListener('click', () => levelsCol.doc(lv.id).update({ color: c }));
      colors.appendChild(b);
    });
    pageL.appendChild(colors);

    const sh = el('div', 'lv-sec'); sh.textContent = 'Linked to'; pageL.appendChild(sh);
    const list = el('div', 'lv-srcs');
    if (!d.perSrc.length) { const e = el('div', 't-hint'); e.textContent = 'Nothing linked yet. Add a source below, then XP starts counting, including everything you already did there.'; list.appendChild(e); }
    d.perSrc.forEach((p, i) => {
      const cfg = SRC[p.src.type] || { label: p.src.type, unit: '' };
      const r = el('div', 'lv-src');
      const target = srcTargetName(p.src);
      r.innerHTML = `<div class="lv-src-main"><b>${esc(cfg.label)}${target ? ': ' + esc(target) : ''}</b><span>${esc(cfg.hint || '')}</span></div>
        <label class="lv-xp"><input type="number" min="0" max="999" value="${+p.src.xp || 0}"><small>XP ${esc(cfg.unit)}</small></label>
        <div class="lv-earned">${p.xp} XP</div>`;
      const inp = r.querySelector('input');
      inp.addEventListener('change', () => {
        const v = Math.max(0, Math.min(999, Math.round(+inp.value || 0)));
        const sources = (lv.sources || []).map((s2, j) => j === p.idx ? { ...s2, xp: v } : s2);
        levelsCol.doc(lv.id).update({ sources });
      });
      const rm = el('button', 'lv-rm', I.trash); rm.title = 'Unlink';
      rm.addEventListener('click', () => {
        if (!confirm('Unlink "' + cfg.label + (target ? ': ' + target : '') + '" from this level?')) return;
        levelsCol.doc(lv.id).update({ sources: (lv.sources || []).filter((_, j) => j !== p.idx) });
      });
      r.appendChild(rm);
      list.appendChild(r);
    });
    pageL.appendChild(list);

    if (lState.adding) {
      const f = el('div', 'lv-add');
      const typeSel = el('select');
      Object.keys(SRC).forEach(k => { const o = el('option'); o.value = k; o.textContent = SRC[k].label; typeSel.appendChild(o); });
      const tgtSel = el('select');
      const xpIn = el('input'); xpIn.type = 'number'; xpIn.min = '0'; xpIn.max = '999';
      const unit = el('small');
      const fill = () => {
        const cfg = SRC[typeSel.value];
        xpIn.value = cfg.def; unit.textContent = 'XP ' + cfg.unit;
        tgtSel.innerHTML = '';
        if (cfg.pick === 'folder') {
          const add = (parent, depth) => allFolders.filter(x => (x.parentId || null) === parent).forEach(x => {
            const o = el('option'); o.value = x.id; o.textContent = '\u00a0\u00a0'.repeat(depth) + x.name; tgtSel.appendChild(o); add(x.id, depth + 1); });
          add(null, 0);
        } else if (cfg.pick === 'board') {
          boards.forEach(b => { const o = el('option'); o.value = b.id; o.textContent = b.name; tgtSel.appendChild(o); });
        }
        tgtSel.style.display = cfg.pick ? '' : 'none';
        ok.disabled = !!cfg.pick && !tgtSel.options.length;
        note.textContent = cfg.pick && !tgtSel.options.length ? (cfg.pick === 'folder' ? 'Create a ToDo folder first.' : 'Create a Territory board first.') : (cfg.hint || '');
      };
      const ok = el('button', 'x-btn primary'); ok.textContent = 'Link';
      const cancel = el('button', 'x-btn'); cancel.textContent = 'Cancel';
      const note = el('div', 't-hint'); note.style.flexBasis = '100%';
      typeSel.addEventListener('change', fill);
      ok.addEventListener('click', () => {
        const cfg = SRC[typeSel.value];
        const src = { type: typeSel.value, xp: Math.max(0, Math.min(999, Math.round(+xpIn.value || 0))) };
        if (cfg.pick) src.id = tgtSel.value;
        lState.adding = false;
        levelsCol.doc(lv.id).update({ sources: (lv.sources || []).concat([src]) });
      });
      cancel.addEventListener('click', () => { lState.adding = false; renderLevel(lv); });
      const xpWrap = el('label', 'lv-xp'); xpWrap.appendChild(xpIn); xpWrap.appendChild(unit);
      f.appendChild(typeSel); f.appendChild(tgtSel); f.appendChild(xpWrap); f.appendChild(ok); f.appendChild(cancel); f.appendChild(note);
      pageL.appendChild(f);
      fill();
    } else {
      const add = el('button', 'x-btn'); add.textContent = '+ Link a source'; add.style.marginBottom = '22px';
      add.addEventListener('click', () => { lState.adding = true; renderLevel(lv); });
      pageL.appendChild(add);
    }

    if (d.events.length) {
      const hh = el('div', 'lv-sec'); hh.textContent = 'Recent XP'; pageL.appendChild(hh);
      const hist = el('div', 'a-m-hist');
      d.events.slice(-20).reverse().forEach(e => {
        const r = el('div'); r.innerHTML = `<b style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.label)}</b><span style="white-space:nowrap"><em class="lv-plus">+${e.xp}</em> · ${fmtDay(e.day)}</span>`;
        hist.appendChild(r);
      });
      pageL.appendChild(hist);
    }
    const curve = el('div', 't-hint'); curve.style.marginTop = '14px';
    curve.textContent = 'Each level needs more XP than the one before: level 2 needs ' + needFor(1) + ' XP, level 5 about ' +
      [1, 2, 3, 4].reduce((a, L) => a + needFor(L), 0) + ' in total, level 10 about ' + [1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((a, L) => a + needFor(L), 0) + '.';
    pageL.appendChild(curve);
  }

  // level-up toasts
  function checkLevelUps() {
    let seen = {};
    try { seen = JSON.parse(localStorage.getItem('tgr_lvl_seen') || '{}') || {}; } catch (e) {}
    const next = {};
    levels.forEach(lv => {
      const d = levelData(lv); next[lv.id] = d.level;
      if (seen[lv.id] !== undefined && d.level > seen[lv.id]) {
        const col = lv.color || COLORS[0];
        toastQueue.push({ html: ringSVG(d, 42, col) + '<div><small>Level up</small><b>' + esc(lv.name) + ': level ' + d.level + '</b></div>', open: () => goLevel(lv.id) });
      }
    });
    try { localStorage.setItem('tgr_lvl_seen', JSON.stringify(next)); } catch (e) {}
  }

  // ================= profile =================
  const PROFILE_NAME = 'Tamer';
  const profCard = el('div'); profCard.id = 'prof-card';
  const sbEl = document.getElementById('sidebar');
  sbEl.insertBefore(profCard, sbEl.firstChild);
  const avatarInput = el('input'); avatarInput.type = 'file'; avatarInput.accept = 'image/*'; avatarInput.style.display = 'none';
  document.body.appendChild(avatarInput);
  avatarInput.addEventListener('change', () => {
    const f = avatarInput.files && avatarInput.files[0]; avatarInput.value = '';
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const S = 256, c = document.createElement('canvas'); c.width = S; c.height = S;
      const side = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, S, S);
      URL.revokeObjectURL(url);
      settingsCol.doc('profile').set({ ...profile, k: 'profile', avatar: c.toDataURL('image/jpeg', 0.85) });
    };
    img.onerror = () => { URL.revokeObjectURL(url); alert('Could not read this image.'); };
    img.src = url;
  });
  function avatarHTML(size) {
    if (profile.avatar) return `<img class="prof-av" src="${profile.avatar}" alt="" style="width:${size}px;height:${size}px">`;
    return `<span class="prof-av prof-av-empty" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px">T</span>`;
  }
  function accountLevel() {
    return levelOf(levels.reduce((a, lv) => a + levelData(lv).total, 0));
  }
  window.renderProfileCard = function () {
    const acc = accountLevel();
    profCard.className = currentPage === 'profile' ? 'active' : '';
    profCard.innerHTML = avatarHTML(34) + `<div class="prof-meta"><b>${PROFILE_NAME}</b><span>${levels.length ? 'Level ' + acc.level + ' · ' + rankOf(acc.level) : 'No levels yet'}</span></div>`;
  };
  profCard.addEventListener('click', () => { currentPage = 'profile'; renderAll(); autoCollapseOnMobile(); });

  const pageP = document.createElement('div'); pageP.id = 'page-profile'; pageP.className = 'page-wrap'; pageP.style.display = 'none';
  contentEl.appendChild(pageP);
  window.renderProfilePage = function () {
    const acc = accountLevel();
    const trophies = (achCache || computeAll()).reduce((a, r) => a + r.events.length, 0) + customs.length;
    pageP.innerHTML = '';
    const top = el('div', 'prof-top');
    const avBtn = el('button', 'prof-av-btn', avatarHTML(104) + '<span class="prof-cam"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 8H7.5L9 6H15L16.5 8H20V19H4Z"/><circle cx="12" cy="13" r="3.2"/></svg></span>');
    avBtn.title = 'Change photo'; avBtn.setAttribute('aria-label', 'Change photo');
    avBtn.addEventListener('click', () => avatarInput.click());
    const info = el('div', 'prof-info');
    info.innerHTML = `<h1>${PROFILE_NAME}</h1>
      <div class="lv-rank">${levels.length ? 'Level ' + acc.level + ' · ' + rankOf(acc.level) : 'Create a level to start'}</div>
      ${levels.length ? `<div class="lv-bar" style="--lv:var(--accent)"><i style="width:${Math.round(acc.into / acc.need * 100)}%"></i></div>
      <div class="lv-next">${acc.into} / ${acc.need} XP to level ${acc.level + 1}</div>` : ''}
      <div class="prof-stats"><div><b>${levels.reduce((a, lv) => a + levelData(lv).total, 0)}</b><span>Total XP</span></div><div><b>${trophies}</b><span>Trophies</span></div></div>`;
    top.appendChild(avBtn); top.appendChild(info);
    pageP.appendChild(top);
    if (profile.avatar) {
      const rm = el('button', 'prof-rm'); rm.textContent = 'Remove photo';
      rm.addEventListener('click', () => { const { avatar, ...rest } = profile; settingsCol.doc('profile').set({ ...rest, k: 'profile' }); });
      pageP.appendChild(rm);
    }
    if (levels.length) {
      const h = el('div', 'lv-sec'); h.textContent = 'Levels'; h.style.marginTop = '22px'; pageP.appendChild(h);
      const list = el('div', 'prof-levels');
      levels.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(lv => {
        const d = levelData(lv), col = lv.color || COLORS[0];
        const r = el('div', 'prof-lv');
        r.innerHTML = ringSVG(d, 58, col) + `<div class="lv-card-body"><div class="lv-card-name">${iconSVG(lv.icon || 'star', 14)}<span>${esc(lv.name)}</span></div>
          <div class="lv-rank">${rankOf(d.level)}</div>
          <div class="a-bar"><i style="width:${Math.round(d.into / d.need * 100)}%;background:${col}"></i></div>
          <div class="a-bar-label">${d.into} / ${d.need} XP · ${d.total} XP total</div></div>`;
        list.appendChild(r);
      });
      pageP.appendChild(list);
    }
  };

  // ================= files (Excel viewer) + Finance =================
  const filesCol = SyncDB.collection('files');
  const finFoldersCol = SyncDB.collection('finFolders');
  let files = [], finFolders = [];
  const finState = { folderId: null, creatingIn: undefined };
  const xState = { fileId: null, sheet: 0, query: '' };
  filesCol.orderBy('createdAt', 'asc').onSnapshot(s => { files = s.docs.map(d => ({ id: d.id, ...d.data() })); renderAll(); pumpUploads(); });
  finFoldersCol.orderBy('createdAt', 'asc').onSnapshot(s => { finFolders = s.docs.map(d => ({ id: d.id, ...d.data() })); renderAll(); });
  const FILE_EXT = ['.xlsx', '.xlsm', '.xls', '.csv', '.ods'];
  const MAX_FILE = 25 * 1024 * 1024;
  const extOf = name => { const m = /\.[^.]+$/.exec(name || ''); return m ? m[0].toLowerCase() : ''; };
  const filePath = f => 'files/' + f.id + (f.ext || '.xlsx');
  const fmtSize = b => b < 1024 ? b + ' B' : b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

  // --- local copy of each file (IndexedDB), so files open offline ---
  let idbP = null;
  function idb() {
    if (!idbP) idbP = new Promise((res, rej) => {
      const r = indexedDB.open('tgr_files', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('blobs');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return idbP;
  }
  async function idbOp(mode, fn) {
    const db = await idb();
    return new Promise((res, rej) => { const tx = db.transaction('blobs', mode); const rq = fn(tx.objectStore('blobs')); tx.oncomplete = () => res(rq && rq.result); tx.onerror = () => rej(tx.error); });
  }
  const idbGet = id => idbOp('readonly', s => s.get(id)).catch(() => null);
  const idbPut = (id, buf) => idbOp('readwrite', s => s.put(buf, id));
  const idbDel = id => idbOp('readwrite', s => s.delete(id)).catch(() => {});

  // --- GitHub file storage (files/ folder of the private data repo) ---
  function ghCfg() { try { return SyncDB.getConfig(); } catch (e) { return null; } }
  function ghUrl(cfg, path) { return 'https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo + '/contents/' + path.split('/').map(encodeURIComponent).join('/'); }
  const ghH = (cfg, accept) => ({ Accept: accept || 'application/vnd.github+json', Authorization: 'Bearer ' + cfg.token, 'X-GitHub-Api-Version': '2022-11-28' });
  function toB64(buf) {
    const bytes = new Uint8Array(buf); let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  async function ghSha(cfg, path) {
    const r = await fetch(ghUrl(cfg, path) + '?t=' + Date.now(), { headers: ghH(cfg), cache: 'no-store' });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('GitHub error ' + r.status);
    return (await r.json()).sha;
  }
  async function ghPut(cfg, path, buf) {
    const body = { message: 'file ' + path, content: toB64(buf) };
    let r = await fetch(ghUrl(cfg, path), { method: 'PUT', headers: { ...ghH(cfg), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (r.status === 422 || r.status === 409) { body.sha = await ghSha(cfg, path); r = await fetch(ghUrl(cfg, path), { method: 'PUT', headers: { ...ghH(cfg), 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
    if (!r.ok) throw new Error('Upload failed (' + r.status + ')');
  }
  async function ghGet(cfg, path) {
    const r = await fetch(ghUrl(cfg, path) + '?t=' + Date.now(), { headers: ghH(cfg, 'application/vnd.github.raw'), cache: 'no-store' });
    if (!r.ok) throw new Error(r.status === 404 ? 'File is not on GitHub yet. Open it on the device you added it from while online.' : 'Download failed (' + r.status + ')');
    return r.arrayBuffer();
  }
  async function ghDel(cfg, path) {
    const sha = await ghSha(cfg, path); if (!sha) return;
    const r = await fetch(ghUrl(cfg, path), { method: 'DELETE', headers: { ...ghH(cfg), 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'delete ' + path, sha }) });
    if (!r.ok && r.status !== 404) throw new Error('Delete failed');
  }

  // uploads that are waiting for internet, and deletions that are waiting too
  const uploading = new Set();
  const DELQ = 'tgr_file_delq';
  const getDelQ = () => { try { return JSON.parse(localStorage.getItem(DELQ) || '[]'); } catch (e) { return []; } };
  const setDelQ = q => { try { localStorage.setItem(DELQ, JSON.stringify(q)); } catch (e) {} };
  async function pumpUploads() {
    const cfg = ghCfg(); if (!cfg || !navigator.onLine) return;
    for (const f of files.filter(x => !x.uploaded && !uploading.has(x.id))) {
      const buf = await idbGet(f.id); if (!buf) continue;
      uploading.add(f.id);
      try { await ghPut(cfg, filePath(f), buf); filesCol.doc(f.id).update({ uploaded: true }); }
      catch (e) { console.warn(e); }
      finally { uploading.delete(f.id); }
    }
    const q = getDelQ(), left = [];
    for (const p of q) { try { await ghDel(cfg, p); } catch (e) { left.push(p); } }
    if (q.length) setDelQ(left);
  }
  window.addEventListener('online', () => setTimeout(pumpUploads, 800));
  setInterval(pumpUploads, 90000);

  // --- adding files ---
  const fileInput = el('input'); fileInput.type = 'file'; fileInput.multiple = true; fileInput.accept = FILE_EXT.join(',');
  fileInput.style.display = 'none'; document.body.appendChild(fileInput);
  let pickTarget = null;
  fileInput.addEventListener('change', () => { const fl = [...(fileInput.files || [])]; fileInput.value = ''; if (pickTarget) addFiles(fl, pickTarget.scope, pickTarget.folderId); });
  function pickFiles(scope, folderId) { pickTarget = { scope, folderId: folderId || null }; fileInput.click(); }
  function notify(text) { toastQueue.push({ html: '<div><small>Files</small><b>' + esc(text) + '</b></div>', open: () => {} }); showNextToast(); }
  async function addFiles(list, scope, folderId) {
    const ok = list.filter(f => FILE_EXT.includes(extOf(f.name)));
    if (!ok.length) { notify('Only Excel files: .xlsx, .xls, .csv'); return; }
    let lastId = null;
    for (const f of ok) {
      if (f.size > MAX_FILE) { notify(f.name + ' is bigger than 25 MB'); continue; }
      const buf = await f.arrayBuffer();
      const r = await filesCol.add({ name: f.name, ext: extOf(f.name), size: f.size, scope, folderId: folderId || null, createdAt: Date.now(), uploaded: false });
      await idbPut(r.id, buf);
      lastId = r.id;
    }
    if (scope === 'finance') { openSection('__fin__'); if (folderId) expanded.add('ff:' + folderId); }
    else { openSection('__notes__'); if (folderId) expanded.add('nf:' + folderId); }
    saveExpanded();
    pumpUploads();
    if (ok.length === 1 && lastId) goFile(lastId); else { renderAll(); notify(ok.length + ' files added'); }
  }
  function deleteFile(f, ask = true) {
    if (ask && !confirm('Delete "' + f.name + '"?')) return;
    filesCol.doc(f.id).delete(); idbDel(f.id);
    if (f.uploaded) { setDelQ(getDelQ().concat([filePath(f)])); pumpUploads(); }
    if (xState.fileId === f.id) { xState.fileId = null; if (currentPage === 'xls') { if (f.scope === 'finance') goFinance(f.folderId || null); else { currentPage = 'notes'; nState.noteId = null; renderAll(); } } }
  }
  async function downloadFile(f) {
    let buf = await idbGet(f.id);
    if (!buf) { const cfg = ghCfg(); if (!cfg) return alert('Set up sync first'); buf = await ghGet(cfg, filePath(f)); idbPut(f.id, buf); }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([buf])); a.download = f.name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function fileMenu(f) {
    return rowEl => [
      { label: 'Rename', icon: 'edit', action: () => {
        const base = f.name.replace(/\.[^.]+$/, '');
        inlineEdit(rowEl.querySelector('.row-name'), base, v => filesCol.doc(f.id).update({ name: v + (f.ext || '') }));
      } },
      { label: 'Download', icon: 'down', action: () => downloadFile(f).catch(e => alert(e.message)) },
      { label: 'Delete file', icon: 'trash', danger: true, action: () => deleteFile(f) }
    ];
  }
  function filesIn(scope, folderId) { return files.filter(f => f.scope === scope && (f.folderId || null) === (folderId || null)).sort((a, b) => a.name.localeCompare(b.name, 'ru')); }
  function fileRows(list, scope, folderId, indent) {
    filesIn(scope, folderId).forEach(f => {
      list.appendChild(row({
        icon: I.sheet, name: f.name.replace(/\.[^.]+$/, ''), indent, meta: f.uploaded ? null : '•',
        active: currentPage === 'xls' && xState.fileId === f.id,
        onClick: () => goFile(f.id), menu: fileMenu(f)
      }));
    });
  }

  // --- drag and drop ---
  const hasFiles = e => e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files');
  function dropTarget(elm, getTarget) {
    elm.addEventListener('dragover', e => { if (!hasFiles(e)) return; e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'; elm.classList.add('drop-hover'); hideDropOverlay(); });
    elm.addEventListener('dragleave', () => elm.classList.remove('drop-hover'));
    elm.addEventListener('drop', e => { if (!hasFiles(e)) return; e.preventDefault(); e.stopPropagation(); elm.classList.remove('drop-hover'); const t = getTarget(); addFiles([...e.dataTransfer.files], t.scope, t.folderId); });
  }
  function currentDropTarget() {
    if (currentPage === 'finance') return { scope: 'finance', folderId: finState.folderId, label: 'Finance' + (finState.folderId ? ' / ' + ((finFolders.find(x => x.id === finState.folderId) || {}).name || '') : '') };
    if (currentPage === 'xls') { const f = files.find(x => x.id === xState.fileId); if (f) return { scope: f.scope, folderId: f.folderId || null, label: 'the same folder' }; }
    if (currentPage === 'notes') { const n = notes.find(x => x.id === nState.noteId); const fid = n ? n.folderId || null : null; return { scope: 'notes', folderId: fid, label: 'Notes' + (fid ? ' / ' + ((nFolders.find(x => x.id === fid) || {}).name || '') : '') }; }
    return { scope: 'finance', folderId: null, label: 'Finance' };
  }
  const mainEl = document.getElementById('main');
  const dropOv = el('div'); dropOv.id = 'drop-ov'; mainEl.appendChild(dropOv);
  let ovTimer = null;
  function hideDropOverlay() { dropOv.classList.remove('show'); }
  mainEl.addEventListener('dragover', e => {
    if (!hasFiles(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
    const toNote = currentPage === 'notes' && edState && dragHasImages(e);
    dropOv.innerHTML = '<div>' + (toNote ? NI.photo : I.sheet) + '<b>' + (toNote ? 'Drop to add photos to this note' : 'Drop to add to ' + esc(currentDropTarget().label)) + '</b></div>';
    dropOv.classList.add('show'); clearTimeout(ovTimer); ovTimer = setTimeout(hideDropOverlay, 250);
  });
  mainEl.addEventListener('drop', e => {
    if (!hasFiles(e)) return; e.preventDefault(); hideDropOverlay();
    let fl = [...e.dataTransfer.files];
    if (currentPage === 'notes' && edState) {   // photos dropped on an open note go into it (at the end)
      const pics = fl.filter(isPicFile);
      if (pics.length) { insertPhotos(pics, null); fl = fl.filter(f => !isPicFile(f)); if (!fl.length) return; }
    }
    const t = currentDropTarget(); addFiles(fl, t.scope, t.folderId);
  });
  window.addEventListener('dragover', e => { if (hasFiles(e)) e.preventDefault(); });
  window.addEventListener('drop', e => { if (hasFiles(e)) e.preventDefault(); });

  // --- Finance tree ---
  function fChildren(parentId) { return finFolders.filter(f => (f.parentId || null) === (parentId || null)).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ru')); }
  function finPath(fid) { const chain = []; while (fid) { const f = finFolders.find(x => x.id === fid); if (!f) break; chain.unshift(f); fid = f.parentId; } return chain; }
  function finMenuItems(folderId) {
    return [
      { label: 'Upload Excel file', icon: 'sheet', action: () => pickFiles('finance', folderId) },
      { label: 'New folder', icon: 'folder', action: () => { openSection('__fin__'); if (folderId) expanded.add('ff:' + folderId); saveExpanded(); finState.creatingIn = folderId || null; renderTree(); } }
    ];
  }
  function deleteFinFolder(f) {
    const ids = [], walk = id => { ids.push(id); fChildren(id).forEach(c => walk(c.id)); }; walk(f.id);
    const inside = files.filter(x => x.scope === 'finance' && ids.includes(x.folderId));
    if (!confirm('Delete folder "' + f.name + '"' + (inside.length ? ' and ' + inside.length + ' files inside' : '') + '?')) return;
    inside.forEach(x => deleteFile(x, false));
    ids.forEach(id => finFoldersCol.doc(id).delete());
    if (ids.includes(finState.folderId)) goFinance(null);
  }
  function finFolderForm(parentId, indent) {
    const r = el('div', 'inline-form-row'); r.style.paddingLeft = indent + 'px';
    const inp = el('input', 'fname'); inp.placeholder = 'folder name...';
    const ok = el('button', 'fok', '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.2 11.5L13 4.5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    const done = () => { const name = inp.value.trim(); finState.creatingIn = undefined; if (name) finFoldersCol.add({ name, parentId: parentId || null, createdAt: Date.now() }); renderTree(); };
    ok.addEventListener('click', e => { e.stopPropagation(); done(); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') done(); if (e.key === 'Escape') { finState.creatingIn = undefined; renderTree(); } });
    inp.addEventListener('click', e => e.stopPropagation());
    r.appendChild(inp); r.appendChild(ok); setTimeout(() => inp.focus(), 30);
    return r;
  }
  function renderFinTree(list, parentId, depth) {
    const indent = 6 + depth * 15;
    fChildren(parentId).forEach(f => {
      const key = 'ff:' + f.id, open = expanded.has(key);
      const hasKids = fChildren(f.id).length || filesIn('finance', f.id).length;
      const r = row({
        icon: I.folder, name: f.name, indent, chevron: hasKids ? open : null,
        active: currentPage === 'finance' && finState.folderId === f.id,
        onClick: () => { if (open && currentPage === 'finance' && finState.folderId === f.id) expanded.delete(key); else expanded.add(key); saveExpanded(); goFinance(f.id); },
        menu: rowEl => [{ label: 'Rename', icon: 'edit', action: () => inlineEdit(rowEl.querySelector('.row-name'), f.name, v => finFoldersCol.doc(f.id).update({ name: v })) }]
          .concat(finMenuItems(f.id), [{ label: 'Delete folder', icon: 'trash', danger: true, action: () => deleteFinFolder(f) }])
      });
      dropTarget(r, () => ({ scope: 'finance', folderId: f.id }));
      list.appendChild(r);
      if (open) renderFinTree(list, f.id, depth + 1);
    });
    fileRows(list, 'finance', parentId, indent + 14);
    if (finState.creatingIn !== undefined && (finState.creatingIn || null) === (parentId || null)) list.appendChild(finFolderForm(parentId, indent + 14));
  }
  function goFinance(folderId) { currentPage = 'finance'; finState.folderId = folderId || null; renderAll(); autoCollapseOnMobile(); }
  function goFile(id) { currentPage = 'xls'; if (xState.fileId !== id) { xState.sheet = 0; xState.query = ''; } xState.fileId = id; renderAll(); autoCollapseOnMobile(); }

  // --- Finance folder page ---
  const pageF = el('div'); pageF.id = 'page-finance'; pageF.className = 'page-wrap'; pageF.style.display = 'none'; contentEl.appendChild(pageF);
  function renderFinance() {
    const fid = finState.folderId, f = finFolders.find(x => x.id === fid);
    if (fid && !f) finState.folderId = null;
    pageF.innerHTML = '';
    const head = el('div', 'x-head');
    const h = el('h1', 'x-title'); h.textContent = f ? f.name : 'Finance';
    const up = el('button', 'x-btn primary'); up.textContent = 'Upload';
    up.addEventListener('click', () => pickFiles('finance', finState.folderId));
    const nf = el('button', 'x-btn'); nf.textContent = 'New folder';
    nf.addEventListener('click', () => { openSection('__fin__'); if (fid) expanded.add('ff:' + fid); saveExpanded(); finState.creatingIn = finState.folderId; renderTree(); if (window.innerWidth < 760) document.getElementById('open-sidebar-btn')?.click(); });
    head.appendChild(h); head.appendChild(nf); head.appendChild(up);
    pageF.appendChild(head);
    const subs = fChildren(finState.folderId), fl = filesIn('finance', finState.folderId);
    if (subs.length) {
      const g = el('div', 'fin-folders');
      subs.forEach(s => {
        const n = files.filter(x => x.scope === 'finance' && x.folderId === s.id).length;
        const b = el('button', 'fin-folder', I.folder + '<span>' + esc(s.name) + '</span><small>' + n + '</small>');
        b.addEventListener('click', () => { openSection('__fin__'); expanded.add('ff:' + s.id); saveExpanded(); goFinance(s.id); });
        dropTarget(b, () => ({ scope: 'finance', folderId: s.id }));
        g.appendChild(b);
      });
      pageF.appendChild(g);
    }
    if (fl.length) {
      const list = el('div', 'fin-files');
      fl.forEach(x => {
        const r = el('button', 'fin-file', '<span class="fin-ic">' + I.sheet + '</span><span class="fin-n"><b>' + esc(x.name) + '</b><small>' +
          fmtSize(x.size || 0) + ' · ' + fmtDay(tsDay(x.createdAt)) + (x.uploaded ? '' : ' · waiting to sync') + '</small></span>');
        r.addEventListener('click', () => goFile(x.id));
        list.appendChild(r);
      });
      pageF.appendChild(list);
    }
    const dz = el('div', 'fin-drop', I.sheet + '<b>' + (isTouch ? 'Tap to add Excel files' : 'Drag Excel files here') + '</b><span>.xlsx, .xls, .csv up to 25 MB. Read only.</span>');
    dz.addEventListener('click', () => pickFiles('finance', finState.folderId));
    dropTarget(dz, () => ({ scope: 'finance', folderId: finState.folderId }));
    pageF.appendChild(dz);
  }

  // --- viewer ---
  const pageX = el('div'); pageX.id = 'page-xls'; pageX.className = 'page-wrap'; pageX.style.display = 'none'; contentEl.appendChild(pageX);
  let xlsLib = null, wbCache = { id: null, wb: null };
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (!xlsLib) xlsLib = new Promise((res, rej) => { const s = document.createElement('script'); s.src = './xlsx.full.min.js'; s.onload = () => res(window.XLSX); s.onerror = () => { xlsLib = null; rej(new Error('Could not load the Excel reader')); }; document.head.appendChild(s); });
    return xlsLib;
  }
  let renderToken = 0;
  async function renderXls() {
    const f = files.find(x => x.id === xState.fileId);
    const token = ++renderToken;
    if (!f) { pageX.innerHTML = '<div class="x-empty">File not found.</div>'; return; }
    if (pageX.dataset.fileId === f.id && pageX.dataset.name === f.name && pageX.querySelector('.xv-wrap')) return;
    pageX.dataset.fileId = f.id; pageX.dataset.name = f.name;
    pageX.innerHTML = '';
    const head = el('div', 'x-head');
    const h = el('h1', 'x-title xv-title'); h.textContent = f.name;
    const dl = el('button', 'x-btn'); dl.textContent = 'Download';
    dl.addEventListener('click', () => downloadFile(f).catch(e => alert(e.message)));
    const del = el('button', 'x-btn ghost-danger'); del.textContent = 'Delete';
    del.addEventListener('click', () => deleteFile(f));
    head.appendChild(h); head.appendChild(dl); head.appendChild(del);
    pageX.appendChild(head);
    const body = el('div', 'xv-body', '<div class="x-empty">Opening...</div>');
    pageX.appendChild(body);
    try {
      let wb = wbCache.id === f.id ? wbCache.wb : null;
      if (!wb) {
        let buf = await idbGet(f.id);
        if (!buf) {
          const cfg = ghCfg();
          if (!cfg) throw new Error('This file is not on this device. Set up sync to download it.');
          if (!navigator.onLine) throw new Error('This file is not downloaded on this device yet. Open it once with internet.');
          buf = await ghGet(cfg, filePath(f)); idbPut(f.id, buf);
        }
        const X = await loadXlsx();
        wb = X.read(new Uint8Array(buf), { type: 'array', cellDates: true, dense: false });
        wbCache = { id: f.id, wb };
      }
      if (token !== renderToken) return;
      drawWorkbook(body, wb);
    } catch (e) {
      if (token === renderToken) body.innerHTML = '<div class="x-empty">' + esc(e.message || 'Could not open this file') + '</div>';
    }
  }
  const colName = n => { let s = ''; n++; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  function drawWorkbook(body, wb) {
    const X = window.XLSX;
    body.innerHTML = '';
    const names = wb.SheetNames;
    if (xState.sheet >= names.length) xState.sheet = 0;
    const bar = el('div', 'xv-bar');
    if (names.length > 1) {
      const tabs = el('div', 'xv-tabs');
      names.forEach((n, i) => { const t = el('button', 'xv-tab' + (i === xState.sheet ? ' on' : '')); t.textContent = n; t.addEventListener('click', () => { xState.sheet = i; drawWorkbook(body, wb); }); tabs.appendChild(t); });
      bar.appendChild(tabs);
    }
    const q = el('input', 'xv-search'); q.type = 'search'; q.placeholder = 'Search in sheet...'; q.value = xState.query;
    bar.appendChild(q);
    body.appendChild(bar);
    const info = el('div', 't-hint xv-info'); body.appendChild(info);
    const wrap = el('div', 'xv-wrap'); body.appendChild(wrap);
    const ws = wb.Sheets[names[xState.sheet]];
    if (!ws || !ws['!ref']) { wrap.innerHTML = '<div class="x-empty">This sheet is empty.</div>'; return; }
    const rng = X.utils.decode_range(ws['!ref']);
    const rows = X.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '', blankrows: true });
    let maxC = 0; rows.forEach(r => { for (let c = r.length - 1; c >= 0; c--) if (String(r[c]).trim() !== '') { maxC = Math.max(maxC, c + 1); break; } });
    let last = rows.length; while (last > 0 && !rows[last - 1].some(v => String(v).trim() !== '')) last--;
    const LIMIT = 3000;
    const isNum = v => /^[-+(]?[\d\s .,]+[)%]?$/.test(String(v).trim()) || /^[-+]?[$€₸₽£]\s?[\d\s.,]+$/.test(String(v).trim());
    const draw = () => {
      const qq = xState.query.trim().toLowerCase();
      let html = '<table class="xv"><thead><tr><th class="xv-rn"></th>';
      for (let c = 0; c < maxC; c++) html += '<th>' + colName(rng.s.c + c) + '</th>';
      html += '</tr></thead><tbody>';
      let shown = 0, matched = 0;
      for (let r = 0; r < last && shown < LIMIT; r++) {
        const rowv = rows[r] || [];
        if (qq && !rowv.some(v => String(v).toLowerCase().includes(qq))) continue;
        matched++; shown++;
        html += '<tr><td class="xv-rn">' + (rng.s.r + r + 1) + '</td>';
        for (let c = 0; c < maxC; c++) { const v = rowv[c] == null ? '' : rowv[c]; html += '<td' + (v !== '' && isNum(v) ? ' class="n"' : '') + '>' + esc(v) + '</td>'; }
        html += '</tr>';
      }
      html += '</tbody></table>';
      wrap.innerHTML = maxC ? html : '<div class="x-empty">This sheet is empty.</div>';
      info.textContent = (qq ? matched + ' matching rows' : last + ' rows × ' + maxC + ' columns') + (shown >= LIMIT ? ' · showing the first ' + LIMIT : '');
    };
    let t = null;
    q.addEventListener('input', () => { xState.query = q.value; clearTimeout(t); t = setTimeout(draw, 160); });
    draw();
  }
  function filePathChain(f) { return f.scope === 'finance' ? finPath(f.folderId) : (() => { const chain = []; let fid = f.folderId; while (fid) { const x = nFolders.find(y => y.id === fid); if (!x) break; chain.unshift(x); fid = x.parentId; } return chain; })(); }

  // ================= 9x9 (mandala charts) =================
  const mandCol = SyncDB.collection('mandalas');
  let mandalas = [];
  const mState = { id: null, view: null, block: 4, creating: false };
  mandCol.orderBy('createdAt', 'asc').onSnapshot(s => { mandalas = s.docs.map(d => ({ id: d.id, ...d.data() })); renderAll(); });
  // block b (0..8, 4 = center), cell c (0..8, 4 = center of the block)
  // area i of the center block (cell i, i != 4) is the same thing as the center of outer block i
  const canon = (b, c) => (c === 4 && b !== 4) ? '4-' + b : b + '-' + c;
  const mCell = (m, b, c) => ((m.cells || {})[canon(b, c)] || '');
  const AREA_COLORS = ['#3f8de0', '#33c27a', '#e0823e', '#9b5de5', null, '#e0b83e', '#e03e8b', '#2fb6b6', '#e05a3e'];
  const isWide = () => window.innerWidth >= 760;
  function mFilled(m) { let n = 0; for (let b = 0; b < 9; b++) for (let c = 0; c < 9; c++) { if (b !== 4 && c === 4) continue; if (mCell(m, b, c).trim()) n++; } return n; }
  function goMand(id) {
    const ae = document.activeElement; if (ae && pageM.contains(ae)) ae.blur();
    currentPage = 'mandala';
    if (mState.id !== id) { mState.block = 4; mState.view = null; }
    mState.id = id || null;
    renderAll(); autoCollapseOnMobile();
  }
  function createMand(name) {
    const now = Date.now();
    return mandCol.add({ name, cells: {}, createdAt: now, order: now }).then(r => { openSection('__mand__'); saveExpanded(); goMand(r.id); return r; });
  }
  function deleteMand(m) {
    if (!confirm('Delete "' + m.name + '"? Everything written in it will be lost.')) return;
    mandCol.doc(m.id).delete();
    if (mState.id === m.id) { mState.id = null; if (currentPage === 'mandala') renderAll(); }
  }
  const mSaveTimers = {};
  function saveCell(m, b, c, text) {
    const key = canon(b, c);
    const cells = { ...(m.cells || {}) };
    if (text) cells[key] = text; else delete cells[key];
    m.cells = cells;
    clearTimeout(mSaveTimers[m.id]);
    mSaveTimers[m.id] = setTimeout(() => mandCol.doc(m.id).update({ cells: m.cells }), 400);
  }

  const pageM = el('div'); pageM.id = 'page-mandala'; pageM.className = 'page-wrap'; pageM.style.display = 'none'; contentEl.appendChild(pageM);
  function renderMandala() {
    const m = mandalas.find(x => x.id === mState.id);
    if (mState.id && !m) mState.id = null;
    if (m) renderMandChart(m); else renderMandList();
  }
  function miniPreview(m) {
    let h = '<div class="md-mini">';
    for (let c = 0; c < 9; c++) {
      const t = mCell(m, 4, c), col = AREA_COLORS[c];
      h += '<i' + (c === 4 ? ' class="g"' : col ? ' style="--a:' + col + '"' : '') + (t ? ' data-on="1"' : '') + '></i>';
    }
    return h + '</div>';
  }
  function renderMandList() {
    pageM.innerHTML = '';
    const head = el('div', 'x-head');
    const h = el('h1', 'x-title'); h.textContent = '9x9';
    const nb = el('button', 'x-btn primary'); nb.textContent = 'New chart';
    nb.addEventListener('click', () => { mState.creating = true; renderMandList(); });
    head.appendChild(h); head.appendChild(nb); pageM.appendChild(head);
    if (mState.creating) {
      const f = el('div', 'x-form');
      const inp = el('input'); inp.placeholder = 'Name, e.g. 2027 goals'; inp.maxLength = 40;
      const ok = el('button', 'x-btn primary'); ok.textContent = 'Create';
      const cancel = el('button', 'x-btn'); cancel.textContent = 'Cancel';
      const submit = () => { const v = inp.value.trim(); if (!v) return; mState.creating = false; createMand(v); };
      ok.addEventListener('click', submit);
      cancel.addEventListener('click', () => { mState.creating = false; renderMandList(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') cancel.click(); });
      f.appendChild(inp); f.appendChild(ok); f.appendChild(cancel); pageM.appendChild(f);
      setTimeout(() => inp.focus(), 30);
    }
    if (!mandalas.length) {
      const e = el('div', 'x-empty');
      e.innerHTML = 'Write your main goal in the center, 8 things it needs around it, then 8 concrete actions for each of those.';
      pageM.appendChild(e); return;
    }
    const grid = el('div', 'md-cards');
    mandalas.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(m => {
      const goal = mCell(m, 4, 4);
      const card = el('button', 'md-card', miniPreview(m) + '<div class="md-card-b"><b>' + esc(m.name) + '</b><span>' +
        (goal ? esc(goal) : 'No goal yet') + '</span><small>' + mFilled(m) + ' / 72 filled</small></div>');
      card.addEventListener('click', () => goMand(m.id));
      grid.appendChild(card);
    });
    pageM.appendChild(grid);
  }

  function cellEl(m, b, c, editable, big) {
    const isGoal = b === 4 && c === 4;
    const isArea = (b === 4 && c !== 4) || (b !== 4 && c === 4);
    const area = b === 4 ? c : b;
    const col = AREA_COLORS[area];
    const d = el('div', 'md-cell' + (isGoal ? ' goal' : isArea ? ' area' : '') + (big ? ' big' : ''));
    if (col && !isGoal) d.style.setProperty('--a', col);
    const t = el('div', 'md-t');
    const txt = mCell(m, b, c);
    t.textContent = txt;
    d.appendChild(t);
    if (!txt && editable) d.dataset.ph = isGoal ? 'Main goal' : isArea ? 'Area ' + (area < 4 ? area + 1 : area) : '';
    if (editable) {
      try { t.contentEditable = 'plaintext-only'; } catch (e) { t.contentEditable = 'true'; }
      if (t.contentEditable !== 'plaintext-only') t.contentEditable = 'true';
      t.spellcheck = false;
      t.addEventListener('input', () => { const v = t.innerText.replace(/\n{3,}/g, '\n\n').trim(); d.dataset.ph = v ? '' : (d.dataset.ph0 || ''); saveCell(m, b, c, v); });
      d.dataset.ph0 = d.dataset.ph || '';
      t.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); t.blur(); } if (e.key === 'Escape') t.blur(); });
      t.addEventListener('blur', () => { if (isArea) setTimeout(() => { if (!pageM.contains(document.activeElement) || !document.activeElement.isContentEditable) renderMandala(); }, 0); });
      d.addEventListener('click', e => { if (e.target === d) t.focus(); });
    }
    return d;
  }

  function renderMandChart(m) {
    if (!mState.view) mState.view = isWide() ? 'grid' : 'block';
    pageM.innerHTML = '';
    const head = el('div', 'x-head');
    const nameIn = el('input', 't-name-input'); nameIn.value = m.name; nameIn.maxLength = 40;
    const saveName = () => { const v = nameIn.value.trim(); if (v && v !== m.name) mandCol.doc(m.id).update({ name: v }); else nameIn.value = m.name; };
    nameIn.addEventListener('blur', saveName);
    nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') nameIn.blur(); });
    const tabs = el('div', 'md-views');
    [['grid', 'Whole chart'], ['block', 'One block']].forEach(([v, l]) => {
      const t = el('button', 'tab-btn' + (mState.view === v ? ' active' : '')); t.textContent = l;
      t.addEventListener('click', () => { mState.view = v; renderMandChart(m); });
      tabs.appendChild(t);
    });
    const del = el('button', 'x-btn ghost-danger'); del.textContent = 'Delete';
    del.addEventListener('click', () => deleteMand(m));
    head.appendChild(nameIn); head.appendChild(del);
    pageM.appendChild(head);
    const sub = el('div', 'md-sub');
    sub.appendChild(tabs);
    const meta = el('span', 't-hint'); meta.textContent = mFilled(m) + ' / 72 filled';
    sub.appendChild(meta);
    pageM.appendChild(sub);

    if (mState.view === 'grid') {
      const editable = isWide();
      const g = el('div', 'md-grid' + (editable ? '' : ' ro'));
      for (let b = 0; b < 9; b++) {
        const blk = el('div', 'md-block' + (b === 4 ? ' center' : ''));
        for (let c = 0; c < 9; c++) blk.appendChild(cellEl(m, b, c, editable, false));
        if (!editable) blk.addEventListener('click', () => { mState.view = 'block'; mState.block = b; renderMandChart(m); });
        g.appendChild(blk);
      }
      pageM.appendChild(g);
      if (!editable) { const hnt = el('div', 't-hint'); hnt.style.marginTop = '10px'; hnt.textContent = 'Tap a block to open and edit it.'; pageM.appendChild(hnt); }
      else { const hnt = el('div', 't-hint'); hnt.style.marginTop = '10px'; hnt.textContent = 'Click any cell to write. Enter saves, Shift+Enter makes a new line. The 8 areas around the goal also appear in the middle of the outer blocks.'; pageM.appendChild(hnt); }
      return;
    }

    // one block view
    const wrap = el('div', 'md-focus');
    const nav = el('div', 'md-nav');
    for (let b = 0; b < 9; b++) {
      const label = b === 4 ? (mCell(m, 4, 4) || 'Goal') : (mCell(m, 4, b) || 'Area');
      const n = el('button', 'md-nav-b' + (b === mState.block ? ' on' : '') + (b === 4 ? ' g' : ''));
      if (AREA_COLORS[b]) n.style.setProperty('--a', AREA_COLORS[b]);
      n.textContent = label; n.title = label;
      n.addEventListener('click', () => { mState.block = b; renderMandChart(m); });
      nav.appendChild(n);
    }
    const blk = el('div', 'md-block big' + (mState.block === 4 ? ' center' : ''));
    for (let c = 0; c < 9; c++) {
      const ce = cellEl(m, mState.block, c, true, true);
      if (mState.block === 4 && c !== 4) {
        const go = el('button', 'md-open', '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5L10.5 8L6 12.5"/></svg>');
        go.title = 'Open this area'; go.setAttribute('aria-label', 'Open this area');
        go.addEventListener('click', e => { e.stopPropagation(); mState.block = c; renderMandChart(m); });
        ce.appendChild(go);
      }
      if (mState.block !== 4 && c === 4) {
        const back = el('button', 'md-open back', '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5L5.5 8L10 12.5"/></svg>');
        back.title = 'Back to the goal'; back.setAttribute('aria-label', 'Back to the goal');
        back.addEventListener('click', e => { e.stopPropagation(); mState.block = 4; renderMandChart(m); });
        ce.appendChild(back);
      }
      blk.appendChild(ce);
    }
    wrap.appendChild(blk);
    wrap.appendChild(nav);
    pageM.appendChild(wrap);
    const hnt = el('div', 't-hint'); hnt.style.marginTop = '10px';
    hnt.textContent = mState.block === 4 ? 'Write the goal in the middle and 8 areas around it. The arrow on an area opens its block.' : 'Write 8 concrete actions around this area.';
    pageM.appendChild(hnt);
  }
  let mWide = isWide();
  window.addEventListener('resize', () => { const w = isWide(); if (w !== mWide) { mWide = w; mState.view = null; if (currentPage === 'mandala') renderMandala(); } });

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
    level: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5Z"/><path d="M8.5 13.5L12 10L15.5 13.5"/></svg>',
    sheet: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" style="vertical-align:-2px"><rect x="2" y="2" width="12" height="12" rx="1.5"/><path d="M2 6H14M2 10H14M6.5 2V14"/></svg>',
    finance: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M4 20V10M10 20V4M16 20V13M22 20H2"/></svg>',
    grid9: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" style="vertical-align:-2px"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3V21M15 3V21M3 9H21M3 15H21"/><rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none" opacity=".55"/></svg>',
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
    if (opts.menu) attachRowMenu(r, opts.menu);
    if (false) {
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
    const notesRow = row({
      icon: I.notes, name: 'Notes', bold: true,
      onClick: () => { if (nOpen) expanded.delete('__notes__'); else openSection('__notes__'); saveExpanded(); renderTree(); },
      menu: () => notesMenuItems(null)
    });
    dropTarget(notesRow, () => ({ scope: 'notes', folderId: null }));
    list.appendChild(notesRow);
    if (nOpen) renderNotesTree(list, null, 1);
    const fOpen = expanded.has('__fin__');
    const finRow = row({
      icon: I.finance, name: 'Finance', bold: true,
      onClick: () => { if (fOpen) expanded.delete('__fin__'); else openSection('__fin__'); saveExpanded(); renderTree(); },
      menu: () => finMenuItems(null).concat([{ label: 'Open Finance', icon: 'folder', action: () => goFinance(null) }])
    });
    dropTarget(finRow, () => ({ scope: 'finance', folderId: null }));
    list.appendChild(finRow);
    if (fOpen) {
      if (!finFolders.length && !filesIn('finance', null).length && finState.creatingIn === undefined)
        list.appendChild(row({ icon: I.sheet, name: 'Add files', indent: 27, onClick: () => goFinance(null) }));
      renderFinTree(list, null, 1);
    }
    const mOpen = expanded.has('__mand__');
    list.appendChild(row({
      icon: I.grid9, name: '9x9', bold: true,
      onClick: () => { if (mOpen) expanded.delete('__mand__'); else openSection('__mand__'); saveExpanded(); renderTree(); },
      menu: () => [
        { label: 'New chart', icon: 'grid9', action: () => { openSection('__mand__'); saveExpanded(); mState.creating = true; goMand(null); } },
        { label: 'All charts', icon: 'grid9', action: () => goMand(null) }
      ]
    }));
    if (mOpen) {
      if (!mandalas.length) list.appendChild(row({ icon: I.plus, name: 'New chart', indent: 27, onClick: () => { mState.creating = true; goMand(null); } }));
      mandalas.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(m => {
        list.appendChild(row({
          icon: I.grid9, name: m.name, indent: 27,
          active: currentPage === 'mandala' && mState.id === m.id,
          onClick: () => goMand(m.id),
          menu: rowEl => [
            { label: 'Rename', icon: 'edit', action: () => inlineEdit(rowEl.querySelector('.row-name'), m.name, v => mandCol.doc(m.id).update({ name: v })) },
            { label: 'Delete chart', icon: 'trash', danger: true, action: () => deleteMand(m) }
          ]
        }));
      });
    }
    const lOpen = expanded.has('__lvl__');
    list.appendChild(row({
      icon: I.level, name: 'Levels', bold: true,
      onClick: () => { if (lOpen) expanded.delete('__lvl__'); else openSection('__lvl__'); saveExpanded(); renderTree(); },
      menu: () => [
        { label: 'New level', icon: 'level', action: () => { openSection('__lvl__'); saveExpanded(); lState.creating = true; goLevel(null); } },
        { label: 'All levels', icon: 'level', action: () => goLevel(null) }
      ]
    }));
    if (lOpen) {
      if (!levels.length) list.appendChild(row({ icon: I.plus, name: 'New level', indent: 27, onClick: () => { lState.creating = true; goLevel(null); } }));
      levels.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(lv => {
        const d = levelData(lv);
        list.appendChild(row({
          icon: iconSVG(lv.icon || 'star', 14), name: lv.name, indent: 27, meta: 'Lv ' + d.level,
          active: currentPage === 'levels' && lState.id === lv.id,
          onClick: () => goLevel(lv.id),
          menu: rowEl => [{ label: 'Rename', icon: 'edit', action: () => inlineEdit(rowEl.querySelector('.row-name'), lv.name, v => levelsCol.doc(lv.id).update({ name: v })) },
            { label: 'Delete level', icon: 'trash', danger: true, action: () => deleteLevel(lv) }]
        }));
      });
    }
    const tOpen = expanded.has('__terr__');
    list.appendChild(row({
      icon: I.territory, name: 'Territory progress', bold: true,
      active: currentPage === 'territory' && !tState.boardId,
      onClick: () => { if (tOpen) expanded.delete('__terr__'); else openSection('__terr__'); saveExpanded(); renderTree(); },
      menu: () => [
        { label: 'New board', icon: 'board', action: () => { openSection('__terr__'); saveExpanded(); tState.creating = true; goTerritory(null); } },
        { label: 'All boards', icon: 'board', action: () => goTerritory(null) }
      ]
    }));
    if (tOpen) {
      boards.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(b => {
        list.appendChild(row({
          icon: iconSVG(b.icon || 'target', 14), name: b.name, indent: 27, meta: cellsOf(b.id).length,
          active: currentPage === 'territory' && tState.boardId === b.id,
          onClick: () => goTerritory(b.id),
          menu: rowEl => [{ label: 'Rename', icon: 'edit', action: () => inlineEdit(rowEl.querySelector('.row-name'), b.name, v => boardsCol.doc(b.id).update({ name: v })) },
            { label: 'Delete board', icon: 'trash', danger: true, action: () => deleteBoard(b) }]
        }));
      });
    }
    const aOpen = expanded.has('__ach__');
    list.appendChild(row({
      icon: I.trophy, name: 'Achievements', bold: true,
      onClick: () => { if (aOpen) expanded.delete('__ach__'); else openSection('__ach__'); saveExpanded(); renderTree(); }
    }));
    if (aOpen) {
      list.appendChild(row({ icon: I.shelf, name: 'My achievements', indent: 27, active: currentPage === 'achievements' && aTab === 'mine', onClick: () => goAch('mine') }));
      list.appendChild(row({ icon: I.list, name: 'All achievements', indent: 27, active: currentPage === 'achievements' && aTab === 'all', onClick: () => goAch('all') }));
      list.appendChild(row({ icon: I.brush, name: 'Create trophy', indent: 27, active: currentPage === 'achievements' && aTab === 'create', onClick: () => { draft = null; goAch('create'); } }));
    }
  };

  window.renderExtraBreadcrumbs = function (bc) {
    if (!['territory', 'achievements', 'notes', 'levels', 'profile', 'finance', 'xls', 'mandala'].includes(currentPage)) return false;
    bc.innerHTML = '';
    const crumb = (text, current, onClick) => {
      const c = el('span', 'crumb' + (current ? ' current' : '')); c.textContent = text;
      if (onClick && !current) c.addEventListener('click', onClick);
      bc.appendChild(c);
    };
    const sep = () => { const s = el('span', 'crumb-sep'); s.textContent = '/'; bc.appendChild(s); };
    if (currentPage === 'profile') { crumb('Profile', true); return true; }
    if (currentPage === 'mandala') {
      const m = mandalas.find(x => x.id === mState.id);
      crumb('9x9', !m, () => goMand(null));
      if (m) { sep(); crumb(m.name, true); }
      return true;
    }
    if (currentPage === 'finance') {
      const chain = finPath(finState.folderId);
      crumb('Finance', !chain.length, () => goFinance(null));
      chain.forEach((f, i) => { sep(); crumb(f.name, i === chain.length - 1, () => goFinance(f.id)); });
      return true;
    }
    if (currentPage === 'xls') {
      const f = files.find(x => x.id === xState.fileId);
      if (!f) { crumb('File', true); return true; }
      if (f.scope === 'finance') crumb('Finance', false, () => goFinance(null)); else crumb('Notes', false);
      filePathChain(f).forEach(x => { sep(); crumb(x.name, false, f.scope === 'finance' ? () => goFinance(x.id) : null); });
      sep(); crumb(f.name, true);
      return true;
    }
    if (currentPage === 'levels') {
      const lv = levels.find(x => x.id === lState.id);
      crumb('Levels', !lv, () => goLevel(null));
      if (lv) { sep(); crumb(lv.name, true); }
      return true;
    }
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
    pageF.style.display = currentPage === 'finance' ? 'block' : 'none';
    pageM.style.display = currentPage === 'mandala' ? 'block' : 'none';
    if (currentPage === 'mandala') { const ae = document.activeElement; if (!(ae && pageM.contains(ae) && (ae.isContentEditable || ae.tagName === 'INPUT'))) renderMandala(); }
    pageX.style.display = currentPage === 'xls' ? 'block' : 'none';
    if (currentPage !== 'xls') pageX.dataset.fileId = '';
    if (currentPage === 'finance') renderFinance();
    if (currentPage === 'xls') renderXls();
    pageP.style.display = currentPage === 'profile' ? 'block' : 'none';
    if (currentPage === 'profile') window.renderProfilePage();
    window.renderProfileCard();
    pageL.style.display = currentPage === 'levels' ? 'block' : 'none';
    if (currentPage === 'levels') { const ae = document.activeElement; if (!(ae && pageL.contains(ae) && (ae.tagName === 'INPUT' || ae.tagName === 'SELECT'))) renderLevels(); }
    if (currentPage !== 'notes') { if (edState) closeEditor(); pageN.dataset.noteId = ''; }
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
    try { checkLevelUps(); } catch (e) {}
    showNextToast();
  }
  function showNextToast() {
    if (toastBusy || !toastQueue.length) return;
    const r = toastQueue.shift(); toastBusy = true;
    if (r.html) {
      toast.innerHTML = r.html;
      toast.onclick = () => { toast.classList.remove('show'); r.open(); };
    } else if (r.many) {
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
    { id: 'blood', name: 'Blood', c: ['#0b0b0c', '#141416', '#060607', '#c8102e'] },
    { id: 'skyrim', name: 'Skyrim', c: ['#16140f', '#201d17', '#0e0d0a', '#b8975a'] },
    { id: 'wayne', name: 'Bruce Wayne', c: ['#0a0b0d', '#16191d', '#050607', '#9fb0c3'] }
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

  const APP_VERSION = '24';
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
  const BG_KEY = 'tgr_bg_img', BG_OP_KEY = 'tgr_bg_op';
  function applyBg() {
    let img = null, op = 0.16;
    try { img = localStorage.getItem(BG_KEY); op = parseFloat(localStorage.getItem(BG_OP_KEY) || '0.16'); } catch (e) {}
    const layer = document.getElementById('bg-layer');
    if (!layer) return;
    document.body.classList.toggle('has-bgimg', !!img);
    layer.style.backgroundImage = img ? 'url("' + img + '")' : '';
    document.documentElement.style.setProperty('--bg-img-op', String(op));
  }
  applyBg();
  const bgInput = el('input'); bgInput.type = 'file'; bgInput.accept = 'image/*'; bgInput.style.display = 'none'; document.body.appendChild(bgInput);
  bgInput.addEventListener('change', () => {
    const f = bgInput.files && bgInput.files[0]; bgInput.value = ''; if (!f) return;
    const url = URL.createObjectURL(f), img = new Image();
    img.onload = () => {
      const maxW = 1600, k = Math.min(1, maxW / img.width);
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      try { localStorage.setItem(BG_KEY, c.toDataURL('image/jpeg', 0.78)); } catch (e) { alert('This image is too big, try a smaller one.'); }
      applyBg(); openSettings();
    };
    img.src = url;
  });
  const setModal = el('div'); setModal.id = 'set-modal'; document.body.appendChild(setModal);
  setModal.addEventListener('click', e => { if (e.target === setModal) setModal.classList.remove('open'); });
  function openSettings() {
    const cur = document.documentElement.getAttribute('data-theme');
    setModal.innerHTML = `<div class="a-m-card" role="dialog" aria-label="Settings"><p class="a-m-name">Settings</p>
      <p class="a-m-sub" style="margin:0">Theme</p><div class="th-grid"></div>
      <button class="th-system${cur ? '' : ' on'}">Match my device (light or dark)</button>
      <p class="a-m-sub" style="margin:4px 0 0">Background picture (this device)</p>
      <div class="bg-row"><button class="x-btn" id="set-bg">${document.body.classList.contains('has-bgimg') ? 'Change picture' : 'Choose picture'}</button>
        ${document.body.classList.contains('has-bgimg') ? '<button class="x-btn ghost-danger" id="set-bg-rm">Remove</button><input type="range" id="set-bg-op" min="0.05" max="0.5" step="0.01" aria-label="Picture visibility">' : ''}</div>
      <p class="a-m-sub" style="margin:4px 0 0">Sync</p>
      <button class="x-btn" id="set-sync" style="text-align:left">Sync with GitHub</button>
      <p class="a-m-sub" style="margin:4px 0 0">Widget</p>
      <button class="x-btn" id="set-widget" style="text-align:left">iPhone widget: Home Screen and Lock Screen</button>
      <p class="a-m-sub" style="margin:4px 0 0">App</p>
      <button class="x-btn" id="set-update" style="text-align:left">Check for updates</button>
      <span class="t-hint" id="set-update-msg">Version ${APP_VERSION} · page ${window.PAGE_VERSION || 'old'}</span>
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
    setModal.querySelector('#set-widget').addEventListener('click', () => openWidgetPanel());
    setModal.querySelector('#set-bg').addEventListener('click', () => bgInput.click());
    const bgRm = setModal.querySelector('#set-bg-rm');
    if (bgRm) bgRm.addEventListener('click', () => { try { localStorage.removeItem(BG_KEY); } catch (e) {} applyBg(); openSettings(); });
    const bgOp = setModal.querySelector('#set-bg-op');
    if (bgOp) {
      try { bgOp.value = localStorage.getItem(BG_OP_KEY) || '0.16'; } catch (e) {}
      bgOp.addEventListener('input', () => { try { localStorage.setItem(BG_OP_KEY, bgOp.value); } catch (e) {} applyBg(); });
    }
    setModal.querySelector('#set-close').addEventListener('click', () => setModal.classList.remove('open'));
    setModal.querySelector('#set-update').addEventListener('click', e => checkForUpdates(e.currentTarget, setModal.querySelector('#set-update-msg')));
    setModal.classList.add('open');
  }
  // ================= iPhone widget (through the Scriptable app) =================
  // iPhone gives widgets only to native apps, so the widget is a Scriptable script that reads the same data.json from GitHub.
  // The app hands over the script with the sync settings filled in; folders and look live in appSettings/widget (synced),
  // so the widget picks up changes by itself.
  const WG_LOOKS = [['auto', 'Match iPhone'], ['light', 'Light'], ['dark', 'Dark'], ['blood', 'Blood'], ['skyrim', 'Skyrim'], ['wayne', 'Bruce Wayne']];
  let wgScript = null;
  function loadWidgetScript() {
    if (wgScript) return Promise.resolve(wgScript);
    return fetch('./tgr-widget.js?v=' + APP_VERSION).then(r => (r.ok ? r.text() : null))
      .then(t => (wgScript = t && t.includes('__TGR_CONFIG__') ? t : null)).catch(() => null);
  }
  function saveWidgetCfg(patch) {
    widgetCfg = { ...widgetCfg, ...patch };
    settingsCol.doc('widget').set({ k: 'widget', folders: widgetCfg.folders || null, look: widgetCfg.look || 'auto' });
  }
  function todoFolderTree() {
    const out = [], key = f => (f.order != null ? f.order : f.createdAt || 0);
    const kids = pid => allFolders.filter(f => (f.parentId || null) === pid).sort((a, b) => key(a) - key(b));
    const walk = (pid, depth) => { if (depth > 8) return; kids(pid).forEach(f => { out.push({ f, depth }); walk(f.id, depth + 1); }); };
    walk(null, 0);
    return out;
  }
  function legacyCopy(text) {
    const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
    document.body.appendChild(ta); ta.select(); try { ta.setSelectionRange(0, text.length); } catch (e) {}
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    ta.remove(); return ok;
  }
  function copyText(text) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(() => true, () => legacyCopy(text)); } catch (e) {}
    return Promise.resolve(legacyCopy(text));
  }
  function openWidgetPanel() {
    const tree = todoFolderTree();
    const ids = new Set(tree.map(x => x.f.id));
    const chosen = Array.isArray(widgetCfg.folders) ? widgetCfg.folders.filter(id => ids.has(id)) : [];
    const sel = chosen.length ? new Set(chosen) : null;
    const look = widgetCfg.look || 'auto';
    setModal.innerHTML = `<div class="a-m-card wg-card" role="dialog" aria-label="iPhone widget">
      <div><p class="a-m-name">iPhone widget</p>
      <p class="a-m-desc">Your most important open tasks on the Home Screen and the Lock Screen: overdue and today's first, then by priority.
        iPhone doesn't let web apps have widgets, so it works through the free Scriptable app.</p></div>
      <p class="a-m-sub">Folders</p>
      <div class="wg-folders">
        <label class="wg-f wg-all"><input type="checkbox" data-all ${sel ? '' : 'checked'}><span>All folders</span></label>
        ${tree.map(x => `<label class="wg-f" style="padding-left:${10 + x.depth * 20}px"><input type="checkbox" data-id="${esc(x.f.id)}" ${!sel || sel.has(x.f.id) ? 'checked' : ''}><span>${esc(x.f.name)}</span></label>`).join('')}
        ${tree.length ? '' : '<div class="wg-f" style="color:var(--text-dim)">No ToDo folders yet</div>'}
      </div>
      <p class="a-m-sub">Look</p>
      <div class="t-chips">${WG_LOOKS.map(([id, n]) => `<button class="t-chip${look === id ? ' on' : ''}" data-look="${id}">${n}</button>`).join('')}</div>
      <p class="a-m-sub">Set up once</p>
      <ol class="wg-steps">
        <li>Install <a href="https://apps.apple.com/app/scriptable/id1405459188" target="_blank" rel="noopener">Scriptable</a> from the App Store, it's free.</li>
        <li>Tap <b>Copy widget script</b>. In Scriptable tap <b>+</b>, paste, tap the name at the top and call it <b>TGRAPP</b>, then <b>Done</b>.</li>
        <li><b>Home Screen:</b> hold an empty spot → <b>Edit</b> → <b>Add Widget</b> → Scriptable → pick a size. Then hold the widget → <b>Edit Widget</b> → Script: <b>TGRAPP</b>.</li>
        <li><b>Lock Screen:</b> hold it → <b>Customize</b> → <b>Lock Screen</b> → tap the widget row → Scriptable → the wide one. Tap it → Script: <b>TGRAPP</b>.</li>
      </ol>
      <button class="x-btn primary" id="wg-copy">Copy widget script</button>
      <span class="t-hint" id="wg-msg">Folders and look update in the widget by themselves, no need to copy again. The widget refreshes about every 15 to 30 minutes, iPhone decides when.</span>
      <textarea class="wg-manual" readonly hidden aria-label="Widget script"></textarea>
      <div class="cr-actions"><button class="x-btn" id="wg-back">Back</button><span style="flex:1"></span><button class="x-btn" id="wg-close">Close</button></div></div>`;
    const card = setModal.querySelector('.wg-card'), msg = card.querySelector('#wg-msg'), copyBtn = card.querySelector('#wg-copy');
    const boxes = [...card.querySelectorAll('input[data-id]')], all = card.querySelector('input[data-all]');
    const syncFolders = () => {
      const on = boxes.filter(b => b.checked).map(b => b.dataset.id);
      all.checked = on.length === boxes.length;
      saveWidgetCfg({ folders: on.length === boxes.length ? null : on });
    };
    all.addEventListener('change', () => { if (!all.checked) { all.checked = true; return; } boxes.forEach(b => { b.checked = true; }); syncFolders(); });
    boxes.forEach(b => b.addEventListener('change', () => {
      if (!boxes.some(x => x.checked)) { b.checked = true; msg.textContent = 'Keep at least one folder.'; return; }
      syncFolders();
    }));
    card.querySelectorAll('[data-look]').forEach(b => b.addEventListener('click', () => {
      card.querySelectorAll('[data-look]').forEach(x => x.classList.toggle('on', x === b));
      saveWidgetCfg({ look: b.dataset.look });
    }));
    const cfg = SyncDB.getConfig();
    if (!cfg || !cfg.token) { copyBtn.disabled = true; msg.textContent = 'Turn on Sync with GitHub first: the widget reads your tasks from there.'; }
    loadWidgetScript();
    copyBtn.addEventListener('click', () => {
      const c = SyncDB.getConfig(); if (!c || !c.token) return;
      if (!wgScript) { msg.textContent = 'Loading the script, tap again in a second.'; loadWidgetScript(); return; }
      const text = wgScript.replace('__TGR_CONFIG__', () => JSON.stringify({ owner: c.owner, repo: c.repo, path: c.path || 'data.json', token: c.token }));
      copyText(text).then(ok => {
        if (ok) { copyBtn.textContent = 'Copied ✓'; msg.textContent = 'Copied. Open Scriptable, tap + and paste. The script has your sync token inside, so don\'t share it.'; return; }
        const ta = card.querySelector('.wg-manual'); ta.hidden = false; ta.value = text; ta.focus(); ta.select();
        msg.textContent = 'Copying didn\'t work here. Select everything in the box below and copy it.';
      });
    });
    card.querySelector('#wg-back').addEventListener('click', () => openSettings());
    card.querySelector('#wg-close').addEventListener('click', () => setModal.classList.remove('open'));
    setModal.classList.add('open');
  }

  const gear = el('button', 'icon-btn', '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>');
  gear.id = 'settings-btn'; gear.title = 'Settings';
  gear.addEventListener('click', openSettings);
  const hb = document.querySelector('#sidebar-header .header-btns');
  if (hb) hb.insertBefore(gear, hb.firstChild);

  window.__tgr = { goLevel, goTerritory, goAch, goNote };
  renderAll();
})();
