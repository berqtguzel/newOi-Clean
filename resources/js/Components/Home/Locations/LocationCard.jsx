import React, { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import "react-lazy-load-image-component/src/effects/blur.css";
import "../../../../css/LocationCard.css";

// 🚀 LazyLoadImage'ı SSR-safe şekilde dinamik import ediyoruz
let LazyLoadImageComponent = (props) => <img {...props} />; // SSR fallback

// Client tarafında modülü dinamik olarak yükle
if (typeof window !== "undefined") {
    import("react-lazy-load-image-component").then((mod) => {
        LazyLoadImageComponent =
            mod.LazyLoadImage || mod.default?.LazyLoadImage;
    });
}

// 🔠 Slug helper
const toSlug = (s = "") =>
    s
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

// 🧩 LocationCard component
export default function LocationCard({ location, onHover, isActive }) {
    const [Img, setImg] = useState(() => LazyLoadImageComponent);

    // Client’ta modül geldikten sonra state’i güncelle
    useEffect(() => {
        if (typeof window !== "undefined") {
            import("react-lazy-load-image-component").then((mod) => {
                const Lazy = mod.LazyLoadImage || mod.default?.LazyLoadImage;
                if (Lazy) setImg(() => Lazy);
            });
        }
    }, []);

    const slug = location.slug || toSlug(location.city || location.title);
    const href =
        location.link && location.link.trim().length > 0
            ? location.link
            : `/standorte/${slug}`;

    return (
        <article
            className={`location-card ${isActive ? "active" : ""}`}
            onMouseEnter={onHover}
            onFocus={onHover}
        >
            <div className="location-card-media">
                <Img
                    src={location.image}
                    alt={`Reinigungsservice in ${location.city}`}
                    effect="blur"
                    className="location-card-image"
                    width={400}
                    height={300}
                />
                <div className="location-card-overlay" aria-hidden="true">
                    <h2 className="location-card-title">{location.title}</h2>
                </div>
            </div>

            <div className="location-card-content">
                <div className="location-card-footer">
                    <Link
                        href={href}
                        className="location-card-button"
                        aria-label={`Mehr über unsere Reinigungsservices in ${location.city} erfahren`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        Mehr erfahren
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
                    </Link>
                </div>
            </div>
        </article>
    );
}
