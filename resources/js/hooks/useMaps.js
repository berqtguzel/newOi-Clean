import { useEffect, useState } from "react";
import { fetchMaps } from "@/services/mapService";

/**
 *
 *
 * @param {Object} options
 * @param {string|number} [options.tenantId]
 * @param {string}        [options.locale]
 */
export function useMaps({ tenantId, locale } = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetchMaps({ tenantId, locale });

                if (!isMounted) return;
                setData(res);
            } catch (err) {
                if (!isMounted) return;

                setError(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();

        return () => {
            isMounted = false;
        };
    }, [tenantId, locale]);

    return {
        maps: data,
        loading,
        error,
    };
}
