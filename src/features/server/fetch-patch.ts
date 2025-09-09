import { getApiBase } from '../../lib/http';
import { safeFetch } from '../../lib/safeFetch';
import { isGitHubMainSite } from '../../lib/isCodespaces';

const base = getApiBase(); // '' => same-origin

export async function fetchEventsOnce() {
    // If we're literally sitting on github.com, and no explicit API base set,
    // do NOT try to hit Codespace preview domains.
    if (isGitHubMainSite() && !import.meta.env.VITE_API_BASE) {
        return { ok: false, reason: 'disabled_on_github_host' as const };
    }

    const url = `${base}/events`;
    const res = await safeFetch(url, { timeoutMs: 3000 });
    if (!res.ok) return { ok: false, status: res.status as number };
    const data = await res.json().catch(() => null);
    return { ok: true, data };
}
