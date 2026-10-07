/* ==========================================================================
   DOCI — sample data (prototype). Seluruh konten di sini adalah CONTOH,
   akan diganti oleh data dari backend/CMS pada implementasi sebenarnya.
   ========================================================================== */
(function () {
  const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  const day = (offset, h = 7, m = 0) => { const d = new Date(TODAY); d.setDate(d.getDate() + offset); d.setHours(h, m, 0, 0); return d; };

  const CATEGORIES = {
    touring:  { label: 'Touring',   color: '#D5001C', text: '#fff' },
    riding:   { label: 'Riding',    color: '#B87400', text: '#fff' },
    trackday: { label: 'Track Day', color: '#141416', text: '#fff' },
    sosial:   { label: 'Sosial',    color: '#0F9D58', text: '#fff' },
    meeting:  { label: 'Meeting',   color: '#1A73E8', text: '#fff' }
  };

  const CHAPTERS = [
    { id: 'jakarta',  name: 'Chapter Jakarta',   city: 'Jakarta',   members: 312, coord: 'Koordinator menyusul', agenda: 'Sunday Morning Ride tiap Minggu pertama', lat: -6.2088, lng: 106.8456 },
    { id: 'bandung',  name: 'Chapter Bandung',   city: 'Bandung',   members: 164, coord: 'Koordinator menyusul', agenda: 'Kopdar & ngopi tiap Sabtu malam', lat: -6.9175, lng: 107.6191 },
    { id: 'surabaya', name: 'Chapter Surabaya',  city: 'Surabaya',  members: 148, coord: 'Koordinator menyusul', agenda: 'Kopdar bulanan Jumat ke-3', lat: -7.2575, lng: 112.7521 },
    { id: 'bali',     name: 'Chapter Bali',      city: 'Denpasar',  members: 96,  coord: 'Koordinator menyusul', agenda: 'Sunrise ride Sanur–Kintamani', lat: -8.6705, lng: 115.2126 },
    { id: 'yogya',    name: 'Chapter Yogyakarta',city: 'Yogyakarta',members: 88,  coord: 'Koordinator menyusul', agenda: 'Heritage ride & kuliner', lat: -7.7956, lng: 110.3695 },
    { id: 'semarang', name: 'Chapter Semarang',  city: 'Semarang',  members: 74,  coord: 'Koordinator menyusul', agenda: 'Ride Ungaran–Bandungan', lat: -6.9667, lng: 110.4167 },
    { id: 'medan',    name: 'Chapter Medan',     city: 'Medan',     members: 71,  coord: 'Koordinator menyusul', agenda: 'Touring Danau Toba (tahunan)', lat: 3.5952, lng: 98.6722 },
    { id: 'makassar', name: 'Chapter Makassar',  city: 'Makassar',  members: 52,  coord: 'Koordinator menyusul', agenda: 'Coastal ride Losari–Bantaeng', lat: -5.1477, lng: 119.4327 }
  ];

  const EVENTS = [
    {
      id: 'touring-jkt-bdg', title: 'Touring Jakarta–Bandung via Puncak', cat: 'touring', chapter: 'jakarta',
      start: day(0, 6, 0), end: day(1, 18, 0), loc: 'Monas Parkir Timur, Jakarta', city: 'Jakarta', price: 750000, quota: 60, taken: 52,
      img: 'assets/img/touring.jpg', status: 'berlangsung', tracking: true, pic: 'Tim Road Captain Jakarta',
      lat: -6.1754, lng: 106.8272,
      desc: 'Dua hari menyusuri jalur Puncak–Cianjur menuju Bandung. Formasi dipandu road captain, ada sweeper di belakang, dan live tracking aktif untuk seluruh peserta yang memberi izin lokasi.',
      rundown: [['06.00', 'Kumpul & briefing keselamatan di meeting point'], ['07.00', 'Flag-off menuju Puncak Pass'], ['10.30', 'Coffee break & dokumentasi, Cipanas'], ['13.00', 'Makan siang, Cianjur'], ['17.00', 'Tiba di Bandung, check-in hotel'], ['19.30', 'Dinner & malam keakraban']],
      syarat: ['Member DOCI aktif', 'SIM C & STNK berlaku', 'Riding gear lengkap (helm full-face, jaket, sarung tangan, sepatu)', 'Kondisi motor prima & BBM penuh saat flag-off']
    },
    {
      id: 'sunday-ride-coast', title: 'Sunday Morning Ride — Jakarta Coast', cat: 'riding', chapter: 'jakarta',
      start: day(4, 5, 30), end: day(4, 11, 0), loc: 'Plaza Senayan, Jakarta', city: 'Jakarta', price: 50000, quota: 100, taken: 64,
      img: 'assets/img/coast.jpg', status: 'terbit', pic: 'Chapter Jakarta', lat: -6.2253, lng: 106.7998,
      desc: 'Ride santai menyusuri pesisir utara Jakarta, ditutup sarapan bersama. Cocok untuk member baru yang ingin kenal rider chapter.',
      rundown: [['05.30', 'Kumpul & registrasi ulang'], ['06.00', 'Flag-off'], ['08.00', 'Foto bersama di titik pantai'], ['09.00', 'Sarapan bersama'], ['11.00', 'Bubar']],
      syarat: ['Member DOCI aktif', 'Riding gear lengkap', 'Datang 30 menit sebelum flag-off']
    },
    {
      id: 'kopdar-surabaya', title: 'Kopdar Bulanan Chapter Surabaya', cat: 'meeting', chapter: 'surabaya',
      start: day(6, 19, 0), end: day(6, 22, 0), loc: 'Kafe Rider, Jl. Darmo, Surabaya', city: 'Surabaya', price: 0, quota: 50, taken: 22,
      img: 'assets/img/meetup.jpg', status: 'terbit', pic: 'Chapter Surabaya', lat: -7.2899, lng: 112.7367,
      desc: 'Ngobrol santai, bahas rencana touring akhir tahun, dan sharing tips perawatan. Terbuka untuk member dan calon member.',
      rundown: [['19.00', 'Registrasi & ngopi'], ['19.30', 'Update kegiatan chapter'], ['20.30', 'Sharing session & tanya jawab'], ['22.00', 'Selesai']],
      syarat: ['Terbuka untuk member & calon member']
    },
    {
      id: 'trackday-series-3', title: 'DOCI Track Day Series #3', cat: 'trackday', chapter: 'jakarta',
      start: day(9, 7, 0), end: day(9, 17, 0), loc: 'Sentul International Circuit, Bogor', city: 'Bogor', price: 1250000, quota: 40, taken: 37,
      img: 'assets/img/trackday.jpg', status: 'terbit', pic: 'Tim Track Day DOCI', lat: -6.5671, lng: 106.8833,
      desc: 'Sesi bebas di sirkuit dengan grup Beginner, Intermediate, dan Advanced. Instruktur berlisensi mendampingi, marshal dan ambulans siaga sepanjang hari.',
      rundown: [['07.00', 'Registrasi & technical inspection'], ['08.30', 'Riders briefing'], ['09.00', 'Sesi 1 (Beginner / Intermediate / Advanced)'], ['12.00', 'Istirahat & makan siang'], ['13.00', 'Sesi 2 & 3'], ['16.30', 'Penutupan & foto bersama']],
      syarat: ['Member DOCI aktif', 'Leather suit / pelindung tubuh lengkap', 'Motor lolos technical inspection', 'Menandatangani pernyataan risiko']
    },
    {
      id: 'baksos-bandung', title: 'Bakti Sosial & Donor Darah Chapter Bandung', cat: 'sosial', chapter: 'bandung',
      start: day(14, 8, 0), end: day(14, 14, 0), loc: 'Lembang, Kab. Bandung Barat', city: 'Bandung', price: 0, quota: 80, taken: 31,
      img: 'assets/img/social.jpg', status: 'terbit', pic: 'Chapter Bandung', lat: -6.8120, lng: 107.6180,
      desc: 'Bagi-bagi paket sembako untuk warga desa binaan dan donor darah bekerja sama dengan PMI. Mari berkontribusi untuk sesama.',
      rundown: [['08.00', 'Kumpul & ride bersama ke lokasi'], ['09.30', 'Penyerahan paket sembako'], ['10.30', 'Donor darah (PMI)'], ['13.00', 'Makan siang & penutupan']],
      syarat: ['Member DOCI aktif', 'Kaos chapter (jika ada)']
    },
    {
      id: 'riding-clinic', title: 'Riding Clinic: Safety & Cornering', cat: 'riding', chapter: 'jakarta',
      start: day(20, 8, 0), end: day(20, 15, 0), loc: 'Lapangan Parkir JIEXPO Kemayoran', city: 'Jakarta', price: 350000, quota: 36, taken: 14,
      img: 'assets/img/detail.jpg', status: 'terbit', pic: 'Tim Safety DOCI', lat: -6.1450, lng: 106.8460,
      desc: 'Latihan teknik pengereman, body position, dan cornering aman bersama instruktur berpengalaman. Ideal sebelum ikut track day.',
      rundown: [['08.00', 'Registrasi'], ['08.30', 'Teori singkat'], ['09.30', 'Latihan slow-speed handling'], ['12.00', 'Istirahat'], ['13.00', 'Latihan braking & cornering'], ['15.00', 'Evaluasi']],
      syarat: ['Member DOCI aktif', 'Riding gear lengkap']
    },
    {
      id: 'touring-bali', title: 'Touring Bali Island Loop', cat: 'touring', chapter: 'bali',
      start: day(30, 6, 0), end: day(32, 18, 0), loc: 'Bandara Ngurah Rai, Denpasar', city: 'Denpasar', price: 2450000, quota: 30, taken: 12,
      img: 'assets/img/hero.jpg', status: 'terbit', tracking: true, pic: 'Chapter Bali', lat: -8.7467, lng: 115.1668,
      desc: 'Tiga hari keliling Pulau Dewata: Kintamani, Amed, hingga Uluwatu. Sudah termasuk penginapan, sarapan, dan dokumentasi profesional.',
      rundown: [['Hari 1', 'Denpasar → Kintamani → Ubud'], ['Hari 2', 'Ubud → Amed → Candidasa'], ['Hari 3', 'Candidasa → Uluwatu → Denpasar']],
      syarat: ['Member DOCI aktif', 'Motor sendiri atau sewa (info di grup)', 'Riding gear lengkap']
    },
    {
      id: 'rat-2026', title: 'Rapat Anggota Tahunan 2026', cat: 'meeting', chapter: 'jakarta',
      start: day(45, 10, 0), end: day(45, 15, 0), loc: 'Hotel Sekretariat, Jakarta Selatan', city: 'Jakarta', price: 0, quota: 200, taken: 38,
      img: 'assets/img/group.jpg', status: 'terbit', pic: 'Pengurus Pusat', lat: -6.2615, lng: 106.8106,
      desc: 'Laporan pertanggungjawaban pengurus, pembahasan AD/ART, dan penetapan program kerja tahun berikutnya.',
      rundown: [['10.00', 'Registrasi'], ['10.30', 'Pembukaan & laporan pengurus'], ['12.00', 'Ishoma'], ['13.00', 'Pembahasan & voting'], ['15.00', 'Penutupan']],
      syarat: ['Khusus member aktif']
    },
    {
      id: 'heritage-jogja', title: 'Touring Jogja Heritage', cat: 'touring', chapter: 'yogya',
      start: day(-12, 6, 0), end: day(-11, 17, 0), loc: 'Tugu Jogja', city: 'Yogyakarta', price: 650000, quota: 50, taken: 50,
      img: 'assets/img/coast.jpg', status: 'selesai', pic: 'Chapter Yogyakarta', lat: -7.7829, lng: 110.3671,
      desc: 'Touring dua hari menyusuri situs-situs bersejarah di sekitar Yogyakarta.', rundown: [], syarat: []
    },
    {
      id: 'charity-ride', title: 'Charity Ride untuk Panti Asuhan', cat: 'sosial', chapter: 'semarang',
      start: day(-25, 8, 0), end: day(-25, 14, 0), loc: 'Ungaran, Semarang', city: 'Semarang', price: 0, quota: 60, taken: 48,
      img: 'assets/img/social.jpg', status: 'selesai', pic: 'Chapter Semarang', lat: -7.1400, lng: 110.4000,
      desc: 'Ride bersama sekaligus penyerahan donasi untuk panti asuhan.', rundown: [], syarat: []
    }
  ];

  const NEWS = [
    { id: 'rilis-platform', title: 'DOCI Luncurkan Platform Digital Baru: Daftar Member dan Bayar Otomatis dari HP', cat: 'Berita Klub', date: day(-2), author: 'Sekretariat DOCI', img: 'assets/img/group.jpg',
      excerpt: 'Pendaftaran member, pembayaran kegiatan, hingga live tracking touring kini terintegrasi dalam satu platform yang bisa diakses dari smartphone.',
      body: ['Pengurus DOCI resmi meluncurkan platform digital baru untuk seluruh anggota dan calon anggota. Melalui platform ini, pendaftaran keanggotaan dapat diselesaikan kurang dari 15 menit, lengkap dengan pembayaran otomatis melalui virtual account, QRIS, maupun e-wallet.', 'Status pembayaran diperbarui secara real-time tanpa perlu mengunggah bukti transfer. Begitu pembayaran berhasil, membership langsung aktif dan kartu member digital terbit.', 'Platform ini juga menghadirkan kalender kegiatan terpadu, galeri dokumentasi yang bisa diunggah seluruh member, serta live tracking saat touring untuk meningkatkan keselamatan dan koordinasi peserta.'] },
    { id: 'laporan-heritage', title: 'Laporan Kegiatan: Touring Jogja Heritage Diikuti 50 Rider dari 6 Chapter', cat: 'Laporan Kegiatan', date: day(-10), author: 'Chapter Yogyakarta', img: 'assets/img/coast.jpg',
      excerpt: 'Dua hari menyusuri situs bersejarah, tanpa insiden, dengan dokumentasi lebih dari 600 foto dan video.',
      body: ['Touring Jogja Heritage berlangsung dua hari dengan rute melewati Prambanan, Kaliurang, hingga pesisir selatan. Seluruh peserta finish dengan selamat.', 'Dokumentasi lengkap sudah tersedia di galeri dan dapat diunduh oleh peserta.'] },
    { id: 'tips-cornering', title: '5 Kesalahan Cornering yang Sering Dilakukan Rider Baru Sport Bike', cat: 'Artikel', date: day(-14), author: 'Tim Safety DOCI', img: 'assets/img/trackday.jpg',
      excerpt: 'Dari pandangan mata hingga posisi badan: kenali kesalahan umum dan cara memperbaikinya sebelum ikut track day.',
      body: ['Cornering yang baik bukan soal berani, melainkan soal teknik dan konsistensi. Berikut lima kesalahan yang paling sering kami temui di sesi latihan.', '1. Melihat ke depan roda, bukan ke ujung tikungan. 2. Pengereman terlalu telat. 3. Kaku di handlebar. 4. Posisi badan tidak membantu keseimbangan. 5. Throttle on-off yang kasar.', 'Ikuti Riding Clinic DOCI untuk berlatih langsung bersama instruktur.'] },
    { id: 'baksos-lembang', title: 'Bakti Sosial Chapter Bandung: 300 Paket Sembako untuk Warga Lembang', cat: 'Laporan Kegiatan', date: day(-21), author: 'Chapter Bandung', img: 'assets/img/social.jpg',
      excerpt: 'Kolaborasi member Chapter Bandung bersama relawan setempat menyalurkan bantuan ke desa binaan.',
      body: ['Sebanyak 300 paket sembako disalurkan kepada warga desa binaan di Lembang. Kegiatan ini rutin digelar chapter setiap semester.', 'Terima kasih kepada seluruh member yang berpartisipasi.'] },
    { id: 'perawatan-musim-hujan', title: 'Checklist Perawatan Motor Sebelum Touring Musim Hujan', cat: 'Artikel', date: day(-30), author: 'Tim Teknik DOCI', img: 'assets/img/detail.jpg',
      excerpt: 'Ban, rem, rantai, dan kelistrikan: cek lima area ini agar touring tetap aman saat cuaca tidak bersahabat.',
      body: ['Musim hujan menuntut persiapan ekstra. Mulai dari kondisi ban dan kedalaman alur, kampas rem, pelumasan rantai, hingga ketahanan kelistrikan terhadap air.', 'Bawa selalu jas hujan yang layak dan lapisan pelindung untuk dokumen penting.'] },
    { id: 'pengumuman-rat', title: 'Pengumuman: Jadwal Rapat Anggota Tahunan 2026', cat: 'Berita Klub', date: day(-35), author: 'Sekretariat DOCI', img: 'assets/img/meetup.jpg',
      excerpt: 'RAT 2026 akan digelar di Jakarta. Seluruh member aktif diharapkan hadir dan menggunakan hak suaranya.',
      body: ['Pengurus Pusat mengundang seluruh member aktif menghadiri Rapat Anggota Tahunan 2026.', 'Pendaftaran kehadiran dapat dilakukan melalui kalender kegiatan.'] }
  ];

  const GALLERY = [
    { id: 'g1', type: 'photo', title: 'Formasi riding di kaki gunung', album: 'Touring Jakarta–Bandung', img: 'assets/img/hero.jpg', by: 'Raka Pratama', chapter: 'jakarta' },
    { id: 'g2', type: 'photo', title: 'Break di viewpoint pagi hari', album: 'Touring Jakarta–Bandung', img: 'assets/img/touring.jpg', by: 'Dewi Lestari', chapter: 'jakarta' },
    { id: 'g3', type: 'video', title: 'Highlight Track Day Series #2', album: 'DOCI Track Day', img: 'assets/img/trackday.jpg', by: 'Tim Dokumentasi', chapter: 'jakarta', duration: '03:42' },
    { id: 'g4', type: 'photo', title: 'Bagi-bagi paket sembako', album: 'Baksos Bandung', img: 'assets/img/social.jpg', by: 'Chapter Bandung', chapter: 'bandung' },
    { id: 'g5', type: 'photo', title: 'Detail tangki & mesin', album: 'Garage Story', img: 'assets/img/detail.jpg', by: 'Fajar Nugroho', chapter: 'bandung' },
    { id: 'g6', type: 'photo', title: 'Foto bersama sore hari', album: 'Sunday Morning Ride', img: 'assets/img/group.jpg', by: 'Chapter Jakarta', chapter: 'jakarta' },
    { id: 'g7', type: 'video', title: 'Sunrise ride pesisir', album: 'Sunday Morning Ride', img: 'assets/img/coast.jpg', by: 'Dewi Lestari', chapter: 'jakarta', duration: '01:58' },
    { id: 'g8', type: 'photo', title: 'Kopdar malam di kafe', album: 'Kopdar Surabaya', img: 'assets/img/meetup.jpg', by: 'Chapter Surabaya', chapter: 'surabaya' },
    { id: 'g9', type: 'photo', title: 'Tikungan Puncak', album: 'Touring Jakarta–Bandung', img: 'assets/img/hero.jpg', by: 'Bima Aditya', chapter: 'jakarta' },
    { id: 'g10', type: 'photo', title: 'Lineup parkir viewpoint', album: 'Touring Jogja Heritage', img: 'assets/img/touring.jpg', by: 'Chapter Yogyakarta', chapter: 'yogya' },
    { id: 'g11', type: 'photo', title: 'Pesisir selatan', album: 'Touring Jogja Heritage', img: 'assets/img/coast.jpg', by: 'Sari Wulandari', chapter: 'yogya' },
    { id: 'g12', type: 'photo', title: 'Kumpul rutin chapter', album: 'Kopdar Surabaya', img: 'assets/img/group.jpg', by: 'Chapter Surabaya', chapter: 'surabaya' }
  ];

  const FAQ = [
    ['Apa saja syarat menjadi member DOCI?', 'Pemilik atau pengguna motor Ducati, berusia minimal 17 tahun, memiliki SIM C yang berlaku, dan menyetujui AD/ART serta kode etik klub.'],
    ['Berapa biaya keanggotaan dan berapa lama masa berlakunya?', 'Biaya join Rp 1.500.000, sudah termasuk pendaftaran dan iuran tahun pertama, dengan masa berlaku 12 bulan. Nominal final mengikuti ketetapan pengurus.'],
    ['Bagaimana cara membayar? Apakah perlu upload bukti transfer?', 'Tidak perlu. Pembayaran diproses otomatis lewat virtual account, QRIS, e-wallet, atau kartu. Status berubah menjadi Berhasil dalam hitungan detik dan membership langsung aktif.'],
    ['Apakah pendaftaran harus menunggu persetujuan pengurus?', 'Membership aktif otomatis setelah pembayaran berhasil. Jika organisasi menerapkan approval pengurus, proses itu tidak menahan akses dasar Anda sebagai member.'],
    ['Bagaimana jika invoice kedaluwarsa?', 'Invoice yang tidak dibayar sampai batas waktu akan kedaluwarsa otomatis. Anda akan menerima notifikasi dan bisa membayar ulang dengan satu klik dari halaman status pendaftaran.'],
    ['Apakah data saya aman?', 'Nomor telepon, alamat, dan dokumen tidak pernah tampil di direktori publik. Kami mengikuti UU Pelindungan Data Pribadi (UU No. 27/2022) dan tidak menyimpan data kartu pembayaran.']
  ];

  const BENEFITS = [
    ['calendar', 'Akses Kegiatan', 'Ikut touring, riding, track day, dan bakti sosial di seluruh chapter.'],
    ['qr', 'Kartu Member Digital', 'Member ID unik dan QR verifikasi, siap dipindai saat check-in.'],
    ['navigation', 'Live Tracking Touring', 'Pantau posisi rombongan real-time dan tombol SOS saat di jalan.'],
    ['image', 'Arsip Dokumentasi', 'Unggah dan simpan foto/video kegiatan di galeri komunitas.'],
    ['users', 'Jaringan Brotherhood', 'Terhubung dengan rider Ducati se-Indonesia lewat chapter di kotamu.'],
    ['star', 'Partner Benefit', 'Diskon bengkel, gear, dan merchandise dari partner resmi klub.']
  ];

  const DOCS = [
    { cat: 'AD/ART', title: 'Anggaran Dasar (AD) DOCI', size: 'PDF · 1,2 MB', ver: 'v2024.1' },
    { cat: 'AD/ART', title: 'Anggaran Rumah Tangga (ART) DOCI', size: 'PDF · 1,8 MB', ver: 'v2024.1' },
    { cat: 'AD/ART', title: 'Keputusan Munas Terakhir', size: 'PDF · 640 KB', ver: 'v2024' },
    { cat: 'Regulasi', title: 'Kode Etik Anggota', size: 'PDF · 420 KB', ver: 'v2023.2' },
    { cat: 'Regulasi', title: 'Aturan Keselamatan Touring & Track Day', size: 'PDF · 980 KB', ver: 'v2025.1' },
    { cat: 'Regulasi', title: 'Kebijakan Privasi & Perlindungan Data (UU PDP)', size: 'PDF · 350 KB', ver: 'v2026.1' },
    { cat: 'Unduhan', title: 'Formulir Pendaftaran Offline', size: 'PDF · 210 KB', ver: 'v1' },
    { cat: 'Unduhan', title: 'Template Proposal Kegiatan Chapter', size: 'DOCX · 96 KB', ver: 'v3' },
    { cat: 'Unduhan', title: 'Panduan Logo & Brand DOCI', size: 'PDF · 2,4 MB', ver: 'v1.0' }
  ];

  /* Pseudo-random deterministic generator for admin sample data */
  function rng(seed) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }
  const R = rng(20261003);
  const FIRST = ['Raka', 'Dewi', 'Fajar', 'Bima', 'Sari', 'Anwar', 'Rina', 'Dimas', 'Putri', 'Ahmad', 'Nadia', 'Yoga', 'Intan', 'Reza', 'Maya', 'Hendra', 'Citra', 'Eko', 'Tiara', 'Galih', 'Wulan', 'Arif', 'Laras', 'Bagas'];
  const LAST = ['Pratama', 'Lestari', 'Nugroho', 'Aditya', 'Wulandari', 'Hidayat', 'Kusuma', 'Santoso', 'Permata', 'Wijaya', 'Rahman', 'Saputra', 'Maharani', 'Firmansyah', 'Utami', 'Setiawan'];
  const BIKES = ['Panigale V4', 'Panigale V2', 'Monster 937', 'Streetfighter V2', 'Multistrada V4', 'Scrambler Icon', 'DesertX', 'Hypermotard 950', 'Diavel V4', 'SuperSport 950'];
  const pick = (a) => a[Math.floor(R() * a.length)];

  const MEMBERS = Array.from({ length: 58 }, (_, i) => {
    const status = R() < .82 ? 'aktif' : (R() < .6 ? 'kedaluwarsa' : 'review');
    const chapter = pick(CHAPTERS);
    const joined = day(-Math.floor(R() * 900) - 5);
    return {
      id: 'DOCI-' + String(joined.getFullYear()).slice(2) + '-' + String(100 + i * 7).padStart(5, '0'),
      name: pick(FIRST) + ' ' + pick(LAST), chapter: chapter.id, chapterName: chapter.name, city: chapter.city,
      bike: 'Ducati ' + pick(BIKES), year: 2018 + Math.floor(R() * 8), joined, status,
      phone: '+62812' + String(10000000 + Math.floor(R() * 89999999))
    };
  });

  const METHODS = ['BCA Virtual Account', 'BNI Virtual Account', 'QRIS', 'GoPay', 'OVO', 'DANA', 'Mandiri Virtual Account', 'ShopeePay', 'Kartu Kredit/Debit'];
  const TX = Array.from({ length: 64 }, (_, i) => {
    const r = R();
    const status = r < .74 ? 'berhasil' : r < .86 ? 'menunggu' : r < .94 ? 'kedaluwarsa' : r < .97 ? 'gagal' : 'refunded';
    const isEvent = R() < .55;
    const ev = pick(EVENTS.filter(e => e.price > 0));
    const m = pick(MEMBERS);
    const amount = isEvent ? ev.price : 1500000;
    return {
      inv: 'INV/DOCI/' + '202610' + '/' + String(10234 - i).padStart(5, '0'),
      who: m.name, whoId: m.id, item: isEvent ? ev.title : 'Membership Baru (Biaya Join)',
      type: isEvent ? 'Kegiatan' : 'Membership', amount, method: pick(METHODS), status,
      date: new Date(TODAY.getTime() - Math.floor(R() * 40 * 86400000) - Math.floor(R() * 86400000)),
      manual: R() < .03
    };
  }).sort((a, b) => b.date - a.date);
  TX[7].manual = true; TX[7].status = 'berhasil';

  const MODERATION = [
    { id: 'm1', title: 'Foto formasi touring', by: 'Raka Pratama', album: 'Touring Jakarta–Bandung', img: 'assets/img/hero.jpg', at: day(-1, 19, 12), reason: 'Dilaporkan: menampilkan plat nomor jelas', status: 'dilaporkan' },
    { id: 'm2', title: 'Video lap pertama', by: 'Bima Aditya', album: 'DOCI Track Day', img: 'assets/img/trackday.jpg', at: day(0, 8, 3), reason: 'Menunggu review (video > 5 menit)', status: 'review' },
    { id: 'm3', title: 'Kopdar malam minggu', by: 'Putri Maharani', album: 'Kopdar Surabaya', img: 'assets/img/meetup.jpg', at: day(-2, 21, 40), reason: 'Dilaporkan: konten promosi non-klub', status: 'dilaporkan' },
    { id: 'm4', title: 'Detail knalpot', by: 'Galih Setiawan', album: 'Garage Story', img: 'assets/img/detail.jpg', at: day(0, 6, 31), reason: 'Menunggu review', status: 'review' }
  ];

  const PERMISSIONS = [
    ['Lihat konten publik', [1, 1, 1, 1]],
    ['Unggah dokumentasi', [0, 1, 1, 1]],
    ['Daftar & bayar kegiatan', [0, 1, 1, 1]],
    ['Berbagi lokasi (peserta)', [0, 1, 1, 1]],
    ['Lihat peta live tracking', [0, 1, 1, 1]],
    ['Lihat detail member', [0, 0, 1, 1]],
    ['Approve / suspend member', [0, 0, 1, 1]],
    ['Buat & edit kegiatan', [0, 0, 1, 1]],
    ['Moderasi konten', [0, 0, 1, 1]],
    ['Lihat seluruh transaksi', [0, 0, 1, 1]],
    ['Proses refund', [0, 0, 0, 1]],
    ['Kelola CMS (berita, halaman)', [0, 0, 1, 1]],
    ['Kelola role & akun admin', [0, 0, 0, 1]],
    ['Konfigurasi sistem & gateway', [0, 0, 0, 1]],
    ['Lihat audit log lengkap', [0, 0, 0, 1]]
  ];

  const DEMO_USERS = {
    '+6281200000001': { name: 'Raka Pratama', role: 'member', memberId: 'DOCI-24-00142', chapter: 'jakarta', bike: 'Ducati Panigale V4 (2023, Merah)', email: 'raka@contoh.id', city: 'Jakarta Selatan', activeUntil: day(212).toISOString(), status: 'aktif' },
    '+6281200000002': { name: 'Fajar Nugroho', role: 'admin', memberId: 'DOCI-22-00031', chapter: 'bandung', bike: 'Ducati Monster 937 (2022)', email: 'fajar@contoh.id', city: 'Bandung', activeUntil: day(300).toISOString(), status: 'aktif' },
    '+6281200000003': { name: 'Anwar Hidayat', role: 'superadmin', memberId: 'DOCI-18-00001', chapter: 'jakarta', bike: 'Ducati Multistrada V4 (2024)', email: 'anwar@contoh.id', city: 'Jakarta', activeUntil: day(340).toISOString(), status: 'aktif' }
  };

  window.DOCI_DATA = { TODAY, day, CATEGORIES, CHAPTERS, EVENTS, NEWS, GALLERY, FAQ, BENEFITS, DOCS, MEMBERS, TX, MODERATION, PERMISSIONS, DEMO_USERS, METHODS, FIRST, LAST, BIKES };
})();
