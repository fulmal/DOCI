/* ==========================================================================
   DOCI Live Tracking — simulasi peserta touring di atas peta (Leaflet)
   Mengikuti PRD §7.5 (TRK-01..13): consent-first, status Online/Idle/Offline/
   Low Battery/SOS, marker halus (tanpa teleport), fallback jika peta gagal,
   mode hemat data, antrean lokasi saat offline, SOS, playback (admin).
   ========================================================================== */
(function () {
  const { D, icon, esc, fmt, toast, Audit, statusChip, Store } = window.DOCI;

  // Rute contoh: Jakarta → Puncak → Cianjur → Bandung
  const ROUTE = [[-6.1754, 106.8272], [-6.2615, 106.8470], [-6.3733, 106.8949], [-6.4817, 106.8540], [-6.5950, 106.8166], [-6.6783, 106.9300], [-6.7050, 106.9930], [-6.7370, 107.0270], [-6.8200, 107.1420], [-6.8260, 107.3000], [-6.8400, 107.4800], [-6.9175, 107.6191]];
  const seg = []; let total = 0;
  for (let i = 1; i < ROUTE.length; i++) { const d = Math.hypot(ROUTE[i][0] - ROUTE[i - 1][0], ROUTE[i][1] - ROUTE[i - 1][1]); seg.push(d); total += d; }
  function pointAt(t) {
    t = Math.max(0, Math.min(1, t)); let dist = t * total;
    for (let i = 0; i < seg.length; i++) { if (dist <= seg[i]) { const k = dist / seg[i]; return [ROUTE[i][0] + (ROUTE[i + 1][0] - ROUTE[i][0]) * k, ROUTE[i][1] + (ROUTE[i + 1][1] - ROUTE[i][1]) * k]; } dist -= seg[i]; }
    return ROUTE[ROUTE.length - 1];
  }
  const KM_TOTAL = 152;

  function makeRiders(anon) {
    let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const n = ['Raka Pratama', 'Dewi Lestari', 'Bima Aditya', 'Sari Wulandari', 'Dimas Kusuma', 'Putri Maharani', 'Yoga Saputra', 'Intan Permata', 'Reza Firmansyah', 'Maya Utami', 'Hendra Wijaya', 'Galih Setiawan'];
    return n.map((name, i) => {
      const status = i === 3 ? 'offline' : i === 6 ? 'idle' : i === 9 ? 'lowbat' : 'online';
      return { id: 'r' + i, name: anon ? 'Peserta ' + (i + 1) : name, initials: anon ? 'P' + (i + 1) : fmt.initials(name), t: 0.12 + r() * 0.5, v: 45 + r() * 40, base: 0.0009 + r() * 0.0005, status, battery: status === 'lowbat' ? 14 : 60 + Math.floor(r() * 38), last: Date.now() - (status === 'offline' ? 12 * 60000 : 0), me: false };
    });
  }

  function create(opts) {
    const o = Object.assign({ interval: 2000, admin: false, anon: false, mapEl: null, listEl: null, statsEl: null, onSelect: null }, opts);
    const st = { riders: makeRiders(o.anon), interval: o.interval, sharing: false, sos: false, queue: 0, markers: {}, timer: null, selected: null, map: null, trail: null, ok: !!window.L };
    st.me = { id: 'me', name: 'Anda', initials: 'AN', t: 0.38, v: 0, base: 0.0011, status: 'online', battery: 78, last: Date.now(), me: true };

    /* ---- map ---- */
    function initMap() {
      if (!window.L) { fallback(); return; }
      try {
        const map = st.map = L.map(o.mapEl, { zoomControl: false, attributionControl: true }).setView(pointAt(0.4), 9);
        const road = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 });
        const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri', maxZoom: 18 });
        road.addTo(map); st.layers = { road, sat, cur: 'road' };
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.polyline(ROUTE, { color: '#D5001C', weight: 5, opacity: .9, lineCap: 'round' }).addTo(map);
        const flag = (c, ic) => L.divIcon({ className: '', html: `<div class="flag-mk" style="background:${c}">${icon(ic, 'icon--16')}</div>`, iconSize: [34, 34], iconAnchor: [17, 17] });
        L.marker(ROUTE[0], { icon: flag('#141416', 'flag') }).addTo(map).bindTooltip('Start · Monas, Jakarta');
        L.marker(ROUTE[ROUTE.length - 1], { icon: flag('#0F9D58', 'flag') }).addTo(map).bindTooltip('Finish · Bandung');
        map.on('zoomstart', () => o.mapEl.classList.remove('trk-smooth')); map.on('zoomend', () => o.mapEl.classList.add('trk-smooth')); o.mapEl.classList.add('trk-smooth');
        // tile error → fallback hint
        let errs = 0; road.on('tileerror', () => { if (++errs === 12) toast({ type: 'warning', title: 'Peta sulit dimuat', msg: 'Koneksi lambat. Data posisi tetap tampil di daftar peserta.' }); });
        st.riders.forEach(addMarker);
        setTimeout(() => map.invalidateSize(), 200);
        fitAll();
      } catch (err) { console.error(err); fallback(); }
    }
    function fallback() {
      st.ok = false;
      const f = document.createElement('div'); f.className = 'map-fallback';
      f.innerHTML = `<div><div class="empty" style="padding:0">${icon('map')}<h3>Peta gagal dimuat</h3><p>Anda tetap bisa melihat koordinat terakhir peserta di daftar.</p><button class="btn" id="map-reload">${icon('refresh', 'icon--16')}Muat Ulang</button></div><div class="mono small muted" id="coord-fallback" style="margin-top:16px;text-align:left;max-height:140px;overflow:auto"></div></div>`;
      o.mapEl.appendChild(f); f.querySelector('#map-reload').onclick = () => location.reload();
    }
    const mkHTML = (r) => `<div class="mk ${r.status === 'offline' ? 'is-off' : r.status === 'idle' ? 'is-idle' : r.status === 'sos' ? 'is-sos' : r.status === 'online' || r.status === 'lowbat' ? 'is-ok' : ''} ${r.me ? 'is-me' : ''}">${r.initials}</div>`;
    function addMarker(r) {
      if (!st.map) return;
      const m = L.marker(pointAt(r.t), { icon: L.divIcon({ className: 'rider-mk', html: mkHTML(r), iconSize: [38, 38], iconAnchor: [19, 19] }), zIndexOffset: r.me ? 1000 : 0, keyboard: true, title: r.name }).addTo(st.map);
      m.bindPopup(() => popupHTML(r), { closeButton: true });
      m.on('click', () => select(r.id, false));
      st.markers[r.id] = m; r._status = r.status;
    }
    const popupHTML = (r) => `<div class="mk-pop"><b>${esc(r.name)}</b><div style="margin:6px 0">${statusChip(r.status)}</div>
      ${o.anon ? '<div class="muted">Detail disamarkan untuk publik.</div>' : `<div>Kecepatan: <b class="num">${Math.round(r.v)} km/j</b></div><div>Baterai: <b class="num">${Math.round(r.battery)}%</b></div>`}
      <div class="muted">Update ${fmt.ago(r.last)}</div>
      ${o.admin ? `<button class="btn btn--sm btn--secondary" style="margin-top:8px" data-contact="${r.id}">${icon('phone', 'icon--16')}Kontak</button>` : ''}</div>`;

    /* ---- simulation ---- */
    function tick() {
      const scale = st.interval / 2000;
      const all = st.sharing ? st.riders.concat(st.me) : st.riders;
      all.forEach(r => {
        if (r.status === 'offline' && !r.me) return;
        if (r.status === 'idle' && Math.random() < .12) r.status = 'online';
        else if (r.status === 'online' && !r.me && Math.random() < .005) r.status = 'idle';
        const moving = r.status !== 'idle' && !(r.me && !navigator.onLine);
        r.v = moving ? Math.max(25, Math.min(95, r.v + (Math.random() - .5) * 8)) : 0;
        if (moving) r.t = Math.min(0.995, r.t + r.base * scale * (r.v / 60));
        r.battery = Math.max(3, r.battery - 0.02 * scale);
        if (r.battery < 20 && r.status === 'online') r.status = 'lowbat';
        if (!(r.me && !navigator.onLine)) r.last = Date.now(); else st.queue++;
        if (st.map && st.markers[r.id]) {
          st.markers[r.id].setLatLng(pointAt(r.t));
          if (r._status !== r.status) { st.markers[r.id].setIcon(L.divIcon({ className: 'rider-mk', html: mkHTML(r), iconSize: [38, 38], iconAnchor: [19, 19] })); r._status = r.status; }
        }
      });
      if (st.sharing && !st.markers.me && st.map) addMarker(st.me);
      renderList(); renderStats();
      const cf = document.getElementById('coord-fallback'); if (cf) cf.innerHTML = all.map(r => { const p = pointAt(r.t); return `${esc(r.name)}: ${p[0].toFixed(4)}, ${p[1].toFixed(4)}`; }).join('<br>');
      if (o.onTick) o.onTick(st);
    }

    function renderList() {
      if (!o.listEl) return;
      const order = { sos: 0, lowbat: 1, offline: 2, idle: 3, online: 4 };
      const arr = (st.sharing ? [st.me] : []).concat(st.riders).sort((a, b) => order[a.status] - order[b.status] || b.t - a.t);
      o.listEl.innerHTML = arr.map(r => `<button class="rider ${r.status === 'offline' ? 'is-off' : ''} ${st.selected === r.id ? 'is-sel' : ''}" data-id="${r.id}" aria-label="${esc(r.name)}, ${r.status}">
        <span class="avatar">${r.initials}</span><span class="grow"><b>${esc(r.name)}${r.me ? ' (Anda)' : ''}</b><span class="sub">${o.anon ? '' : `<span class="num">${Math.round(r.v)} km/j</span><span>${icon('battery', 'icon--14')}<span class="num">${Math.round(r.battery)}%</span></span>`}<span>${fmt.ago(r.last)}</span></span></span>${statusChip(r.status)}</button>`).join('');
    }
    function renderStats() {
      if (!o.statsEl) return;
      const all = st.sharing ? st.riders.concat(st.me) : st.riders;
      const on = all.filter(r => r.status === 'online' || r.status === 'lowbat' || r.status === 'sos').length, off = all.filter(r => r.status === 'offline').length;
      const mv = all.filter(r => r.v > 0); const avg = mv.length ? Math.round(mv.reduce((a, r) => a + r.v, 0) / mv.length) : 0;
      const lead = Math.max(...all.map(r => r.t));
      o.statsEl.innerHTML = `<div><b class="num">${on}</b><span>Online</span></div><div><b class="num">${off}</b><span>Offline</span></div><div><b class="num">${avg}</b><span>Rata² km/j</span></div>`;
      const ps = document.getElementById('prog-pill'); if (ps) ps.textContent = `Terdepan ${Math.round(lead * KM_TOTAL)} / ${KM_TOTAL} km`;
    }

    /* ---- actions ---- */
    function select(id, pan = true) {
      st.selected = id; const r = id === 'me' ? st.me : st.riders.find(x => x.id === id); if (!r || !st.map) return renderList();
      if (pan) st.map.flyTo(pointAt(r.t), Math.max(st.map.getZoom(), 12), { duration: .8 });
      st.markers[id]?.openPopup(); renderList(); if (o.onSelect) o.onSelect(r);
    }
    function fitAll() { if (!st.map) return; st.map.fitBounds(L.latLngBounds(ROUTE), { padding: [60, 60] }); }
    function setLayer(kind) { if (!st.map) return; const l = st.layers; st.map.removeLayer(l[l.cur]); l[kind].addTo(st.map); l.cur = kind; }
    function setInterval_(ms) { st.interval = ms; start(); }
    function start() { stop(); tick(); st.timer = window.setInterval(tick, st.interval); }
    function stop() { clearInterval(st.timer); }
    function startSharing() { st.sharing = true; st.me.status = 'online'; st.me.last = Date.now(); Audit.log('mulai berbagi lokasi', 'Touring Jakarta–Bandung'); tick(); if (st.map) st.map.flyTo(pointAt(st.me.t), 11, { duration: .8 }); }
    function stopSharing() { st.sharing = false; st.sos = false; if (st.markers.me) { st.map.removeLayer(st.markers.me); delete st.markers.me; } Audit.log('berhenti berbagi lokasi', 'Touring Jakarta–Bandung'); renderList(); renderStats(); }
    function triggerSos() { st.sos = true; st.me.status = 'sos'; tick(); Audit.log('SOS dikirim', 'Touring Jakarta–Bandung', null, { lat: pointAt(st.me.t) }); }
    function cancelSos() { st.sos = false; st.me.status = 'online'; tick(); Audit.log('SOS dibatalkan', 'Touring Jakarta–Bandung'); }
    function playback(t) { // t 0..1 — memutar ulang track log (admin / peserta pasca kegiatan)
      if (!st.map) return null; const p = pointAt(t);
      if (!st.ghost) st.ghost = L.circleMarker(p, { radius: 9, color: '#fff', weight: 3, fillColor: '#141416', fillOpacity: 1 }).addTo(st.map);
      st.ghost.setLatLng(p); if (st.trail) st.map.removeLayer(st.trail);
      const pts = []; for (let i = 0; i <= 60; i++) pts.push(pointAt(t * i / 60)); st.trail = L.polyline(pts, { color: '#141416', weight: 6, opacity: .85 }).addTo(st.map);
      return { km: Math.round(t * KM_TOTAL), t };
    }
    function clearPlayback() { if (st.ghost) { st.map.removeLayer(st.ghost); st.ghost = null; } if (st.trail) { st.map.removeLayer(st.trail); st.trail = null; } }

    // offline / online (TRK-11)
    window.addEventListener('offline', () => { if (st.sharing) toast({ type: 'warning', title: 'Anda offline', msg: 'Lokasi disimpan di perangkat dan dikirim saat koneksi kembali.' }); });
    window.addEventListener('online', () => { if (st.queue && st.sharing) { toast({ type: 'success', title: 'Tersambung kembali', msg: `${st.queue} titik lokasi tersinkron otomatis.` }); st.queue = 0; } });

    if (o.listEl) o.listEl.addEventListener('click', (e) => { const b = e.target.closest('.rider'); if (b) select(b.dataset.id); });
    initMap(); renderList(); renderStats();
    return { st, start, stop, select, fitAll, setLayer, setInterval: setInterval_, startSharing, stopSharing, triggerSos, cancelSos, playback, clearPlayback, pointAt, KM_TOTAL, tick };
  }
  window.DOCI.Tracking = { create, ROUTE, pointAt, KM_TOTAL };
})();
