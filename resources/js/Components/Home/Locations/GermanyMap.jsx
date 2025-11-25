import React, { memo, useMemo, useState, useEffect } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
} from "react-simple-maps";
import { fetchServices } from "@/services/servicesService";
import { usePage } from "@inertiajs/react";

const DE_STATES_URL =
    "https://cdn.jsdelivr.net/gh/isellsoap/deutschlandGeoJSON@master/2_bundeslaender/4_niedrig.geo.json";

const CITY_COORDS = {
    aachen: { lat: 50.7753, lng: 6.0839 },
    "bad vilbel": { lat: 50.1877, lng: 8.7362 },
    "bad salzuflen": { lat: 52.0868, lng: 8.7527 },
    "bad oeynhausen": { lat: 52.207, lng: 8.8003 },
    "bad nauheim": { lat: 50.3665, lng: 8.7397 },
    "bad kreuznach": { lat: 49.8454, lng: 7.8653 },
    köln: { lat: 50.9375, lng: 6.9603 },
    düsseldorf: { lat: 51.2277, lng: 6.7735 },
    frankfurt: { lat: 50.1109, lng: 8.6821 },
    berlin: { lat: 52.52, lng: 13.405 },
    hamburg: { lat: 53.5511, lng: 9.9937 },
    münchen: { lat: 48.1351, lng: 11.582 },
    stuttgart: { lat: 48.7758, lng: 9.1829 },
};

const GermanyMap = ({ activeId, setActiveId }) => {
    const { props } = usePage();
    const tenantId = props?.global?.tenantId || "";
    const locale = props?.locale || "de";

    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadMapData() {
            try {
                const data = await fetchServices({
                    tenantId,
                    locale,
                    perPage: 1000,
                });

                if (isMounted) {
                    const allServices = data.services || [];

                    const cleaningServices = allServices.filter((s) => {
                        const lowerTitle = (s.title || "").toLowerCase();
                        const lowerCat = (s.categoryName || "").toLowerCase();

                        return (
                            lowerCat.includes("gebäudereinigung") ||
                            lowerCat.includes("building cleaning") ||
                            lowerTitle.includes("gebäudereinigung") ||
                            lowerTitle.includes("building cleaning")
                        );
                    });

                    const uniqueLocationsMap = new Map();

                    cleaningServices.forEach((s) => {
                        const cityName = s.city ? s.city.trim() : "";
                        const cityKey = cityName.toLowerCase();

                        let lat = parseFloat(s.latitude);
                        let lng = parseFloat(s.longitude);

                        if (!lat || !lng) {
                            const fallback = CITY_COORDS[cityKey];
                            if (fallback) {
                                lat = fallback.lat;
                                lng = fallback.lng;
                            }
                        }

                        if (lat && lng && !uniqueLocationsMap.has(cityKey)) {
                            uniqueLocationsMap.set(cityKey, {
                                id: s.id,
                                name: cityName || s.title,
                                coords: [lng, lat],
                            });
                        }
                    });

                    setLocations(Array.from(uniqueLocationsMap.values()));
                }
            } catch (error) {
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadMapData();

        return () => {
            isMounted = false;
        };
    }, [tenantId, locale]);

    const markers = useMemo(() => locations, [locations]);

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
                                        outline: "none",
                                    },
                                    hover: {
                                        fill: hoverFill,
                                        stroke: stroke,
                                        strokeWidth: 0.9,
                                        outline: "none",
                                    },
                                    pressed: {
                                        fill: activeFill,
                                        stroke: stroke,
                                        strokeWidth: 0.9,
                                        outline: "none",
                                    },
                                }}
                            />
                        ))
                    }
                </Geographies>

                {markers.map((m) => {
                    const isActive = activeId === m.id;
                    return (
                        <Marker
                            key={m.id}
                            coordinates={m.coords}
                            onMouseEnter={() => setActiveId?.(m.id)}
                            onMouseLeave={() => setActiveId?.(null)}
                            onClick={() => setActiveId?.(m.id)}
                            style={{ cursor: "pointer" }}
                        >
                            <circle
                                r={10}
                                fill="rgba(14,165,233,0.3)"
                                stroke="none"
                            />

                            <circle
                                r={isActive ? 6 : 4}
                                fill={isActive ? "#0284c7" : "#0ea5e9"} // Mavi
                                stroke="#fff"
                                strokeWidth={1.5}
                                style={{ transition: "all 0.2s ease" }}
                            />

                            {isActive && (
                                <text
                                    textAnchor="middle"
                                    y={-15}
                                    style={{
                                        fontFamily: "system-ui",
                                        fill: "#1e293b",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        pointerEvents: "none",
                                        textShadow:
                                            "0px 0px 2px rgba(255,255,255,0.8)",
                                    }}
                                >
                                    {m.name}
                                </text>
                            )}
                        </Marker>
                    );
                })}
            </ComposableMap>
        </div>
    );
};

export default memo(GermanyMap);
