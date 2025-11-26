// resources/js/hooks/useServices.js
import { useEffect, useState } from "react";

const API_BASE = "https://omerdogan.de/api/v1/services";

export function useServices({
    tenantId,
    locale = "de",
    page = 1,
    perPage = 50,
    categoryId = undefined, // null → ana servis, undefined → gönderme
    locationOnly = false, // Standorte (şehir lokasyon) mod
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
                params.append("per_page", String(perPage));
                params.append("page", String(page));
                params.append("locale", locale);

                // Backend logic:
                // category_id = (empty string) → Ana servisler
                // category_id = number → belirli kategori
                if (categoryId === null) {
                    params.append("category_id", "");
                } else if (categoryId !== undefined) {
                    params.append("category_id", String(categoryId));
                }

                const url = `${API_BASE}?${params.toString()}`;
                console.log("🌍 API Request:", url);

                const res = await fetch(url, {
                    headers: {
                        Accept: "application/json",
                        "X-Tenant-ID": tenantId, // Güvenli fallback
                    },
                });

                const json = await res.json();
                console.log("📌 RAW Response:", json);

                let list = json?.data || [];

                // 🔥 STANDORTE (şehir sayfalarını çek)
                if (locationOnly) {
                    list = list.filter((s) => {
                        const cityOk = !!s.city;
                        const mapsOk = !!s.has_maps;
                        const catOk =
                            String(s.category_name || "")
                                .toLowerCase() === "gebäudereinigung".toLowerCase() ||
                            String(s.category_name || "")
                                .toLowerCase() === "gebaudereinigung".toLowerCase();

                        return cityOk && mapsOk && catOk;
                    });

                    console.log("📌 Filtered Standorte:", list);
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
    }, [tenantId, locale, page, perPage, categoryId, locationOnly]);

    return { services, loading, error, durationMs };
}
