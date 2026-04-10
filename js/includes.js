(() => {
  const includes = Array.from(document.querySelectorAll("[data-include]"));
  if (!includes.length) {
    return;
  }

  const resolveCandidates = (value) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (trimmed.includes("/") || trimmed.endsWith(".html")) {
      return [new URL(trimmed, document.baseURI).toString()];
    }

    const scriptUrl = document.currentScript
      ? new URL(document.currentScript.src, document.baseURI)
      : new URL(document.baseURI);
    const scriptDir = new URL("./", scriptUrl);
    const scriptRelative = new URL(`../partials/${trimmed}.html`, scriptDir).toString();

    return [
      new URL(`/partials/${trimmed}.html`, window.location.origin).toString(),
      new URL(`partials/${trimmed}.html`, document.baseURI).toString(),
      scriptRelative,
    ];
  };

  const requests = includes.map(async (el) => {
    const candidates = resolveCandidates(el.getAttribute("data-include"));
    if (!candidates) return;

    for (const target of candidates) {
      try {
        const res = await fetch(target, { cache: "no-cache" });
        if (!res.ok) {
          throw new Error(`Failed to load ${target}: ${res.status}`);
        }
        const html = await res.text();
        el.innerHTML = html;
        return;
      } catch (err) {
        console.error(err);
      }
    }
  });

  window.__includesReady = Promise.all(requests).then(() => {
    window.dispatchEvent(new Event("includes:loaded"));
  });
})();
