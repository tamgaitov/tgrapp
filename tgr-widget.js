// TGRAPP widget for the Scriptable app.
// Shows your most important open ToDo tasks on the Home Screen and the Lock Screen.
// It reads the data.json your TGRAPP app syncs to GitHub.
// Your sync token is inside this script: don't share it.
// Made by TGRAPP (Settings → iPhone widget). Folders and look are chosen in the app.

const CFG = __TGR_CONFIG__;
const VERSION = 1;

const PRIO = { '2': ['#e03e3e', 'Highest', '🔴'], '1': ['#e0823e', 'High', '🟠'], '0': ['#8b8d93', 'Medium', '⚪️'], '-1': ['#3f8de0', 'Low', '🔵'], '-2': ['#6b6dae', 'Lowest', '🟣'] };
const LOOKS = {
  light: { bg: '#f6f5f2', bg2: '#ffffff', text: '#1a1b1e', dim: '#6b6d72', accent: '#1d40c4', danger: '#d64545' },
  dark: { bg: '#121317', bg2: '#1b1d23', text: '#eceef1', dim: '#8b8d93', accent: '#5b78e6', danger: '#ef6a6a' },
  blood: { bg: '#0b0b0c', bg2: '#1a1a1d', text: '#ececee', dim: '#8a8a90', accent: '#e0263f', danger: '#ff6b6b' },
  skyrim: { bg: '#16140f', bg2: '#2b2518', text: '#ede5d1', dim: '#a59c86', accent: '#c4a468', danger: '#d9644a' },
  wayne: { bg: '#0a0b0d', bg2: '#1a1e24', text: '#e4e7eb', dim: '#868c95', accent: '#9fb0c3', danger: '#d9534f' },
  fallout: { bg: '#04100a', bg2: '#0a2615', text: '#3cff78', dim: '#23a04c', accent: '#3cff78', danger: '#ff5d3c', mono: true }
};
// Fonts follow the look: Fallout swaps every font for the terminal monospace.
let MONO = false;
const FT = {
  r: n => MONO ? Font.regularMonospacedSystemFont(n) : Font.systemFont(n),
  m: n => MONO ? Font.mediumMonospacedSystemFont(n) : Font.mediumSystemFont(n),
  s: n => MONO ? Font.semiboldMonospacedSystemFont(n) : Font.semiboldSystemFont(n),
  b: n => MONO ? Font.boldMonospacedSystemFont(n) : Font.boldSystemFont(n),
  br: n => MONO ? Font.boldMonospacedSystemFont(n) : Font.boldRoundedSystemFont(n)
};

const fm = FileManager.local();
const CACHE = fm.joinPath(fm.documentsDirectory(), 'tgrapp-widget-cache.json');
const pad2 = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const clean = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
const prio = t => PRIO[String(t.priority || 0)] || PRIO['0'];

// ---------- data ----------
function live(col) {
  return Object.keys(col || {}).filter(id => col[id] && !col[id]._d).map(id => Object.assign({ id }, col[id]));
}
function slim(cols) {
  const subs = {};
  live(cols.subtasks).forEach(s => { const c = subs[s.taskId] || (subs[s.taskId] = [0, 0]); c[1]++; if (s.done) c[0]++; });
  const ws = cols.appSettings && cols.appSettings.widget;
  return {
    tasks: live(cols.tasks).filter(t => !t.done && clean(t.text)).map(t => ({
      id: t.id, text: clean(t.text), priority: t.priority || 0, deadline: t.deadline || null, folderId: t.folderId || null,
      order: t.order != null ? t.order : (t.createdAt || 0), subs: subs[t.id] || null })),
    folders: live(cols.folders).map(f => ({ id: f.id, name: clean(f.name) || 'Folder', parentId: f.parentId || null, order: f.order != null ? f.order : (f.createdAt || 0) })),
    widget: ws && !ws._d ? { folders: Array.isArray(ws.folders) ? ws.folders : null, look: ws.look || 'auto' } : { folders: null, look: 'auto' }
  };
}
async function load() {
  let err = null;
  if (CFG && CFG.token && CFG.owner && CFG.repo) {
    try {
      const path = String(CFG.path || 'data.json').split('/').map(encodeURIComponent).join('/');
      const req = new Request('https://api.github.com/repos/' + encodeURIComponent(CFG.owner) + '/' + encodeURIComponent(CFG.repo) + '/contents/' + path + '?t=' + Date.now());
      req.headers = { Authorization: 'Bearer ' + CFG.token, Accept: 'application/vnd.github.raw', 'X-GitHub-Api-Version': '2022-11-28' };
      req.timeoutInterval = 20;
      const text = await req.loadString();
      const code = req.response ? req.response.statusCode : 0;
      if (code === 401 || code === 403) err = 'token';
      else if (code === 404) err = 'nofile';
      else if (code !== 200) err = 'net';
      else {
        const d = slim((JSON.parse(text) || {}).cols || {});
        try { fm.writeString(CACHE, JSON.stringify({ at: Date.now(), d })); } catch (e) {}
        return { d, at: Date.now(), live: true };
      }
    } catch (e) { err = 'net'; }
  } else err = 'setup';
  try {
    if (fm.fileExists(CACHE)) { const c = JSON.parse(fm.readString(CACHE)); return { d: c.d, at: c.at, live: false, err }; }
  } catch (e) {}
  return { d: null, err };
}

// most important first: overdue, then due today, then by priority, the nearest deadline and the app's own order
function pick(d) {
  const ids = new Set(d.folders.map(f => f.id));
  let sel = d.widget.folders && d.widget.folders.length ? new Set(d.widget.folders.filter(id => ids.has(id))) : null;
  if (sel && !sel.size) sel = null;
  const today = ymd(new Date());
  const hot = t => (!t.deadline ? 2 : t.deadline < today ? 0 : t.deadline === today ? 1 : 2);
  const dl = t => (t.deadline ? +t.deadline.replace(/-/g, '') : 99999999);
  return d.tasks.filter(t => t.folderId && ids.has(t.folderId) && (!sel || sel.has(t.folderId)))
    .sort((a, b) => hot(a) - hot(b) || (b.priority || 0) - (a.priority || 0) || dl(a) - dl(b) || (a.order || 0) - (b.order || 0));
}
function due(t) {
  if (!t.deadline) return null;
  const today = ymd(new Date());
  if (t.deadline < today) return { s: 'overdue', hot: true, late: true };
  if (t.deadline === today) return { s: 'today', hot: true };
  const tm = new Date(); tm.setDate(tm.getDate() + 1);
  if (t.deadline === ymd(tm)) return { s: 'tomorrow' };
  const [y, m, dd] = t.deadline.split('-').map(Number);
  const o = { day: 'numeric', month: 'short' };
  if (y !== new Date().getFullYear()) o.year = 'numeric';
  return { s: new Date(y, m - 1, dd).toLocaleDateString('ru-RU', o).replace(/\.$/, '').replace(/ г$/, '') };
}
function scopeName(d) {
  const sel = d.widget.folders && d.widget.folders.length ? d.folders.filter(f => d.widget.folders.includes(f.id)) : [];
  if (!sel.length || sel.length === d.folders.length) return 'All folders';
  return sel.length === 1 ? sel[0].name : sel.length + ' folders';
}
// folders like the app's sidebar: each parent followed by its subfolders, shown as "Parent / Sub"
function folderTree(d) {
  const out = [], kids = pid => d.folders.filter(f => (f.parentId || null) === pid).sort((a, b) => (a.order || 0) - (b.order || 0));
  const walk = (pid, names, depth) => { if (depth > 8) return; kids(pid).forEach(f => { const n = names.concat(f.name); out.push({ f, path: n.join(' / ') }); walk(f.id, n, depth + 1); }); };
  walk(null, [], 0);
  return out;
}

// ---------- look ----------
function colors(look) {
  const P = LOOKS[look];
  MONO = !!(P && P.mono);
  if (P) return { bg: new Color(P.bg), bg2: new Color(P.bg2), text: new Color(P.text), dim: new Color(P.dim), accent: new Color(P.accent), danger: new Color(P.danger), fixed: true };
  const L = LOOKS.light, D = LOOKS.dark, dy = k => Color.dynamic(new Color(L[k]), new Color(D[k]));
  return { bg: dy('bg'), bg2: dy('bg2'), text: dy('text'), dim: dy('dim'), accent: dy('accent'), danger: dy('danger'), fixed: false };
}
function sym(name, size, bold) {
  const s = SFSymbol.named(name) || SFSymbol.named('circle');
  s.applyFont(Font.systemFont(size));
  if (bold) s.applySemiboldWeight();
  return s.image;
}
function txt(parent, s, font, color, lines) {
  const t = parent.addText(s);
  t.font = font; if (color) t.textColor = color; t.lineLimit = lines || 1;
  return t;
}
const ERR = {
  setup: 'Copy the script again from TGRAPP → Settings → iPhone widget.',
  token: 'GitHub did not accept the token. Copy the script again from TGRAPP → Settings → iPhone widget.',
  nofile: 'No data on GitHub yet. Open TGRAPP once with sync turned on.',
  net: 'No internet. The widget will update by itself later.'
};

// ---------- Home Screen ----------
function homeWidget(fam, res) {
  const d = res.d, C = colors(d ? d.widget.look : 'auto');
  const w = new ListWidget();
  if (C.fixed) { const g = new LinearGradient(); g.colors = [C.bg2, C.bg]; g.locations = [0, 0.75]; w.backgroundGradient = g; }
  else w.backgroundColor = C.bg;
  const big = fam === 'large', small = fam === 'small';
  w.setPadding(small ? 13 : 14, small ? 13 : 15, small ? 11 : 12, small ? 13 : 15);
  const list = d ? pick(d) : [];
  const h = w.addStack(); h.centerAlignContent(); h.spacing = 5;
  const ic = h.addImage(sym('checklist', 13, true)); ic.imageSize = new Size(15, 15); ic.tintColor = C.accent;
  txt(h, 'ToDo', FT.b(big ? 16 : 14), C.text);
  if (!small && d) { const sc = txt(h, scopeName(d), FT.m(11), C.dim); sc.textOpacity = 0.9; }
  if (d && !res.live) { const off = h.addImage(sym('icloud.slash', 10)); off.imageSize = new Size(13, 11); off.tintColor = C.dim; }
  h.addSpacer();
  if (d) txt(h, String(list.length), FT.br(big ? 16 : 14), C.accent);
  w.addSpacer(big ? 10 : small ? 7 : 8);

  if (!d) {
    txt(w, res.err === 'net' ? 'No data yet' : 'Setup needed', FT.s(13), C.text);
    w.addSpacer(3);
    txt(w, ERR[res.err] || ERR.net, FT.r(11), C.dim, 4);
    w.addSpacer();
    return w;
  }
  if (!list.length) {
    w.addSpacer();
    const e = w.addStack(); e.centerAlignContent(); e.spacing = 6;
    const ok = e.addImage(sym('checkmark.circle.fill', 16)); ok.imageSize = new Size(18, 18); ok.tintColor = C.accent;
    txt(e, 'All done', FT.s(14), C.text);
    w.addSpacer();
    return w;
  }
  const max = big ? 12 : 5, fs = big ? 13.5 : small ? 12.5 : 13;
  const shown = list.length > max ? max - 1 : list.length;
  const rows = w.addStack(); rows.layoutVertically(); rows.spacing = big ? 6 : 4.5;
  list.slice(0, shown).forEach(t => {
    const r = rows.addStack(); r.centerAlignContent(); r.spacing = 6;
    const dot = r.addStack(); dot.size = new Size(7, 7); dot.cornerRadius = 3.5; dot.backgroundColor = new Color(prio(t)[0]);
    const u = due(t);
    txt(r, t.text, FT.r(fs), u && u.late ? C.danger : C.text);
    r.addSpacer();
    if (!small && u) txt(r, u.s, FT.m(fs - 2), u.hot ? C.danger : C.dim);
  });
  if (list.length > shown) {
    rows.addSpacer(1);
    const m = txt(rows, '+' + (list.length - shown) + ' more', FT.m(fs - 2), C.dim);
    m.textOpacity = 0.9;
  }
  w.addSpacer();
  if (big) {
    const f = w.addStack(); f.addSpacer();
    const at = res.at ? new Date(res.at) : new Date();
    txt(f, (res.live ? 'Updated ' : 'Offline, from ') + pad2(at.getHours()) + ':' + pad2(at.getMinutes()), FT.r(10), C.dim);
  }
  return w;
}

// ---------- Lock Screen ----------
function lockWidget(fam, res) {
  const LK = res.d && LOOKS[res.d.widget.look]; MONO = !!(LK && LK.mono);
  const d = res.d, list = d ? pick(d) : [];
  const w = new ListWidget();
  if (fam === 'accessoryInline') {
    w.addImage(sym('checklist', 12));
    w.addText(!d ? (res.err === 'net' ? 'TGRAPP: no data yet' : 'TGRAPP: setup needed') : list.length ? list.length + ' · ' + list[0].text : 'All done');
    return w;
  }
  if (fam === 'accessoryCircular') {
    w.addAccessoryWidgetBackground = true;
    w.addSpacer();
    const im = w.addImage(sym(list.length ? 'checklist' : 'checkmark', 12, true)); im.imageSize = new Size(15, 15); im.centerAlignImage();
    const n = txt(w, d ? String(list.length) : '–', FT.br(20)); n.centerAlignText(); n.minimumScaleFactor = 0.6;
    w.addSpacer();
    return w;
  }
  // accessoryRectangular: three most important tasks
  if (!d) { txt(w, 'TGRAPP', FT.s(13)); txt(w, res.err === 'net' ? 'No data yet, no internet' : 'Tap to finish setup', FT.r(12), null, 2); return w; }
  if (!list.length) {
    const r = w.addStack(); r.centerAlignContent(); r.spacing = 5;
    const ok = r.addImage(sym('checkmark.circle.fill', 13)); ok.imageSize = new Size(15, 15);
    txt(r, 'All done', FT.s(14));
    return w;
  }
  w.spacing = 2;
  list.slice(0, 3).forEach((t, i) => {
    const r = w.addStack(); r.centerAlignContent(); r.spacing = 5;
    const u = due(t);
    const name = u && u.hot ? 'exclamationmark.circle.fill' : (t.priority || 0) >= 1 ? 'circle.fill' : 'circle';
    const im = r.addImage(sym(name, 9, true)); im.imageSize = new Size(11, 11);
    txt(r, t.text, i === 0 ? FT.s(13.5) : FT.r(13.5));
    r.addSpacer();
    if (i === 2 && list.length > 3) { const m = txt(r, '+' + (list.length - 3), FT.s(12)); m.textOpacity = 0.75; }
  });
  return w;
}

function makeWidget(fam, res) {
  const w = String(fam).startsWith('accessory') ? lockWidget(fam, res) : homeWidget(fam, res);
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  w.url = URLScheme.forRunningScript();
  return w;
}

// ---------- inside the Scriptable app: the full list ----------
async function showList(res) {
  if (!res.d) {
    const a = new Alert();
    a.title = 'TGRAPP widget';
    a.message = ERR[res.err] || ERR.net;
    a.addCancelAction('OK');
    await a.present();
    return;
  }
  const d = res.d, list = pick(d);
  const tb = new UITable(); tb.showSeparators = true;
  const head = new UITableRow(); head.height = 64; head.isHeader = true;
  const at = res.at ? new Date(res.at) : new Date();
  head.addText('ToDo · ' + list.length + ' open', scopeName(d) + ' · ' + (res.live ? 'updated ' : 'offline, saved ') + pad2(at.getHours()) + ':' + pad2(at.getMinutes()));
  tb.addRow(head);
  let preview = null;
  const pv = new UITableRow(); pv.height = 46; pv.cellSpacing = 6;
  [['Small', 'small'], ['Medium', 'medium'], ['Large', 'large'], ['Lock', 'accessoryRectangular']].forEach(([label, fam]) => {
    const b = pv.addButton(label); b.dismissOnTap = true; b.onTap = () => { preview = fam; };
  });
  tb.addRow(pv);
  const byFolder = {};
  list.forEach(t => (byFolder[t.folderId] = byFolder[t.folderId] || []).push(t));
  folderTree(d).filter(x => byFolder[x.f.id]).forEach(({ f, path }) => {
    const fr = new UITableRow(); fr.isHeader = true; fr.height = 40;
    fr.addText(path + ' · ' + byFolder[f.id].length);
    tb.addRow(fr);
    byFolder[f.id].forEach(t => {
      const r = new UITableRow(); r.height = 56;
      const u = due(t), meta = [prio(t)[1]];
      if (u) meta.push(u.s);
      if (t.subs) meta.push(t.subs[0] + '/' + t.subs[1] + ' subtasks');
      const c = r.addText(prio(t)[2] + '  ' + t.text, meta.join(' · '));
      if (u && u.late) c.subtitleColor = new Color(LOOKS.light.danger);
      tb.addRow(r);
    });
  });
  if (!list.length) { const r = new UITableRow(); r.addText('All done ✓', 'Nothing open in the chosen folders'); tb.addRow(r); }
  await tb.present(false);
  if (preview) {
    const w = makeWidget(preview, res);
    const fn = { small: 'presentSmall', medium: 'presentMedium', large: 'presentLarge', accessoryRectangular: 'presentAccessoryRectangular' }[preview];
    await w[fn]();
  }
}

// ---------- run ----------
const res = await load();
if (config.runsInWidget) {
  Script.setWidget(makeWidget(config.widgetFamily || 'medium', res));
} else if (config.runsInApp) {
  await showList(res);
} else {
  Script.setWidget(makeWidget('medium', res));
}
Script.complete();
