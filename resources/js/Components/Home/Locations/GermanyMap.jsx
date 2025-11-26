import React, { memo, useMemo } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
} from "react-simple-maps";
import { useMaps } from "@/hooks/useMaps";
import { usePage } from "@inertiajs/react";

const DE_STATES_URL =
    "https://cdn.jsdelivr.net/gh/isellsoap/deutschlandGeoJSON@master/2_bundeslaender/4_niedrig.geo.json";

const GermanyMap = ({ activeId, setActiveId }) => {
    const { props } = usePage();

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        "oi_cleande_690e161c3a1dd";

    const locale = props?.locale || "de";

    // ✅ DOĞRU KULLANIM: Parametre Objeyle
    const { maps, loading, error } = useMaps({
        tenantId,
        locale,
    });


    const markers = useMemo(() => {
        if (!maps?.length || !maps[0]?.map_data?.markers) return [];

        return maps[0].map_data.markers
            .filter((m) => m.latitude && m.longitude)
            .map((m) => ({
                id: m.id,
                name: m.name,
                city: m.city || m.name,
                coords: [parseFloat(m.longitude), parseFloat(m.latitude)],
            }));
    }, [maps]);

    const baseFill = "#e5e7eb";
    const stroke = "#cbd5e1";
    const hoverFill = "#dbeafe";
    const activeFill = "#bae6fd";

    return (
        <div
            className="map-box"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: "600px",
            }}
        >
            {loading && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                        color: "#64748b",
                    }}
                >
                    Karte wird geladen...
                </div>
            )}

            {error && (
                <div style={{ color: "red", textAlign: "center" }}>
                    ❌ Map API Fehler!
                </div>
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
                                        fill: baseFill,
                                        stroke: stroke,
                                        strokeWidth: 0.8,
                                    },
                                    hover: {
                                        fill: hoverFill,
                                        stroke: stroke,
                                    },
                                    pressed: {
                                        fill: activeFill,
                                        stroke: stroke,
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
                        onClick={() => setActiveId?.(m.id)}
                        style={{ cursor: "pointer" }}
                    >
                        <circle r={10} fill="rgba(14,165,233,0.3)" />
                        <circle
                            r={activeId === m.id ? 6 : 4}
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
