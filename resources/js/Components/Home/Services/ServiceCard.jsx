// resources/js/Components/Home/Services/ServiceCard.jsx
import React from "react";
import { Link } from "@inertiajs/react";
import "./ServiceCard.css";

function buildHref({ link, slug, basePath = "/services" }) {
    if (link) return link; // tam verilen link öncelikli
    if (!slug) return basePath; // güvenli fallback
    if (slug.startsWith("/")) return slug; // mutlak slug
    return `${basePath}/${slug}`.replace(/([^:]\/)\/+/g, "$1");
}

const ServiceCard = ({
    title,
    image,
    icon: Icon,
    description,
    link,
    slug,
    basePath,
}) => {
    const imageRef = React.useRef(null);
    const [isLoaded, setIsLoaded] = React.useState(false);

    React.useEffect(() => {
        if (imageRef.current && imageRef.current.complete) setIsLoaded(true);
    }, []);

    const href = buildHref({ link, slug, basePath });

    return (
        <Link
            href={href}
            className="service-card group"
            aria-label={`Mehr über ${title} erfahren`}
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
                    alt={title}
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
                <h3 className="service-card__title">{title}</h3>
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
