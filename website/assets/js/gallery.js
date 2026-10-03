/* Gallery grid + accessible lightbox (keyboard: ←/→/Esc), atribusi uploader, laporkan konten */
(function () {
  const { icon, esc, toast, Auth, Audit } = window.DOCI;

  function itemHTML(g, i) {
    return `<button class="g-item" data-i="${i}" aria-label="Buka ${g.type === 'video' ? 'video' : 'foto'}: ${esc(g.title)}">
      <img src="${g.img}" alt="${esc(g.title)} — ${esc(g.album)}" loading="lazy" width="400" height="400">
      ${g.type === 'video' ? `<span class="g-play"><span>${icon('video', 'icon--24')}</span></span><span class="chip chip--dark g-badge">${g.duration}</span>` : ''}
      <span class="g-cap"><b>${esc(g.title)}</b><span>${esc(g.album)}</span></span></button>`;
  }

  function initGallery(gridSel, items, lbSel) {
    const grid = document.querySelector(gridSel), lb = document.querySelector(lbSel);
    let cur = 0, list = items;
    function render(l) { list = l; grid.innerHTML = l.map(itemHTML).join(''); }
    render(items);

    function show(i) {
      cur = (i + list.length) % list.length; const g = list[cur];
      lb.innerHTML = `<div class="lb-bar"><span class="small" aria-live="polite">${cur + 1} / ${list.length}</span><button class="icon-btn" data-close aria-label="Tutup penampil">${icon('x', 'icon--24')}</button></div>
        <div class="lb-stage"><button class="lb-nav lb-nav--prev" aria-label="Sebelumnya">${icon('chev-left', 'icon--24')}</button>
          <img src="${g.img}" alt="${esc(g.title)}">
          <button class="lb-nav lb-nav--next" aria-label="Berikutnya">${icon('chev-right', 'icon--24')}</button></div>
        <div class="lb-cap"><b>${esc(g.title)}</b><div class="small" style="opacity:.8">Album: ${esc(g.album)} · Oleh ${esc(g.by)} (kredit fotografer)</div>
          <div class="row"><a class="btn btn--sm btn--outline-light" href="${g.img}" download>${icon('download', 'icon--16')}Unduh</a><button class="btn btn--sm btn--outline-light" data-report>${icon('flag', 'icon--16')}Laporkan</button></div></div>`;
      lb.querySelector('.lb-nav--prev').onclick = () => show(cur - 1);
      lb.querySelector('.lb-nav--next').onclick = () => show(cur + 1);
      lb.querySelector('[data-report]').onclick = () => {
        Audit.log('laporkan konten', g.title); toast({ type: 'success', title: 'Laporan diterima', msg: 'Terima kasih. Admin akan meninjau konten ini.' });
      };
    }
    grid.addEventListener('click', (e) => { const b = e.target.closest('.g-item'); if (!b) return; show(+b.dataset.i); lb.showModal(); lb.querySelector('[data-close]').focus(); });
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
    return { render };
  }
  window.DOCI.initGallery = initGallery;
})();
