import React, { memo, useMemo } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
} from "react-simple-maps";

const DE_STATES_URL =
    "https://cdn.jsdelivr.net/gh/isellsoap/deutschlandGeoJSON@master/2_bundeslaender/4_niedrig.geo.json";

const GermanyMap = ({ locations = [], activeId, setActiveId }) => {
    const markers = useMemo(
        () =>
            (locations || [])
                .filter(
                    (l) =>
                        l?.coordinates &&
                        Number.isFinite(l.coordinates.lat) &&
                        Number.isFinite(l.coordinates.lng)
                )
                .map((l) => ({
                    id: l.id,
                    name: l.city || l.title || `#${l.id}`,
                    coords: [l.coordinates.lng, l.coordinates.lat],
                })),
        [locations]
    );

    const baseFill = "#e5e7eb";
    const stroke = "#cbd5e1";
    const hoverFill = "#dbeafe";
    const activeFill = "#bae6fd";

    return (
        <div className="map-box">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{ center: [10.3, 51.2], scale: 3400 }}
                width={500}
                height={780}
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
                                        stroke,
                                        strokeWidth: 0.8,
                                        outline: "none",
                                    },
                                    hover: {
                                        fill: hoverFill,
                                        stroke,
                                        strokeWidth: 0.9,
                                        outline: "none",
                                    },
                                    pressed: {
                                        fill: activeFill,
                                        stroke,
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
                        >
                            <circle
                                r={9.5}
                                fill="rgba(14,165,233,0.18)"
                                stroke="rgba(14,165,233,0.45)"
                                strokeWidth={1.6}
                            />
                            <circle
                                r={isActive ? 6 : 5}
                                fill={isActive ? "#06b6d4" : "#22d3ee"}
                                style={{ transition: "r .15s ease" }}
                            />
                        </Marker>
                    );
                })}
            </ComposableMap>
        </div>
    );
};

export default memo(GermanyMap);
