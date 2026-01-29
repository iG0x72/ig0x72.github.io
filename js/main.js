const runSite = () => {
  // NAV: smooth scroll + active link
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "start" });

      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // MENU BAR: hide on scroll, reveal on hover near top
  const menuBar = document.querySelector(".menu-bar");
  const menuBarSensor = document.querySelector(".menu-bar-sensor");
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  function updateMenuBarOnScroll() {
    if (!menuBar || isCoarsePointer) return;
    if (window.scrollY > 0) {
      document.body.classList.add("menubar-scroll-hidden");
    } else {
      document.body.classList.remove("menubar-scroll-hidden");
    }
  }

  if (menuBar && !isCoarsePointer) {
    const reveal = () => document.body.classList.add("menubar-reveal");
    const hide = () => {
      if (window.scrollY > 0) document.body.classList.remove("menubar-reveal");
    };

    if (menuBarSensor) {
      menuBarSensor.addEventListener("mouseenter", reveal);
      menuBarSensor.addEventListener("mouseleave", hide);
    }
    menuBar.addEventListener("mouseenter", reveal);
    menuBar.addEventListener("mouseleave", hide);
    menuBar.addEventListener("focusin", reveal);
    menuBar.addEventListener("focusout", hide);
  }

  updateMenuBarOnScroll();
  window.addEventListener("scroll", updateMenuBarOnScroll, { passive: true });

  // THEME TOGGLE (dentro do painel)
  const body = document.body;
  const themeToggleBtn = document.querySelector(".theme-toggle");
  const THEME_KEY = "ig-portfolio-theme";

  function applyTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    body.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (_) {
      // ignore
    }
  }

  // carrega tema salvo
  (() => {
    let saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch (_) {
      saved = null;
    }
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
    } else {
      applyTheme(body.getAttribute("data-theme") || "light");
    }
  })();

  // clique no botão de tema (dentro do painel)
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const current = body.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
    });
  }

  // CONTROL CENTER: abre/fecha painel
  const ccToggleBtn = document.querySelector(".control-center-toggle");
  const ccPanel = document.getElementById("controlCenter");
  const isMobileLayout = window.matchMedia("(max-width: 820px), (pointer: coarse)").matches;

  if (ccToggleBtn && ccPanel) {
    ccToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      ccPanel.classList.toggle("open");
    });

    // fecha ao clicar fora
    document.addEventListener("click", (e) => {
      if (!ccPanel.classList.contains("open")) return;
      if (
        !ccPanel.contains(e.target) &&
        !ccToggleBtn.contains(e.target)
      ) {
        ccPanel.classList.remove("open");
      }
    });
  }

  // iOS-like drag-down to reveal Control Center
  if (ccPanel && isMobileLayout) {
    let startY = 0;
    let dragging = false;
    let deltaY = 0;

    window.addEventListener("touchstart", (e) => {
      if (window.scrollY > 0) return;
      startY = e.touches[0].clientY;
      dragging = startY < 60;
      deltaY = 0;
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      deltaY = e.touches[0].clientY - startY;
      if (deltaY > 40) {
        ccPanel.classList.add("open");
      } else if (deltaY < -20) {
        ccPanel.classList.remove("open");
      }
    }, { passive: true });

    window.addEventListener("touchend", () => {
      if (!dragging) return;
      if (deltaY < 30) {
        ccPanel.classList.remove("open");
      }
      dragging = false;
    });
  }

  // Fake macOS clock (sempre 9:41)
  function updateClock() {
    const el = document.getElementById("clock");
    if (!el) return;
    el.textContent = "Wed 9:41 AM";
  }

  updateClock();
  setInterval(updateClock, 60 * 1000);

  // BOOT SCREEN
  const bootScreen = document.querySelector(".boot-screen");
  const bootBar = document.querySelector(".boot-progress-bar");
  if (bootScreen && bootBar) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 400 : 1600;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      bootBar.style.width = `${Math.round(t * 100)}%`;
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          bootScreen.classList.add("hidden");
        }, 200);
      }
    }

    requestAnimationFrame(tick);
  }

};

if (window.__includesReady && typeof window.__includesReady.then === "function") {
  window.__includesReady.then(runSite).catch(runSite);
} else {
  runSite();
}
