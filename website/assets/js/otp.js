/* OTP flow (nomor telepon +62) — dipakai di halaman Masuk & Daftar.
   Simulasi: kode OTP demo = 123456. Pada produksi dikirim via WhatsApp/SMS (AUTH-02). */
(function () {
  const { icon, normPhone, esc, fmt, Store, toast, Auth } = window.DOCI;
  const DEMO_CODE = '123456';

  function OtpFlow({ root, mode = 'login', onVerified, cta }) {
    const st = { stage: 'phone', phone: '', sent: 0, fails: 0, timer: null, left: 0, captchaOk: false };
    const blocked = () => { const b = Store.get('otp_block'); return b && b > Date.now() ? b : 0; };

    function phoneView(err = '', raw = '') {
      root.innerHTML = `
        <form novalidate id="phone-form">
          <div class="field ${err ? 'has-error' : ''}">
            <label for="phone">Nomor telepon (WhatsApp)<span class="req" aria-hidden="true">*</span></label>
            <div class="phone-field"><span class="phone-prefix"><span class="flag-id" aria-hidden="true"></span>+62</span>
              <input class="input" id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="0812 3456 7890" value="${esc(raw)}" aria-describedby="phone-err phone-help" required></div>
            <span class="help" id="phone-help">Format 08xx otomatis diubah menjadi +628xx.</span>
            <span class="error-text" id="phone-err" role="alert">${icon('alert', 'icon--16')}<span>${err}</span></span>
          </div>
          <button class="btn btn--block btn--lg" type="submit">${cta || 'Kirim OTP'}</button>
        </form>`;
      const f = root.querySelector('#phone-form'), inp = f.querySelector('#phone');
      inp.addEventListener('input', () => { f.querySelector('.field').classList.remove('has-error'); });
      f.addEventListener('submit', (e) => { e.preventDefault(); submitPhone(inp.value, f); });
      if (!err) inp.focus();
    }

    function submitPhone(raw, f) {
      const p = normPhone(raw);
      const fail = (m) => phoneView(m, raw);
      const b = blocked();
      if (b) return blockView();
      if (!p) return fail('Nomor belum sesuai format. Gunakan 08xx atau +628xx ya.');
      if (mode === 'login' && !Auth.users()[p]) return fail('Nomor telepon belum terdaftar. <a href="daftar.html">Daftar dulu, yuk?</a>');
      if (mode === 'signup' && Auth.users()[p]) return fail('Nomor ini sudah terdaftar sebagai member. <a href="masuk.html">Masuk saja, yuk?</a>');
      const sub = f.querySelector('button[type=submit]'); sub.setAttribute('aria-busy', 'true'); sub.textContent = 'Mengirim…';
      setTimeout(() => { st.phone = p; st.sent = 1; otpView(); toast({ type: 'info', title: 'Kode OTP terkirim', msg: 'Mode demo: gunakan kode 123456. (Pada sistem nyata dikirim via WhatsApp/SMS.)', timeout: 9000 }); }, 650);
    }

    function startTimer() {
      clearInterval(st.timer); st.left = 60;
      const tick = () => {
        const btn = root.querySelector('#resend'); if (!btn) { clearInterval(st.timer); return; }
        if (st.left <= 0) { btn.disabled = false; btn.textContent = 'Kirim ulang OTP'; clearInterval(st.timer); return; }
        btn.disabled = true; btn.textContent = `Kirim ulang dalam ${st.left} dtk`; st.left--;
      };
      tick(); st.timer = setInterval(tick, 1000);
    }

    function otpView(err = '') {
      root.innerHTML = `
        <div class="stack" id="otp-wrap">
          <p style="margin:0">Masukkan 6 digit kode yang dikirim ke <b class="mono">${fmt.phone(st.phone)}</b>. Kode berlaku 5 menit.</p>
          <div class="otp ${err ? 'has-error' : ''}" role="group" aria-label="Kode OTP 6 digit">
            ${Array.from({ length: 6 }, (_, i) => `<input inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="${i === 0 ? 'one-time-code' : 'off'}" aria-label="Digit ${i + 1}" aria-describedby="otp-err">`).join('')}
          </div>
          <span class="error-text" id="otp-err" role="alert" style="${err ? 'display:flex;justify-content:center' : ''}">${err ? icon('alert', 'icon--16') + '<span>' + err + '</span>' : ''}</span>
          ${st.fails >= 3 ? `<label class="check" style="justify-content:center"><input type="checkbox" id="captcha"><span>Saya bukan robot (CAPTCHA)</span></label>` : ''}
          <button class="btn btn--block btn--lg" id="verify" type="button">Verifikasi</button>
          <div class="resend"><button type="button" id="resend" disabled>Kirim ulang</button> · <button type="button" id="change" style="text-decoration:underline">Ubah nomor</button></div>
          <div class="sr-only" aria-live="polite" id="otp-live"></div>
        </div>`;
      const boxes = Array.from(root.querySelectorAll('.otp input'));
      boxes[0].focus();
      boxes.forEach((b, i) => {
        b.addEventListener('input', () => {
          b.value = b.value.replace(/\D/g, '').slice(-1);
          if (b.value && i < 5) boxes[i + 1].focus();
          if (boxes.every(x => x.value)) verify(boxes.map(x => x.value).join(''));
        });
        b.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !b.value && i > 0) boxes[i - 1].focus(); });
        b.addEventListener('paste', (e) => {
          const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (!t) return; e.preventDefault();
          t.split('').forEach((c, k) => { boxes[k].value = c; }); boxes[Math.min(t.length, 5)].focus(); if (t.length === 6) verify(t);
        });
      });
      root.querySelector('#verify').addEventListener('click', () => { const c = boxes.map(x => x.value).join(''); if (c.length < 6) return otpView('Lengkapi 6 digit kode OTP dulu ya.'); verify(c); });
      root.querySelector('#change').addEventListener('click', () => { clearInterval(st.timer); phoneView('', st.phone.replace('+62', '0')); });
      root.querySelector('#resend').addEventListener('click', () => {
        if (st.sent >= 3) return toast({ type: 'warning', title: 'Batas kirim ulang tercapai', msg: 'Maksimal 3× per 15 menit. Coba lagi nanti.' });
        st.sent++; startTimer(); toast({ type: 'info', msg: 'Kode OTP baru dikirim. Mode demo: 123456.' });
      });
      startTimer();
    }

    function blockView() {
      clearInterval(st.timer);
      const until = blocked();
      root.innerHTML = `<div class="banner banner--danger" role="alert">${icon('lock')}<div><b>Pengiriman OTP diblokir sementara</b>Terlalu banyak kode salah. Coba lagi pukul ${fmt.time(until)}. Jika butuh bantuan, hubungi admin.</div></div>`;
    }

    function verify(code) {
      if (st.fails >= 3 && !root.querySelector('#captcha')?.checked) return otpView('Centang CAPTCHA dulu sebelum memverifikasi.');
      const btn = root.querySelector('#verify'); btn.setAttribute('aria-busy', 'true'); btn.textContent = 'Memverifikasi…';
      setTimeout(() => {
        if (code === DEMO_CODE) {
          clearInterval(st.timer);
          root.innerHTML = `<div class="text-center stack" style="padding:16px 0"><div class="pay-ok-anim" style="color:var(--color-success)">${icon('check-circle', 'icon--32')}</div><b style="font-family:var(--font-display)">Nomor terverifikasi</b><span class="muted small" aria-live="polite">Mengarahkan Anda…</span></div>`;
          setTimeout(() => onVerified(st.phone), 700);
        } else {
          st.fails++;
          if (st.fails >= 5) { Store.set('otp_block', Date.now() + 15 * 60 * 1000); return blockView(); }
          otpView(`Kode OTP belum sesuai. Cek lagi ya (sisa ${5 - st.fails} percobaan).`);
        }
      }, 500);
    }

    if (blocked()) blockView(); else phoneView();
    return { st };
  }
  window.DOCI.OtpFlow = OtpFlow;
})();
