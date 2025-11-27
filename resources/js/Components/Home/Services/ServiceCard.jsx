import React, { useEffect, useRef, useState, useMemo } from "react";
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

    const activeTranslation = translations.find(
        (tr) => normLang(tr.language_code) === currentLang
    );

    const displayTitle =
        title || activeTranslation?.title || activeTranslation?.name || "";

    const imageRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (imageRef.current?.complete) {
            setIsLoaded(true);
        }
    }, []);

    // 📌 Slug → olduğu gibi kullanıyoruz
    const effectiveSlug = slug || "";
    const href = buildHref({ link, slug: effectiveSlug });

    const plainTitle = useMemo(
        () =>
            stripHtml(displayTitle) ||
            t("services.card.default_service_name", "Service"),
        [displayTitle, t, i18n.language]
    );

    const buttonLabel = useMemo(
        () => t("services.card.button", "Details"),
        [t, i18n.language]
    );

    const ariaLabel = useMemo(
        () =>
            t("services.card.aria", {
                service: plainTitle,
                defaultValue: `Learn more about ${plainTitle}`,
            }),
        [t, i18n.language, plainTitle]
    );

    return (
        <Link href={href} className="service-card group" aria-label={ariaLabel}>
            <div className="service-card__image-wrapper">
                {!isLoaded && image && (
                    <div className="service-card__skeleton" aria-hidden />
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
