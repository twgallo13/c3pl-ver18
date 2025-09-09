import React from 'react';
import { getApiBase } from '../../lib/http';
import { isGitHubMainSite } from '../../lib/isCodespaces';

const base = getApiBase();
const sseSupported = typeof EventSource !== 'undefined';
const allowSSE = !isGitHubMainSite() || !!import.meta.env.VITE_API_BASE;

export function ServerEventsProvider({ children }: { children: React.ReactNode }) {
    React.useEffect(() => {
        if (!sseSupported || !allowSSE || base === '') return; // same-origin only
        const es = new EventSource(`${base}/events`);
        es.onerror = () => { /* optionally set some off state */ };
        return () => es.close();
    }, []);

    return <>{children}</>;
}
