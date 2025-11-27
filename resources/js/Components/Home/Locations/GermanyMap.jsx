import React, { memo, useMemo } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
} from "react-simple-maps";
import { useMaps } from "@/hooks/useMaps";
import { usePage, router } from "@inertiajs/react";

const DE_STATES_URL =
    "https://cdn.jsdelivr.net/gh/isellsoap/deutschlandGeoJSON@master/2_bundeslaender/4_niedrig.geo.json";

// slug: "gebaudereinigung-in-neustadt-am-rubenberge"
// ➜ "Neustadt Am Rubenberge"
const slugToCityName = (slug = "") => {
    if (!slug) return "";

    let s = slug;

    // Önde gelen sabit kısımları temizle
    const prefixes = [
        "gebaudereinigung-in-",
        "gebäudereinigung-in-",
        "gebaeudereinigung-in-",
    ];

    for (const p of prefixes) {
        if (s.startsWith(p)) {
            s = s.slice(p.length);
            break;
        }
    }

    // "neustadt-am-rubenberge" ➜ ["neustadt","am","rubenberge"] ➜ "Neustadt Am Rubenberge"
    return s
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

const GermanyMap = ({ activeId, setActiveId }) => {
    const { props } = usePage();

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        "oi_cleande_690e161c3a1dd";

    const locale = props?.locale || "de";

    const { maps, loading } = useMaps({ tenantId, locale });

    const markers = useMemo(() => {
        const regions = maps?.[0]?.map_data?.regions || [];

        return regions
            .filter((r) => r.latitude && r.longitude && r.service_slug)
            .map((r) => {
                const cityFromSlug = slugToCityName(r.service_slug);

                return {
                    id: r.service_id,
                    // 1) API'den city varsa onu kullan
                    // 2) Yoksa slug'tan ürettiğimiz şehir adını kullan
                    // 3) O da yoksa fallback olarak r.name kullan
                    name: r.city || cityFromSlug || r.name,
                    slug: r.service_slug,
                    coords: [
                        parseFloat(r.longitude),
                        parseFloat(r.latitude),
                    ],
                };
            });
    }, [maps]);

    const goToCity = (slug) => {
        if (!slug) return;
        router.visit(`/${slug}`); // SEO-friendly slug redirect (bunu bozmadım)
    };

    return (
        <div className="map-box" style={{ minHeight: "600px" }}>
            {loading && (
                <p style={{ textAlign: "center", color: "#888" }}>
                    Karte wird geladen…
                </p>
            )}

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    center: [9.5, 51.5],
                    scale: 2400,
                }}
                style={{ width: "100%", height: "100%" }}
            >
                <Geographies geography={DE_STATES_URL}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                style={{
                                    default: {
                                        fill: "#e5e7eb",
                                        stroke: "#cbd5e1",
                                        strokeWidth: 0.8,
                                    },
                                    hover: {
                                        fill: "#dbeafe",
                                    },
                                }}
                            />
                        ))
                    }
                </Geographies>

                {markers.map((m) => (
                    <Marker
                        key={m.id}
                        coordinates={m.coords}
                        onMouseEnter={() => setActiveId?.(m.id)}
                        onMouseLeave={() => setActiveId?.(null)}
                        onClick={() => goToCity(m.slug)}
                        style={{ cursor: "pointer" }}
                    >
                        {/* Glow */}
                        <circle
                            r={10}
                            fill="rgba(14, 165, 233, 0.30)"
                        />
                        {/* Dot */}
                        <circle
                            r={activeId === m.id ? 7 : 5}
                            fill={activeId === m.id ? "#0284c7" : "#0ea5e9"}
                            stroke="#fff"
                            strokeWidth={1.5}
                        />
                    </Marker>
                ))}
            </ComposableMap>
        </div>
    );
};

export default memo(GermanyMap);
