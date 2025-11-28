// resources/js/hooks/useServices.js
import { useEffect, useState } from "react";

const API_BASE = "https://omerdogan.de/api/v1/services";

const CACHE_KEY = "services_cache_v1";
const CACHE_EXPIRE_MS = 24 * 60 * 60 * 1000; // 24 saat

async function fetchAllPages(
    url,
    tenantId,
    page = 1,
    perPage = 1000,
    accumulator = []
) {
    const params = new URLSearchParams(url);
    params.set("page", page);
    params.set("per_page", perPage);

    const res = await fetch(`${API_BASE}?${params.toString()}`, {
        headers: {
            Accept: "application/json",
            "X-Tenant-ID": tenantId,
        },
    });

    const json = await res.json();
    const data = json?.data || [];
    const pagination = json?.pagination || {};

    const merged = [...accumulator, ...data];

    if (pagination.current_page < pagination.last_page) {
        return fetchAllPages(url, tenantId, page + 1, perPage, merged);
    }

    return merged;
}

export function useServices({
    tenantId,
    locale = "de",
    categoryId,
    locationOnly = false,
    cleaningOnly = false,
} = {}) {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [durationMs, setDurationMs] = useState(null);

    useEffect(() => {
        if (!tenantId) {
            setError("Tenant ID yok!");
            setLoading(false);
            return;
        }



        const cacheKey = `${CACHE_KEY}_${tenantId}_${locale}_${categoryId}_${locationOnly}_${cleaningOnly}`;

        if (typeof window !== "undefined") {
            try {
                const raw = localStorage.getItem(cacheKey);
                if (raw) {
                    const { data, timestamp } = JSON.parse(raw) || {};
                    if (
                        data &&
                        timestamp &&
                        Date.now() - timestamp < CACHE_EXPIRE_MS
                    ) {

                        setServices(data);
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) {
                console.warn("Services cache okunamadı:", e);
            }
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const start = performance.now();

                const params = new URLSearchParams();
                params.append("tenant", tenantId);
                params.append("locale", locale);

                if (categoryId !== undefined) {
                    params.append(
                        "category_id",
                        categoryId === null ? "" : String(categoryId)
                    );
                }

                let list = await fetchAllPages(params, tenantId);

                if (locationOnly) {
                    list = list.filter((s) => s.city);
                }

                if (cleaningOnly) {
                    list = list.filter((s) =>
                        String(s.slug || "")
                            .toLowerCase()
                            .includes("gebaudereinigung")
                    );


                }

                setServices(list);
                setDurationMs(performance.now() - start);




                if (typeof window !== "undefined") {
                    try {
                        localStorage.setItem(
                            cacheKey,
                            JSON.stringify({ data: list, timestamp: Date.now() })
                        );


                    } catch (e) {
                        console.warn("Services cache yazılamadı:", e);
                    }
                }
            } catch (err) {
                console.error("❌ API ERROR:", err);
                setError(err.message || "API hatası");
                setServices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tenantId, locale, categoryId, locationOnly, cleaningOnly]);

    return { services, loading, error, durationMs };
}
