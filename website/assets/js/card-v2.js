/* DOCI — Kartu Member v2 (Carbon Edition). Memuat DOCI.cardHTMLv2 dengan signature sama seperti DOCI.cardHTML. */
(function () {
  const { esc, fmt, logo, qrSvg } = window.DOCI;

  function cardHTMLv2({ name, id, chapter, until, photo, bike, blood, emergPhone, emergRel, plate, vin }) {
    const _id = id || 'DOCI-00-00000';
    const photoUrl = photo || 'assets/img/member-photo.jpg';
    const dash = (v) => esc(v || '-');
    const active = until ? new Date(until) > new Date() : true;

    return `<div class="xcard-flip" tabindex="0" role="button" aria-label="Kartu member. Klik untuk membalik kartu"
    onclick="this.classList.toggle('is-flipped')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.classList.toggle('is-flipped')}">
  <div class="xcard-flip__inner">
    <div class="xcard xcard--front" role="img" aria-label="Kartu member depan">
      <div class="xcard__stripe"></div>
      <div class="xcard__in">
      <div class="xcard__top">
        ${logo(true, '#')}
        <span class="xcard__tier">Member</span>
      </div>
      <div class="xcard__main">
        <div class="xcard__photo"><img src="${photoUrl}" alt="Foto anggota"></div>
        <div class="xcard__info">
          <span class="xcard__label">Nama Anggota</span>
          <div class="xcard__name">${esc(name)}</div>
          <span class="xcard__label">No. Anggota</span>
          <div class="xcard__nra">${esc(_id)}</div>
          <div class="xcard__meta">
            <div><span class="xcard__label">Chapter</span><b>${dash(chapter)}</b></div>
            <div><span class="xcard__label">Berlaku s/d</span><b>${until ? fmt.dateShort(until) : '-'}</b></div>
          </div>
        </div>
      </div>
      <div class="xcard__bottom">
        <span class="xcard__tag">Ducati Official<br>Club Indonesia</span>
        <span class="xcard__status ${active ? '' : 'xcard__status--off'}"><i></i>${active ? 'Active Member' : 'Expired'}</span>
      </div>
      </div>
    </div>

    <div class="xcard xcard--back" role="img" aria-label="Kartu member belakang">
      <div class="xcard__band">${logo(true, '#')}<span>Official Member Card</span></div>
      <div class="xcard__panels">
        <div class="xcard__panel">
          <strong>Emergency &amp; Medical</strong>
          <div><span>Gol. Darah</span><b>${dash(blood)}</b></div>
          <div><span>Kontak Darurat</span><b>${dash(emergPhone)}</b></div>
          <div><span>Hubungan</span><b>${dash(emergRel)}</b></div>
        </div>
        <div class="xcard__panel">
          <strong>Registrasi Unit</strong>
          <div><span>Model</span><b>${dash(bike)}</b></div>
          <div><span>No. Polisi</span><b>${dash(plate)}</b></div>
          <div><span>VIN / Rangka</span><b>${dash(vin)}</b></div>
        </div>
      </div>
      <div class="xcard__foot">
        <div class="xcard__qr" aria-label="QR validasi kartu">${qrSvg(_id, 64)}</div>
        <div class="xcard__rules">
          <strong>Ketentuan Kartu</strong>
          <ul>
            <li>Tanda pengenal sah anggota resmi DOCI, terafiliasi dengan Desmo Owners Club Bologna, Italia.</li>
            <li>Tidak dapat dipindahtangankan; wajib dibawa saat turing, track day, dan musyawarah klub.</li>
            <li>Jika ditemukan, hubungi Sekretariat DOCI: 0812-8000-DOCI / docindonesia.com.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>`;
  }

  window.DOCI.cardHTMLv2 = cardHTMLv2;
})();
