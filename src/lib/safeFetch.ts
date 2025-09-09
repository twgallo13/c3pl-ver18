export async function safeFetch(input: RequestInfo | URL, init?: RequestInit & { timeoutMs?: number }) {
    const { timeoutMs = 4000, ...rest } = init || {};
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(input, { ...rest, signal: ctrl.signal });
        return res;
    } finally {
        clearTimeout(t);
    }
}
