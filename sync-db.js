// Local-first DB with the same small API the app used (collection/add/doc/update/delete/orderBy/onSnapshot).
// Data lives in localStorage and syncs to a JSON file in a private GitHub repo.
(function () {
  const LS_DATA = 'tgr_db_v1';
  const LS_CFG = 'tgr_sync_cfg';
  const LS_SYNCED = 'tgr_synced_once';

  let store = {};            // { colName: { id: { ...fields, _u: ts, _d?: true } } }
  const subs = [];           // { col, field, dir, cb }
  const pendingEmit = new Set();
  let ready = false;
  let syncing = false, again = false, syncTimer = null;
  const statusListeners = [];
  let status = { state: 'none', msg: 'Sync not set up', last: null };

  try { store = JSON.parse(localStorage.getItem(LS_DATA) || '{}') || {}; } catch (e) { store = {}; }
  function persist() { try { localStorage.setItem(LS_DATA, JSON.stringify(store)); } catch (e) {} }

  function getCfg() { try { return JSON.parse(localStorage.getItem(LS_CFG) || 'null'); } catch (e) { return null; } }
  function setCfg(c) { try { c ? localStorage.setItem(LS_CFG, JSON.stringify(c)) : localStorage.removeItem(LS_CFG); } catch (e) {} }
  function syncedOnce() { try { return localStorage.getItem(LS_SYNCED) === '1'; } catch (e) { return false; } }
  function markSynced(v) { try { v ? localStorage.setItem(LS_SYNCED, '1') : localStorage.removeItem(LS_SYNCED); } catch (e) {} }

  function setStatus(state, msg) {
    status = { state, msg, last: state === 'ok' ? Date.now() : status.last };
    statusListeners.forEach(f => { try { f(status); } catch (e) {} });
  }

  function newId() {
    const a = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let s = '';
    const r = crypto.getRandomValues(new Uint8Array(20));
    for (let i = 0; i < 20; i++) s += a[r[i] % a.length];
    return s;
  }
  function col(name) { return store[name] || (store[name] = {}); }

  // ---------- snapshots ----------
  function emit(name) {
    if (!ready) return;
    pendingEmit.add(name);
    queueMicrotask(flush);
  }
  function flush() {
    const names = [...pendingEmit]; pendingEmit.clear();
    names.forEach(n => subs.filter(s => s.col === n).forEach(fire));
  }
  function fire(s) {
    const c = col(s.col);
    const docs = Object.keys(c).filter(id => !c[id]._d).map(id => {
      const { _u, _d, ...rest } = c[id];
      return { id, data: () => JSON.parse(JSON.stringify(rest)) };
    });
    const v = d => { const x = d.data()[s.field]; return x == null ? 0 : x; };
    docs.sort((a, b) => (v(a) < v(b) ? -1 : v(a) > v(b) ? 1 : 0) * (s.dir === 'desc' ? -1 : 1));
    try { s.cb({ docs }); } catch (e) { console.error(e); }
  }
  function emitAll() { Object.keys(store).forEach(emit); subs.forEach(s => emit(s.col)); }

  function changed(name) { persist(); emit(name); scheduleSync(1500); }

  function collection(name) {
    return {
      add(data) {
        const id = newId();
        col(name)[id] = { ...JSON.parse(JSON.stringify(data)), _u: Date.now() };
        changed(name);
        return Promise.resolve({ id });
      },
      doc(id) {
        return {
          update(patch) {
            const d = col(name)[id];
            if (!d || d._d) return Promise.reject(new Error('not found'));
            Object.assign(d, JSON.parse(JSON.stringify(patch)), { _u: Date.now() });
            changed(name);
            return Promise.resolve();
          },
          set(data) {
            col(name)[id] = { ...JSON.parse(JSON.stringify(data)), _u: Date.now() };
            changed(name);
            return Promise.resolve();
          },
          delete() {
            col(name)[id] = { _d: true, _u: Date.now() };
            changed(name);
            return Promise.resolve();
          }
        };
      },
      orderBy(field, dir) {
        return {
          onSnapshot(cb) {
            const s = { col: name, field, dir, cb };
            subs.push(s);
            if (ready) queueMicrotask(() => fire(s));
            return () => { const i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1); };
          }
        };
      }
    };
  }

  // ---------- GitHub ----------
  function b64encode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function b64decode(b64) {
    const bin = atob(b64.replace(/\s/g, ''));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function api(cfg, path, opts) {
    return fetch('https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo + path, {
      cache: 'no-store',
      ...opts,
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + cfg.token,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(opts && opts.headers)
      }
    });
  }
  async function pull(cfg) {
    const r = await api(cfg, '/contents/' + encodeURIComponent(cfg.path) + '?t=' + Date.now());
    if (r.status === 404) return { data: null, sha: null };
    if (r.status === 401 || r.status === 403) throw new Error('Token rejected: check token and its repo access');
    if (!r.ok) throw new Error('GitHub error ' + r.status);
    const j = await r.json();
    let text;
    if (j.encoding === 'base64' && j.content) text = b64decode(j.content);
    else {
      const b = await api(cfg, '/git/blobs/' + j.sha);
      if (!b.ok) throw new Error('GitHub error ' + b.status);
      text = b64decode((await b.json()).content);
    }
    let data = null;
    try { data = JSON.parse(text); } catch (e) { throw new Error('Data file is not valid JSON'); }
    return { data: (data && data.cols) || {}, sha: j.sha };
  }
  async function push(cfg, cols, sha) {
    const body = { message: 'sync ' + new Date().toISOString(), content: b64encode(JSON.stringify({ v: 1, cols })) };
    if (sha) body.sha = sha;
    const r = await api(cfg, '/contents/' + encodeURIComponent(cfg.path), {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    if (r.status === 409 || r.status === 422) return false; // someone pushed in between
    if (r.status === 401 || r.status === 403) throw new Error('Token has no write access to the repo');
    if (!r.ok) throw new Error('GitHub error ' + r.status);
    return true;
  }

  function merge(a, b) {
    const out = {};
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach(name => {
      const ca = a[name] || {}, cb = b[name] || {}, co = {};
      new Set([...Object.keys(ca), ...Object.keys(cb)]).forEach(id => {
        const x = ca[id], y = cb[id];
        co[id] = !x ? y : !y ? x : ((y._u || 0) > (x._u || 0) ? y : x);
      });
      out[name] = co;
    });
    return out;
  }
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  function scheduleSync(ms) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(sync, ms || 0);
  }

  async function sync() {
    const cfg = getCfg();
    if (!cfg) { setStatus('none', 'Sync not set up'); return; }
    if (!navigator.onLine) { setStatus('offline', 'Offline, changes are saved on this device'); return; }
    if (syncing) { again = true; return; }
    syncing = true;
    setStatus('pending', 'Syncing...');
    try {
      for (let attempt = 0; attempt < 4; attempt++) {
        const remote = await pull(cfg);
        let next;
        if (!syncedOnce() && remote.data) next = remote.data;          // first sync on this device: take the cloud copy
        else next = merge(store, remote.data || {});
        const localChanged = !same(next, store);
        store = next; persist();
        if (localChanged) emitAll();
        if (remote.data && same(next, remote.data)) break;
        if (await push(cfg, next, remote.sha)) break;
      }
      markSynced(true);
      setStatus('ok', 'Synced');
    } catch (e) {
      setStatus('error', e.message || 'Sync failed');
    } finally {
      syncing = false;
      if (again) { again = false; scheduleSync(300); }
    }
  }

  async function open() {
    const cfg = getCfg();
    const finish = () => { if (!ready) { ready = true; subs.forEach(s => fire(s)); } };
    if (cfg && navigator.onLine) {
      const t = setTimeout(finish, 6000);
      sync().finally(() => { clearTimeout(t); finish(); });
    } else {
      setTimeout(finish, 0);
      if (!cfg) setStatus('none', 'Sync not set up'); else setStatus('offline', 'Offline, changes are saved on this device');
    }
    return { collection };
  }

  window.addEventListener('online', () => scheduleSync(500));
  window.addEventListener('offline', () => getCfg() && setStatus('offline', 'Offline, changes are saved on this device'));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') scheduleSync(300); });
  setInterval(() => { if (document.visibilityState === 'visible') sync(); }, 60000);

  window.SyncDB = {
    open,
    collection,
    isReady: () => ready,
    sync: () => scheduleSync(0),
    getConfig: getCfg,
    configure(cfg) {
      const prev = getCfg();
      setCfg(cfg);
      if (!prev || prev.owner !== cfg.owner || prev.repo !== cfg.repo || prev.path !== cfg.path) markSynced(false);
      scheduleSync(0);
    },
    disconnect() { setCfg(null); markSynced(false); setStatus('none', 'Sync not set up'); },
    onStatus(f) { statusListeners.push(f); f(status); },
    exportJSON() { return JSON.stringify({ v: 1, cols: store }, null, 1); }
  };
})();
