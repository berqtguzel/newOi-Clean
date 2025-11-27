// resources/js/hooks/useServices.js
import { useEffect, useState } from "react";

const API_BASE = "https://omerdogan.de/api/v1/services";

async function fetchAllPages(url, tenantId, page = 1, perPage = 1000, accumulator = []) {
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
    categoryId = undefined,
    locationOnly = false,
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

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const start = performance.now();

                const params = new URLSearchParams();
                params.append("tenant", tenantId);
                params.append("locale", locale);

                if (categoryId !== undefined) {
                    categoryId === null
                        ? params.append("category_id", "")
                        : params.append("category_id", String(categoryId));
                }

                // 🔥 TÜM SAYFALARI ÇEK 🔥
                let list = await fetchAllPages(params, tenantId);

                // 📌 SONRA locationOnly filtre uygula
                if (locationOnly) {
                    list = list.filter((s) => {
                        const cityOk = !!s.city;
                        const catOk =
                            (s.category_name || "").toLowerCase() === "gebäudereinigung" ||
                            (s.category_name || "").toLowerCase() === "gebaudereinigung";
                        return cityOk && catOk;
                    });
                }

                setServices(list);
                setDurationMs(performance.now() - start);

            } catch (err) {
                console.error("❌ API ERROR:", err);
                setError(err.message || "API hatası");
                setServices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tenantId, locale, categoryId, locationOnly]);

    return { services, loading, error, durationMs };
}
