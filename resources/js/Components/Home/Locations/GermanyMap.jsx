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
            .map((r) => ({
                id: r.service_id,
                name: r.city || r.name,
                slug: r.service_slug,
                coords: [
                    parseFloat(r.longitude),
                    parseFloat(r.latitude),
                ],
            }));
    }, [maps]);

    const goToCity = (slug) => {
        if (!slug) return;
        router.visit(`/${slug}`); // SEO-friendly slug redirect
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
                projectionConfig={{ center: [10.4, 51.2], scale: 3200 }}
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
