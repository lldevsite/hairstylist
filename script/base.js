/* Numero WhatsApp in formato internazionale, senza + e senza spazi.
   DA VERIFICARE: se WhatsApp è attivo su un cellulare, sostituire con quel numero. */
const WA_NUMBER = "390321838414";

/* ?statico disattiva le animazioni allo scroll (utile per gli screenshot) */
if (!/[?&]statico\b/.test(location.search)) document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", async function () {
  await load("/component/navbar.html", "navbar");
  await load("/component/footer.html", "footer");

  initMenu();
  initHeader();
  initWhatsApp();
  initReveal();
  initFlipCards();
  initLightbox();
  initCarousel();
});

/* --- Link WhatsApp: ogni elemento con data-wa diventa un link wa.me --- */
function initWhatsApp() {
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    const text = el.getAttribute("data-wa") || "Ciao Debora, vorrei prenotare un appuntamento.";
    el.setAttribute("href", "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
}

/* --- Header: trasparente sull'hero, pieno quando si scorre --- */
function initHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;

  if (document.body.dataset.page === "servizi") {
    const current = header.querySelector('[data-nav="servizi"]');
    if (current) current.setAttribute("aria-current", "page");
  }

  const update = function () {
    header.classList.toggle("is-solid", window.scrollY > 40);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* --- Menu mobile --- */
function initMenu() {
  const menuOpen = document.getElementById("menu-open");
  const menuClose = document.getElementById("menu-close");
  const sideMenu = document.getElementById("side-menu");
  const overlay = document.getElementById("menu-overlay");
  if (!menuOpen || !menuClose || !sideMenu || !overlay) return;

  function openMenu() {
    sideMenu.classList.add("open");
    overlay.classList.add("open");
    sideMenu.setAttribute("aria-hidden", "false");
    menuOpen.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    menuClose.focus();
  }

  function closeMenu() {
    if (!sideMenu.classList.contains("open")) return;
    sideMenu.classList.remove("open");
    overlay.classList.remove("open");
    sideMenu.setAttribute("aria-hidden", "true");
    menuOpen.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    menuOpen.focus();
  }

  menuOpen.addEventListener("click", openMenu);
  menuClose.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);
  sideMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });
}

/* --- Rivelazioni allo scroll --- */
function initReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }
  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  items.forEach(function (el) { io.observe(el); });
}

/* --- Card servizi che si girano --- */
function initFlipCards() {
  document.querySelectorAll(".flip-card").forEach(function (card) {
    const front = card.querySelector(".flip-front");
    const back = card.querySelector(".flip-back");
    const toggles = card.querySelectorAll("[data-flip]");

    function setFlipped(flipped) {
      card.classList.toggle("is-flipped", flipped);
      front.setAttribute("aria-hidden", String(flipped));
      back.setAttribute("aria-hidden", String(!flipped));
      front.inert = flipped;
      back.inert = !flipped;
      toggles.forEach(function (t) { t.setAttribute("aria-expanded", String(flipped)); });
      const target = flipped ? back.querySelector("[data-flip]") : front.querySelector("[data-flip]");
      if (target && card.contains(document.activeElement)) target.focus({ preventScroll: true });
    }

    setFlipped(false);
    toggles.forEach(function (t) {
      t.addEventListener("click", function () {
        setFlipped(!card.classList.contains("is-flipped"));
      });
    });
    front.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) return;
      setFlipped(true);
    });
  });
}

/* --- Lightbox per le gallerie --- */
function initLightbox() {
  const triggers = document.querySelectorAll("[data-lightbox]");
  if (!triggers.length || typeof HTMLDialogElement !== "function") return;

  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Foto ingrandita");
  dialog.innerHTML =
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button class="lightbox-close" type="button" aria-label="Chiudi">' +
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>' +
    "</button>";
  document.body.appendChild(dialog);

  const img = dialog.querySelector("img");
  const cap = dialog.querySelector("figcaption");

  triggers.forEach(function (t) {
    t.addEventListener("click", function () {
      const source = t.querySelector("img");
      img.src = t.getAttribute("data-lightbox") || source.currentSrc || source.src;
      img.alt = source.alt;
      cap.textContent = t.getAttribute("data-caption") || "";
      cap.hidden = !cap.textContent;
      dialog.showModal();
    });
  });

  dialog.querySelector(".lightbox-close").addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) dialog.close();
  });
}

/* --- Carosello certificazioni --- */
function initCarousel() {
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    const track = root.querySelector(".carousel-track");
    const prev = root.querySelector("[data-prev]");
    const next = root.querySelector("[data-next]");
    const bar = root.querySelector(".carousel-progress span");
    const count = root.querySelector("[data-count]");
    const slides = track.children;
    if (!track || !slides.length) return;

    function step() {
      const first = slides[0].getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first.width + gap;
    }

    function update() {
      const max = track.scrollWidth - track.clientWidth;
      const ratio = max > 0 ? track.scrollLeft / max : 1;
      const visible = Math.max(1, Math.round(track.clientWidth / step()));
      const share = Math.min(1, visible / slides.length);
      if (bar) {
        bar.style.width = share * 100 + "%";
        bar.style.transform = "translateX(" + ratio * ((1 - share) / share) * 100 + "%)";
      }
      if (count) {
        const firstIndex = Math.round(track.scrollLeft / step()) + 1;
        const lastIndex = Math.min(slides.length, firstIndex + visible - 1);
        count.textContent =
          (visible > 1 ? firstIndex + "–" + lastIndex : firstIndex) + " di " + slides.length;
      }
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    }

    prev && prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    next && next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    /* trascinamento col mouse su desktop */
    let dragging = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      dragging = true; moved = false;
      startX = e.clientX; startLeft = track.scrollLeft;
      track.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
    });
    track.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    update();
  });
}
