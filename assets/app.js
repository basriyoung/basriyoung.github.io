/*!
 * app.js - logika antarmuka untuk hasanbasri.dev
 * Dipakai bersama oleh index.html (Inggris) dan id.html (Indonesia).
 * Bahasa dipilih otomatis dari atribut lang pada tag <html>.
 */
(function () {
  "use strict";

  /* ============================================================
     KONFIGURASI
     Kosongkan FORM_ENDPOINT untuk mode WhatsApp.
     Isi dengan endpoint Formspree/Web3Forms agar pesan masuk ke email,
     contoh: "https://formspree.io/f/xxxxxxx"
     ============================================================ */
  var FORM_ENDPOINT = "";
  var WA_NUMBER     = "628114036827";
  var MAIL_USER     = "email";
  var MAIL_HOST     = "hasanbasri.dev";

  /* ============================================================
     TEKS DUA BAHASA
     Hanya teks yang dihasilkan JavaScript yang ada di sini.
     Teks yang sudah tertulis di HTML tidak perlu diulang.
     ============================================================ */
  var STRINGS = {
    en: {
      themeToLight:  "Switch to light mode",
      themeToDark:   "Switch to dark mode",
      menuOpen:      "Open menu",
      menuClose:     "Close menu",
      emailCopied:   "Email copied: ",
      emailCopyFail: "Could not copy. The address is ",
      emailManual:   "Copy manually: ",
      hintEndpoint:  "Your message is delivered straight to my inbox.",
      hintWhatsapp:  "This opens WhatsApp with your message ready to send.",
      btnSend:       "Send message",
      btnWhatsapp:   "Send via WhatsApp",
      btnSending:    "Sending...",
      waOpened:      "WhatsApp opened, just press send.",
      sent:          "Message sent. Thank you, I will reply shortly.",
      sendFailed:    "Sending failed. Please reach me on WhatsApp or email.",
      waGreeting:    "Hello Basri, this is ",
      waEmail:       "\nEmail: ",
      waTopic:       "\nTopic: ",
      steps: [
        { label: "[1] Define",    cls: "c-amber",  text: " Manual sign-in is slow and easy to falsify." },
        { label: "[2] Collect",   cls: "c-blue",   text: " Build a face dataset under real lighting conditions." },
        { label: "[3] Train",     cls: "c-purple", text: " Benchmark CNN backbones, log accuracy per config." },
        { label: "[4] Validate",  cls: "c-amber",  text: " Measure inference latency on deployment hardware." },
        { label: "[5] Integrate", cls: "c-blue",   text: " Wire into the attendance database and monthly reports." },
        { label: "[6] Hand over", cls: "c-green",  text: " Documentation, user training, maintenance plan." }
      ]
    },
    id: {
      themeToLight:  "Aktifkan mode terang",
      themeToDark:   "Aktifkan mode gelap",
      menuOpen:      "Buka menu",
      menuClose:     "Tutup menu",
      emailCopied:   "Email disalin: ",
      emailCopyFail: "Gagal menyalin. Alamatnya: ",
      emailManual:   "Salin manual: ",
      hintEndpoint:  "Pesan dikirim langsung ke email saya.",
      hintWhatsapp:  "Tombol ini membuka WhatsApp dengan pesan yang sudah tersusun.",
      btnSend:       "Kirim Pesan",
      btnWhatsapp:   "Kirim lewat WhatsApp",
      btnSending:    "Mengirim...",
      waOpened:      "WhatsApp dibuka, tinggal tekan kirim.",
      sent:          "Pesan terkirim. Terima kasih, saya balas secepatnya.",
      sendFailed:    "Pengiriman gagal. Silakan hubungi lewat WhatsApp atau email.",
      waGreeting:    "Halo Pak Basri, saya ",
      waEmail:       "\nEmail: ",
      waTopic:       "\nKategori: ",
      steps: [
        { label: "[1] Definisi",     cls: "c-amber",  text: " Presensi manual lambat dan rawan titip absen." },
        { label: "[2] Data",         cls: "c-blue",   text: " Bangun dataset wajah pada pencahayaan nyata." },
        { label: "[3] Pelatihan",    cls: "c-purple", text: " Uji backbone CNN, catat akurasi tiap konfigurasi." },
        { label: "[4] Validasi",     cls: "c-amber",  text: " Ukur waktu inferensi pada perangkat operasional." },
        { label: "[5] Integrasi",    cls: "c-blue",   text: " Sambungkan ke basis data kehadiran dan laporan bulanan." },
        { label: "[6] Serah terima", cls: "c-green",  text: " Dokumentasi, pelatihan pengguna, rencana pemeliharaan." }
      ]
    }
  };

  var LANG = document.documentElement.lang === "id" ? "id" : "en";
  var T = STRINGS[LANG];

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Penyimpanan aman: mode privat atau storage diblokir tidak boleh
     menghentikan skrip, jadi setiap akses dibungkus try/catch. */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(message, ok) {
    var box = $("#toast");
    if (!box) return;
    $("#toast-msg").textContent = message;
    $("#toast-icon").firstElementChild.setAttribute("href", ok === false ? "#i-close" : "#i-check");
    box.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { box.classList.remove("show"); }, 4000);
  }

  /* ---------- Mode gelap ---------- */
  function applyTheme(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    var use = $("#theme-icon");
    if (use && use.firstElementChild) {
      use.firstElementChild.setAttribute("href", mode === "dark" ? "#i-sun" : "#i-moon");
    }
    var btn = $("#theme-btn");
    if (btn) btn.setAttribute("aria-label", mode === "dark" ? T.themeToLight : T.themeToDark);
  }

  var saved = store.get("theme");
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));

  var themeBtn = $("#theme-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      store.set("theme", next);
    });
  }

  /* ---------- Menu ponsel ---------- */
  var mToggle = $("#mobile-toggle"), mPanel = $("#mobile-panel");
  function setMenu(open) {
    if (!mPanel || !mToggle) return;
    mPanel.classList.toggle("open", open);
    mToggle.setAttribute("aria-expanded", String(open));
    mToggle.setAttribute("aria-label", open ? T.menuClose : T.menuOpen);
    var use = $("#menu-icon");
    if (use && use.firstElementChild) {
      use.firstElementChild.setAttribute("href", open ? "#i-close" : "#i-menu");
    }
  }
  if (mToggle) mToggle.addEventListener("click", function () { setMenu(!mPanel.classList.contains("open")); });
  if (mPanel) mPanel.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- Email dirakit lewat JS agar tidak mudah dipanen bot ---------- */
  var EMAIL = MAIL_USER + "@" + MAIL_HOST;
  var emailDisplay = $("#email-display");
  if (emailDisplay) emailDisplay.textContent = EMAIL;

  function copyEmail() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(function () {
        toast(T.emailCopied + EMAIL);
      }).catch(function () {
        toast(T.emailCopyFail + EMAIL, false);
      });
    } else {
      toast(T.emailManual + EMAIL, false);
    }
  }
  $$("#copy-email-card, #copy-email-hero").forEach(function (b) {
    b.addEventListener("click", copyEmail);
  });

  /* ---------- Filter keahlian ---------- */
  $$(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var cat = this.getAttribute("data-filter");
      $$(".tab").forEach(function (t) { t.setAttribute("aria-pressed", String(t === tab)); });
      $$("#skill-grid .skill").forEach(function (card) {
        var cats = (card.getAttribute("data-cat") || "").split(" ");
        card.hidden = !(cat === "all" || cats.indexOf(cat) !== -1);
      });
    });
  });

  /* ---------- Simulasi alur kerja ---------- */
  var demoTimers = [];
  var demoBtn = $("#run-demo");
  if (demoBtn) {
    demoBtn.addEventListener("click", function () {
      var out = $("#demo-out");
      if (!out) return;
      demoTimers.forEach(clearTimeout);
      demoTimers = [];
      out.textContent = "";

      var bar = document.createElement("div");
      bar.className = "bar";
      var left = document.createElement("span");
      left.textContent = "workflow.log";
      var right = document.createElement("span");
      right.className = "c-amber";
      right.textContent = "running";
      bar.appendChild(left);
      bar.appendChild(right);
      out.appendChild(bar);

      T.steps.forEach(function (s, i) {
        demoTimers.push(setTimeout(function () {
          var p = document.createElement("p");
          var b = document.createElement("span");
          b.className = s.cls;
          b.textContent = s.label;
          p.appendChild(b);
          p.appendChild(document.createTextNode(s.text));
          out.appendChild(p);
          if (s.cls === "c-green") { right.className = "c-green"; right.textContent = "done"; }
        }, 300 + i * 800));
      });
    });
  }

  /* ---------- Formulir kontak ---------- */
  var form = $("#contact-form"), hint = $("#form-hint"), label = $("#submit-label");

  if (FORM_ENDPOINT) {
    if (hint)  hint.textContent = T.hintEndpoint;
    if (label) label.textContent = T.btnSend;
  } else {
    if (hint)  hint.textContent = T.hintWhatsapp;
    if (label) label.textContent = T.btnWhatsapp;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: kalau terisi berarti bot, diam-diam diabaikan.
      if (form.elements["_website"] && form.elements["_website"].value) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var name  = form.elements["name"].value.trim();
      var email = form.elements["email"].value.trim();
      var topic = form.elements["topic"].value;
      var msg   = form.elements["message"].value.trim();

      // Tanpa endpoint: susun pesan lalu buka WhatsApp.
      if (!FORM_ENDPOINT) {
        var text = T.waGreeting + name + T.waEmail + email + T.waTopic + topic + "\n\n" + msg;
        window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text), "_blank", "noopener");
        toast(T.waOpened);
        return;
      }

      var btn = $("#submit-btn");
      btn.disabled = true;
      if (label) label.textContent = T.btnSending;

      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      }).then(function (res) {
        if (!res.ok) throw new Error("failed");
        toast(T.sent);
        form.reset();
      }).catch(function () {
        toast(T.sendFailed, false);
      }).then(function () {
        btn.disabled = false;
        if (label) label.textContent = T.btnSend;
      });
    });
  }

  /* ---------- Penanda menu aktif saat menggulir ---------- */
  var sections = $$("main section[id]"), navMap = {};
  $$(".nav-links a").forEach(function (a) {
    var h = a.getAttribute("href");
    if (h && h.charAt(0) === "#") navMap[h.slice(1)] = a;
  });
  if ("IntersectionObserver" in window && sections.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var link = navMap[en.target.id];
        if (!link) return;
        if (en.isIntersecting) {
          Object.keys(navMap).forEach(function (k) { navMap[k].removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { obs.observe(s); });
  }

  /* ---------- Tahun otomatis di footer ---------- */
  var y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();
