// Motivation: short phrases you write here show up on the iPhone Lock Screen through the Scriptable widget
// (a TGRAPP widget with the Parameter "motivation"). Pinned phrases show first; otherwise the widget rotates them.
(function () {
  const css = `
  #page-motivation { max-width: 640px; }
  .mo-add { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
  .mo-add textarea { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 10px; padding: 11px 13px;
    font-size: 15px; color: var(--text); outline: none; font-family: inherit; resize: vertical; min-height: 64px; }
  .mo-add textarea:focus { border-color: var(--accent); }
  .mo-add-bar { display: flex; align-items: center; gap: 10px; }
  .mo-count { font-size: 12.5px; color: var(--text-dim); flex: 1; }
  .mo-count.long { color: var(--danger); }
  .mo-list { display: flex; flex-direction: column; gap: 8px; }
  .mo-item { display: flex; align-items: flex-start; gap: 10px; background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 12px 12px 14px; }
  .mo-item.pinned { border-color: var(--accent); }
  .mo-text { flex: 1; min-width: 0; font-size: 15px; line-height: 1.4; white-space: pre-wrap; word-break: break-word; cursor: text; }
  .mo-btn { background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 4px; border-radius: 7px; display: flex; flex-shrink: 0; }
  .mo-btn:hover { background: var(--accent-soft); color: var(--text); }
  .mo-btn.on { color: var(--accent); }
  .mo-btn.del:hover { color: var(--danger); }
  .mo-help { margin-top: 22px; font-size: 13px; color: var(--text-dim); line-height: 1.5; }
  .mo-help b { color: var(--text); }
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const LOCK_MAX = 70;   // about what fits in the wide Lock Screen widget (3-4 short lines)
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const ICON = {
    bolt: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M13 2L4 14H11L10 22L20 9H13L13 2Z"/></svg>',
    pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L14.5 9.2L21 9.8L16 14.1L17.5 20.5L12 17L6.5 20.5L8 14.1L3 9.8L9.5 9.2L12 3Z"/></svg>',
    pinOn: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3L14.5 9.2L21 9.8L16 14.1L17.5 20.5L12 17L6.5 20.5L8 14.1L3 9.8L9.5 9.2L12 3Z"/></svg>',
    trash: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 4H13M6.5 4V2.7C6.5 2.3 6.8 2 7.2 2H8.8C9.2 2 9.5 2.3 9.5 2.7V4M5 4V12.5C5 13 5.4 13.4 5.9 13.4H10.1C10.6 13.4 11 13 11 12.5V4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  const moCol = SyncDB.collection('motivation');
  let items = [];
  moCol.orderBy('createdAt', 'asc').onSnapshot(s => {
    items = s.docs.map(d => ({ id: d.id, ...d.data() }));
    if (currentPage === 'motivation') renderAll();
  });

  const page = el('div'); page.id = 'page-motivation'; page.className = 'page-wrap'; page.style.display = 'none';
  document.getElementById('content').appendChild(page);

  function goMotivation() { currentPage = 'motivation'; renderAll(); autoCollapseOnMobile(); }

  function addPhrase(text) {
    const v = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    if (!v) return;
    moCol.add({ text: v, pinned: false, createdAt: Date.now() });
  }
  function togglePin(m) {
    // one pinned phrase at a time: it stays on the Lock Screen until you unpin it
    if (!m.pinned) items.filter(x => x.pinned && x.id !== m.id).forEach(x => moCol.doc(x.id).update({ pinned: false }));
    moCol.doc(m.id).update({ pinned: !m.pinned });
  }
  function removePhrase(m) {
    if (!confirm('Delete this phrase?')) return;
    moCol.doc(m.id).delete();
  }

  function render() {
    const keep = page.querySelector('.mo-add textarea');
    const draft = keep ? keep.value : '';
    const hadFocus = keep && document.activeElement === keep;
    page.innerHTML = '';
    const head = el('div', 'x-head'); head.appendChild(el('h1', 'x-title', 'Motivation')); page.appendChild(head);

    const add = el('div', 'mo-add');
    const ta = el('textarea'); ta.placeholder = 'A phrase for your Lock Screen...'; ta.rows = 2; ta.value = draft;
    const bar = el('div', 'mo-add-bar');
    const cnt = el('span', 'mo-count');
    const btn = el('button', 'x-btn primary', 'Add');
    const upd = () => {
      const n = ta.value.trim().length;
      cnt.textContent = n ? n + ' / ~' + LOCK_MAX + (n > LOCK_MAX ? ' · may get cut on the Lock Screen' : '') : 'Short phrases fit the Lock Screen best';
      cnt.classList.toggle('long', n > LOCK_MAX);
    };
    const submit = () => { addPhrase(ta.value); ta.value = ''; upd(); ta.focus(); };
    ta.addEventListener('input', upd);
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); } });
    btn.addEventListener('click', submit);
    bar.appendChild(cnt); bar.appendChild(btn);
    add.appendChild(ta); add.appendChild(bar);
    page.appendChild(add);
    upd();
    if (hadFocus) ta.focus();

    const list = el('div', 'mo-list');
    const sorted = items.slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.createdAt || 0) - (a.createdAt || 0));
    sorted.forEach(m => {
      const it = el('div', 'mo-item' + (m.pinned ? ' pinned' : ''));
      const tx = el('div', 'mo-text'); tx.textContent = m.text; tx.title = 'Tap to edit';
      tx.addEventListener('click', () => inlineEdit(tx, m.text, v => moCol.doc(m.id).update({ text: v })));
      const pin = el('button', 'mo-btn' + (m.pinned ? ' on' : ''), m.pinned ? ICON.pinOn : ICON.pin);
      pin.title = m.pinned ? 'Unpin' : 'Pin to the Lock Screen';
      pin.addEventListener('click', () => togglePin(m));
      const del = el('button', 'mo-btn del', ICON.trash); del.title = 'Delete';
      del.addEventListener('click', () => removePhrase(m));
      it.appendChild(tx); it.appendChild(pin); it.appendChild(del);
      list.appendChild(it);
    });
    if (!items.length) list.appendChild(el('div', 'x-empty', 'No phrases yet'));
    page.appendChild(list);

    page.appendChild(el('div', 'mo-help',
      '<b>On the Lock Screen:</b> a pinned phrase (star) stays there. With nothing pinned, the widget goes through all your phrases in random order and repeats only after showing every one.<br>' +
      '<b>Set up once:</b> copy the widget script again (Settings → iPhone widget) and replace the old one in Scriptable. ' +
      'Then add a Scriptable widget to the Lock Screen, tap it, pick Script <b>TGRAPP</b> and type <b>motivation</b> in the Parameter field.'));
  }

  // ---------- hook into the app's sidebar, breadcrumbs and pages ----------
  const prevSidebar = window.renderExtraSidebar;
  window.renderExtraSidebar = function (list) {
    if (prevSidebar) prevSidebar(list);
    const r = el('div', 'tree-row' + (currentPage === 'motivation' ? ' active' : ''));
    r.style.paddingLeft = '6px';
    r.appendChild(el('span', 'row-icon', ICON.bolt));
    const nm = el('span', 'row-name'); nm.textContent = 'Motivation'; nm.style.fontWeight = '700'; r.appendChild(nm);
    if (items.length) { const m = el('span'); m.textContent = items.length; m.style.cssText = 'font-size:11.5px;color:var(--sidebar-text-dim);padding-right:4px'; r.appendChild(m); }
    r.addEventListener('click', goMotivation);
    list.appendChild(r);
  };
  const prevCrumbs = window.renderExtraBreadcrumbs;
  window.renderExtraBreadcrumbs = function (bc) {
    if (currentPage !== 'motivation') return prevCrumbs ? prevCrumbs(bc) : false;
    bc.innerHTML = '';
    const c = el('span', 'crumb current'); c.textContent = 'Motivation'; bc.appendChild(c);
    return true;
  };
  const prevPages = window.renderExtraPages;
  window.renderExtraPages = function () {
    if (prevPages) prevPages();
    page.style.display = currentPage === 'motivation' ? 'block' : 'none';
    if (currentPage === 'motivation') render();
  };

  window.__tgr = Object.assign(window.__tgr || {}, { goMotivation });
  renderAll();
})();
