/* ==========================================================
   TOM Servicios Generales — Interacciones de la web
   ========================================================== */
(function () {
  "use strict";
  var E = window.EMPRESA || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Datos de la empresa en toda la página ---------- */
  function waLink(msg) {
    return "https://wa.me/" + (E.whatsapp || "") + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }
  $$("[data-emp]").forEach(function (el) {
    var k = el.getAttribute("data-emp");
    if (E[k]) el.textContent = E[k];
  });
  $$("[data-href]").forEach(function (el) {
    var t = el.getAttribute("data-href");
    if (t === "tel" && E.telefonoLink) el.href = "tel:" + E.telefonoLink;
    else if (t === "wa") el.href = waLink(el.getAttribute("data-wa-msg") || "Hola TOM, quiero una cotización.");
    else if (t === "mail" && E.correo) el.href = "mailto:" + E.correo;
    else if (E[t]) el.href = E[t];
  });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- 1b. Fotos de internet: si no cargan, se usa la foto propia ---------- */
  $$("img[data-fallback]").forEach(function (img) {
    function useFallback() {
      var fb = img.getAttribute("data-fallback");
      if (fb && img.getAttribute("src") !== fb) { img.src = fb; img.removeAttribute("data-fallback"); }
    }
    img.addEventListener("error", useFallback);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) useFallback();
  });

  /* ---------- 2. Cabecera al hacer scroll + botón subir ---------- */
  var header = $(".header"), toTop = $(".to-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 20);
    if (toTop) toTop.classList.toggle("show", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- 3. Menú móvil y submenú de servicios ---------- */
  var burger = $(".burger"), nav = $(".nav");
  function closeNav() {
    if (!nav) return;
    nav.classList.remove("open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (burger && nav) {
    burger.addEventListener("click", function () {
      nav.style.top = header.getBoundingClientRect().bottom + "px";
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 980) closeNav(); });
  }
  $$(".dd").forEach(function (dd) {
    var btn = $("button", dd);
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = dd.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", function (e) {
    $$(".dd.open").forEach(function (dd) {
      if (!dd.contains(e.target)) { dd.classList.remove("open"); $("button", dd).setAttribute("aria-expanded", "false"); }
    });
  });

  /* ---------- 4. Animación de aparición ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 5. Visor de fotos (galería) ---------- */
  var items = $$(".gallery button");
  if (items.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.hidden = true;
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Foto ampliada");
    lb.innerHTML =
      '<button class="lb-btn lb-close" aria-label="Cerrar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="lb-btn lb-prev" aria-label="Foto anterior"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-btn lb-next" aria-label="Foto siguiente"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>';
    document.body.appendChild(lb);
    var lbImg = $("img", lb), lbCap = $("figcaption", lb), idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + items.length) % items.length;
      var it = items[idx], img = $("img", it);
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = it.getAttribute("data-cap") || img.alt;
    }
    function open(i) { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = "hidden"; $(".lb-close", lb).focus(); }
    function close() { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
    items.forEach(function (it, i) { it.addEventListener("click", function () { open(i); }); });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { show(idx - 1); });
    $(".lb-next", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- 6. Formularios: envían la consulta por WhatsApp ---------- */
  $$("form[data-wa-form]").forEach(function (form) {
    var msg = $(".form-msg", form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$("[required]", form).forEach(function (f) {
        var bad = !f.value.trim();
        f.closest(".field").classList.toggle("invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) {
        msg.textContent = "Escribe tu nombre y un teléfono para poder contactarte.";
        msg.hidden = false;
        return;
      }
      var val = function (n) { var f = form.elements[n]; return f ? f.value.trim() : ""; };
      var texto = "Hola TOM, quiero una cotización.\n";
      if (val("servicio")) texto += "\nServicio: " + val("servicio");
      texto += "\nNombre: " + val("nombre") + "\nTeléfono: " + val("telefono");
      if (val("correo")) texto += "\nCorreo: " + val("correo");
      if (val("distrito")) texto += "\nDistrito: " + val("distrito");
      if (val("mensaje")) texto += "\nDetalle: " + val("mensaje");
      window.open(waLink(texto), "_blank", "noopener");
      msg.textContent = "Se abrió WhatsApp con tu consulta. Solo presiona Enviar.";
      msg.hidden = false;
    });
  });

  /* ---------- 7. Botones "Más información" preseleccionan el servicio ---------- */
  $$("[data-pick]").forEach(function (a) {
    a.addEventListener("click", function () {
      var sel = $("select[name=servicio]");
      if (sel) sel.value = a.getAttribute("data-pick");
    });
  });
})();
