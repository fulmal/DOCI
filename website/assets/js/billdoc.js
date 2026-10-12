/* DOCI — dokumen Invoice & Kuitansi (A4). Template mengikuti desain Canva Invoice.pdf / Kwitansi.pdf. */
(function () {
  const { fmt, esc, qrSvg, icon } = window.DOCI;
  const D = window.DOCI_DATA || {};

  const ORG = {
    name: 'Ducati Official Club Indonesia',
    aff: 'Official Affiliated Club with Ducati Motor Holding S.p.A.',
    addr: 'Sekretariat: DOCIClubhouse, Jl. Radio Dalam Raya No.12 Jakarta Selatan 12140',
    bank: { name: 'BANK MANDIRI', holder: 'DUCATI OFFICIAL CLUB INDONESIA', no: '122-00- 1928374-1' },
    verifyUrl: 'https://docindonesia.com/verify-invoice',
    treasurer: 'Bendahara Umum & Administrasi DOCI,',
    division: 'Divisi Keanggotaan & Keuangan DOCI',
    period: 'Pengurus Pusat Periode 2026-2028'
  };
  const METHOD_LABEL = {
    bca: 'BCA Virtual Account', bni: 'BNI Virtual Account', bri: 'BRI Virtual Account', mandiri: 'Mandiri Bill / VA',
    qris: 'QRIS', gopay: 'GoPay', ovo: 'OVO', dana: 'DANA', shopeepay: 'ShopeePay', card: 'Kartu Kredit / Debit (3D Secure)'
  };
  const DEFAULT_DESC = {
    'Biaya join (pendaftaran + iuran 12 bulan pertama)': 'Verifikasi berkas motor, penerbitan Nomor Register Anggota (NRA), iuran keanggotaan 12 bulan pertama & kartu anggota digital',
    'Biaya kegiatan': 'Biaya partisipasi kegiatan resmi DOCI',
    'Iuran Keanggotaan Tahunan 2026': 'Kontribusi operasional klub, hak suara Munas, subsidi event turing & kegiatan bakti sosial'
  };

  /* ---------- util ---------- */
  const SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  function terbilang(n) {
    n = Math.floor(n);
    if (n < 12) return SATUAN[n];
    if (n < 20) return terbilang(n - 10) + ' belas';
    if (n < 100) return terbilang(Math.floor(n / 10)) + ' puluh' + (n % 10 ? ' ' + terbilang(n % 10) : '');
    if (n < 200) return 'seratus' + (n - 100 ? ' ' + terbilang(n - 100) : '');
    if (n < 1000) return terbilang(Math.floor(n / 100)) + ' ratus' + (n % 100 ? ' ' + terbilang(n % 100) : '');
    if (n < 2000) return 'seribu' + (n - 1000 ? ' ' + terbilang(n - 1000) : '');
    if (n < 1e6) return terbilang(Math.floor(n / 1000)) + ' ribu' + (n % 1000 ? ' ' + terbilang(n % 1000) : '');
    if (n < 1e9) return terbilang(Math.floor(n / 1e6)) + ' juta' + (n % 1e6 ? ' ' + terbilang(n % 1e6) : '');
    if (n < 1e12) return terbilang(Math.floor(n / 1e9)) + ' miliar' + (n % 1e9 ? ' ' + terbilang(n % 1e9) : '');
    return String(n);
  }
  const words = (n) => { const w = n === 0 ? 'nol' : terbilang(n); return w.replace(/\b\w/g, c => c.toUpperCase()) + ' Rupiah'; };
  const rp = (n) => fmt.rpRaw(n);
  const pad = (n) => String(n).padStart(2, '0');
  const dLong = (d) => fmt.date(d);
  const dtWib = (d) => { d = new Date(d); return `${fmt.date(d)}, ${pad(d.getHours())}:${pad(d.getMinutes())} WIB`; };
  const dtDue = (d) => { d = new Date(d); return `${fmt.date(d)} (${pad(d.getHours())}:${pad(d.getMinutes())} WIB)`; };
  const mask = (s) => { s = String(s || ''); return s.length > 4 ? s.slice(0, -4) + '****' : (s || '—'); };
  const chapterName = (id) => { const c = (D.CHAPTERS || []).find(x => x.id === id); return c ? 'DOCI ' + c.name : 'DOCI'; };
  const seqOf = (id) => String(id || '').split('/').pop();

  function ctx(inv) {
    const p = inv.profile || {};
    const v = (p.vehicles && p.vehicles[0]) || { model: p.model, year: p.year, color: p.color, plate: p.plate, chassis: p.chassis };
    const bike = v && v.model ? ('Ducati ' + v.model + (v.year ? ' (' + v.year + ')' : '')) : '';
    const stnk = v && v.stnk;
    const ev = inv.type === 'event' ? (D.EVENTS || []).find(e => e.id === inv.eventId) : null;
    const fee = inv.fee || 0;
    const subtotal = inv.items.reduce((s, i) => s + (i.amount || 0), 0);
    return {
      p, v, bike, stnk, ev, fee, subtotal, total: inv.amount + fee,
      name: p.fullName || inv.phone || 'Member DOCI',
      chapter: chapterName(p.chapter),
      phone: inv.phone ? fmt.phone(inv.phone) : '—',
      method: METHOD_LABEL[inv.method] || (inv.method ? String(inv.method).toUpperCase() : null)
    };
  }

  const row = (k, v, cls) => `<div><dt>${k}</dt><dd${cls ? ` class="${cls}"` : ''}>${v}</dd></div>`;
  const head = (title, lines, accent) => `
    <header class="bd-head">
      <div class="bd-brand">
        <img src="assets/img/logo-square.png" alt="Logo DOCI Indonesia">
        <div><h1>${ORG.name}</h1><div class="aff">${ORG.aff}</div><div class="addr">${ORG.addr}</div></div>
      </div>
      <div class="bd-meta"><div class="ttl">${title}</div>${lines.map(([k, v]) => `<div><b>${k}:</b> ${v}</div>`).join('')}</div>
    </header>`;
  const foot = (l, r) => `<footer class="bd-foot"><span>${l}</span><span>${r}</span></footer>`;

  function itemDesc(i, c) {
    if (i.desc) return i.desc;
    if (c.ev && i.label === 'Biaya kegiatan') return c.ev.title;
    return DEFAULT_DESC[i.label] || '';
  }

  /* ---------- INVOICE ---------- */
  function invoice(inv) {
    const c = ctx(inv);
    const stMap = { menunggu: ['MENUNGGU PEMBAYARAN', 'red', 'stamp--warn', 'UNPAID / MENUNGGU TRANSFER'], berhasil: ['LUNAS', 'green', 'stamp--ok', 'PAID / LUNAS'], kedaluwarsa: ['KEDALUWARSA', '', 'stamp--exp', 'EXPIRED / KEDALUWARSA'] };
    const st = stMap[inv.status] || stMap.menunggu;
    const regNo = inv.regNo || '—';

    const left = [row('Nama Lengkap:', esc(c.name)), row('ID Pendaftaran:', esc(regNo), ''), row('Email:', esc(c.p.email || '—')), row('WhatsApp:', esc(c.phone)), row('Chapter Regional:', esc(c.chapter))].join('');
    let right;
    if (c.ev) {
      right = [row('Kegiatan:', esc(c.ev.title)), row('Jadwal:', fmt.dateShort(c.ev.start)), row('Lokasi:', esc(c.ev.loc || '—')), row('Status Invoice:', st[0], st[1]), row('Kategori:', 'Kegiatan Resmi')].join('');
    } else {
      const unit = c.stnk ? (c.stnk.status === 'valid' || c.stnk.status === 'terverifikasi' ? 'Valid (Surat Lengkap / On-The-Road)' : 'Menunggu Verifikasi Admin') : 'Menunggu Verifikasi Admin';
      right = [row('Model Motor:', esc(c.bike || '—')), row('No. Rangka (VIN):', esc(mask(c.v && c.v.chassis)), 'mono'), row('Status Verifikasi Unit:', unit, unit.startsWith('Valid') ? 'green' : ''), row('Status Invoice:', st[0], st[1]), row('Masa Berlaku:', '1 Tahun')].join('');
    }

    const rows = inv.items.map((i, k) => `<tr><td class="c">${k + 1}</td><td><div class="n">${esc(i.label)}</div>${itemDesc(i, c) ? `<div class="d">${esc(itemDesc(i, c))}</div>` : ''}</td><td class="c">${i.qty || 1}</td><td class="r num">${rp(i.amount / (i.qty || 1))}</td><td class="r num">${rp(i.amount)}</td></tr>`).join('');

    const pay = inv.va && c.method
      ? `<h4>Instruksi Pembayaran</h4><p>Bayar melalui ${esc(c.method)} dengan nomor berikut, sesuai total tagihan:</p><div class="bank">${esc(c.method).toUpperCase()}</div><div class="acc"><span>Nomor Virtual Account</span><span class="no">${esc(inv.va)}</span></div>`
      : `<h4>Instruksi Pembayaran</h4><p>Silakan transfer tepat sesuai total nominal ke rekening kas klub berikut:</p><div class="bank">${ORG.bank.name}</div><div class="acc"><span>a.n. ${ORG.bank.holder}</span><span class="no">${ORG.bank.no}</span></div>`;

    const due = inv.expires ? dtDue(inv.expires) : '—';
    return `<article class="bd-paper" aria-label="Invoice ${esc(inv.id)}">
      ${head('Invoice', [['No', esc(inv.id)], ['Tanggal', dLong(inv.created)], ['Jatuh Tempo', due]])}
      <section class="bd-panels">
        <div class="bd-panel"><h3>${c.ev ? 'Tagihan Untuk (Data Peserta)' : 'Tagihan Untuk (Data Calon Anggota)'}</h3><dl>${left}</dl></div>
        <div class="bd-panel"><h3>${c.ev ? 'Detail Kegiatan & Status' : 'Detail Unit Motor & Status'}</h3><dl>${right}</dl></div>
      </section>
      <table class="bd-table"><thead><tr><th class="c" style="width:44px">No</th><th>Deskripsi Komponen ${c.ev ? 'Kegiatan' : 'Keanggotaan'}</th><th class="c" style="width:56px">Qty</th><th class="r" style="width:120px">Harga Satuan</th><th class="r" style="width:120px">Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
      <section class="bd-sum">
        <div class="bd-pay">${pay}<p class="note">* Konfirmasi otomatis berlangsung 5–15 menit setelah dana diterima sesuai nilai total.</p></div>
        <div class="bd-totals">
          <div><span>Subtotal Biaya</span><span>${rp(c.subtotal)}</span></div>
          <div><span>Biaya Layanan Admin${c.method ? ' (' + esc(c.method) + ')' : ''}</span><span>${c.fee ? rp(c.fee) : 'Rp 0 (Gratis)'}</span></div>
          <div class="grand"><span>Total Tagihan</span><span>${rp(c.total)}</span></div>
        </div>
      </section>
      ${inv.status === 'menunggu' ? `<p class="bd-note bd-note--warn"><b>PENTING:</b> Pastikan nominal transfer sama persis (<b>${rp(c.total)}</b>) agar sistem dapat memvalidasi otomatis tanpa konfirmasi manual. Jika pembayaran melewati batas tanggal <b>${dtDue(inv.expires)}</b>, nomor registrasi akan dibatalkan.${c.ev ? '' : ' Starter Kit akan dikirimkan maksimal 5 hari kerja setelah pembayaran disahkan.'}</p>` : inv.status === 'berhasil' ? `<p class="bd-note bd-note--info"><b>Pembayaran diterima</b> pada ${dtWib(inv.paidAt)}. Dokumen Kuitansi dapat diunduh dari halaman ini.</p>` : `<p class="bd-note bd-note--warn"><b>Invoice kedaluwarsa.</b> Batas waktu pembayaran terlewati; tidak ada tagihan yang terpotong. Silakan buat pembayaran ulang.</p>`}
      <section class="bd-sign">
        <div><div class="stamp ${st[2]}">${st[3]}</div><div class="verif">Tautan verifikasi resmi: ${ORG.verifyUrl}</div></div>
        <div class="by"><div class="role">Jakarta, ${dLong(inv.created)}<br>${ORG.treasurer}</div><b>${ORG.division}</b><small>${ORG.period}</small></div>
      </section>
      ${foot('Ducati Official Club Indonesia (DOCI) • Sistem Registrasi Anggota', 'Halaman 1 dari 1 • Dokumen Sah Terverifikasi Sistem')}
    </article>`;
  }

  /* ---------- KUITANSI / BUKTI BAYAR ---------- */
  function receipt(inv) {
    const c = ctx(inv);
    const paidAt = inv.paidAt || inv.created;
    const kwt = 'KWT/DOCI/' + String(inv.id).replace(/^INV\/DOCI\//, '');
    const trx = 'TRX-' + String(inv.method || 'PG').toUpperCase().slice(0, 3) + '-' + String(seqOf(inv.id)).replace(/\D/g, '').padStart(10, '0');
    const member = inv.type === 'membership';
    const until = inv.activeUntil ? new Date(inv.activeUntil) : null;
    const statusLine = member
      ? `Status Keanggotaan DOCI: <b>AKTIF${until ? ' (Periode ' + (until.getFullYear() - 1) + ' – ' + until.getFullYear() + ')' : ''}</b>`
      : `Status Pendaftaran: <b>TERDAFTAR${c.ev ? ' — ' + esc(c.ev.title) : ''}</b>`;
    const check = icon ? icon('check-circle') : '✓';

    const left = [row('Nama Anggota:', esc(c.name)), member ? row('NRA (No. Anggota):', esc(inv.memberId || '—'), 'red') : '', row('ID Pendaftaran:', esc(inv.regNo || '—')), c.ev ? row('Kegiatan:', esc(c.ev.title)) : row('Model Motor:', esc(c.bike || '—')), row('Chapter Regional:', esc(c.chapter))].join('');
    const rcpt = inv.va ? row('Nomor Tujuan (VA):', esc(inv.va), 'mono') : row('Rekening Tujuan:', `${ORG.bank.name.replace('BANK ', '')} - ${ORG.bank.no.replace(/\s/g, '')} (Kas DOCI)`);
    const right = [row('Metode Pembayaran:', esc(c.method || 'Transfer Bank')), rcpt, row('No. Referensi:', esc(trx), 'mono'), row('Waktu Validasi:', dtWib(paidAt)), row('Kanal Verifikasi:', 'Sistem Otomatis / Valid', 'green')].join('');

    const rows = inv.items.map((i, k) => `<tr><td class="c">${k + 1}</td><td><div class="n">${esc(i.label)}</div></td><td class="c">${i.qty || 1}</td><td class="r num">${rp(i.amount)}</td><td class="st">LUNAS</td></tr>`).join('') + (c.fee ? `<tr><td class="c">${inv.items.length + 1}</td><td><div class="n">Biaya Layanan Pembayaran${c.method ? ' (' + esc(c.method) + ')' : ''}</div></td><td class="c">1</td><td class="r num">${rp(c.fee)}</td><td class="st">LUNAS</td></tr>` : '');

    const info = member
      ? `<p class="bd-note bd-note--info"><b>Informasi Keanggotaan:</b> Nomor Register Anggota (NRA) Anda kini telah teregistrasi di database pusat DOCI &amp; Desmo Owners Club (Bologna, Italia). Kartu anggota digital sudah dapat diakses di Area Member. Konfirmasi dikirimkan otomatis melalui WhatsApp resmi klub.</p>`
      : `<p class="bd-note bd-note--info"><b>Informasi Kegiatan:</b> Pendaftaran Anda telah terkonfirmasi. QR check-in tersedia di menu <b>Kegiatan Saya</b>; tunjukkan kepada panitia di meeting point.</p>`;

    return `<article class="bd-paper bd-paper--paid" aria-label="Kuitansi ${esc(kwt)}">
      ${head('Bukti Bayar', [['No. Kuitansi', esc(kwt)], ['Ref. Invoice', esc(inv.id)], ['Tanggal Bayar', dtWib(paidAt)]])}
      <section class="bd-banner">
        <div><div class="t">${check}<span>Pembayaran Telah Diterima &amp; Diverifikasi</span></div><div class="s">${statusLine}</div></div>
        <div class="amt"><small>JUMLAH LUNAS</small><strong>${rp(c.total)}</strong></div>
      </section>
      <section class="bd-panels">
        <div class="bd-panel"><h3>Diterima Dari (Data Anggota Resmi)</h3><dl>${left}</dl></div>
        <div class="bd-panel"><h3>Detail Transaksi Pembayaran</h3><dl>${right}</dl></div>
      </section>
      <table class="bd-table"><thead><tr><th class="c" style="width:44px">No</th><th>Rincian Biaya yang Telah Diselesaikan</th><th class="c" style="width:56px">Qty</th><th class="r" style="width:120px">Nominal</th><th class="c" style="width:100px">Status</th></tr></thead><tbody>${rows}</tbody></table>
      <section class="bd-sum">
        <div class="bd-words"><h4>Terbilang (Amount in Words):</h4><p>"${words(c.total)}"</p></div>
        <div class="bd-totals">
          <div><span>Subtotal Item</span><span>${rp(c.subtotal)}</span></div>
          ${c.fee ? `<div><span>Biaya Layanan</span><span>${rp(c.fee)}</span></div>` : ''}
          <div class="grand"><span>Total Dibayar</span><span>${rp(c.total)}</span></div>
        </div>
      </section>
      ${info}
      <section class="bd-sign">
        <div class="qr">${qrSvg(kwt, 74)}<div><b>Verifikasi Digital Sah</b>Pindai untuk validasi kuitansi${member ? ' &amp; NRA' : ''} online<br>ID: ${esc('DOCI-' + new Date(paidAt).getFullYear() + '-VAL-' + String(seqOf(inv.id)).replace(/\D/g, '').slice(-5))}</div></div>
        <div class="by"><div class="role">Jakarta, ${dLong(paidAt)}<br>Bendahara &amp; Biro Keuangan DOCI,</div><b>Divisi Finance &amp; Membership DOCI</b><small>${ORG.period.replace('-', '–')}</small></div>
      </section>
      ${foot('Ducati Official Club Indonesia (DOCI) • Kuitansi Resmi Pembayaran Member', 'Kuitansi Elektronik Sah Tanpa Tanda Tangan Basah')}
    </article>`;
  }

  /* ---------- tampilkan di layar (skala otomatis, A4 saat cetak) ---------- */
  function mount(root, html) {
    root.innerHTML = `<div class="bd-stage" id="bd-stage"><div class="bd-scale" id="bd-scale">${html}</div></div>`;
    const stage = root.querySelector('#bd-stage'), sc = root.querySelector('#bd-scale'), paper = sc.firstElementChild;
    const fit = () => { const s = Math.min(1, (window.innerWidth - 24) / 794); sc.style.transform = `scale(${s})`; stage.style.height = Math.round(paper.offsetHeight * s) + 'px'; };
    fit(); window.addEventListener('resize', fit);
    window.addEventListener('beforeprint', () => { sc.style.transform = 'none'; stage.style.height = 'auto'; });
    window.addEventListener('afterprint', fit);
  }

  window.DOCI.BillDoc = { invoice, receipt, mount, terbilang: words };
})();
