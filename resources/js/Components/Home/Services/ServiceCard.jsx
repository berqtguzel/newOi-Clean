// resources/js/Components/Home/Services/ServiceCard.jsx
import React from "react";
import { Link } from "@inertiajs/react";
import "./ServiceCard.css";
import SafeHtml from "@/Components/Common/SafeHtml";

/**
 * Artık /services/... değil, doğrudan /slug kullanıyoruz
 */
function buildHref({ link, slug }) {
    if (link) return link; // tam URL ya da özel link verilmişse onu kullan
    if (!slug) return "/"; // slug yoksa ana sayfaya fallback
    if (slug.startsWith("/")) return slug; // zaten /ile başlıyorsa dokunma
    return `/${slug}`.replace(/([^:]\/)\/+/g, "$1"); // normalde → /wohnungsrenovierung
}

function stripHtml(str = "") {
    return String(str)
        .replace(/<[^>]+>/g, "")
        .trim();
}

const ServiceCard = ({
    title,
    image,
    icon: Icon,
    description,
    link,
    slug,
    // basePath, // ⬅️ artık kullanmıyoruz, ama kalsın istersek props bozmasın
}) => {
    const imageRef = React.useRef(null);
    const [isLoaded, setIsLoaded] = React.useState(false);

    React.useEffect(() => {
        if (imageRef.current && imageRef.current.complete) {
            setIsLoaded(true);
        }
    }, []);

    // ⬅️ basePath yerine sadece slug/link'e göre href hesaplıyoruz
    const href = buildHref({ link, slug });

    const plainTitle = stripHtml(title) || "diesen Service";

    return (
        <Link
            href={href}
            className="service-card group"
            aria-label={`Mehr über ${plainTitle} erfahren`}
        >
            <div className="service-card__image-wrapper">
                {!isLoaded && (
                    <div className="service-card__skeleton" aria-hidden="true">
                        <div className="service-card__skeleton-wave" />
                    </div>
                )}

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

                <div className="service-card__overlay">
                    {Icon && <Icon className="service-card__icon" />}
                </div>
            </div>

            <div className="service-card__content">
                <h3 className="service-card__title">
                    <SafeHtml html={title} />
                </h3>

                {description && (
                    <p className="service-card__description">
                        <SafeHtml html={description} />
                    </p>
                )}

                <span className="service-card__button">
                    <span>Details</span>
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
