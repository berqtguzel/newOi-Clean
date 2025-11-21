// resources/js/Components/Home/Locations/LocationCard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "@inertiajs/react";
import "react-lazy-load-image-component/src/effects/blur.css";
import "../../../../css/LocationCard.css";

import SafeHtml from "@/Components/Common/SafeHtml";
import { useLocale } from "@/hooks/useLocale";
import { useTranslation } from "react-i18next";

const stripHtml = (s = "") =>
    String(s)
        .replace(/<[^>]*>/g, "")
        .trim();

let FallbackImg = (props) => <img {...props} />;

export default function LocationCard({ location, onHover, isActive }) {
    const [Img, setImg] = useState(() => FallbackImg);
    const locale = useLocale("de");
    const { t } = useTranslation();

    useEffect(() => {
        if (typeof window !== "undefined") {
            import("react-lazy-load-image-component").then((mod) => {
                const Lazy = mod.LazyLoadImage || mod.default?.LazyLoadImage;
                if (Lazy) setImg(() => Lazy);
            });
        }
    }, []);

    const activeTranslation = useMemo(() => {
        const list = location?.translations;
        if (!Array.isArray(list) || list.length === 0) return null;

        let found = list.find((tr) => tr.language_code === locale);
        if (!found) {
            found = list.find((tr) => tr.language_code === "de");
        }
        if (!found) {
            found = list[0];
        }
        return found || null;
    }, [location, locale]);

    const titleHtml =
        activeTranslation?.title ||
        activeTranslation?.name ||
        location.title ||
        location.name ||
        "";

    const cityRaw =
        activeTranslation?.city ||
        location.city ||
        location.district ||
        location.country ||
        activeTranslation?.title ||
        location.title ||
        activeTranslation?.name ||
        location.name ||
        "";

    const cityText = stripHtml(cityRaw) || "dieser Stadt";

    const slug = location.slug;

    if (!slug) {
        console.warn("Location without slug, skipping card:", location);
        return null;
    }

    const hasMaps = Array.isArray(location.maps) && location.maps.length > 0;
    const primaryMap = hasMaps ? location.maps[0] : null;

    const href = `/${slug}`;

    // i18n metinleri
    const ctaLabel = t("locations.card.cta", "Mehr erfahren");
    const ctaAria = t(
        "locations.card.cta_aria",
        "Mehr über unsere Reinigungsservices in {{city}} erfahren",
        { city: cityText }
    );

    return (
        <article
            className={`location-card ${isActive ? "active" : ""}`}
            onMouseEnter={onHover}
            onFocus={onHover}
            data-map-id={primaryMap?.id}
            data-map-name={primaryMap?.name}
            data-map-type={primaryMap?.map_type}
            data-map-source={primaryMap?.map_source}
            data-map-data-source={primaryMap?.data_source}
        >
            <div className="location-card-media">
                <Img
                    src={location.image}
                    alt={
                        primaryMap?.name
                            ? `Reinigungsservice in ${cityText} – ${primaryMap.name}`
                            : `Reinigungsservice in ${cityText}`
                    }
                    effect="blur"
                    className="location-card-image"
                    width={400}
                    height={300}
                />

                <div className="location-card-overlay" aria-hidden="true">
                    <h2 className="location-card-title">
                        <SafeHtml html={titleHtml || cityText} as="span" />
                    </h2>
                </div>
            </div>

            <div className="location-card-content">
                <div className="location-card-footer">
                    <a
                        href={href}
                        className="location-card-button"
                        aria-label={ctaAria}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {ctaLabel}
                        <svg
                            className="location-card-arrow"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M5 12H19M19 12L12 5M19 12L12 19"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </article>
    );
}
