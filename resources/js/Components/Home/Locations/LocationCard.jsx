import React, { useEffect, useState, useMemo } from "react";
import { Link } from "@inertiajs/react";
import "react-lazy-load-image-component/src/effects/blur.css";
import "../../../../css/LocationCard.css";
import SafeHtml from "@/Components/Common/SafeHtml";
import { useLocale } from "@/hooks/useLocale";
import { useTranslation } from "react-i18next";

const stripHtml = (s = "") =>
    String(s).replace(/<[^>]*>/g, "").trim();

let FallbackImg = (props) => <img {...props} />;

function getCityFromSlug(slug) {
    if (!slug) return { citySlug: "", cityTitle: "" };

    let cleaned = slug.replace(/^gebaudereinigung(?:-in)?-/, "");
    const cityTitle = cleaned
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return { citySlug: cleaned, cityTitle };
}

export default function LocationCard({ location, isActive }) {
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
        const list = location?.translations ?? [];
        return (
            list.find((tr) => tr.language_code === locale) ||
            list.find((tr) => tr.language_code === "de") ||
            list[0] ||
            {}
        );
    }, [location, locale]);

    const titleHtml =
        activeTranslation.title ||
        activeTranslation.name ||
        location.title ||
        location.name ||
        "";

    const { citySlug, cityTitle } = getCityFromSlug(location.slug);
    const cityText = cityTitle || stripHtml(titleHtml) || "";

    const href = `/${citySlug}`;

    const CTA_TEXT = {
        de: "Mehr erfahren",
        en: "Learn more",
        tr: "Daha fazla bilgi",
    };

    const CTA_ARIA =
        {
            de: `Reinigungsservices in ${cityText} ansehen`,
            en: `Cleaning services in ${cityText}`,
            tr: `${cityText} temizlik hizmetlerini görüntüle`,
        }[locale] || CTA_TEXT.de;

    const imgAlt = `Reinigungsservice in ${cityText}`;


    return (
        <Link
            href={href}
            className={`location-card ${isActive ? "active" : ""}`}
            aria-label={CTA_ARIA}
        >
            {/* IMAGE */}
            <div className="location-card-media">
                <Img
                    src={location.image}
                    alt={imgAlt}
                    width={400}
                    height={260}
                    effect="blur"
                    className="location-card-image is-loaded"
                />

               

                {/* Overlay Title */}
                <div className="location-card-overlay">
                    <h2 className="location-card-title">
                        <SafeHtml html={titleHtml} as="span" />
                    </h2>
                </div>
            </div>

            {/* CONTENT */}
            <div className="location-card-content">
                {/* 👇 Buraya şehir adını gösteriyoruz! */}
                <h3 className="location-card-city">
                    {cityText}
                </h3>

                <div className="location-card-footer">
                    <span className="location-card-button">
                        {CTA_TEXT[locale] || CTA_TEXT.de}
                        <svg className="location-card-arrow" viewBox="0 0 24 24">
                            <path
                                d="M5 12H19M19 12L12 5M19 12L12 19"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                </div>
            </div>
        </Link>
    );
}
