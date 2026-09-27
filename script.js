/* Обычный JavaScript: без библиотек, сервера и сборки. */
(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const read = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const write = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Сайт работает и без хранилища. */
    }
  };
  const booking = $("#booking-dialog");
  const menu = $("#menu-dialog");
  const lightbox = $("#lightbox-dialog");
  const cookie = $("#cookie-banner");
  const sticky = $("#mobile-sticky");
  let lastFocus = null;

  function updateScroll() {
    const scrolled = window.scrollY > 80;
    $(".header").classList.toggle("compact", scrolled);
    sticky.hidden = !scrolled || !cookie.hidden || !!$("dialog[open]");
  }
  function openDialog(dialog) {
    if (!dialog || dialog.open) return;
    lastFocus = document.activeElement;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    updateScroll();
  }
  $$("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          dialog.close();
      }
    });
    dialog.addEventListener("close", () => {
      document.body.style.overflow = "";
      $("[data-open-menu]").setAttribute("aria-expanded", "false");
      lastFocus?.focus({ preventScroll: true });
      updateScroll();
    });
  });
  $$("[data-close]").forEach((button) =>
    button.addEventListener("click", () => button.closest("dialog").close()),
  );
  $$("[data-book]").forEach((button) =>
    button.addEventListener("click", () => {
      openDialog(booking);
    }),
  );
  $("[data-open-menu]").addEventListener("click", () => {
    openDialog(menu);
    $("[data-open-menu]").setAttribute("aria-expanded", "true");
  });
  $$("#menu-dialog a").forEach((link) =>
    link.addEventListener("click", () => menu.close()),
  );
  $$("[data-lightbox]").forEach((button) =>
    button.addEventListener("click", () => {
      $("#lightbox-image").src = button.dataset.lightbox;
      $("#lightbox-image").alt = button.dataset.caption;
      $("#lightbox-caption").textContent = button.dataset.caption;
      openDialog(lightbox);
    }),
  );

  cookie.hidden = read("gh-static-cookie") === "accepted";
  $("#cookie-accept").addEventListener("click", () => {
    write("gh-static-cookie", "accepted");
    cookie.hidden = true;
    updateScroll();
  });
  $$("[data-cookie-settings]").forEach((button) =>
    button.addEventListener("click", () => {
      cookie.hidden = false;
      $("#cookie-accept").focus({ preventScroll: true });
      updateScroll();
    }),
  );
  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  // Content stays visible without JS or with reduced-motion enabled.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if ("IntersectionObserver" in window && !reduced.matches) {
    document.documentElement.classList.add("js-motion");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -25px 0px" },
    );
    $$(".reveal").forEach((element) => observer.observe(element));
    reduced.addEventListener("change", () => {
      if (reduced.matches) {
        document.documentElement.classList.remove("js-motion");
        observer.disconnect();
      }
    });
  }
})();
