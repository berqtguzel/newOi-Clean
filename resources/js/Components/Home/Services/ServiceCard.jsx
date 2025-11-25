import React, { useEffect, useRef, useState } from "react";
import { Link } from "@inertiajs/react";
import "./ServiceCard.css";
import SafeHtml from "@/Components/Common/SafeHtml";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
/* ------------------------------ helpers ------------------------------ */

function buildHref({ link, slug }) {
    if (link) return link;
    if (!slug) return "/";
    if (slug.startsWith("/")) return slug;
    return `/${slug}`.replace(/([^:]\/)\/+/g, "$1");
}

function stripHtml(str = "") {
    return String(str)
        .replace(/<[^>]+>/g, "")
        .trim();
}

// "de-DE", "tr-TR", "EN" → normalize: de, tr, en
function normLang(code) {
    return String(code || "")
        .toLowerCase()
        .split("-")[0];
}

const ServiceCard = ({
    title,
    image,
    icon: Icon,
    description,
    link,
    slug,
    translations = [],
}) => {
    const { t, i18n } = useTranslation();

    const currentLang = normLang(i18n.language || "de");

    /* ======================================================
     * DİL SEÇİMİ
     * ====================================================== */

    const activeTranslation = translations.find(
        (tr) => normLang(tr.language_code) === currentLang
    );

    const displayTitle =
        title || activeTranslation?.title || activeTranslation?.name || "";

    const displayDesc =
        description ||
        activeTranslation?.description ||
        activeTranslation?.content ||
        "";

    /* ======================================================
     * IMAGE LOADING
     * ====================================================== */

    const imageRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (imageRef.current && imageRef.current.complete) {
            setIsLoaded(true);
        }
    }, []);

    /* ======================================================
     * SLUG – ŞEHİR EKLEME ALGORİTMASI
     * ====================================================== */

    // Location show sayfasında mıyız? (ör: /aalen, /berlin)
    // Location show sayfası: sadece bir segment var ve service prefix'leri ile başlamıyor
    const isLocationShowPage = () => {
        if (typeof window === "undefined") return false;
        const path = window.location.pathname;
        const parts = path.split("/").filter(Boolean);

        // Sadece bir segment varsa ve service prefix'leri ile başlamıyorsa location show sayfası
        if (parts.length === 1) {
            const slug = parts[0] || "";
            const isServicePrefix =
                /^(gebaudereinigung|wohnungsrenovierung|hotelreinigung)-/.test(
                    slug.toLowerCase()
                );
            const isSpecialRoute =
                /^(services|standorte|kontakt|dienstleistungen|lang|home)$/i.test(
                    slug
                );
            return !isServicePrefix && !isSpecialRoute;
        }

        return false;
    };

    // Mevcut URL'den city slug'ını al (location show sayfası için)
    const getCurrentCitySlug = () => {
        if (typeof window === "undefined") return null;
        const path = window.location.pathname;
        const parts = path.split("/").filter(Boolean);
        if (parts.length === 1) {
            const slug = parts[0] || "";
            const isServicePrefix =
                /^(gebaudereinigung|wohnungsrenovierung|hotelreinigung)-/.test(
                    slug.toLowerCase()
                );
            const isSpecialRoute =
                /^(services|standorte|kontakt|dienstleistungen|lang|home)$/i.test(
                    slug
                );
            if (!isServicePrefix && !isSpecialRoute) {
                return slug;
            }
        }
        return null;
    };

    const getCitySlugFromPath = () => {
        if (typeof window === "undefined") return null;
        const parts = window.location.pathname.split("/").filter(Boolean);
        if (!parts.length) return null;

        const last = parts[parts.length - 1] || "";
        const slugParts = last.split("-");

        if (slugParts.length <= 1) return null;

        const cityParts =
            slugParts[1] === "in" ? slugParts.slice(2) : slugParts.slice(1);

        if (!cityParts.length) return null;

        return cityParts.join("-").toLowerCase();
    };

    const normalize = (v) =>
        String(v || "")
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, "-")
            .replace(/^-+|-+$/g, "");

    // Service slug kontrolü: slug zaten service prefix'leri ile başlıyorsa
    const isServiceSlug =
        /^(gebaudereinigung|wohnungsrenovierung|hotelreinigung)-/.test(
            String(slug || "").toLowerCase()
        );

    // Location show sayfasındaysak city ekleme mantığını UYGULA - location'a göre URL oluştur
    const isOnLocationPage = isLocationShowPage();

    let effectiveSlug = slug || "";

    if (isOnLocationPage) {
        // Location show sayfasındaysak city slug'ını al ve ekle
        // Örnek: /berlin sayfasındayken /baufeinreinigung-berlin'e yönlendir
        const currentCitySlug = getCurrentCitySlug();
        const slugValue = effectiveSlug.startsWith("/")
            ? effectiveSlug.slice(1)
            : effectiveSlug;

        if (
            currentCitySlug &&
            slugValue &&
            !normalize(slugValue).includes(normalize(currentCitySlug))
        ) {
            effectiveSlug = `${slugValue}-${currentCitySlug}`;
        } else {
            effectiveSlug = slugValue;
        }
    } else if (isServiceSlug) {
        // Service slug ise olduğu gibi kullan
        effectiveSlug = effectiveSlug.startsWith("/")
            ? effectiveSlug.slice(1)
            : effectiveSlug;
    } else {
        // Normal sayfalarda city ekleme mantığı
        const currentCitySlug = getCitySlugFromPath();
        const slugValue = effectiveSlug.startsWith("/")
            ? effectiveSlug.slice(1)
            : effectiveSlug;

        if (
            currentCitySlug &&
            slugValue &&
            !normalize(slugValue).includes(normalize(currentCitySlug))
        ) {
            effectiveSlug = `${slugValue}-${currentCitySlug}`;
        }
    }

    const href = buildHref({ link, slug: effectiveSlug });

    // HYDRATION FIX: useMemo ile sarmala ve i18n.language dependency ekle
    const plainTitle = useMemo(() => {
        return (
            stripHtml(displayTitle) ||
            t("services.card.default_service_name", "Service")
        );
    }, [displayTitle, t, i18n.language]);

    const buttonLabel = useMemo(() => {
        return t("services.card.button", "Details");
    }, [t, i18n.language]);

    const ariaLabel = useMemo(() => {
        return t("services.card.aria", {
            service: plainTitle,
            defaultValue: `Learn more about ${plainTitle}`,
        });
    }, [t, i18n.language, plainTitle]);

    return (
        <Link href={href} className="service-card group" aria-label={ariaLabel}>
            <div className="service-card__image-wrapper">
                {!isLoaded && image && (
                    <div
                        className="service-card__skeleton"
                        aria-hidden="true"
                    />
                )}

                {image ? (
                    <img
                        ref={imageRef}
                        src={image}
                        alt={plainTitle}
                        className={`service-card__image ${
                            isLoaded ? "is-loaded" : ""
                        }`}
                        loading="lazy"
                        onLoad={() => setIsLoaded(true)}
                        onError={() => setIsLoaded(true)}
                        width="800"
                        height="600"
                    />
                ) : (
                    <div className="service-card__image-placeholder">
                        {Icon && <Icon className="w-12 h-12" />}
                    </div>
                )}

                {Icon && (
                    <div className="service-card__overlay" aria-hidden="true">
                        <Icon className="service-card__icon" />
                    </div>
                )}
            </div>

            <div className="service-card__content">
                <div className="service-card__title-wrapper">
                    <h3 className="service-card__title">
                        <SafeHtml html={displayTitle} />
                    </h3>
                </div>

                <span className="service-card__button">
                    <span>{buttonLabel}</span>
                    <svg
                        className="service-card__arrow"
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
        </Link>
    );
};

export default ServiceCard;
