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

/**
 * Almanca karakterleri normalize et (ß -> ss, ü -> ue, ö -> oe, ä -> ae)
 */
function normalizeGermanChars(text) {
    if (!text) return "";
    return String(text)
        .replace(/ß/g, "ss")
        .replace(/ü/g, "ue")
        .replace(/ö/g, "oe")
        .replace(/ä/g, "ae")
        .replace(/Ü/g, "ue")
        .replace(/Ö/g, "oe")
        .replace(/Ä/g, "ae");
}

let FallbackImg = (props) => <img {...props} />;

function getCityFromSlug(rawSlug) {
    if (!rawSlug) return { citySlug: "", cityTitle: "" };

    const slug = String(rawSlug).trim();
    const lower = slug.toLowerCase();

    const prefix1 = "gebaudereinigung-in-";
    const prefix2 = "gebaudereinigung-";

    let citySlug = slug;

    if (lower.startsWith(prefix1)) {
        citySlug = slug.slice(prefix1.length);
    } else if (lower.startsWith(prefix2)) {
        citySlug = slug.slice(prefix2.length);
    }

    citySlug = citySlug.replace(/^\/+|\/+$/g, "");

    const cityTitle = citySlug
        .split("-")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return { citySlug, cityTitle };
}

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

        return (
            list.find((tr) => tr.language_code === locale) ||
            list.find((tr) => tr.language_code === "de") ||
            list[0] ||
            null
        );
    }, [location, locale]);

    const titleHtml =
        activeTranslation?.title ||
        activeTranslation?.name ||
        location.title ||
        location.name ||
        "";

    const originalSlug = location.slug;
    if (!originalSlug) return null;

    // 🔥 Önce location.city field'ını kullan, yoksa slug'dan çıkar
    let citySlug = location.city?.toLowerCase()?.trim() || "";

    if (!citySlug) {
        // Slug'dan şehir bilgisini çıkar
        const parsed = getCityFromSlug(originalSlug);
        citySlug = parsed.citySlug.toLowerCase().trim();
    }

    // Eğer hala citySlug yoksa, slug'ın tamamını kullan
    if (!citySlug) {
        citySlug = originalSlug.toLowerCase().trim();
        // Prefix'leri kaldır
        if (citySlug.startsWith("gebaudereinigung-in-")) {
            citySlug = citySlug.replace(/^gebaudereinigung-in-/, "");
        } else if (citySlug.startsWith("gebaudereinigung-")) {
            citySlug = citySlug.replace(/^gebaudereinigung-/, "");
        }
    }

    // 🔥 Almanca karakterleri normalize et (ß -> ss, ü -> ue, ö -> oe, ä -> ae)
    citySlug = normalizeGermanChars(citySlug);

    // 🔥 Boşlukları tireye çevir (URL için normalize et)
    citySlug = citySlug.replace(/\s+/g, "-");

    // Şehir başlığını oluştur (boşluklu versiyon)
    const cityTitle = citySlug
        .split("-")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const cityText = cityTitle || stripHtml(titleHtml) || "dieser Stadt";

    const href = `/${citySlug}`;

    const hasMaps = Array.isArray(location.maps) && location.maps.length > 0;
    const primaryMap = hasMaps ? location.maps[0] : null;

    const CTA_TEXT = {
        de: "Mehr erfahren",
        en: "Learn more",
        tr: "Daha fazla bilgi",
    };

    const CTA_ARIA = {
        de: "Mehr über unsere Reinigungsservices in {{city}} erfahren",
        en: "Learn more about our cleaning services in {{city}}",
        tr: "{{city}}'deki temizlik hizmetlerimiz hakkında daha fazla bilgi alın",
    };

    const ctaLabel = CTA_TEXT[locale] || CTA_TEXT.de;
    const ctaAria = (CTA_ARIA[locale] || CTA_ARIA.de).replace(
        "{{city}}",
        cityText
    );
    const finalTitle = titleHtml
        ? `${stripHtml(titleHtml)} – ${cityText}`
        : cityText;

    return (
        <Link
            href={href}
            className={`location-card ${isActive ? "active" : ""}`}
            aria-label={ctaAria}
            data-map-id={primaryMap?.id}
            data-map-name={primaryMap?.name}
            data-map-type={primaryMap?.map_type}
            data-map-source={primaryMap?.map_source}
            data-map-data-source={primaryMap?.data_source}
            onMouseEnter={onHover}
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
            </div>

            <div className="location-card-content">
                <div className="location-card-overlay" aria-hidden="true">
                    <h3 className="location-card-title">{titleHtml}</h3>
                </div>
                <div className="location-card-footer">
                    <span className="location-card-button">
                        <span suppressHydrationWarning>{ctaLabel}</span>
                        <svg
                            className="location-card-arrow"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
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
