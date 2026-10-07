/* ==========================================================================
   DOCI — shared app shell: icons, helpers, header/footer, auth, toast, dialogs
   ========================================================================== */
(function () {
  const D = window.DOCI_DATA;

  /* ---------- Icons (Lucide-style, outline 2px) ---------- */
  const P = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    'chev-down': '<path d="m6 9 6 6 6-6"/>',
    'chev-left': '<path d="m15 18-6-6 6-6"/>',
    'chev-right': '<path d="m9 18 6-6-6-6"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    navigation: '<path d="m3 11 19-9-9 19-2-8-8-2z"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
    sos: '<path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z"/><path d="M12 8v4M12 16h.01"/>',
    battery: '<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h3M21 17v4"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    comment: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    youtube: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    map: '<path d="M14.1 5.55a2 2 0 0 0 1.8 0l3.66-1.83A1 1 0 0 1 21 4.62v12.76a1 1 0 0 1-.55.9l-4.55 2.28a2 2 0 0 1-1.79 0l-4.21-2.1a2 2 0 0 0-1.79 0l-3.66 1.83A1 1 0 0 1 3 19.38V6.62a1 1 0 0 1 .55-.9l4.55-2.27a2 2 0 0 1 1.79 0z"/><path d="M15 5.76v15M9 3.24v15"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 16h5v5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>',
    more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    flash: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    wifioff: '<path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M2 8.82a15 15 0 0 1 4.17-2.65M10.66 5c4.01-.36 8.14.9 11.34 3.76M16.85 11.25a10 10 0 0 1 2.22 1.68M5 12.86a10 10 0 0 1 5.17-2.69M12 20h.01"/>',
    bike: '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h3l-3 6H9l-3.5 5.5M9 12l-2-4H4M12 12l3 5.5"/>',
    helmet: '<path d="M3 15a9 9 0 0 1 18 0v2a2 2 0 0 1-2 2h-6v-5H3z"/><path d="M13 14h8"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    mapfocus: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/>',
    bank: '<path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1zM16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"/>',
    newspaper: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2M18 14h-8M15 18h-5M10 6h8v4h-8z"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M12 7v5l4 2"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>'
  };
  function icon(name, cls = '', label) {
    const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
    return `<svg class="icon ${cls}" viewBox="0 0 24 24" ${a11y} focusable="false">${P[name] || ''}</svg>`;
  }

  /* ---------- Formatters (Indonesia) ---------- */
  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const MON_S = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = {
    rp: (n) => (n === 0 ? 'Gratis' : 'Rp ' + Math.round(n).toLocaleString('id-ID')),
    rpRaw: (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID'),
    date: (d) => { d = new Date(d); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; },
    dateShort: (d) => { d = new Date(d); return `${d.getDate()} ${MON_S[d.getMonth()]} ${d.getFullYear()}`; },
    time: (d) => { d = new Date(d); return `${pad(d.getHours())}.${pad(d.getMinutes())} WIB`; },
    dateTime: (d) => { d = new Date(d); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}.${pad(d.getMinutes())} WIB`; },
    dayName: (d) => DAYS[new Date(d).getDay()],
    mon: (d) => MON_S[new Date(d).getMonth()],
    monthName: (m) => MONTHS[m],
    range: (a, b) => {
      a = new Date(a); b = new Date(b);
      if (a.toDateString() === b.toDateString()) return `${DAYS[a.getDay()]}, ${fmt.date(a)} · ${fmt.time(a).replace(' WIB', '')}–${fmt.time(b)}`;
      return `${a.getDate()} ${a.getMonth() === b.getMonth() ? '' : MON_S[a.getMonth()] + ' '}– ${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`;
    },
    phone: (p) => { const s = p.replace('+62', ''); return '+62 ' + s.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3'); },
    maskPhone: (p) => p.slice(0, 6) + '••••' + p.slice(-3),
    initials: (n) => n.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase(),
    ago: (d) => { const s = Math.floor((Date.now() - new Date(d)) / 1000); if (s < 60) return 'baru saja'; if (s < 3600) return Math.floor(s / 60) + ' menit lalu'; if (s < 86400) return Math.floor(s / 3600) + ' jam lalu'; return Math.floor(s / 86400) + ' hari lalu'; }
  };
  function normPhone(v) {
    let s = String(v || '').replace(/[^\d+]/g, '');
    if (s.startsWith('+62')) s = s.slice(3);
    else if (s.startsWith('62')) s = s.slice(2);
    else if (s.startsWith('0')) s = s.slice(1);
    if (s.startsWith('0')) s = s.slice(1); /* +62 0812… / 62 0812… */
    return /^8\d{8,11}$/.test(s) ? '+62' + s : null;
  }
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Store ---------- */
  const Store = {
    get(k, d = null) { try { const v = localStorage.getItem('doci_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('doci_' + k, JSON.stringify(v)); } catch { /* storage penuh/diblokir */ } },
    del(k) { try { localStorage.removeItem('doci_' + k); } catch { /* noop */ } }
  };

  /* Terapkan perubahan dari Admin Panel (prototipe, localStorage): kegiatan & berita buatan/ubahan admin.
     D.EVENTS / D.NEWS = hanya yang tayang publik; D.EVENTS_ALL / D.NEWS_ALL = termasuk draft (dipakai admin). */
  (function () {
    const ed = Store.get('ev_edits', {}), cu = Store.get('ev_custom', []);
    const rev = (o) => Object.assign({}, o, { start: new Date(o.start), end: new Date(o.end) });
    D.EVENTS.forEach((e, i) => { if (ed[e.id]) D.EVENTS[i] = Object.assign(e, rev(ed[e.id])); });
    cu.forEach(c => D.EVENTS.push(rev(c)));
    D.EVENTS_ALL = D.EVENTS.slice(); D.EVENTS = D.EVENTS.filter(e => e.status !== 'draft');
    const nov = Store.get('news_ov', {}), nc = Store.get('news_custom', []);
    const nrev = (n) => Object.assign({}, n, { date: new Date(n.date) });
    D.NEWS.forEach(n => { n.status = nov[n.id] || 'terbit'; });
    nc.forEach(n => D.NEWS.push(nrev(n)));
    D.NEWS_ALL = D.NEWS.slice(); D.NEWS = D.NEWS.filter(n => n.status !== 'draft').sort((a, b) => b.date - a.date);
  })();

  /* Terapkan pendaftar baru (simulasi) ke kuota kegiatan */
  (function () { const t = Store.get('taken', {}); D.EVENTS_ALL.forEach(e => { if (t[e.id]) e.taken = Math.min(e.quota, e.taken + t[e.id]); }); })();

  /* ---------- Audit log ---------- */
  const Audit = {
    list() { return Store.get('audit', []); },
    log(action, object, before, after) {
      const u = Auth.current();
      const l = Audit.list();
      l.unshift({ at: new Date().toISOString(), actor: u ? u.name : 'Anonim', role: u ? u.role : 'public', action, object, before: before ?? null, after: after ?? null, ip: '103.28.' + (12 + (u ? u.name.length : 0)) + '.' + (40 + action.length) });
      Store.set('audit', l.slice(0, 200));
    }
  };

  /* ---------- Auth (simulasi) ---------- */
  const Auth = {
    current() { return Store.get('session'); },
    users() { return Object.assign({}, D.DEMO_USERS, Store.get('users', {})); },
    login(phone) {
      const u = Auth.users()[phone];
      if (!u) return null;
      const s = Object.assign({ phone }, u);
      Store.set('session', s);
      Audit.log('login', 'Sesi ' + phone);
      return s;
    },
    registerUser(phone, data) {
      const users = Store.get('users', {});
      users[phone] = data; Store.set('users', users);
    },
    logout() { Audit.log('logout', 'Sesi'); Store.del('session'); location.href = 'index.html'; },
    require(roles, redirect = true) {
      const u = Auth.current();
      if (u && (!roles || roles.includes(u.role))) return u;
      if (redirect) {
        if (!u) location.href = 'masuk.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.hash);
      }
      return null;
    }
  };

  /* ---------- Toast ---------- */
  function toast({ type = 'info', title = '', msg = '', timeout = 5000 }) {
    let region = $('#toast-region');
    if (!region) { region = document.createElement('div'); region.id = 'toast-region'; region.className = 'toast-region'; region.setAttribute('aria-live', 'polite'); document.body.appendChild(region); }
    const ic = { success: 'check-circle', error: 'x-circle', warning: 'alert', info: 'alert' }[type];
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = `<span class="toast__icon">${icon(ic, 'icon--24')}</span><div class="toast__body">${title ? `<b>${esc(title)}</b>` : ''}${esc(msg)}</div><button class="toast__close" aria-label="Tutup notifikasi">${icon('x', 'icon--16')}</button>`;
    const close = () => { el.classList.add('is-out'); setTimeout(() => el.remove(), 200); };
    el.querySelector('.toast__close').addEventListener('click', close);
    region.appendChild(el);
    if (type !== 'error' && timeout) setTimeout(close, timeout);
    return close;
  }

  /* ---------- Dialog helpers ---------- */
  function openDialog(d) { if (typeof d === 'string') d = $(d); if (!d.open) d.showModal(); return d; }
  function closeDialog(d) { if (typeof d === 'string') d = $(d); if (d && d.open) d.close(); }
  document.addEventListener('click', (e) => {
    const closer = e.target.closest('[data-close]');
    if (closer) { closeDialog(closer.closest('dialog')); return; }
    const opener = e.target.closest('[data-open]');
    if (opener) { openDialog(opener.getAttribute('data-open')); return; }
    const dlg = e.target.tagName === 'DIALOG' ? e.target : null; // klik backdrop (light dismiss)
    if (dlg && dlg.dataset.nolight === undefined) {
      const r = dlg.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
    }
  });
  function confirmDialog({ title, body, confirmText = 'Ya, lanjutkan', cancelText = 'Batal', danger = false }) {
    return new Promise((resolve) => {
      const d = document.createElement('dialog');
      d.className = 'modal'; d.setAttribute('aria-labelledby', 'cd-title');
      d.innerHTML = `<div class="modal__head"><h2 id="cd-title">${esc(title)}</h2></div><div class="modal__body"><p class="muted" style="margin:0">${body}</p></div><div class="modal__foot"><button class="btn btn--ghost" data-v="0">${esc(cancelText)}</button><button class="btn ${danger ? 'btn--danger' : ''}" data-v="1">${esc(confirmText)}</button></div>`;
      document.body.appendChild(d);
      let val = false;
      d.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { val = b.dataset.v === '1'; d.close(); } });
      d.addEventListener('close', () => { d.remove(); resolve(val); });
      d.showModal();
    });
  }

  /* ---------- Logo ---------- */
  function logo(white = false, href = 'index.html') {
    const horizSrc = white ? 'assets/img/logo-horizontal-white.png' : 'assets/img/logo-horizontal.png';
    const squareSrc = white ? 'assets/img/logo-square-white.png' : 'assets/img/logo-square.png';
    return `<a href="${href}" class="logo ${white ? 'logo--white' : ''}" aria-label="DOCI Indonesia — ke Beranda"><img src="${horizSrc}" alt="Logo DOCI Indonesia" class="logo-img logo-img--full"><img src="${squareSrc}" alt="Logo DOCI Indonesia" class="logo-img logo-img--square"></a>`;
  }
  const EMBLEM = `<img src="assets/img/logo-square.png" alt="Emblem DOCI" class="logo-emblem">`;

  /* ---------- Pseudo QR (visual, non-scannable placeholder) ---------- */
  function qrSvg(text, size = 120, fg = '#141416', bg = '#fff') {
    let h = 2166136261; for (const c of text) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    const n = 25; const rnd = () => (h = (Math.imul(h, 1103515245) + 12345) >>> 0) / 4294967296;
    const finder = (x, y) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    let cells = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (finder(x, y)) continue;
      if (rnd() > .52) cells += `M${x} ${y}h1v1h-1z`;
    }
    const fnd = (ox, oy) => `<path d="M${ox} ${oy}h7v7h-7zM${ox + 1} ${oy + 1}v5h5v-5z" fill="${fg}" fill-rule="evenodd"/><rect x="${ox + 2}" y="${oy + 2}" width="3" height="3" fill="${fg}"/>`;
    return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" width="${size}" height="${size}" role="img" aria-label="Kode QR verifikasi"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="${bg}"/><path d="${cells}" fill="${fg}"/>${fnd(0, 0)}${fnd(n - 7, 0)}${fnd(0, n - 7)}</svg>`;
  }

  /* ---------- Social (handle placeholder — ganti dengan akun resmi) ---------- */
  const SOCIAL = { instagram: { handle: 'doci.indonesia', url: 'https://www.instagram.com/doci.indonesia/' } };

  /* ---------- Header ---------- */
  const NAV = [
    { label: 'Tentang', key: 'tentang', items: [['Sejarah', 'tentang.html#sejarah', 'history'], ['Profil, Visi & Misi', 'tentang.html#profil', 'flag'], ['Struktur Organisasi', 'tentang.html#struktur', 'users'], ['AD/ART & Dokumen', 'dokumen.html', 'file']] },
    { label: 'Keanggotaan', key: 'membership', items: [['Join Us', 'membership.html', 'user'], ['Benefit Member', 'membership.html#benefit', 'star'], ['Direktori Member', 'membership.html#direktori', 'users'], ['Area Member', 'akun.html', 'card']] },
    { label: 'Kegiatan', key: 'kegiatan', items: [['Kalender Kegiatan', 'kegiatan.html', 'calendar'], ['Touring', 'kegiatan.html?cat=touring', 'navigation'], ['Riding & Track Day', 'kegiatan.html?cat=riding', 'bike'], ['Sosial', 'kegiatan.html?cat=sosial', 'heart']] },
    { label: 'Berita', key: 'berita', href: 'berita.html' },
    { label: 'Galeri', key: 'galeri', href: 'galeri.html' },
    { label: 'Chapter', key: 'chapter', href: 'chapter.html' },
    { label: 'Kontak', key: 'kontak', href: 'kontak.html' }
  ];

  function renderHeader() {
    const host = $('#site-header'); if (!host) return;
    const page = document.body.dataset.page || '';
    const u = Auth.current();
    const navHTML = NAV.map(n => n.items ? `
      <li class="has-menu"><button class="nav-link" aria-expanded="false" aria-haspopup="true" ${page === n.key ? 'aria-current="page"' : ''}>${n.label}${icon('chev-down')}</button>
      <ul class="submenu">${n.items.map(i => `<li><a href="${i[1]}">${icon(i[2], 'icon--16')}${i[0]}</a></li>`).join('')}</ul></li>`
      : `<li><a class="nav-link" href="${n.href}" ${page === n.key ? 'aria-current="page"' : ''}>${n.label}</a></li>`).join('');

    const drawerNav = NAV.map((n, i) => n.items ? `
      <div class="acc-item"><button aria-expanded="false" aria-controls="dr-${i}">${n.label}${icon('chev-down')}</button>
      <div class="acc-panel" id="dr-${i}" hidden>${n.items.map(it => `<a href="${it[1]}">${it[0]}</a>`).join('')}</div></div>`
      : `<div class="acc-item"><a href="${n.href}">${n.label}</a></div>`).join('');

    const userBlock = u ? `
      <div class="user-menu"><button class="user-btn" aria-haspopup="true" aria-expanded="false" aria-label="Menu akun ${esc(u.name)}"><span class="avatar">${fmt.initials(u.name)}</span><span class="small" style="font-weight:600;display:none" data-name>${esc(u.name.split(' ')[0])}</span>${icon('chev-down', 'icon--16')}</button>
        <div class="user-pop" role="menu"><div class="who"><b>${esc(u.name)}</b><span>${esc(u.memberId || '')} · ${u.role === 'superadmin' ? 'Superadmin' : u.role === 'admin' ? 'Admin' : 'Member'}</span></div>
        <a href="akun.html" role="menuitem">${icon('card')}Area Member</a>
        ${u.role !== 'member' ? `<a href="admin.html" role="menuitem">${icon('dashboard')}Admin Panel</a>` : ''}
        <a href="akun.html#kegiatan" role="menuitem">${icon('calendar')}Kegiatan Saya</a>
        <button data-logout role="menuitem">${icon('logout')}Keluar</button></div></div>` :
      `<a class="btn btn--ghost btn-login" href="masuk.html">Masuk</a>`;

    host.innerHTML = `
      <a class="skip-link" href="#main">Lewati ke konten utama</a>
      <header class="site-header"><div class="container site-header__inner">
        ${logo()}
        <nav class="site-nav" aria-label="Navigasi utama"><ul>${navHTML}</ul></nav>
        <div class="site-header__actions">
          ${userBlock}
          ${u ? '' : '<a class="btn btn-join" href="membership.html">Join Member</a>'}
          <button class="icon-btn menu-toggle" aria-label="Buka menu" aria-controls="drawer" data-open="#drawer">${icon('menu', 'icon--24')}</button>
        </div>
      </div></header>
      <dialog class="drawer" id="drawer" aria-label="Menu navigasi">
        <div class="drawer__head">${logo()}<button class="icon-btn" aria-label="Tutup menu" data-close>${icon('x', 'icon--24')}</button></div>
        <div class="drawer__cta">${u ? `<a class="btn" href="akun.html">Area Member</a>` : `<a class="btn" href="membership.html">Daftar Menjadi Member</a><a class="btn btn--secondary" href="masuk.html">Masuk</a>`}</div>
        <div class="drawer__body">${drawerNav}${u ? `<div class="acc-item"><button data-logout style="color:var(--color-danger)">Keluar ${icon('logout')}</button></div>` : ''}</div>
      </dialog>`;

    const header = $('.site-header', host);
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

    // dropdowns
    const closeAllSubmenus = () => {
      $$('.has-menu.open', host).forEach(x => {
        x.classList.remove('open');
        if (x.firstElementChild) x.firstElementChild.setAttribute('aria-expanded', 'false');
      });
    };

    $$('.has-menu', host).forEach(item => {
      const btn = item.querySelector('.nav-link');
      item.addEventListener('mouseenter', () => {
        closeAllSubmenus();
        item.classList.add('open');
        if (btn) btn.setAttribute('aria-expanded', 'true');
      });
      item.addEventListener('mouseleave', () => {
        item.classList.remove('open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const isOpen = item.classList.contains('open');
          closeAllSubmenus();
          if (!isOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
          }
          e.stopPropagation();
        });
      }
    });

    $$('.site-nav > ul > li:not(.has-menu) > a', host).forEach(a => {
      a.addEventListener('mouseenter', closeAllSubmenus);
    });
    const um = $('.user-menu', host);
    if (um) um.querySelector('.user-btn').addEventListener('click', (e) => { const o = um.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); e.stopPropagation(); });
    document.addEventListener('click', () => {
      $$('.has-menu.open', host).forEach(x => { x.classList.remove('open'); x.firstElementChild.setAttribute('aria-expanded', 'false'); });
      if (um) { um.classList.remove('open'); um.querySelector('.user-btn').setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $$('.has-menu.open').forEach(x => x.classList.remove('open')); if (um) um.classList.remove('open'); } });
    // drawer accordion
    $$('.acc-item > button[aria-controls]', host).forEach(b => b.addEventListener('click', () => {
      const p = $('#' + b.getAttribute('aria-controls'), host); const o = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', !o); p.hidden = o;
    }));
    $$('[data-logout]', host).forEach(b => b.addEventListener('click', Auth.logout));
    $$('#drawer a', host).forEach(a => a.addEventListener('click', () => closeDialog('#drawer')));
    if (window.matchMedia('(min-width: 992px)').matches === false) { const n = $('[data-name]', host); if (n) n.style.display = 'none'; } else { const n = $('[data-name]', host); if (n) n.style.display = 'inline'; }
  }

  /* ---------- Footer ---------- */
  function renderFooter() {
    const host = $('#site-footer'); if (!host) return;
    const g = (title, body, open = false) => `<section class="footer-group ${open ? 'open' : ''}"><h3><button class="footer-toggle" aria-expanded="${open}">${title}${icon('chev-down')}</button></h3><div class="footer-body">${body}</div></section>`;
    host.innerHTML = `<footer class="site-footer"><div class="container">
      <div class="footer-grid">
        <div class="footer-brand">${logo(true)}
          <p>Komunitas Ducati Indonesia — satu keluarga di atas roda dua. Tegas, akrab, dan saling menjaga.</p>
          <div class="footer-social"><a href="${SOCIAL.instagram.url}" target="_blank" rel="noopener noreferrer" aria-label="Instagram DOCI (@${SOCIAL.instagram.handle})">${icon('instagram', 'icon--24')}</a><a href="#" aria-label="Facebook DOCI">${icon('facebook', 'icon--24')}</a><a href="#" aria-label="YouTube DOCI">${icon('youtube', 'icon--24')}</a></div>
        </div>
        ${g('Kontak', `<ul class="footer-contact"><li>${icon('pin', 'icon--16')}<span>Sekretariat DOCI<br>Jakarta, Indonesia<br><span style="opacity:.7">(alamat final menyusul)</span></span></li><li>${icon('phone', 'icon--16')}<span>+62 812-0000-0000</span></li><li>${icon('mail', 'icon--16')}<a href="mailto:halo@doci.example">halo@doci.example</a></li></ul>`)}
        ${g('Menu', `<ul><li><a href="tentang.html">Tentang DOCI</a></li><li><a href="kegiatan.html">Kalender Kegiatan</a></li><li><a href="berita.html">Berita</a></li><li><a href="galeri.html">Galeri</a></li><li><a href="chapter.html">Chapter</a></li><li><a href="dokumen.html">AD/ART & Dokumen</a></li></ul>`)}
        ${g('Keanggotaan', `<ul><li><a href="membership.html">Join Us</a></li><li><a href="membership.html#benefit">Benefit Member</a></li><li><a href="masuk.html">Masuk</a></li><li><a href="akun.html">Area Member</a></li><li><a href="admin.html">Admin Panel</a></li></ul>`)}
        ${g('Gabung Newsletter', `<p style="font-size:14px;margin:0 0 4px">Kabar kegiatan terbaru langsung ke WhatsApp/email Anda.</p><form class="newsletter" data-newsletter><label class="sr-only" for="nl-email">Email atau nomor WhatsApp</label><input class="input" id="nl-email" type="text" placeholder="Email / nomor WhatsApp" required><button class="btn btn--sm" type="submit">Daftar</button></form>`)}
      </div>
      <div class="footer-bottom"><span>© ${new Date().getFullYear()} Komunitas Ducati Indonesia (DOCI). Hak cipta dilindungi.</span><nav aria-label="Tautan hukum"><a href="dokumen.html">Kebijakan Privasi</a><a href="dokumen.html">Kode Etik</a></nav></div>
    </div></footer>`;
    $$('.footer-toggle', host).forEach(b => b.addEventListener('click', () => { const gr = b.closest('.footer-group'); const o = gr.classList.toggle('open'); b.setAttribute('aria-expanded', o); }));
    const nl = $('[data-newsletter]', host);
    nl.addEventListener('submit', (e) => { e.preventDefault(); toast({ type: 'success', title: 'Terima kasih!', msg: 'Anda akan menerima kabar kegiatan DOCI terbaru.' }); nl.reset(); });
  }

  /* ---------- Reveal, count-up ---------- */
  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .12 });
    els.forEach(e => io.observe(e));
  }
  function countUp(el) {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = target.toLocaleString('id-ID') + suffix; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(target * e).toLocaleString('id-ID') + suffix; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------- Shared UI builders ---------- */
  function statusChip(kind) {
    const m = {
      berhasil: ['chip--success', 'check-circle', 'Pembayaran Berhasil'], menunggu: ['chip--warning', 'clock', 'Menunggu Pembayaran'],
      kedaluwarsa: ['chip--danger', 'x-circle', 'Kedaluwarsa'], gagal: ['chip--danger', 'x-circle', 'Pembayaran Gagal'], refunded: ['chip--info', 'refresh', 'Refunded'],
      aktif: ['chip--active', 'shield', 'Membership Aktif'], memberKedaluwarsa: ['chip--danger', 'x-circle', 'Kedaluwarsa'], review: ['chip--info', 'pencil', 'Under Review'],
      online: ['chip--success', 'pin', 'Online'], idle: ['chip--warning', 'clock', 'Idle'], offline: ['chip--offline', 'wifioff', 'Offline'], lowbat: ['chip--warning', 'battery', 'Baterai Lemah'], sos: ['chip--danger', 'sos', 'SOS'],
      terbit: ['chip--success', 'check-circle', 'Terbit'], berlangsung: ['chip--danger', 'activity', 'Berlangsung'], selesai: ['chip--offline', 'check', 'Selesai'], draft: ['chip--info', 'pencil', 'Draft'], dibatalkan: ['chip--danger', 'x-circle', 'Dibatalkan'],
      dilaporkan: ['chip--danger', 'flag', 'Dilaporkan'], disetujui: ['chip--success', 'check', 'Published']
    };
    const [c, i, t] = m[kind] || ['', 'alert', kind];
    return `<span class="chip ${c}">${icon(i)}${t}</span>`;
  }
  function eventCard(e) {
    const s = new Date(e.start); const left = e.quota - e.taken; const pct = Math.round(e.taken / e.quota * 100);
    const low = left <= 5 && left > 0, full = left <= 0;
    const c = D.CATEGORIES[e.cat];
    return `<a class="card media-card card--link" href="kegiatan-detail.html?id=${e.id}">
      <div class="media-card__img"><img src="${e.img}" alt="${esc(e.title)}" loading="lazy" width="640" height="360">
        <div class="date-chip" aria-hidden="true"><b>${s.getDate()}</b><span>${fmt.mon(s)}</span></div>
        <span class="chip cat-tag" style="background:${c.color};color:${c.text}">${c.label}</span></div>
      <div class="media-card__body">
        <h3>${esc(e.title)}</h3>
        <div class="media-card__meta"><span>${icon('pin', 'icon--16')}${esc(e.loc.split(',')[0])}</span><span>${icon('clock', 'icon--16')}${fmt.time(s)}</span></div>
        <div class="quota"><div class="row row--between"><span class="${low ? '' : 'muted'}" ${low ? 'style="font-weight:700;color:var(--color-warning-text)"' : ''}>${full ? 'Kuota penuh · waiting list' : low ? `${icon('alert', 'icon--14')} Sisa ${left} kuota` : `${e.taken}/${e.quota} peserta`}</span></div>
          <div class="progress ${low ? 'progress--warn' : ''}" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Kuota terisi ${pct}%"><span style="width:${pct}%"></span></div></div>
        <div class="media-card__foot"><span class="price">${fmt.rp(e.price)}</span><span class="link-arrow">Lihat detail ${icon('arrow', 'icon--16')}</span></div>
      </div></a>`;
  }
  function newsCard(n) {
    return `<a class="card media-card news-card card--link" href="berita-detail.html?id=${n.id}">
      <div class="media-card__img"><img src="${n.img}" alt="" loading="lazy" width="640" height="360"></div>
      <div class="media-card__body"><span class="chip chip--red" style="align-self:flex-start">${n.cat}</span><h3>${esc(n.title)}</h3><p>${esc(n.excerpt)}</p>
      <div class="media-card__meta" style="margin-top:auto"><span>${icon('calendar', 'icon--16')}${fmt.dateShort(n.date)}</span><span>${icon('user', 'icon--16')}${esc(n.author)}</span></div></div></a>`;
  }
  function pageHead(title, desc, crumbs) {
    return `<section class="page-head"><div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="index.html">Beranda</a></li>${(crumbs || []).map(c => `<li><a href="${c[1]}">${c[0]}</a></li>`).join('')}<li><span aria-current="page">${title}</span></li></ol></nav>
      <h1>${title}</h1>${desc ? `<p>${desc}</p>` : ''}</div></section>`;
  }
  function joinCta() {
    return `<section class="section section--red"><div class="container text-center reveal">
      <h2 style="font-size:var(--text-display);margin-bottom:12px;font-weight:800">Ride Bareng Kami.<br>Jadi Bagian dari Keluarga DOCI.</h2>
      <p style="max-width:56ch;margin:0 auto 24px;font-size:var(--text-body-lg);opacity:.95">Daftar dalam kurang dari 15 menit, bayar otomatis, dan membership Anda langsung aktif.</p>
      <a class="btn btn--light btn--lg" href="membership.html">Daftar Menjadi Member</a></div></section>`;
  }

  /* ---------- Online/offline banner (penting untuk touring) ---------- */
  function initOffline() {
    let b;
    const show = () => { if (b) return; b = document.createElement('div'); b.className = 'banner banner--warning'; b.setAttribute('role', 'status'); b.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:150;max-width:520px;margin:0 auto;box-shadow:var(--shadow-lg)'; b.innerHTML = `${icon('wifioff')}<div><b>Anda offline</b>Data terakhir diperbarui ${fmt.time(new Date())}. Mencoba tersambung kembali…</div>`; document.body.appendChild(b); };
    const hide = () => { if (b) { b.remove(); b = null; toast({ type: 'success', msg: 'Kembali online. Data disinkronkan.' }); } };
    window.addEventListener('offline', show); window.addEventListener('online', hide);
  }

  /* ---------- Membership card (digital) ---------- */
  function cardHTML({ name, id, chapter, until }) {
    return `<div class="mcard" role="img" aria-label="Kartu member ${esc(name)}, ${id}"><div class="mcard__top">${logo(true, '#')}<span class="mcard__tag">Member</span></div>
      <div class="mcard__mid"><div><div class="mcard__name">${esc(name)}</div><div class="mcard__id">${id}</div><div class="mcard__meta" style="margin-top:10px"><div><span>Chapter</span><b>${esc(chapter)}</b></div><div><span>Berlaku s.d.</span><b>${fmt.dateShort(until)}</b></div></div></div><div class="mcard__qr">${qrSvg(id, 64)}</div></div></div>`;
  }

  /* ---------- Boot ---------- */
  function boot() {
    renderHeader(); renderFooter(); initReveal(); initOffline();
    $$('[data-count]').forEach(el => { const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { countUp(el); io.disconnect(); } })); io.observe(el); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.DOCI = Object.assign(window.DOCI || {}, { D, icon, fmt, normPhone, esc, $, $$, Store, Audit, Auth, toast, openDialog, closeDialog, confirmDialog, logo, SOCIAL, qrSvg, statusChip, eventCard, newsCard, pageHead, joinCta, EMBLEM, cardHTML });
})();
