import React, { memo, useMemo, useState } from "react";
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

// 🔹 Gösterim için: slug → City Title
const slugToCityTitle = (slug = "") =>
    String(slug)
        .split("-")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

// 🔹 URL yönlendirme için: Prefix temizleme
const servicePrefixes = [
    "gebaudereinigung-in-",
    "gebäudereinigung-in-",
    "gebaeudereinigung-in-",
];

const stripSlugPrefix = (slug = "") => {
    const lowerSlug = String(slug).toLowerCase().trim();
    const prefix = servicePrefixes.find((p) => lowerSlug.startsWith(p));
    return prefix ? lowerSlug.slice(prefix.length) : lowerSlug;
};

const GermanyMap = ({ activeId, setActiveId }) => {
    const { props } = usePage();
    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        "oi_cleande_690e161c3a1dd";
    const locale = props?.locale || "de";

    const { maps, loading } = useMaps({ tenantId, locale });

    const [hoveredMarker, setHoveredMarker] = useState(null);

    const markers = useMemo(() => {
        const regions = maps?.[0]?.map_data?.regions || [];
        return regions
            .filter((r) => r.latitude && r.longitude && r.service_slug)
            .map((r) => {
                const cleanSlug = stripSlugPrefix(r.service_slug);
                return {
                    id: r.service_id,
                    name: r.city || slugToCityTitle(cleanSlug),
                    slug: cleanSlug,
                    coords: [parseFloat(r.longitude), parseFloat(r.latitude)],
                };
            });
    }, [maps]);

    const goToCity = (slug) => {
        if (!slug) return;
        router.visit(`/${slug}`);
    };

    return (
        <div className="map-box" style={{ minHeight: "600px" }}>
            {loading && <p style={{ textAlign: "center" }}></p>}

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{ center: [9.5, 51.5], scale: 2400 }}
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
                                    hover: { fill: "#dbeafe" },
                                }}
                            />
                        ))
                    }
                </Geographies>

                {markers.map((m) => (
                    <Marker
                        key={m.id}
                        coordinates={m.coords}
                        onMouseEnter={() => {
                            setActiveId?.(m.id);
                            setHoveredMarker(m);
                        }}
                        onMouseLeave={() => {
                            setActiveId?.(null);
                            setHoveredMarker(null);
                        }}
                        onClick={() => goToCity(m.slug)}
                        style={{ cursor: "pointer" }}
                    >
                        {/* Glow */}
                        <circle
                            r={activeId === m.id ? 12 : 10}
                            style={{
                                fill: "var(--site-primary-color)",
                                opacity: 0.25,
                                transition:
                                    "r 0.2s ease-out, opacity 0.2s ease-out",
                            }}
                        />

                        {/* Dot */}
                        <circle
                            r={activeId === m.id ? 8 : 6}
                            style={{
                                fill: "var(--site-primary-color)",
                                stroke: "#fff",
                                strokeWidth: 1.4,
                                transition: "r 0.2s ease-out",
                            }}
                        />

                        {/* Tooltip */}
                        {hoveredMarker?.id === m.id && (
                            <g transform="translate(12, -10)">
                                <rect
                                    rx="4"
                                    width={m.name.length * 8 + 12}
                                    height="22"
                                    fill="#1e293b"
                                    opacity="0.9"
                                />
                                <text
                                    x="6"
                                    y="15"
                                    style={{
                                        fill: "#fff",
                                        fontSize: "12px",
                                        pointerEvents: "none",
                                        fontWeight: 600,
                                    }}
                                >
                                    {m.name}
                                </text>
                            </g>
                        )}
                    </Marker>
                ))}
            </ComposableMap>
        </div>
    );
};

export default memo(GermanyMap);
