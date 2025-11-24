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

// --- FALLBACK KOORDİNATLAR (API'den NULL gelirse bunlar kullanılacak) ---
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
    // Buraya projedeki diğer şehirleri de ekleyebilirsin
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
                // 1. Çok sayıda veri çekiyoruz
                const data = await fetchServices({
                    tenantId,
                    locale,
                    perPage: 1000,
                });

                if (isMounted) {
                    const allServices = data.services || [];

                    // 2. Filtreleme: "Gebäudereinigung" veya "Building Cleaning" olanlar
                    const cleaningServices = allServices.filter((s) => {
                        // Başlıkta, kategori adında veya slug'da arıyoruz
                        const lowerTitle = (s.title || "").toLowerCase();
                        const lowerCat = (s.categoryName || "").toLowerCase();

                        return (
                            lowerCat.includes("gebäudereinigung") ||
                            lowerCat.includes("building cleaning") ||
                            lowerTitle.includes("gebäudereinigung") ||
                            lowerTitle.includes("building cleaning")
                        );
                    });

                    // 3. Koordinat Bulma ve Tekleştirme
                    const uniqueLocationsMap = new Map();

                    cleaningServices.forEach((s) => {
                        const cityName = s.city ? s.city.trim() : "";
                        const cityKey = cityName.toLowerCase();

                        // A) API'den gelen koordinat var mı?
                        let lat = parseFloat(s.latitude);
                        let lng = parseFloat(s.longitude);

                        // B) Yoksa Fallback listesinden bulalım
                        if (!lat || !lng) {
                            const fallback = CITY_COORDS[cityKey];
                            if (fallback) {
                                lat = fallback.lat;
                                lng = fallback.lng;
                            }
                        }

                        // Eğer hala koordinat yoksa haritaya ekleyemeyiz, atlıyoruz.
                        if (lat && lng && !uniqueLocationsMap.has(cityKey)) {
                            uniqueLocationsMap.set(cityKey, {
                                id: s.id,
                                name: cityName || s.title,
                                coords: [lng, lat], // [Boylam, Enlem] sırası önemli
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

    // Marker oluşturma
    const markers = useMemo(() => locations, [locations]);

    // Renkler
    const baseFill = "#e5e7eb"; // Harita Gri
    const stroke = "#cbd5e1"; // Sınır Çizgileri
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
            {/* Yükleniyor İfadesi */}
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
                // Almanya'yı ortalamak için config:
                projectionConfig={{ center: [10.4, 51.2], scale: 3200 }}
                style={{ width: "100%", height: "100%" }}
            >
                {/* Harita Zemini (Eyaletler) */}
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

                {/* Noktalar (Markers) */}
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
                            {/* Dış Hare (Pulse efekti) */}
                            <circle
                                r={10}
                                fill="rgba(14,165,233,0.3)"
                                stroke="none"
                            />

                            {/* Ana Nokta */}
                            <circle
                                r={isActive ? 6 : 4}
                                fill={isActive ? "#0284c7" : "#0ea5e9"} // Mavi
                                stroke="#fff"
                                strokeWidth={1.5}
                                style={{ transition: "all 0.2s ease" }}
                            />

                            {/* Şehir İsmi (Opsiyonel: Sadece hover'da veya mobilde açılabilir) */}
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
