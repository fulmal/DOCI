/* OTP flow (nomor telepon +62) — dipakai di halaman Masuk & Daftar.
   Simulasi: kode OTP demo = 123456. Pada produksi dikirim via WhatsApp/SMS (AUTH-02).
   Aturan (semua dicek di browser untuk prototipe; produksi wajib divalidasi di server):
   - Nomor: hanya angka/spasi/tanda hubung/+, format 08xx / 62xx / +628xx.
   - Kode berlaku 5 menit; kirim ulang tiap 60 dtk, maksimal 3× per 15 menit per nomor.
   - 5× salah → diblokir 15 menit per nomor (tetap berlaku setelah halaman dimuat ulang); CAPTCHA muncul setelah 3× salah. */
(function () {
  const { icon, normPhone, esc, fmt, Store, toast, Auth } = window.DOCI;
  const DEMO_CODE = '123456';
  const TTL = 5 * 60 * 1000, WINDOW = 15 * 60 * 1000, COOLDOWN = 60, MAX_SENDS = 3, MAX_FAILS = 5, CAPTCHA_AT = 3;

  /* ---- status per nomor, disimpan di localStorage agar tidak hilang saat refresh ---- */
  const mapGet = (k) => { const v = Store.get(k, {}); return v && typeof v === 'object' ? v : {}; };
  const blockedUntil = (p) => { const b = mapGet('otp_block')[p]; return b && b > Date.now() ? b : 0; };
  const setBlock = (p) => { const m = mapGet('otp_block'); m[p] = Date.now() + WINDOW; Store.set('otp_block', m); };
  const failsOf = (p) => { const r = mapGet('otp_fails')[p]; return r && Date.now() - r.at < WINDOW ? r.n : 0; };
  const setFails = (p, n) => { const m = mapGet('otp_fails'); if (n) m[p] = { n, at: Date.now() }; else delete m[p]; Store.set('otp_fails', m); };
  const sendsOf = (p) => (mapGet('otp_sends')[p] || []).filter(t => Date.now() - t < WINDOW);
  const addSend = (p) => { const m = mapGet('otp_sends'); m[p] = sendsOf(p).concat(Date.now()); Store.set('otp_sends', m); };
  const nextSendAt = (p) => new Date(sendsOf(p)[0] + WINDOW);

  function OtpFlow({ root, mode = 'login', onVerified, cta }) {
    const st = { phone: '', issued: 0, timer: null, left: 0, busy: false };

    function phoneView(err = '', raw = '') {
      root.innerHTML = `
        <div id="phone-form">
          <div class="field ${err ? 'has-error' : ''}">
            <label for="phone">Nomor telepon (WhatsApp)<span class="req" aria-hidden="true">*</span></label>
            <div class="phone-field"><span class="phone-prefix"><span class="flag-id" aria-hidden="true"></span>+62</span>
              <input class="input" id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="0812 3456 7890" value="${esc(raw)}" aria-describedby="phone-err phone-help" ${err ? 'aria-invalid="true"' : ''} required></div>
            <span class="help" id="phone-help">Format 08xx otomatis diubah menjadi +628xx.</span>
            <span class="error-text" id="phone-err" role="alert">${icon('alert', 'icon--16')}<span>${err}</span></span>
          </div>
          <button class="btn btn--block btn--lg" type="button" id="phone-send">${cta || 'Kirim OTP'}</button>
        </div>`;
      const f = root.querySelector('#phone-form'), inp = f.querySelector('#phone');
      inp.addEventListener('input', () => { f.querySelector('.field').classList.remove('has-error'); inp.removeAttribute('aria-invalid'); });
      /* sengaja bukan <form>: di daftar.html OTP berada di dalam <form> langkah, dan <form> bersarang dibuang parser HTML */
      const send = () => submitPhone(inp.value, f);
      f.querySelector('#phone-send').addEventListener('click', send);
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
      inp.focus();
    }

    function submitPhone(raw, f) {
      const fail = (m) => phoneView(m, raw);
      const txt = String(raw || '').trim();
      if (!txt) return fail('Nomor telepon wajib diisi.');
      if (/[^\d\s+().-]/.test(txt)) return fail('Nomor hanya boleh berisi angka. Hapus huruf atau simbol lain ya.');
      const p = normPhone(txt);
      if (!p) return fail('Nomor belum sesuai format. Gunakan 08xx atau +628xx, total 10–13 digit.');
      if (blockedUntil(p)) return blockView(p);
      if (mode === 'login' && !Auth.users()[p]) return fail('Nomor telepon belum terdaftar. <a href="daftar.html">Daftar dulu, yuk?</a>');
      if (mode === 'signup' && Auth.users()[p]) return fail('Nomor ini sudah terdaftar sebagai member. <a href="masuk.html">Masuk saja, yuk?</a>');
      if (sendsOf(p).length >= MAX_SENDS) return fail(`Batas kirim OTP tercapai (maks ${MAX_SENDS}× per 15 menit). Coba lagi pukul ${fmt.time(nextSendAt(p))}.`);
      const sub = f.querySelector('#phone-send'); sub.setAttribute('aria-busy', 'true'); sub.disabled = true; sub.textContent = 'Mengirim…';
      setTimeout(() => {
        st.phone = p; sendCode(); otpView();
        toast({ type: 'info', title: 'Kode OTP terkirim', msg: 'Mode demo: gunakan kode 123456. (Pada sistem nyata dikirim via WhatsApp/SMS.)', timeout: 9000 });
      }, 650);
    }

    /* kirim kode baru: catat waktu terbit (untuk masa berlaku) & hitungan kirim ulang */
    function sendCode() { st.issued = Date.now(); addSend(st.phone); st.left = COOLDOWN; }

    function paintResend() {
      const btn = root.querySelector('#resend'); if (!btn) { clearInterval(st.timer); return; }
      const used = sendsOf(st.phone).length;
      if (used >= MAX_SENDS) { btn.disabled = true; btn.textContent = `Batas kirim ulang tercapai (coba lagi ${fmt.time(nextSendAt(st.phone))})`; clearInterval(st.timer); return; }
      if (st.left <= 0) { btn.disabled = false; btn.textContent = `Kirim ulang OTP (${MAX_SENDS - used} kesempatan)`; clearInterval(st.timer); return; }
      btn.disabled = true; btn.textContent = `Kirim ulang dalam ${st.left} dtk`;
    }
    /* timer dijalankan sekali per pengiriman; render ulang (mis. kode salah) tidak mengulang hitungan */
    function startTimer() { clearInterval(st.timer); paintResend(); st.timer = setInterval(() => { st.left--; paintResend(); }, 1000); }

    function otpView(err = '') {
      const fails = failsOf(st.phone);
      root.innerHTML = `
        <div class="stack" id="otp-wrap">
          <p style="margin:0">Masukkan 6 digit kode yang dikirim ke <b class="mono">${fmt.phone(st.phone)}</b>. Kode berlaku 5 menit.</p>
          <div class="otp ${err ? 'has-error' : ''}" role="group" aria-label="Kode OTP 6 digit">
            ${Array.from({ length: 6 }, (_, i) => `<input inputmode="numeric" pattern="[0-9]*" autocomplete="${i === 0 ? 'one-time-code' : 'off'}" aria-label="Digit ${i + 1}" aria-describedby="otp-err" ${err ? 'aria-invalid="true"' : ''}>`).join('')}
          </div>
          <span class="error-text" id="otp-err" role="alert" style="${err ? 'display:flex;justify-content:center' : ''}">${err ? icon('alert', 'icon--16') + '<span>' + err + '</span>' : ''}</span>
          ${fails >= CAPTCHA_AT ? `<label class="check" style="justify-content:center"><input type="checkbox" id="captcha"><span>Saya bukan robot (CAPTCHA)</span></label>` : ''}
          <button class="btn btn--block btn--lg" id="verify" type="button">Verifikasi</button>
          <div class="resend"><button type="button" id="resend" disabled>Kirim ulang</button> · <button type="button" id="change" style="text-decoration:underline">Ubah nomor</button></div>
          <div class="sr-only" aria-live="polite" id="otp-live"></div>
        </div>`;
      const boxes = Array.from(root.querySelectorAll('.otp input'));
      const code = () => boxes.map(x => x.value).join('');
      const fill = (digits, from) => { digits.slice(0, 6 - from).split('').forEach((c, k) => { boxes[from + k].value = c; }); boxes[Math.min(from + digits.length, 5)].focus(); if (code().length === 6) verify(code()); };
      boxes[0].focus();
      boxes.forEach((b, i) => {
        b.addEventListener('input', () => {
          const d = b.value.replace(/\D/g, '');
          if (!d) { b.value = ''; return; }
          if (d.length > 1) { b.value = ''; fill(d, i); return; } /* autofill / tempel banyak digit */
          b.value = d; if (i < 5) boxes[i + 1].focus();
          if (code().length === 6) verify(code());
        });
        b.addEventListener('focus', () => b.select());
        b.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !b.value && i > 0) { boxes[i - 1].focus(); boxes[i - 1].value = ''; e.preventDefault(); }
          else if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
          else if (e.key === 'ArrowRight' && i < 5) boxes[i + 1].focus();
          else if (e.key === 'Enter') { e.preventDefault(); root.querySelector('#verify').click(); }
        });
        b.addEventListener('paste', (e) => {
          const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (!t) return; e.preventDefault();
          boxes.forEach(x => { x.value = ''; }); fill(t, 0);
        });
      });
      root.querySelector('#verify').addEventListener('click', () => { const c = code(); if (c.length < 6) { otpView(c.length ? 'Lengkapi 6 digit kode OTP dulu ya.' : 'Masukkan 6 digit kode OTP dulu ya.'); return; } verify(c); });
      root.querySelector('#change').addEventListener('click', () => { clearInterval(st.timer); phoneView('', st.phone.replace('+62', '0')); });
      root.querySelector('#resend').addEventListener('click', () => {
        if (sendsOf(st.phone).length >= MAX_SENDS) return toast({ type: 'warning', title: 'Batas kirim ulang tercapai', msg: `Maksimal ${MAX_SENDS}× per 15 menit. Coba lagi pukul ${fmt.time(nextSendAt(st.phone))}.` });
        sendCode(); otpView(); toast({ type: 'info', msg: 'Kode OTP baru dikirim, kode sebelumnya tidak berlaku. Mode demo: 123456.' });
      });
      startTimer();
    }

    function blockView(p) {
      clearInterval(st.timer);
      const until = blockedUntil(p || st.phone);
      root.innerHTML = `<div class="banner banner--danger" role="alert">${icon('lock')}<div><b>Verifikasi OTP diblokir sementara</b>Terlalu banyak kode salah untuk nomor ini. Coba lagi pukul ${fmt.time(new Date(until))}. Jika butuh bantuan, hubungi admin.</div></div>
        <div class="form-actions"><button type="button" class="btn btn--ghost" id="other">Gunakan nomor lain</button></div>`;
      root.querySelector('#other').addEventListener('click', () => phoneView());
    }

    function verify(c) {
      if (st.busy) return;
      const p = st.phone;
      if (blockedUntil(p)) return blockView(p);
      if (failsOf(p) >= CAPTCHA_AT && !root.querySelector('#captcha')?.checked) return otpView('Centang CAPTCHA dulu sebelum memverifikasi.');
      if (!/^\d{6}$/.test(c)) return otpView('Kode OTP harus 6 digit angka.');
      if (Date.now() - st.issued > TTL) return otpView('Kode OTP sudah kedaluwarsa (berlaku 5 menit). Kirim ulang untuk mendapat kode baru.');
      st.busy = true;
      const btn = root.querySelector('#verify'); btn.setAttribute('aria-busy', 'true'); btn.disabled = true; btn.textContent = 'Memverifikasi…';
      root.querySelectorAll('.otp input').forEach(x => { x.disabled = true; });
      setTimeout(() => {
        st.busy = false;
        if (c === DEMO_CODE) {
          clearInterval(st.timer); setFails(p, 0);
          root.innerHTML = `<div class="text-center stack" style="padding:16px 0"><div class="pay-ok-anim" style="color:var(--color-success)">${icon('check-circle', 'icon--32')}</div><b style="font-family:var(--font-display)">Nomor terverifikasi</b><span class="muted small" aria-live="polite">Mengarahkan Anda…</span></div>`;
          setTimeout(() => onVerified(p), 700);
        } else {
          const n = failsOf(p) + 1; setFails(p, n);
          if (n >= MAX_FAILS) { setBlock(p); setFails(p, 0); return blockView(p); }
          otpView(`Kode OTP belum sesuai. Cek lagi ya (sisa ${MAX_FAILS - n} percobaan).`);
        }
      }, 500);
    }

    phoneView();
    return { st };
  }
  window.DOCI.OtpFlow = OtpFlow;
})();
