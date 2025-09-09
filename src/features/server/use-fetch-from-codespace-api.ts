import { useEffect, useState, useRef } from 'react';
import { fetchEventsOnce } from './fetch-patch';

export function useCodespaceEvents() {
    const [state, setState] = useState<{ status: 'idle' | 'ok' | 'off' | 'error'; data?: any }>({ status: 'idle' });
    const retry = useRef(500);

    useEffect(() => {
        let alive = true;

        async function tick() {
            const r = await fetchEventsOnce().catch(() => ({ ok: false, reason: 'network_error' }));
            if (!alive) return;

            if (r.ok) {
                setState({ status: 'ok', data: (r as any).data });
                retry.current = 1000;
            } else {
                // If disabled or 404/blocked, stop hammering
                if ((r as any).reason === 'disabled_on_github_host' || (r as any).status === 404) {
                    setState({ status: 'off' });
                    return;
                }
                setState({ status: 'error' });
                retry.current = Math.min(retry.current * 2, 10000);
                setTimeout(tick, retry.current);
                return;
            }
            setTimeout(tick, 2500);
        }

        tick();
        return () => { alive = false; };
    }, []);

    return state;
}
