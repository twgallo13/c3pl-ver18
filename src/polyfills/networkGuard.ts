// Blocks accidental calls to Codespaces preview hosts unless explicitly configured.
(function setupNetworkGuard() {
  // Only apply when NO explicit API base is provided.
  if (import.meta.env?.VITE_API_BASE) return;

  const isPreview = (host: string) => /\.app\.github\.dev$/i.test(host);
  const resolve = (input: RequestInfo | URL) => {
    if (typeof input === 'string') return new URL(input, location.href);
    if (input instanceof URL) return input;
    return new URL((input as Request).url, location.href);
  };

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url = resolve(input);
      if (isPreview(url.host)) {
        // Short-circuit to stop console spam; treat as "off"
        return Promise.resolve(new Response(null, { status: 204, statusText: 'blocked_by_networkGuard' }));
      }
    } catch { }
    return originalFetch(input as any, init);
  };

  // Optional: guard EventSource too
  const OriginalES = window.EventSource;
  if (OriginalES) {
    // @ts-ignore
    window.EventSource = function (url: string, esInitDict?: EventSourceInit) {
      try {
        const u = new URL(url, location.href);
        if (isPreview(u.host)) {
          // no-op EventSource
          // @ts-ignore
          const fake = { close() { } };
          return fake;
        }
      } catch { }
      // @ts-ignore
      return new OriginalES(url, esInitDict);
    } as any;
  }
})();
