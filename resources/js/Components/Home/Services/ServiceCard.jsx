import React, { useEffect, useRef, useState } from "react";
import { Link } from "@inertiajs/react";
import "./ServiceCard.css";
import SafeHtml from "@/Components/Common/SafeHtml";
import { useTranslation } from "react-i18next";

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

    const currentCitySlug = getCitySlugFromPath();
    let effectiveSlug = slug || "";

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

    const href = buildHref({ link, slug: effectiveSlug });

    const plainTitle =
        stripHtml(displayTitle) ||
        t("services.card.default_service_name", "Service");

    const buttonLabel = t("services.card.button", "Details");

    const ariaLabel = t("services.card.aria", {
        service: plainTitle,
        defaultValue: `Learn more about ${plainTitle}`,
    });

    return (
        <Link href={href} className="service-card group" aria-label={ariaLabel}>
            <div className="service-card__image-wrapper">
                {!isLoaded && (
                    <div className="service-card__skeleton" aria-hidden="true">
                        <div className="service-card__skeleton-wave" />
                    </div>
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
                        width="800"
                        height="600"
                    />
                ) : (
                    <div className="service-card__image-placeholder">
                        {Icon && <Icon className="w-12 h-12 text-gray-300" />}
                    </div>
                )}

                <div className="service-card__overlay">
                    {Icon && <Icon className="service-card__icon" />}
                </div>
            </div>

            <div className="service-card__content">
                {/* SafeHtml <p> içinde kullanıldığı için div'e çevrilmiştir */}
                <div className="service-card__title-wrapper">
                    <h3 className="service-card__title">
                        <SafeHtml html={displayTitle} />
                    </h3>
                </div>

                {displayDesc && (
                    <div className="service-card__description">
                        <SafeHtml html={displayDesc} />
                    </div>
                )}

                <span className="service-card__button">
                    <span>{buttonLabel}</span>
                    <svg
                        className="service-card__arrow"
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
                </span>
            </div>
        </Link>
    );
};

export default ServiceCard;
