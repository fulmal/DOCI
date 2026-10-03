/* ==========================================================================
   DOCI Upload — dialog unggah dokumentasi (foto/video) untuk member.
   PRD §7.3: semua pengguna terdaftar boleh unggah, progres per berkas,
   coba lagi saat gagal, batas ukuran, album + keterangan, persetujuan lisensi.
   Prototipe: berkas TIDAK dikirim ke server; thumbnail disimpan di localStorage.
   ========================================================================== */
(function () {
  const { D, icon, esc, Store, Auth, Audit, toast, $ } = window.DOCI;
  const MAX_PHOTO = 20 * 1024 * 1024, MAX_VIDEO = 500 * 1024 * 1024;
  const OK_PHOTO = ['image/jpeg', 'image/png', 'image/webp'], OK_VIDEO = ['video/mp4', 'video/quicktime', 'video/webm'];
  const mb = (n) => (n / 1048576).toFixed(1).replace('.', ',') + ' MB';

  function media() { return Store.get('media', []); }
  function allMedia() { return media().concat(D.GALLERY); }

  function albums() {
    const s = new Set(D.GALLERY.map(g => g.album)); media().forEach(m => s.add(m.album));
    D.EVENTS.filter(e => e.status !== 'terbit' || new Date(e.start) < new Date()).forEach(e => s.add(e.title));
    return [...s];
  }

  function thumb(file) {
    return new Promise((res) => {
      const fallback = () => res('assets/img/hero.jpg');
      if (!file.type.startsWith('image/')) return res('assets/img/trackday.jpg');
      const fr = new FileReader();
      fr.onload = () => { const im = new Image(); im.onload = () => {
        const c = document.createElement('canvas'), s = Math.min(1, 480 / Math.max(im.width, im.height));
        c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .72));
      }; im.onerror = fallback; im.src = fr.result; };
      fr.onerror = fallback; fr.readAsDataURL(file);
    });
  }

  function open(onDone) {
    const u = Auth.current();
    let dlg = $('#upload-dlg'); if (dlg) dlg.remove();
    dlg = document.createElement('dialog'); dlg.className = 'modal modal--lg'; dlg.id = 'upload-dlg'; dlg.setAttribute('aria-labelledby', 'up-title');
    document.body.appendChild(dlg);
    if (!u) {
      dlg.innerHTML = `<div class="modal__head"><h2 id="up-title">Masuk untuk mengunggah</h2><button class="icon-btn" data-close aria-label="Tutup">${icon('x', 'icon--24')}</button></div>
        <div class="modal__body"><div class="empty" style="padding:var(--space-5) 0">${icon('lock')}<h3>Khusus member</h3><p>Masuk dengan nomor telepon Anda untuk membagikan foto dan video kegiatan.</p><a class="btn" href="masuk.html?next=${encodeURIComponent(location.pathname.split('/').pop())}">Masuk</a></div></div>`;
      dlg.showModal(); dlg.addEventListener('close', () => dlg.remove()); return;
    }
    const items = []; let seq = 0;
    dlg.innerHTML = `<div class="modal__head"><h2 id="up-title">Unggah Dokumentasi</h2><button class="icon-btn" data-close aria-label="Tutup">${icon('x', 'icon--24')}</button></div>
      <div class="modal__body stack">
        <div class="field"><input class="sr-only" type="file" id="up-file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm">
          <label class="dropzone" for="up-file" id="up-drop" style="display:block">${icon('upload', 'icon--32')}<b>Pilih foto atau video</b> atau tarik ke sini<div class="help">Foto JPG/PNG/WebP maks 20 MB · Video MP4/MOV/WebM maks 500 MB</div></label></div>
        <div id="up-list" aria-live="polite"></div>
        <div class="form-row form-row--2">
          <div class="field"><label class="field-label" for="up-album">Album / kegiatan</label><select class="select" id="up-album">${albums().map(a => `<option>${esc(a)}</option>`).join('')}<option value="__new">+ Album baru…</option></select></div>
          <div class="field" id="up-new-wrap" hidden><label class="field-label" for="up-new">Nama album baru</label><input class="input" id="up-new" maxlength="60"></div>
        </div>
        <div class="field"><label class="field-label" for="up-cap">Keterangan <span class="muted">(opsional)</span></label><input class="input" id="up-cap" maxlength="100" placeholder="Contoh: Break di viewpoint pagi hari"></div>
        <label class="check"><input type="checkbox" id="up-lic"><span>Saya pemilik karya ini dan mengizinkan DOCI menampilkannya di situs dan media resmi. Wajah dan plat nomor orang lain tidak saya unggah tanpa izin.</span></label>
        <p class="error-text" id="up-err" role="alert" hidden></p>
      </div>
      <div class="modal__foot"><button class="btn btn--ghost" data-close>Batal</button><button class="btn" id="up-go" disabled>Unggah</button></div>`;
    const list = $('#up-list', dlg), go = $('#up-go', dlg), err = $('#up-err', dlg);

    const check = () => { go.disabled = !(items.some(i => i.state === 'ready' || i.state === 'error') && $('#up-lic', dlg).checked); };
    function addFiles(fl) {
      err.hidden = true;
      [...fl].forEach(f => {
        const isP = OK_PHOTO.includes(f.type), isV = OK_VIDEO.includes(f.type);
        const it = { id: ++seq, f, type: isV ? 'video' : 'photo', state: 'ready', pct: 0, msg: '' };
        if (!isP && !isV) { it.state = 'bad'; it.msg = 'Format tidak didukung. Gunakan JPG, PNG, WebP, MP4, MOV, atau WebM.'; }
        else if (isP && f.size > MAX_PHOTO) { it.state = 'bad'; it.msg = `Ukuran ${mb(f.size)} melebihi batas 20 MB untuk foto.`; }
        else if (isV && f.size > MAX_VIDEO) { it.state = 'bad'; it.msg = `Ukuran ${mb(f.size)} melebihi batas 500 MB untuk video.`; }
        items.push(it);
      });
      draw(); check();
    }
    function draw() {
      list.innerHTML = items.map(it => `<div class="upload-item" data-id="${it.id}">
        <span class="feature__icon" style="width:48px;height:48px;border-radius:8px">${icon(it.type === 'video' ? 'video' : 'image', 'icon--24')}</span>
        <div class="grow" style="min-width:0"><b class="small" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(it.f.name)}</b><span class="small muted">${mb(it.f.size)}</span>
          ${it.state === 'up' || it.state === 'done' ? `<div class="progress ${it.state === 'done' ? 'progress--ok' : ''}" role="progressbar" aria-valuenow="${it.pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Progres ${esc(it.f.name)}" style="margin-top:6px"><span style="width:${it.pct}%"></span></div>` : ''}
          ${it.state === 'bad' || it.state === 'error' ? `<div class="error-text small" style="margin-top:4px">${it.msg}</div>` : ''}</div>
        ${it.state === 'done' ? `<span class="chip chip--success">${icon('check-circle')}Terunggah</span>` : it.state === 'error' ? `<button class="btn btn--sm btn--secondary" data-retry="${it.id}">${icon('refresh', 'icon--16')}Coba Lagi</button>` : it.state === 'up' ? `<span class="small num">${it.pct}%</span>` : `<button class="icon-btn" data-rm="${it.id}" aria-label="Hapus ${esc(it.f.name)} dari daftar">${icon('trash', 'icon--16')}</button>`}</div>`).join('');
    }
    function send(it) {
      return new Promise((resolve) => {
        it.state = 'up'; it.pct = 0; draw();
        const t = setInterval(() => {
          if (!navigator.onLine) { clearInterval(t); it.state = 'error'; it.msg = 'Koneksi terputus. Berkas tidak hilang — ketuk “Coba Lagi”.'; draw(); return resolve(false); }
          it.pct = Math.min(100, it.pct + 8 + Math.round(Math.random() * 14)); draw();
          if (it.pct >= 100) { clearInterval(t); it.state = 'done'; draw(); resolve(true); }
        }, 180);
      });
    }
    async function finish(done) {
      let a = $('#up-album', dlg).value; if (a === '__new') a = ($('#up-new', dlg).value.trim() || 'Album Baru');
      const cap = $('#up-cap', dlg).value.trim(); const store = media();
      for (const it of done) {
        const th = await thumb(it.f);
        store.unshift({ id: 'u' + Date.now() + it.id, type: it.type, title: cap || it.f.name.replace(/\.[^.]+$/, ''), album: a, img: th, by: u.name, chapter: u.chapter, duration: it.type === 'video' ? '00:30' : undefined,
          status: it.type === 'video' ? 'review' : 'disetujui', at: new Date().toISOString(), phone: u.phone, size: it.f.size });
      }
      try { Store.set('media', store.slice(0, 24)); } catch { /* kuota penuh */ }
      Audit.log('unggah dokumentasi', `${done.length} berkas ke album “${a}”`);
      toast({ type: 'success', title: `${done.length} berkas terunggah`, msg: done.some(d => d.type === 'video') ? 'Video sedang ditinjau admin sebelum tayang. Foto langsung tampil di galeri.' : 'Foto Anda sudah tampil di galeri dengan kredit nama Anda.' });
      if (onDone) onDone();
    }
    go.addEventListener('click', async () => {
      if (!$('#up-lic', dlg).checked) { err.hidden = false; err.textContent = 'Centang persetujuan hak cipta untuk melanjutkan.'; return; }
      go.disabled = true; go.textContent = 'Mengunggah…';
      const todo = items.filter(i => i.state === 'ready' || i.state === 'error');
      await Promise.all(todo.map(send));
      const done = items.filter(i => i.state === 'done' && !i.saved); done.forEach(i => i.saved = true);
      if (done.length) await finish(done);
      go.textContent = 'Unggah'; check();
      if (items.every(i => i.state === 'done' || i.state === 'bad')) setTimeout(() => dlg.close(), 700);
    });
    list.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-rm]'), rt = e.target.closest('[data-retry]');
      if (rm) { items.splice(items.findIndex(i => i.id === +rm.dataset.rm), 1); draw(); check(); }
      if (rt) go.click();
    });
    $('#up-file', dlg).addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
    const drop = $('#up-drop', dlg);
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
    drop.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));
    $('#up-album', dlg).addEventListener('change', (e) => { $('#up-new-wrap', dlg).hidden = e.target.value !== '__new'; });
    $('#up-lic', dlg).addEventListener('change', () => { err.hidden = true; check(); });
    dlg.addEventListener('close', () => dlg.remove());
    dlg.showModal();
  }

  window.DOCI.Upload = { open, media, allMedia, albums };
})();
