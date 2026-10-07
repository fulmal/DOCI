/* ==========================================================================
   DOCI Admin Panel (prototipe front-end)
   Role: admin & superadmin. Semua data contoh + perubahan disimpan di localStorage.
   Pembayaran: TIDAK ada antrean verifikasi manual (PRD §7.4) — status dari webhook.
   ========================================================================== */
(function () {
  const { D, icon, esc, fmt, Store, Auth, Audit, toast, confirmDialog, openDialog, closeDialog, logo, $, $$ } = window.DOCI;
  const user = Auth.require();
  if (!user) return;
  const app = $('#app');

  /* ---------- Akses ---------- */
  if (user.role === 'member') {
    Audit.log('akses admin ditolak', 'admin.html');
    app.innerHTML = `<div class="err-403"><div><div class="code">403</div><h1>Akses ditolak</h1><p class="muted" style="max-width:44ch;margin:0 auto 24px">Halaman ini hanya untuk admin DOCI. Percobaan akses Anda sudah dicatat.</p><a class="btn" href="akun.html">Kembali ke Area Member</a></div></div>`;
    return;
  }
  const isSuper = user.role === 'superadmin';

  /* ---------- Util ---------- */
  const chip = (k) => k === 'suspend' ? `<span class="chip chip--danger">${icon('lock')}Disuspend</span>` : k === 'kedaluwarsa' ? statusChip('memberKedaluwarsa') : statusChip(k);
  function statusChip(k) { return DOCI.statusChip(k); }
  const rp = (n) => fmt.rpRaw(n);
  const toLocalInput = (d) => { d = new Date(d); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
  function csv(rows, name) {
    const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const blob = new Blob(['\ufeff' + rows.map(r => r.map(q).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    Audit.log('ekspor CSV', name); toast({ type: 'success', title: 'Ekspor selesai', msg: `${rows.length - 1} baris disimpan sebagai ${name}.` });
  }
  const noDeny = (what) => toast({ type: 'warning', title: 'Izin tidak cukup', msg: `${what} hanya untuk Superadmin.` });

  /* ---------- Data ---------- */
  function members() {
    const ov = Store.get('m_ov', {});
    const base = D.MEMBERS.map(m => Object.assign({}, m, { status: ov[m.id] || m.status }));
    const us = Store.get('users', {});
    const extra = Object.entries(us).map(([phone, u]) => ({ id: u.memberId, name: u.name, chapter: u.chapter, chapterName: (D.CHAPTERS.find(c => c.id === u.chapter) || {}).name || '', city: u.city || '', bike: u.bike || '—', vehicles: u.vehicles || [], year: '', joined: new Date(), status: ov[u.memberId] || 'aktif', phone, isNew: true }));
    return extra.concat(base);
  }
  function txs() {
    const rf = Store.get('refunds', {});
    const live = Store.get('invoices', []).map(i => ({ inv: i.id, who: (i.profile && i.profile.fullName) || fmt.phone(i.phone), whoId: i.memberId || '—', item: i.title, type: i.type === 'membership' ? 'Membership' : 'Kegiatan', amount: i.amount, method: i.method || '—', status: i.status, date: new Date(i.created), manual: false }));
    return live.concat(D.TX).map(t => rf[t.inv] ? Object.assign({}, t, { status: 'refunded' }) : t).sort((a, b) => b.date - a.date);
  }
  const events = () => D.EVENTS_ALL.slice().sort((a, b) => new Date(a.start) - new Date(b.start));
  const modItems = () => {
    const ov = Store.get('mod', {});
    const up = Store.get('media', []).filter(m => m.status === 'review').map(m => ({ id: m.id, title: m.title, by: m.by, album: m.album, img: m.img, at: new Date(m.at), reason: 'Menunggu review (unggahan video)', status: 'review', up: true }));
    return up.concat(D.MODERATION).filter(m => !ov[m.id]);
  };
  const weeks = (n) => { const a = Array(n).fill(0); return a; };
  function weekly(list, pred, val, n = 8) { const a = weeks(n); list.forEach(t => { if (!pred(t)) return; const w = Math.floor((Date.now() - new Date(t.date)) / 6048e5); if (w >= 0 && w < n) a[n - 1 - w] += val(t); }); return a; }

  /* ---------- Nav ---------- */
  const NAV = [
    ['Utama', null], ['dashboard', 'Dashboard', 'dashboard', 'all'],
    ['Kelola', null], ['member', 'Member', 'users', 'all'], ['kegiatan', 'Kegiatan', 'calendar', 'all'], ['dokumentasi', 'Dokumentasi', 'image', 'all'], ['pembayaran', 'Pembayaran', 'wallet', 'all'], ['tracking', 'Live Tracking', 'pin', 'all'], ['konten', 'Konten & Berita', 'newspaper', 'all'],
    ['Sistem', null], ['role', 'Role & Izin', 'shield', 'super'], ['audit', 'Audit Log', 'history', 'super'], ['pengaturan', 'Pengaturan', 'settings', 'super']
  ];
  const TITLES = { dashboard: 'Dashboard', member: 'Manajemen Member', kegiatan: 'Manajemen Kegiatan', dokumentasi: 'Moderasi Dokumentasi', pembayaran: 'Pembayaran & Transaksi', tracking: 'Live Tracking Monitor', konten: 'Konten & Berita', role: 'Role & Izin', audit: 'Audit Log', pengaturan: 'Pengaturan Sistem' };
  const live = D.EVENTS_ALL.find(e => e.status === 'berlangsung' && e.tracking);
  const pendingMod = () => modItems().length;

  function shell() {
    const collapsed = Store.get('adm_collapsed', false);
    const items = NAV.map(n => n[3] ? ((n[3] === 'super' && !isSuper) ? '' : `<li><a href="#${n[0]}" data-r="${n[0]}">${icon(n[2])}<span class="t">${n[1]}</span>${n[0] === 'tracking' && live ? '<span class="badge badge--live" aria-label="Ada kegiatan berlangsung">LIVE</span><span class="live-dot"></span>' : ''}${n[0] === 'dokumentasi' ? `<span class="badge" data-mod-badge>${pendingMod()}</span>` : ''}</a></li>`) : `<li class="grp" aria-hidden="true">${n[0]}</li>`).join('');
    app.innerHTML = `<div class="adm ${collapsed ? 'is-collapsed' : ''}" id="adm">
      <aside class="adm-side" id="side" aria-label="Navigasi admin">
        <div class="adm-side__brand">${logo(true, 'index.html')}</div>
        <ul class="adm-nav">${items}</ul>
        <div class="adm-side__foot">
          <button class="adm-collapse" id="collapse" aria-label="Ciutkan sidebar">${icon('chev-left', 'icon--24')}<span class="t">Ciutkan</span></button>
          <a href="index.html">${icon('external', 'icon--24')}<span class="t">Lihat Situs</span></a>
          <button id="logout">${icon('logout', 'icon--24')}<span class="t">Keluar</span></button>
        </div>
      </aside>
      <div class="adm-scrim" id="scrim"></div>
      <div class="adm-main">
        <header class="adm-top">
          <button class="icon-btn adm-menu-btn" id="menu" aria-label="Buka menu" aria-controls="side">${icon('menu', 'icon--24')}</button>
          <h1 id="ttl"></h1>
          <div class="adm-search">${icon('search')}<label class="sr-only" for="gs">Cari member</label><input class="input" id="gs" type="search" placeholder="Cari member, ID, atau chapter"></div>
          <div class="adm-top__right">
            <div class="adm-bell"><button class="icon-btn" id="bell" aria-label="Notifikasi" aria-expanded="false" aria-haspopup="true">${icon('bell', 'icon--24')}<span class="cnt" id="bell-n"></span></button><div class="adm-pop" id="pop" hidden></div></div>
            <div class="adm-who"><div class="meta"><b>${esc(user.name)}</b><span>${isSuper ? 'Superadmin' : 'Admin'}</span></div><span class="avatar avatar--dark">${fmt.initials(user.name)}</span></div>
          </div>
        </header>
        <main id="main" class="adm-content"><div id="dyn"></div><div id="v-tracking" class="adm-view" hidden></div></main>
      </div></div>`;
    $$('[data-ic]').forEach(b => b.innerHTML = icon(b.dataset.ic, 'icon--24'));
    const adm = $('#adm');
    $('#collapse').onclick = () => { const c = adm.classList.toggle('is-collapsed'); Store.set('adm_collapsed', c); const b = $('#collapse'); b.setAttribute('aria-label', c ? 'Perluas sidebar' : 'Ciutkan sidebar'); b.firstElementChild.style.transform = c ? 'rotate(180deg)' : ''; setTimeout(() => T && T.st.map && T.st.map.invalidateSize(), 300); };
    if (collapsed) $('#collapse').firstElementChild.style.transform = 'rotate(180deg)';
    $('#menu').onclick = () => adm.classList.add('nav-open'); $('#scrim').onclick = () => adm.classList.remove('nav-open');
    $('#logout').onclick = Auth.logout;
    $('#gs').addEventListener('keydown', (e) => { if (e.key === 'Enter') { Store.set('adm_q', e.target.value.trim()); if (location.hash === '#member') route(); else location.hash = '#member'; } });
    // notifikasi
    const notes = () => {
      const l = []; const mod = pendingMod(); if (mod) l.push(['image', `${mod} dokumentasi menunggu moderasi`, '#dokumentasi']);
      const pend = txs().filter(t => t.status === 'menunggu').length; if (pend) l.push(['clock', `${pend} pembayaran menunggu (otomatis diproses webhook)`, '#pembayaran']);
      D.EVENTS_ALL.filter(e => e.status !== 'selesai' && e.status !== 'draft' && e.quota - e.taken <= 5 && e.quota - e.taken > 0).forEach(e => l.push(['alert', `Kuota hampir penuh: ${e.title} (sisa ${e.quota - e.taken})`, '#kegiatan']));
      if (live) l.push(['activity', `${live.title} sedang berlangsung`, '#tracking']);
      return l;
    };
    const nl = notes(); $('#bell-n').textContent = nl.length; $('#bell-n').hidden = !nl.length;
    $('#pop').innerHTML = `<h2>Notifikasi</h2>${nl.length ? nl.map(n => `<a href="${n[2]}">${icon(n[0], 'icon--16')}<span>${esc(n[1])}</span></a>`).join('') : `<div class="empty" style="padding:24px"><p style="margin:0">Tidak ada notifikasi baru.</p></div>`}`;
    $('#bell').onclick = (e) => { const h = $('#pop').hidden; $('#pop').hidden = !h; e.currentTarget.setAttribute('aria-expanded', h); e.stopPropagation(); };
    document.addEventListener('click', (e) => { if (!e.target.closest('.adm-bell')) { $('#pop').hidden = true; $('#bell').setAttribute('aria-expanded', 'false'); } });
    $('#pop').addEventListener('click', () => { $('#pop').hidden = true; });
  }

  /* ---------- Chart helpers ---------- */
  function spark(a, color = '#D5001C') {
    const w = 84, h = 30, max = Math.max(...a, 1), min = Math.min(...a, 0), x = (i) => (i / (a.length - 1)) * (w - 4) + 2, y = (v) => h - 3 - ((v - min) / (max - min || 1)) * (h - 8);
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><polyline fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${a.map((v, i) => x(i) + ',' + y(v)).join(' ')}"/></svg>`;
  }
  function weekLabels(n) { return Array.from({ length: n }, (_, i) => { const d = new Date(Date.now() - (n - 1 - i) * 6048e5); return `${d.getDate()} ${fmt.mon(d)}`; }); }
  function barChart(A, B, labels) {
    const W = 560, H = 230, pl = 34, pb = 28, pt = 10, max = Math.max(...A, ...B, 1), bw = (W - pl) / A.length;
    const ticks = [0, .5, 1].map(f => Math.round(max * f));
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik batang pendaftaran per minggu: member baru berwarna merah, pendaftar kegiatan abu-abu">
      ${ticks.map(t => { const y = H - pb - (t / max) * (H - pb - pt); return `<line x1="${pl}" x2="${W}" y1="${y}" y2="${y}" stroke="#ECEFF3"/><text x="${pl - 6}" y="${y + 4}" text-anchor="end">${t}</text>`; }).join('')}
      ${A.map((v, i) => { const x = pl + i * bw + bw * .14, w = bw * .34, hA = (v / max) * (H - pb - pt), hB = (B[i] / max) * (H - pb - pt);
        return `<rect x="${x}" y="${H - pb - hA}" width="${w}" height="${hA}" rx="3" fill="#D5001C"><title>${labels[i]}: ${v} member baru</title></rect><rect x="${x + w + 3}" y="${H - pb - hB}" width="${w}" height="${hB}" rx="3" fill="#C7CBD4"><title>${labels[i]}: ${B[i]} pendaftar kegiatan</title></rect><text x="${x + w}" y="${H - 8}" text-anchor="middle">${labels[i]}</text>`; }).join('')}</svg>`;
  }
  function lineChart(A, labels) {
    const W = 560, H = 230, pl = 52, pb = 28, pt = 10, max = Math.max(...A, 1), step = (W - pl - 10) / (A.length - 1), X = (i) => pl + i * step, Y = (v) => H - pb - (v / max) * (H - pb - pt);
    const pts = A.map((v, i) => `${X(i)},${Y(v)}`).join(' ');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik pendapatan per minggu">
      ${[0, .5, 1].map(f => { const t = max * f, y = Y(t); return `<line x1="${pl}" x2="${W}" y1="${y}" y2="${y}" stroke="#ECEFF3"/><text x="${pl - 6}" y="${y + 4}" text-anchor="end">${t >= 1e6 ? (t / 1e6).toFixed(1).replace('.', ',') + ' jt' : Math.round(t / 1000) + ' rb'}</text>`; }).join('')}
      <polygon points="${X(0)},${H - pb} ${pts} ${X(A.length - 1)},${H - pb}" fill="#D5001C" opacity=".1"/><polyline points="${pts}" fill="none" stroke="#D5001C" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      ${A.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="#fff" stroke="#D5001C" stroke-width="2.5"><title>${labels[i]}: ${rp(v)}</title></circle><text x="${X(i)}" y="${H - 8}" text-anchor="middle">${labels[i]}</text>`).join('')}</svg>`;
  }
  function miniCal() {
    const n = new Date(), first = new Date(n.getFullYear(), n.getMonth(), 1), days = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate(), off = (first.getDay() + 6) % 7;
    const evd = new Set(); D.EVENTS_ALL.forEach(e => { const s = new Date(e.start), en = new Date(e.end); for (let d = new Date(s); d <= en; d.setDate(d.getDate() + 1)) if (d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()) evd.add(d.getDate()); });
    return `<div class="mini-cal" role="img" aria-label="Kalender ${fmt.monthName(n.getMonth())} ${n.getFullYear()}, titik merah menandai hari ada kegiatan">${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => `<b>${d}</b>`).join('')}${Array(off).fill('<span class="dim"></span>').join('')}${Array.from({ length: days }, (_, i) => `<span class="${i + 1 === n.getDate() ? 'today' : ''} ${evd.has(i + 1) ? 'ev' : ''}">${i + 1}</span>`).join('')}</div>`;
  }

  /* ---------- Views ---------- */
  const V = {};
  V.dashboard = (el) => {
    const t = txs(), ms = members(), ok = t.filter(x => x.status === 'berhasil');
    const rev = weekly(ok, () => true, x => x.amount), mem = weekly(ok, x => x.type === 'Membership', () => 1), evr = weekly(ok, x => x.type === 'Kegiatan', () => 1);
    const now = new Date(), monthRev = ok.filter(x => Date.now() - new Date(x.date) <= 30 * 864e5).reduce((a, x) => a + x.amount, 0);
    const act = ms.filter(m => m.status === 'aktif').length, pend = t.filter(x => x.status === 'menunggu').length;
    const d = (a, b) => b === 0 ? null : Math.round((a - b) / b * 100); const dl = (v) => v === null ? '<span class="kpi__delta flat">Belum ada pembanding minggu lalu</span>' : `<span class="kpi__delta ${v > 0 ? 'up' : v < 0 ? 'down' : 'flat'}">${icon('trend', 'icon--14')}${v > 0 ? '+' : ''}${v}% vs minggu lalu</span>`;
    const lab = weekLabels(8);
    el.innerHTML = `<div class="stack-lg" style="display:grid;gap:20px">
      <div class="banner banner--demo small"><span>${icon('shield')}</span><div><b>Data contoh.</b> Angka dasar adalah sampel; transaksi yang Anda buat lewat alur daftar/bayar ikut tercatat di sini.</div></div>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi__label">${icon('users')}Member Aktif</div><div class="kpi__val">${act.toLocaleString('id-ID')}</div>${dl(d(mem[7], mem[6]))}${spark(mem)}</div>
        <div class="kpi"><div class="kpi__label">${icon('wallet')}Pendapatan 30 Hari</div><div class="kpi__val">${rp(monthRev)}</div>${dl(d(rev[7], rev[6]))}${spark(rev)}</div>
        <div class="kpi"><div class="kpi__label">${icon('user')}Pendaftar Baru (7 hari)</div><div class="kpi__val">${mem[7]}</div>${dl(d(mem[7], mem[6]))}${spark(mem, '#141416')}</div>
        <div class="kpi"><div class="kpi__label">${icon('clock')}Transaksi Pending</div><div class="kpi__val">${pend}</div><span class="kpi__delta flat">Diproses otomatis oleh webhook</span></div>
      </div>
      <div class="cols cols--2-1">
        <section class="panel"><div class="panel__head"><h2>Pendaftaran per Minggu</h2><div class="chart-legend"><span><i style="background:#D5001C"></i>Member baru</span><span><i style="background:#C7CBD4"></i>Pendaftar kegiatan</span></div></div><div class="panel__body">${barChart(mem, evr, lab)}</div></section>
        <section class="panel"><div class="panel__head"><h2>Kalender ${fmt.monthName(now.getMonth())}</h2></div><div class="panel__body">${miniCal()}</div></section>
      </div>
      <div class="cols cols--2-1">
        <section class="panel"><div class="panel__head"><h2>Pendapatan per Minggu</h2></div><div class="panel__body">${lineChart(rev, lab)}</div></section>
        <section class="panel"><div class="panel__head"><h2>Perlu Perhatian</h2></div><div class="panel__body" style="display:grid;gap:10px">
          <a class="list-item" href="#dokumentasi">${icon('image', 'icon--24')}<div class="grow"><b>${pendingMod()} dokumentasi</b><span class="sub">menunggu moderasi</span></div>${icon('chev-right', 'icon--16')}</a>
          <a class="list-item" href="#pembayaran">${icon('clock', 'icon--24')}<div class="grow"><b>${pend} pembayaran pending</b><span class="sub">menunggu konfirmasi gateway</span></div>${icon('chev-right', 'icon--16')}</a>
          <a class="list-item" href="#member">${icon('pencil', 'icon--24')}<div class="grow"><b>${ms.filter(m => m.status === 'review').length} member under review</b><span class="sub">cek kelengkapan data</span></div>${icon('chev-right', 'icon--16')}</a></div></section>
      </div>
      <section class="panel"><div class="panel__head"><h2>Transaksi Terbaru</h2><a class="btn btn--secondary btn--sm" href="#pembayaran">Lihat Semua</a></div>
        <div class="table-scroll" style="max-height:none"><table class="table stack-sm"><thead><tr><th>Invoice</th><th>Nama</th><th>Item</th><th class="num-col">Jumlah</th><th>Status</th></tr></thead><tbody>
        ${t.slice(0, 6).map(x => `<tr><td class="cell-main mono" style="font-size:12.5px">${esc(x.inv)}</td><td data-label="Nama">${esc(x.who)}</td><td data-label="Item">${esc(x.item)}</td><td class="num-col" data-label="Jumlah">${rp(x.amount)}</td><td data-label="Status">${chip(x.status)}</td></tr>`).join('')}</tbody></table></div></section></div>`;
  };

  V.member = (el) => {
    const st = { q: Store.get('adm_q', ''), ch: 'all', s: 'all', page: 1, sel: new Set() }; Store.set('adm_q', '');
    el.innerHTML = `<section class="panel"><div class="toolbar">
        <label class="sr-only" for="m-q">Cari member</label><input class="input" id="m-q" type="search" placeholder="Cari nama, ID, motor" value="${esc(st.q)}">
        <label class="sr-only" for="m-ch">Chapter</label><select class="select" id="m-ch"><option value="all">Semua chapter</option>${D.CHAPTERS.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
        <label class="sr-only" for="m-s">Status</label><select class="select" id="m-s"><option value="all">Semua status</option><option value="aktif">Aktif</option><option value="kedaluwarsa">Kedaluwarsa</option><option value="review">Under Review</option><option value="suspend">Disuspend</option></select>
        <button class="btn btn--secondary btn--sm" id="m-csv" style="margin-left:auto">${icon('download', 'icon--16')}Ekspor CSV</button></div>
      <div class="bulk-bar" id="bulk" hidden><b id="bulk-n"></b><button class="btn btn--sm btn--light" id="b-csv">Ekspor terpilih</button><button class="btn btn--sm btn--outline-light" id="b-sus">Suspend terpilih</button><button class="btn btn--sm btn--outline-light" id="b-act">Aktifkan terpilih</button></div>
      <div class="table-scroll"><table class="table stack-sm"><thead><tr><th style="width:44px"><input type="checkbox" id="m-all" aria-label="Pilih semua di halaman ini"></th><th>Member</th><th>Chapter</th><th>Motor</th><th>Status</th><th>Bergabung</th><th class="actions">Aksi</th></tr></thead><tbody id="m-body"></tbody></table></div>
      <div class="table-foot"><span id="m-info" aria-live="polite"></span><div class="pager" id="m-pager"></div></div></section>`;
    $('#m-ch', el).value = st.ch;
    let rows = [];
    const filt = () => { const q = $('#m-q', el).value.trim().toLowerCase(); return members().filter(m => (st.ch === 'all' || m.chapter === st.ch) && (st.s === 'all' || m.status === st.s) && (!q || (m.name + ' ' + m.id + ' ' + m.bike + ' ' + m.chapterName).toLowerCase().includes(q))); };
    function draw() {
      rows = filt(); const per = 20, pages = Math.max(1, Math.ceil(rows.length / per)); st.page = Math.min(st.page, pages); const pg = rows.slice((st.page - 1) * per, st.page * per);
      $('#m-body', el).innerHTML = pg.length ? pg.map(m => `<tr><td><input type="checkbox" data-id="${m.id}" aria-label="Pilih ${esc(m.name)}" ${st.sel.has(m.id) ? 'checked' : ''}></td>
        <td class="cell-main"><div class="cell-user"><span class="avatar">${fmt.initials(m.name)}</span><div><b>${esc(m.name)}${m.isNew ? ' <span class="chip chip--red" style="height:20px;font-size:10px">Baru</span>' : ''}</b><span class="mono">${esc(m.id)}</span></div></div></td>
        <td data-label="Chapter">${esc(m.chapterName || m.chapter)}</td><td data-label="Motor">${esc(m.bike)}${m.year ? ` <span class="sub">${m.year}</span>` : ''}</td><td data-label="Status">${chip(m.status)}</td><td data-label="Bergabung">${fmt.dateShort(m.joined)}</td>
        <td class="actions"><button class="btn btn--secondary btn--sm" data-view="${m.id}">Detail</button></td></tr>`).join('')
        : `<tr><td colspan="7"><div class="empty" style="padding:32px">${icon('users')}<h3>Tidak ada member yang cocok</h3><p>Ubah kata kunci atau filter.</p></div></td></tr>`;
      $('#m-info', el).textContent = rows.length ? `Menampilkan ${(st.page - 1) * per + 1}–${Math.min(st.page * per, rows.length)} dari ${rows.length} member` : '0 member';
      $('#m-pager', el).innerHTML = pages > 1 ? `<button ${st.page === 1 ? 'disabled' : ''} data-p="${st.page - 1}" aria-label="Halaman sebelumnya">${icon('chev-left', 'icon--16')}</button>` + Array.from({ length: pages }, (_, i) => `<button data-p="${i + 1}" ${i + 1 === st.page ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('') + `<button ${st.page === pages ? 'disabled' : ''} data-p="${st.page + 1}" aria-label="Halaman berikutnya">${icon('chev-right', 'icon--16')}</button>` : '';
      $('#bulk', el).hidden = !st.sel.size; $('#bulk-n', el).textContent = `${st.sel.size} dipilih`;
      $('#m-all', el).checked = pg.length > 0 && pg.every(m => st.sel.has(m.id));
    }
    const applyStatus = async (ids, s, label) => {
      const ok = await confirmDialog({ title: `${label} ${ids.length} member?`, body: s === 'suspend' ? 'Member yang disuspend tidak bisa mendaftar kegiatan atau mengunggah dokumentasi. Tindakan dicatat di audit log.' : 'Status member akan diubah menjadi Aktif.', confirmText: label, danger: s === 'suspend' });
      if (!ok) return; const ov = Store.get('m_ov', {}); ids.forEach(id => ov[id] = s); Store.set('m_ov', ov);
      Audit.log(`${label.toLowerCase()} member`, `${ids.length} member`, null, { status: s, ids: ids.slice(0, 5) }); st.sel.clear(); draw(); toast({ type: 'success', msg: `${ids.length} member diperbarui.` });
    };
    const exp = (list, name) => csv([['Member ID', 'Nama', 'Chapter', 'Motor', 'Status', 'Bergabung']].concat(list.map(m => [m.id, m.name, m.chapterName, m.bike, m.status, fmt.dateShort(m.joined)])), name);
    $('#m-q', el).oninput = () => { st.page = 1; draw(); }; $('#m-ch', el).onchange = (e) => { st.ch = e.target.value; st.page = 1; draw(); }; $('#m-s', el).onchange = (e) => { st.s = e.target.value; st.page = 1; draw(); };
    $('#m-csv', el).onclick = () => exp(rows, 'member-doci.csv'); $('#b-csv', el).onclick = () => exp(members().filter(m => st.sel.has(m.id)), 'member-terpilih.csv');
    $('#b-sus', el).onclick = () => applyStatus([...st.sel], 'suspend', 'Suspend'); $('#b-act', el).onclick = () => applyStatus([...st.sel], 'aktif', 'Aktifkan');
    $('#m-all', el).onchange = (e) => { const per = 20, pg = rows.slice((st.page - 1) * per, st.page * per); pg.forEach(m => e.target.checked ? st.sel.add(m.id) : st.sel.delete(m.id)); draw(); };
    el.addEventListener('change', (e) => { const c = e.target.closest('[data-id]'); if (c) { c.checked ? st.sel.add(c.dataset.id) : st.sel.delete(c.dataset.id); draw(); } });
    el.addEventListener('click', (e) => {
      const p = e.target.closest('[data-p]'); if (p) { st.page = +p.dataset.p; draw(); }
      const v = e.target.closest('[data-view]'); if (v) memberDrawer(members().find(m => m.id === v.dataset.view), draw);
    });
    draw();
  };
  function memberDrawer(m, after) {
    const d = $('#side-dlg'); Audit.log('lihat detail member', m.id);
    const tx = txs().filter(t => t.whoId === m.id).slice(0, 4);
    d.innerHTML = `<div class="side__head"><h2 id="side-title">Detail Member</h2><button class="icon-btn" data-close aria-label="Tutup">${icon('x', 'icon--24')}</button></div>
      <div class="side__body stack"><div class="cell-user" style="display:flex;gap:14px;align-items:center"><span class="avatar avatar--64">${fmt.initials(m.name)}</span><div><b style="font-family:var(--font-display);font-size:18px">${esc(m.name)}</b><div class="mono small muted">${esc(m.id)}</div><div style="margin-top:6px">${chip(m.status)}</div></div></div>
        <dl class="kv"><div><dt>Chapter</dt><dd>${esc(m.chapterName || m.chapter)}</dd></div><div><dt>Kota</dt><dd>${esc(m.city || '—')}</dd></div><div><dt>Motor</dt><dd>${esc(m.bike)}</dd></div><div><dt>Telepon</dt><dd>${fmt.phone(m.phone)}</dd></div><div><dt>Bergabung</dt><dd>${fmt.date(m.joined)}</dd></div></dl>
        <div class="banner banner--info small">${icon('lock')}<div>Data kontak hanya terlihat oleh admin berizin. Pembukaan detail ini dicatat di audit log.</div></div>
        ${(m.vehicles && m.vehicles.length) ? (() => { const th = Store.get('stnk', {}); const lab = { menunggu: ['chip--warning', 'Menunggu verifikasi'], terverifikasi: ['chip--success', 'Terverifikasi'], ditolak: ['chip--danger', 'Ditolak'] }; return `<h3 style="font-size:15px;margin:0">Kendaraan &amp; STNK (${m.vehicles.length})</h3>` + m.vehicles.map((v, i) => { const s = v.stnk, st = s ? (s.status || 'menunggu') : null, img = th[m.id + ':' + v.id]; return `<div class="veh-rev"><div class="row row--between" style="align-items:flex-start;gap:8px"><div><b>Ducati ${esc(v.model)}</b><span class="sub" style="display:block">${esc(v.year || '')} · ${esc(v.color || '')} · Plat: <span class="mono">${esc(v.plate || '—')}</span>${v.chassis ? ` · Rangka: <span class="mono">${esc(v.chassis)}</span>` : ''}${v.engine ? ` · Mesin: <span class="mono">${esc(v.engine)}</span>` : ''}</span></div>${s ? `<span class="chip ${lab[st][0]}">${lab[st][1]}</span>` : '<span class="chip chip--offline">STNK belum ada</span>'}</div>${s ? `<div class="veh-rev__body">${img ? `<a href="${img}" target="_blank" rel="noopener"><img src="${img}" alt="Foto STNK ${esc(v.plate || '')}" class="veh-rev__img"></a>` : '<span class="muted small">Pratinjau tidak tersedia.</span>'}<div class="small muted">${s.w ? s.w + '×' + s.h + ' px · ' : ''}${(s.size / 1048576).toFixed(2)} MB${(s.warns || []).map(w => `<div style="color:var(--color-warning-text)">${esc(w)}</div>`).join('')}<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn btn--secondary btn--sm" data-stnk="terverifikasi" data-vi="${i}" ${st === 'terverifikasi' ? 'disabled' : ''}>Verifikasi</button><button class="btn btn--ghost btn--sm" data-stnk="ditolak" data-vi="${i}" ${st === 'ditolak' ? 'disabled' : ''}>Tolak</button></div></div></div>` : ''}</div>`; }).join('') + '<p class="muted small" style="margin:0">Pemeriksaan otomatis hanya memeriksa kualitas foto. Kecocokan nomor plat, nama & masa berlaku STNK harus dicek admin secara manual.</p>'; })() : ''}
        <h3 style="font-size:15px;margin:0">Transaksi Terakhir</h3>${tx.length ? tx.map(t => `<div class="list-item"><div class="grow"><b>${esc(t.item)}</b><span class="sub">${rp(t.amount)} · ${fmt.dateShort(t.date)}</span></div>${chip(t.status)}</div>`).join('') : '<p class="muted small" style="margin:0">Belum ada transaksi tercatat.</p>'}</div>
      <div class="side__foot">${m.status === 'suspend' ? '<button class="btn" data-act="aktif">Aktifkan Kembali</button>' : m.status === 'review' ? '<button class="btn" data-act="aktif">Setujui &amp; Aktifkan</button><button class="btn btn--danger" data-act="suspend">Suspend</button>' : '<button class="btn btn--danger" data-act="suspend">Suspend</button>'}<button class="btn btn--ghost" data-close>Tutup</button></div>`;
    d.onclick = async (e) => {
      const sb = e.target.closest('[data-stnk]');
      if (sb) {
        const users = Store.get('users', {}), vv = users[m.phone] && users[m.phone].vehicles && users[m.phone].vehicles[+sb.dataset.vi]; if (!vv || !vv.stnk) return;
        const before = vv.stnk.status || 'menunggu'; vv.stnk.status = sb.dataset.stnk; Store.set('users', users);
        Audit.log(sb.dataset.stnk === 'terverifikasi' ? 'verifikasi STNK' : 'tolak STNK', m.id + ' · ' + (vv.plate || ''), { status: before }, { status: vv.stnk.status });
        toast({ type: sb.dataset.stnk === 'terverifikasi' ? 'success' : 'warning', msg: `STNK ${vv.plate || ''} ${sb.dataset.stnk === 'terverifikasi' ? 'diverifikasi' : 'ditolak'}.` });
        memberDrawer(members().find(x => x.id === m.id) || m, after); return;
      }
      const b = e.target.closest('[data-act]'); if (!b) return; const s = b.dataset.act;
      const ok = await confirmDialog({ title: s === 'suspend' ? 'Suspend member ini?' : 'Aktifkan member ini?', body: s === 'suspend' ? 'Akses member ke fitur kegiatan dan unggahan akan dinonaktifkan.' : 'Member akan kembali aktif.', confirmText: s === 'suspend' ? 'Ya, suspend' : 'Ya, aktifkan', danger: s === 'suspend' });
      if (!ok) return; const ov = Store.get('m_ov', {}); const before = ov[m.id] || m.status; ov[m.id] = s; Store.set('m_ov', ov); Audit.log(s === 'suspend' ? 'suspend member' : 'aktifkan member', m.id, { status: before }, { status: s });
      closeDialog(d); toast({ type: 'success', msg: `Status ${m.name} diubah.` }); after();
    };
    d.showModal();
  }

  V.kegiatan = (el) => {
    const list = events();
    el.innerHTML = `<section class="panel"><div class="panel__head"><h2>${list.length} Kegiatan</h2><button class="btn btn--sm" id="ev-new">${icon('plus', 'icon--16')}Buat Kegiatan</button></div>
      <div class="table-scroll"><table class="table stack-sm"><thead><tr><th>Kegiatan</th><th>Jadwal</th><th>Chapter</th><th class="num-col">Biaya</th><th>Kuota</th><th>Status</th><th class="actions">Aksi</th></tr></thead><tbody>
      ${list.map(e => { const c = D.CATEGORIES[e.cat]; const pct = Math.round(e.taken / e.quota * 100); return `<tr><td class="cell-main"><b>${esc(e.title)}</b><span class="sub"><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${c.color};margin-right:6px"></i>${c.label}</span></td>
        <td data-label="Jadwal">${fmt.dateShort(e.start)}<span class="sub">${fmt.time(e.start)}</span></td><td data-label="Chapter">${esc((D.CHAPTERS.find(x => x.id === e.chapter) || {}).name || '-')}</td><td class="num-col" data-label="Biaya">${fmt.rp(e.price)}</td>
        <td data-label="Kuota"><span class="num">${e.taken}/${e.quota}</span><div class="progress ${pct >= 90 ? 'progress--warn' : ''}" style="width:90px;margin-top:4px" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Kuota terisi ${pct}%"><span style="width:${pct}%"></span></div></td>
        <td data-label="Status">${statusChip(e.status)}</td><td class="actions"><button class="btn btn--secondary btn--sm" data-edit="${e.id}">${icon('pencil', 'icon--16')}Ubah</button> <a class="btn btn--ghost btn--sm" href="kegiatan-detail.html?id=${e.id}" aria-label="Lihat ${esc(e.title)} di situs">${icon('external', 'icon--16')}</a></td></tr>`; }).join('')}</tbody></table></div></section>`;
    $('#ev-new', el).onclick = () => eventDialog(null); el.onclick = (e) => { const b = e.target.closest('[data-edit]'); if (b) eventDialog(D.EVENTS_ALL.find(x => x.id === b.dataset.edit)); };
  };
  function eventDialog(ev) {
    const f = $('#ev-form'), err = $('#ev-err'); err.hidden = true;
    $('#ev-title').textContent = ev ? 'Ubah Kegiatan' : 'Buat Kegiatan';
    $('#ev-c').innerHTML = Object.entries(D.CATEGORIES).map(([k, c]) => `<option value="${k}">${c.label}</option>`).join('');
    $('#ev-ch').innerHTML = D.CHAPTERS.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const now = new Date(); now.setDate(now.getDate() + 14); now.setHours(7, 0, 0, 0); const end = new Date(now); end.setHours(15);
    const v = ev || { title: '', cat: 'touring', chapter: 'jakarta', status: 'draft', start: now, end, loc: '', price: 0, quota: 50, desc: '' };
    $('#ev-t').value = v.title; $('#ev-c').value = v.cat; $('#ev-ch').value = v.chapter;     $('#ev-s').value = v.status;
    $('#ev-st').value = toLocalInput(v.start); $('#ev-en').value = toLocalInput(v.end); $('#ev-l').value = v.loc; $('#ev-p').value = v.price; $('#ev-q').value = v.quota; $('#ev-d').value = v.desc || '';
    f.onsubmit = (e) => {
      e.preventDefault(); const s = new Date($('#ev-st').value), en = new Date($('#ev-en').value), q = +$('#ev-q').value;
      let m = ''; if (!$('#ev-t').value.trim()) m = 'Judul kegiatan wajib diisi.'; else if (isNaN(s) || isNaN(en)) m = 'Isi tanggal mulai dan selesai.'; else if (en <= s) m = 'Waktu selesai harus setelah waktu mulai.'; else if (!$('#ev-l').value.trim()) m = 'Lokasi wajib diisi.'; else if (!(q >= 1)) m = 'Kuota minimal 1 peserta.'; else if (ev && q < ev.taken) m = `Kuota tidak boleh di bawah jumlah peserta saat ini (${ev.taken}).`;
      if (m) { err.textContent = m; err.hidden = false; return; }
      const img = { touring: 'touring', riding: 'hero', trackday: 'trackday', sosial: 'social', meeting: 'meetup' }[$('#ev-c').value];
      const data = { title: $('#ev-t').value.trim(), cat: $('#ev-c').value, chapter: $('#ev-ch').value, status: $('#ev-s').value, start: s.toISOString(), end: en.toISOString(), loc: $('#ev-l').value.trim(), city: $('#ev-l').value.split(',').pop().trim(), price: +$('#ev-p').value || 0, quota: q, desc: $('#ev-d').value.trim() };
      if (ev) {
        const ed = Store.get('ev_edits', {}), cu = Store.get('ev_custom', []); const ci = cu.findIndex(c => c.id === ev.id);
        if (ci >= 0) cu[ci] = Object.assign(cu[ci], data); else ed[ev.id] = Object.assign(ed[ev.id] || {}, Object.assign({}, ev, data, { start: data.start, end: data.end }));
        Store.set('ev_edits', ed); Store.set('ev_custom', cu); Audit.log('ubah kegiatan', ev.title, { status: ev.status, quota: ev.quota, price: ev.price }, { status: data.status, quota: data.quota, price: data.price });
      } else {
        const cu = Store.get('ev_custom', []); cu.push(Object.assign({ id: 'k' + Date.now(), taken: 0, img: `assets/img/${img}.jpg`, pic: 'Panitia ' + (D.CHAPTERS.find(c => c.id === data.chapter) || {}).name, rundown: [], syarat: ['Member DOCI aktif', 'SIM C & STNK berlaku'], lat: -6.2, lng: 106.8 }, data)); Store.set('ev_custom', cu); Audit.log('buat kegiatan', data.title, null, { status: data.status });
      }
      closeDialog('#ev-dlg'); toast({ type: 'success', title: 'Kegiatan disimpan', msg: data.status === 'terbit' ? 'Kegiatan tayang di kalender publik.' : 'Disimpan sebagai draft — belum tampil di situs.' });
      setTimeout(() => location.reload(), 600);
    };
    openDialog('#ev-dlg');
  }

  V.dokumentasi = (el) => {
    const draw = () => {
      const l = modItems(); $$('[data-mod-badge]').forEach(b => b.textContent = l.length);
      el.innerHTML = `<div class="banner banner--info small"><span>${icon('shield')}</span><div><b>Moderasi pasca-tayang.</b> Foto langsung tayang; laporan pengguna dan video masuk antrean di sini.</div></div>
        ${l.length ? `<div class="mod-grid">${l.map(m => `<article class="mod-card"><img src="${m.img}" alt="${esc(m.title)}" loading="lazy"><div class="b"><div class="row row--between">${chip(m.status)}<span class="small muted">${fmt.ago(m.at)}</span></div><b>${esc(m.title)}</b><span class="small muted">${esc(m.by)} · ${esc(m.album)}</span><span class="small" style="color:var(--color-ink-700)">${esc(m.reason)}</span></div>
          <div class="acts"><button class="btn btn--sm" data-ok="${m.id}">${icon('check', 'icon--16')}Setujui</button><button class="btn btn--sm btn--danger" data-hide="${m.id}">${icon('eye-off', 'icon--16')}Sembunyikan</button></div></article>`).join('')}</div>`
        : `<div class="panel"><div class="empty">${icon('check-circle')}<h3>Antrean kosong</h3><p>Semua dokumentasi sudah ditinjau. Kerja bagus!</p></div></div>`}`;
    };
    draw();
    el.onclick = async (e) => {
      const ok = e.target.closest('[data-ok]'), hd = e.target.closest('[data-hide]'); const id = (ok || hd) && (ok || hd).dataset[ok ? 'ok' : 'hide']; if (!id) return;
      const item = modItems().find(m => m.id === id);
      if (hd) { const c = await confirmDialog({ title: 'Sembunyikan konten ini?', body: 'Konten tidak akan tampil di galeri. Pengunggah akan diberi tahu alasannya.', confirmText: 'Sembunyikan', danger: true }); if (!c) return; }
      const mod = Store.get('mod', {}); mod[id] = ok ? 'ok' : 'hide'; Store.set('mod', mod);
      if (item && item.up) { const ms = Store.get('media', []); const x = ms.find(m => m.id === id); if (x) { x.status = ok ? 'disetujui' : 'disembunyikan'; Store.set('media', ms); } }
      Audit.log(ok ? 'setujui konten' : 'sembunyikan konten', item ? item.title : id, { status: item && item.status }, { status: ok ? 'disetujui' : 'disembunyikan' }); toast({ type: 'success', msg: ok ? 'Konten disetujui.' : 'Konten disembunyikan.' }); draw();
    };
  };

  V.pembayaran = (el) => {
    const st = { s: 'all', q: '', page: 1 };
    const all = txs(), okAll = all.filter(t => t.status === 'berhasil'), sum = (a) => a.reduce((x, t) => x + t.amount, 0);
    el.innerHTML = `<div style="display:grid;gap:20px">
      <div class="banner banner--info small"><span>${icon('shield')}</span><div><b>Pembayaran 100% otomatis.</b> Status diperbarui oleh webhook payment gateway — tidak ada antrean verifikasi bukti transfer. Penyesuaian manual hanya untuk kasus pengecualian dan diberi label khusus.</div></div>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi__label">${icon('check-circle')}Berhasil</div><div class="kpi__val">${rp(sum(okAll))}</div><span class="kpi__delta flat">${okAll.length} transaksi</span></div>
        <div class="kpi"><div class="kpi__label">${icon('clock')}Menunggu</div><div class="kpi__val">${all.filter(t => t.status === 'menunggu').length}</div><span class="kpi__delta flat">${rp(sum(all.filter(t => t.status === 'menunggu')))}</span></div>
        <div class="kpi"><div class="kpi__label">${icon('x-circle')}Kedaluwarsa / Gagal</div><div class="kpi__val">${all.filter(t => t.status === 'kedaluwarsa' || t.status === 'gagal').length}</div><span class="kpi__delta flat">Dapat dibayar ulang oleh member</span></div>
        <div class="kpi"><div class="kpi__label">${icon('refresh')}Refund</div><div class="kpi__val">${all.filter(t => t.status === 'refunded').length}</div><span class="kpi__delta flat">${rp(sum(all.filter(t => t.status === 'refunded')))}</span></div>
      </div>
      <div class="cols cols--2-1"><section class="panel"><div class="toolbar"><label class="sr-only" for="p-q">Cari transaksi</label><input class="input" id="p-q" type="search" placeholder="Cari invoice, nama, atau item">
        <label class="sr-only" for="p-s">Status</label><select class="select" id="p-s"><option value="all">Semua status</option><option value="berhasil">Berhasil</option><option value="menunggu">Menunggu</option><option value="kedaluwarsa">Kedaluwarsa</option><option value="gagal">Gagal</option><option value="refunded">Refunded</option></select>
        <button class="btn btn--secondary btn--sm" id="p-csv" style="margin-left:auto">${icon('download', 'icon--16')}Ekspor CSV</button></div>
        <div class="table-scroll"><table class="table stack-sm"><thead><tr><th>Invoice</th><th>Nama</th><th>Item</th><th>Metode</th><th class="num-col">Jumlah</th><th>Status</th><th class="actions">Aksi</th></tr></thead><tbody id="p-body"></tbody></table></div>
        <div class="table-foot"><span id="p-info" aria-live="polite"></span><div class="pager" id="p-pager"></div></div></section>
        <section class="panel"><div class="panel__head"><h2>Rekonsiliasi Gateway</h2></div><div class="panel__body" style="display:grid;gap:12px">
          <dl class="kv"><div><dt>Tercatat di sistem</dt><dd>${okAll.length}</dd></div><div><dt>Tercatat di gateway (contoh)</dt><dd>${okAll.length}</dd></div><div><dt>Selisih</dt><dd style="color:#0b7e46">0</dd></div></dl>
          <h3 style="font-size:14px;margin:8px 0 0">Log Webhook Terakhir (contoh)</h3>
          ${['payment.success · INV…' + String(10234).slice(-5) + ' · 200 OK', 'payment.success · duplikat diabaikan (idempoten)', 'payment.expired · INV…10198 · 200 OK', 'payment.success · INV…10211 · 200 OK'].map((l, i) => `<div class="mono small" style="padding:8px 10px;background:var(--color-cloud-100);border-radius:8px">${icon(i === 1 ? 'alert' : 'check', 'icon--14')} ${l}</div>`).join('')}</div></section></div></div>`;
    const filt = () => { const q = st.q.toLowerCase(); return all.filter(t => (st.s === 'all' || t.status === st.s) && (!q || (t.inv + ' ' + t.who + ' ' + t.item).toLowerCase().includes(q))); };
    let rows = [];
    function draw() {
      rows = filt(); const per = 15, pages = Math.max(1, Math.ceil(rows.length / per)); st.page = Math.min(st.page, pages); const pg = rows.slice((st.page - 1) * per, st.page * per);
      $('#p-body', el).innerHTML = pg.length ? pg.map(t => `<tr><td class="cell-main mono" style="font-size:12.5px">${esc(t.inv)}<span class="sub" style="font-family:var(--font-body)">${fmt.dateTime(t.date)}</span></td><td data-label="Nama">${esc(t.who)}</td><td data-label="Item">${esc(t.item)}<span class="sub">${t.type}</span>${t.manual ? '<span class="tag-manual">Manual — Terverifikasi Admin</span>' : ''}</td><td data-label="Metode">${esc(t.method)}</td><td class="num-col" data-label="Jumlah">${rp(t.amount)}</td><td data-label="Status">${chip(t.status)}</td>
        <td class="actions">${t.status === 'berhasil' ? `<button class="btn btn--secondary btn--sm" data-rf="${esc(t.inv)}" ${isSuper ? '' : 'aria-disabled="true" style="opacity:.55"'}>Refund</button>` : '<span class="row-hint">—</span>'}</td></tr>`).join('')
        : `<tr><td colspan="7"><div class="empty" style="padding:32px">${icon('receipt')}<h3>Tidak ada transaksi</h3><p>Coba ubah filter.</p></div></td></tr>`;
      $('#p-info', el).textContent = `${rows.length} transaksi`;
      $('#p-pager', el).innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) => `<button data-p="${i + 1}" ${i + 1 === st.page ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('') : '';
    }
    $('#p-q', el).oninput = (e) => { st.q = e.target.value.trim(); st.page = 1; draw(); }; $('#p-s', el).onchange = (e) => { st.s = e.target.value; st.page = 1; draw(); };
    $('#p-csv', el).onclick = () => csv([['Invoice', 'Nama', 'Item', 'Jenis', 'Metode', 'Jumlah', 'Status', 'Tanggal', 'Manual']].concat(rows.map(t => [t.inv, t.who, t.item, t.type, t.method, t.amount, t.status, fmt.dateTime(t.date), t.manual ? 'ya' : 'tidak'])), 'transaksi-doci.csv');
    el.addEventListener('click', (e) => {
      const p = e.target.closest('[data-p]'); if (p) { st.page = +p.dataset.p; draw(); }
      const r = e.target.closest('[data-rf]'); if (r) { if (!isSuper) return noDeny('Proses refund'); refundDialog(all.find(t => t.inv === r.dataset.rf)); }
    });
    draw();
  };
  function refundDialog(t) {
    $('#refund-body').innerHTML = `<p style="margin:0">Refund untuk <b>${esc(t.who)}</b> — <span class="mono">${esc(t.inv)}</span></p><dl class="kv"><div><dt>Item</dt><dd>${esc(t.item)}</dd></div><div><dt>Jumlah dikembalikan</dt><dd>${rp(t.amount)}</dd></div><div><dt>Metode asal</dt><dd>${esc(t.method)}</dd></div></dl>
      <div class="field"><label class="field-label" for="rf-r">Alasan refund <span class="req">*</span></label><select class="select" id="rf-r"><option value="">Pilih alasan…</option><option>Kegiatan dibatalkan panitia</option><option>Pembayaran ganda</option><option>Permintaan member (kebijakan pembatalan)</option><option>Lainnya</option></select></div>
      <label class="check"><input type="checkbox" id="rf-c"><span>Saya memahami refund tidak dapat dibatalkan dan akan dicatat di audit log.</span></label><p class="error-text" id="rf-e" role="alert" hidden></p>`;
    $('#refund-form').onsubmit = (e) => {
      e.preventDefault(); const er = $('#rf-e');
      if (!$('#rf-r').value) { er.textContent = 'Pilih alasan refund.'; er.hidden = false; return; } if (!$('#rf-c').checked) { er.textContent = 'Centang konfirmasi untuk melanjutkan.'; er.hidden = false; return; }
      const rf = Store.get('refunds', {}); rf[t.inv] = { at: new Date().toISOString(), reason: $('#rf-r').value }; Store.set('refunds', rf);
      Audit.log('proses refund', t.inv, { status: 'berhasil', amount: t.amount }, { status: 'refunded', reason: $('#rf-r').value }); closeDialog('#refund-dlg'); toast({ type: 'success', title: 'Refund diproses', msg: `${rp(t.amount)} akan dikembalikan ke metode pembayaran asal.` }); route();
    };
    openDialog('#refund-dlg');
  }

  /* ---- Live tracking (persisten, tidak dirender ulang) ---- */
  let T = null;
  function trackingEnter() {
    const host = $('#v-tracking');
    if (!T) {
      host.innerHTML = `<div style="display:grid;gap:16px">
        ${live ? `<div class="banner banner--red small"><span>${icon('activity')}</span><div class="grow"><b>${esc(live.title)}</b> sedang berlangsung — pemantauan penuh aktif untuk admin.</div></div>` : ''}
        <div class="adm-trk"><div class="trk__map"><div id="amap" role="application" aria-label="Peta monitor peserta"></div>
          <div class="map-ctl"><button id="a-fit" aria-label="Lihat seluruh rute">${icon('flag', 'icon--24')}</button><button id="a-layer" aria-pressed="false" aria-label="Ganti tampilan satelit">${icon('map', 'icon--24')}</button></div>
          <div class="live-pill" style="bottom:16px"><span class="dot dot--pulse"></span><span id="prog-pill">Memuat…</span></div></div>
          <aside class="trk__panel"><div class="trk__head"><h2 style="font-size:15px;margin:0 0 4px">Peserta</h2><div class="trk__stats" id="astats"></div><div id="asos" style="margin-top:10px"></div></div>
            <div class="trk__list" id="alist"></div>
            <div class="trk__foot"><div class="playback"><label class="small" for="pb" style="font-weight:600">Playback</label><input type="range" id="pb" min="0" max="100" value="100" aria-valuetext="Live"><span class="small num" id="pb-l" style="min-width:56px;text-align:right">Live</span></div>
              <button class="btn btn--secondary btn--sm" id="a-sos">${icon('sos', 'icon--16')}Simulasikan SOS (demo)</button></div></aside></div></div>`;
      host.hidden = false;
      T = DOCI.Tracking.create({ mapEl: $('#amap'), listEl: $('#alist'), statsEl: $('#astats'), admin: true,
        onTick: (s) => { const r = s.riders.find(x => x.status === 'sos'); const el = $('#asos'); if (!el) return; el.innerHTML = r ? `<div class="banner banner--danger small" role="alert">${icon('sos')}<div><b>SOS dari ${esc(r.name)}</b><button class="btn btn--sm btn--danger" data-sos="${r.id}" style="margin-top:6px">${icon('phone', 'icon--16')}Hubungi</button></div></div>` : ''; } });
      $('#a-fit').onclick = () => T.fitAll();
      $('#a-layer').onclick = (e) => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); T.setLayer(on ? 'sat' : 'road'); };
      $('#pb').oninput = (e) => { const v = +e.target.value; if (v >= 100) { T.clearPlayback(); $('#pb-l').textContent = 'Live'; e.target.setAttribute('aria-valuetext', 'Live'); } else { const r = T.playback(v / 100); if (r) { $('#pb-l').textContent = r.km + ' km'; e.target.setAttribute('aria-valuetext', r.km + ' kilometer'); } } };
      $('#a-sos').onclick = () => { const r = T.st.riders[2]; r.status = r.status === 'sos' ? 'online' : 'sos'; Audit.log(r.status === 'sos' ? 'simulasi SOS' : 'SOS selesai', r.name); T.tick(); toast({ type: r.status === 'sos' ? 'warning' : 'success', title: r.status === 'sos' ? 'SOS diterima (simulasi)' : 'SOS diselesaikan', msg: r.name }); };
      host.addEventListener('click', (e) => { const b = e.target.closest('[data-sos]'); if (b) toast({ type: 'info', msg: 'Menghubungi peserta… (simulasi)' }); });
      document.addEventListener('click', (e) => { const b = e.target.closest('[data-contact]'); if (b) toast({ type: 'info', msg: 'Menghubungi peserta… (simulasi)' }); });
    }
    host.hidden = false; T.start(); setTimeout(() => T.st.map && T.st.map.invalidateSize(), 120);
  }
  function trackingLeave() { if (T) { T.stop(); $('#v-tracking').hidden = true; } }

  V.konten = (el) => {
    const state = { tab: 'berita' };
    const draw = () => {
      const news = D.NEWS_ALL.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      el.innerHTML = `<div class="tabs" role="tablist" aria-label="Konten"><button class="tab" role="tab" aria-selected="${state.tab === 'berita'}" data-t="berita">Berita &amp; Artikel</button><button class="tab" role="tab" aria-selected="${state.tab === 'dokumen'}" data-t="dokumen">Dokumen</button></div>
      ${state.tab === 'berita' ? `<section class="panel" style="margin-top:16px"><div class="panel__head"><h2>${news.length} Artikel</h2><button class="btn btn--sm" id="n-new">${icon('plus', 'icon--16')}Tulis Artikel</button></div>
        <div class="table-scroll"><table class="table stack-sm"><thead><tr><th>Judul</th><th>Kategori</th><th>Tanggal</th><th>Status</th><th class="actions">Aksi</th></tr></thead><tbody>
        ${news.map(n => `<tr><td class="cell-main"><b>${esc(n.title)}</b><span class="sub">${esc(n.author)}</span></td><td data-label="Kategori">${esc(n.cat)}</td><td data-label="Tanggal">${fmt.dateShort(n.date)}</td><td data-label="Status">${statusChip(n.status === 'draft' ? 'draft' : 'terbit')}</td>
        <td class="actions">${n.id.startsWith('c') ? `<button class="btn btn--secondary btn--sm" data-ne="${n.id}">${icon('pencil', 'icon--16')}Ubah</button> ` : ''}<button class="btn btn--ghost btn--sm" data-tg="${n.id}">${n.status === 'draft' ? 'Terbitkan' : 'Jadikan Draft'}</button></td></tr>`).join('')}</tbody></table></div></section>`
      : `<section class="panel" style="margin-top:16px"><div class="panel__head"><h2>${D.DOCS.length} Dokumen</h2><button class="btn btn--sm" id="d-new">${icon('upload', 'icon--16')}Unggah Dokumen</button></div><div class="panel__body">${D.DOCS.map(d => `<div class="doc-row"><span class="feature__icon">${icon('file', 'icon--24')}</span><div class="grow"><b>${esc(d.title)}</b><span class="small muted">${d.cat} · ${d.size} · ${d.ver}</span></div></div>`).join('')}</div></section>`}`;
    };
    draw();
    el.onclick = (e) => {
      const t = e.target.closest('[data-t]'); if (t) { state.tab = t.dataset.t; draw(); return; }
      if (e.target.closest('#d-new')) return toast({ type: 'info', title: 'Prototipe', msg: 'Unggah dokumen akan terhubung ke penyimpanan berkas di versi produksi.' });
      if (e.target.closest('#n-new')) return newsDialog(null);
      const ne = e.target.closest('[data-ne]'); if (ne) return newsDialog(D.NEWS_ALL.find(n => n.id === ne.dataset.ne));
      const tg = e.target.closest('[data-tg]'); if (tg) {
        const n = D.NEWS_ALL.find(x => x.id === tg.dataset.tg), to = n.status === 'draft' ? 'terbit' : 'draft';
        if (n.id.startsWith('c')) { const c = Store.get('news_custom', []); const i = c.find(x => x.id === n.id); if (i) i.status = to; Store.set('news_custom', c); } else { const o = Store.get('news_ov', {}); o[n.id] = to; Store.set('news_ov', o); }
        n.status = to; Audit.log(to === 'terbit' ? 'terbitkan artikel' : 'artikel jadi draft', n.title, { status: to === 'terbit' ? 'draft' : 'terbit' }, { status: to }); toast({ type: 'success', msg: to === 'terbit' ? 'Artikel tayang di situs.' : 'Artikel disembunyikan dari situs.' }); draw();
      }
    };
  };
  function newsDialog(n) {
    const err = $('#n-err'); err.hidden = true; $('#news-title').textContent = n ? 'Ubah Artikel' : 'Tulis Artikel';
    $('#n-t').value = n ? n.title : ''; $('#n-c').value = n ? n.cat : 'Berita Klub'; $('#n-s').value = n ? n.status : 'draft'; $('#n-b').value = n ? n.body.join('\n\n') : '';
    $('#news-form').onsubmit = (e) => {
      e.preventDefault(); const body = $('#n-b').value.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
      if (!$('#n-t').value.trim()) { err.textContent = 'Judul wajib diisi.'; err.hidden = false; return; } if (!body.length) { err.textContent = 'Isi artikel tidak boleh kosong.'; err.hidden = false; return; }
      const c = Store.get('news_custom', []); const data = { title: $('#n-t').value.trim(), cat: $('#n-c').value, status: $('#n-s').value, body, excerpt: body[0].slice(0, 140) + (body[0].length > 140 ? '…' : '') };
      if (n) Object.assign(c.find(x => x.id === n.id), data); else c.push(Object.assign({ id: 'c' + Date.now(), date: new Date().toISOString(), author: user.name, img: 'assets/img/group.jpg' }, data));
      Store.set('news_custom', c); Audit.log(n ? 'ubah artikel' : 'buat artikel', data.title, n && { status: n.status }, { status: data.status }); closeDialog('#news-dlg'); toast({ type: 'success', msg: 'Artikel disimpan.' }); setTimeout(() => location.reload(), 500);
    };
    openDialog('#news-dlg');
  }

  V.role = (el) => {
    const roles = ['Publik', 'Member', 'Admin', 'Superadmin']; const ov = Store.get('perm', {});
    const val = (i, j) => (ov[i + '-' + j] ?? D.PERMISSIONS[i][1][j]) === 1;
    el.innerHTML = `<div class="banner banner--info small"><span>${icon('shield')}</span><div><b>Hak akses minimum.</b> Kolom Publik dan Superadmin terkunci. Setiap perubahan butuh konfirmasi dan dicatat di audit log.</div></div>
      <section class="panel"><div class="table-scroll" style="max-height:none"><table class="table perm-table"><thead><tr><th>Izin</th>${roles.map(r => `<th>${r}</th>`).join('')}</tr></thead><tbody>
      ${D.PERMISSIONS.map((p, i) => `<tr><td>${esc(p[0])}</td>${roles.map((r, j) => (j === 0 || j === 3) ? `<td>${val(i, j) ? `<span title="Terkunci" aria-label="${r}: diizinkan (terkunci)">${icon('check-circle', 'icon--24')}</span>` : `<span class="lock" aria-label="${r}: tidak diizinkan (terkunci)">${icon('lock', 'icon--16')}</span>`}</td>` : `<td><label class="switch"><input type="checkbox" data-i="${i}" data-j="${j}" aria-label="${esc(p[0])} untuk ${r}" ${val(i, j) ? 'checked' : ''}><span></span></label></td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
    el.onchange = async (e) => {
      const c = e.target.closest('[data-i]'); if (!c) return; const i = +c.dataset.i, j = +c.dataset.j;
      const ok = await confirmDialog({ title: 'Ubah izin akses?', body: `<b>${esc(D.PERMISSIONS[i][0])}</b> untuk <b>${roles[j]}</b> akan ${c.checked ? 'DIIZINKAN' : 'DICABUT'}.`, confirmText: 'Ya, ubah', danger: !c.checked });
      if (!ok) { c.checked = !c.checked; return; } ov[i + '-' + j] = c.checked ? 1 : 0; Store.set('perm', ov);
      Audit.log('ubah izin', `${D.PERMISSIONS[i][0]} → ${roles[j]}`, { diizinkan: !c.checked }, { diizinkan: c.checked }); toast({ type: 'success', msg: 'Izin diperbarui.' });
    };
  };

  V.audit = (el) => {
    const SAMPLE = [['Anwar Hidayat', 'superadmin', 'ubah izin', 'Lihat detail member → Admin', { diizinkan: false }, { diizinkan: true }, 2], ['Fajar Nugroho', 'admin', 'setujui konten', 'Foto formasi touring', { status: 'review' }, { status: 'disetujui' }, 5], ['Fajar Nugroho', 'admin', 'ubah kegiatan', 'Sunday Morning Ride — Jakarta Coast', { quota: 100 }, { quota: 120 }, 26], ['Anwar Hidayat', 'superadmin', 'proses refund', 'INV/DOCI/202610/10190', { status: 'berhasil' }, { status: 'refunded' }, 50]]
      .map(s => ({ at: new Date(Date.now() - s[6] * 3600e3).toISOString(), actor: s[0], role: s[1], action: s[2], object: s[3], before: s[4], after: s[5], ip: '103.28.14.' + (40 + s[2].length), sample: true }));
    const real = Audit.list(), rows = real.concat(SAMPLE); let q = '';
    el.innerHTML = `<section class="panel"><div class="toolbar"><label class="sr-only" for="a-q">Cari log</label><input class="input" id="a-q" type="search" placeholder="Cari aktor, aksi, atau objek"><button class="btn btn--secondary btn--sm" id="a-csv" style="margin-left:auto">${icon('download', 'icon--16')}Ekspor CSV</button></div>
      <div class="table-scroll"><table class="table"><thead><tr><th>Waktu</th><th>Aktor</th><th>Aksi</th><th>Objek</th><th>Sebelum → Sesudah</th><th>IP</th></tr></thead><tbody id="a-body"></tbody></table></div>
      <div class="table-foot"><span>Log bersifat read-only dan tidak dapat diubah. Baris bertanda “Contoh” adalah data ilustrasi.</span></div></section>`;
    const draw = () => { const l = rows.filter(r => !q || (r.actor + ' ' + r.action + ' ' + r.object).toLowerCase().includes(q)).slice(0, 120);
      $('#a-body', el).innerHTML = l.length ? l.map(r => `<tr><td style="white-space:nowrap">${fmt.dateTime(r.at)}</td><td><b>${esc(r.actor)}</b><span class="sub">${esc(r.role)}</span></td><td>${esc(r.action)} ${r.sample ? '<span class="tag-sample">Contoh</span>' : ''}</td><td>${esc(r.object)}</td><td>${r.before || r.after ? `<pre class="json">${esc(JSON.stringify(r.before))}\n→ ${esc(JSON.stringify(r.after))}</pre>` : '<span class="muted">—</span>'}</td><td class="mono" style="font-size:12px">${esc(r.ip)}</td></tr>`).join('') : `<tr><td colspan="6"><div class="empty" style="padding:32px">${icon('history')}<h3>Tidak ada log</h3><p>Tidak ditemukan catatan yang cocok.</p></div></td></tr>`; };
    $('#a-q', el).oninput = (e) => { q = e.target.value.trim().toLowerCase(); draw(); };
    $('#a-csv', el).onclick = () => csv([['Waktu', 'Aktor', 'Role', 'Aksi', 'Objek', 'Sebelum', 'Sesudah', 'IP']].concat(rows.map(r => [fmt.dateTime(r.at), r.actor, r.role, r.action, r.object, JSON.stringify(r.before), JSON.stringify(r.after), r.ip])), 'audit-log-doci.csv');
    draw();
  };

  V.pengaturan = (el) => {
    const s = Object.assign({ activation: 'auto', otpLen: 6, otpExp: 5, otpMax: 5, block: 15, mask: true }, Store.get('settings', {}));
    el.innerHTML = `<div class="banner banner--warning small"><span>${icon('alert')}</span><div><b>Prototipe.</b> Pengaturan tersimpan di browser ini dan belum memengaruhi gateway, SMS/WhatsApp, atau alur pembayaran yang disimulasikan.</div></div>
      <div class="cols cols--1-1">
      <section class="panel"><div class="panel__head"><h2>Aktivasi Membership</h2></div><div class="panel__body stack"><fieldset style="border:0;padding:0;margin:0;display:grid;gap:10px"><legend class="sr-only">Mode aktivasi</legend>
        <label class="option-card"><input type="radio" name="act" value="auto" ${s.activation === 'auto' ? 'checked' : ''}><span><span class="opt-title" style="display:block">Auto-Activate (default)</span><span class="opt-sub">Membership aktif otomatis setelah pembayaran berhasil.</span></span><span class="opt-mark"></span></label>
        <label class="option-card"><input type="radio" name="act" value="approval" ${s.activation === 'approval' ? 'checked' : ''}><span><span class="opt-title" style="display:block">Activate-After-Approval</span><span class="opt-sub">Pengurus meninjau dulu; akses dasar tetap diberikan setelah bayar.</span></span><span class="opt-mark"></span></label></fieldset></div></section>
      <section class="panel"><div class="panel__head"><h2>Payment Gateway</h2></div><div class="panel__body stack">
        <div class="field"><label class="field-label" for="gk">Server key</label><input class="input mono" id="gk" value="sk_live_••••••••••••••••a91f" readonly aria-describedby="gk-h"><div class="help" id="gk-h">Kunci disamarkan dan tidak pernah ditampilkan penuh.</div></div>
        <div class="field"><label class="field-label" for="wh">Webhook URL</label><input class="input mono" id="wh" value="https://api.doci.example/webhooks/payment" readonly></div>
        <button class="btn btn--secondary btn--sm" id="gk-rot" style="justify-self:start">${icon('refresh', 'icon--16')}Ganti Key</button></div></section>
      <section class="panel"><div class="panel__head"><h2>OTP &amp; Keamanan Login</h2></div><div class="panel__body stack"><div class="form-row form-row--2">
        <div class="field"><label class="field-label" for="o1">Panjang kode OTP</label><select class="select" id="o1"><option ${s.otpLen === 4 ? 'selected' : ''}>4</option><option ${s.otpLen === 6 ? 'selected' : ''}>6</option></select></div>
        <div class="field"><label class="field-label" for="o2">Masa berlaku (menit)</label><input class="input" id="o2" type="number" min="1" max="15" value="${s.otpExp}"></div>
        <div class="field"><label class="field-label" for="o3">Maks. percobaan salah</label><input class="input" id="o3" type="number" min="3" max="10" value="${s.otpMax}"></div>
        <div class="field"><label class="field-label" for="o4">Blokir sementara (menit)</label><input class="input" id="o4" type="number" min="5" max="60" value="${s.block}"></div></div>
        <button class="btn btn--sm" id="o-save" style="justify-self:start">Simpan Pengaturan</button></div></section></div>`;
    $('#gk-rot', el).onclick = async () => { const ok = await confirmDialog({ title: 'Ganti server key?', body: 'Key lama akan dinonaktifkan. Pastikan key baru sudah dipasang di server sebelum melanjutkan.', confirmText: 'Ya, ganti', danger: true }); if (ok) { Audit.log('ganti server key gateway', 'Payment Gateway', { key: '••••a91f' }, { key: '••••(baru)' }); toast({ type: 'success', msg: 'Permintaan penggantian key dicatat (simulasi).' }); } };
    $$('input[name=act]', el).forEach(r => r.onchange = async () => { const prev = s.activation; const ok = await confirmDialog({ title: 'Ubah mode aktivasi?', body: 'Perubahan memengaruhi seluruh pendaftar baru.', confirmText: 'Ya, ubah' }); if (!ok) { $(`input[name=act][value=${prev}]`, el).checked = true; return; } s.activation = r.value; Store.set('settings', s); Audit.log('ubah mode aktivasi', 'Pengaturan', { mode: prev }, { mode: r.value }); toast({ type: 'success', msg: 'Mode aktivasi disimpan.' }); });
    $('#o-save', el).onclick = () => { const n = (id, a, b) => Math.min(b, Math.max(a, +$('#' + id, el).value || a)); const before = Object.assign({}, s); Object.assign(s, { otpLen: +$('#o1', el).value, otpExp: n('o2', 1, 15), otpMax: n('o3', 3, 10), block: n('o4', 5, 60) }); Store.set('settings', s); Audit.log('ubah pengaturan OTP', 'Pengaturan', { otpExp: before.otpExp, otpMax: before.otpMax }, { otpExp: s.otpExp, otpMax: s.otpMax }); toast({ type: 'success', msg: 'Pengaturan OTP disimpan.' }); };
  };

  /* ---------- Router ---------- */
  function route() {
    let r = (location.hash || '#dashboard').slice(1); if (!V[r] && r !== 'tracking') r = 'dashboard';
    const restricted = ['role', 'audit', 'pengaturan'].includes(r) && !isSuper;
    $('#ttl').textContent = TITLES[r]; document.title = TITLES[r] + ' — Admin DOCI';
    $$('.adm-nav a').forEach(a => a.dataset.r === r ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    $('#adm').classList.remove('nav-open');
    const old = $('#dyn'), dyn = document.createElement('div'); dyn.id = 'dyn'; old.replaceWith(dyn);
    if (r === 'tracking') { trackingEnter(); return; } else trackingLeave();
    if (restricted) { Audit.log('akses ditolak', r); dyn.innerHTML = `<div class="panel"><div class="empty">${icon('lock')}<h3>Hanya untuk Superadmin</h3><p>Role Anda belum memiliki izin untuk membuka halaman ini.</p><a class="btn" href="#dashboard">Kembali ke Dashboard</a></div></div>`; return; }
    dyn.innerHTML = ''; V[r](dyn); window.scrollTo({ top: 0 });
  }
  shell(); route(); window.addEventListener('hashchange', route);
})();
