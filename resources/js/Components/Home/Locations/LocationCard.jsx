import React, { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import "react-lazy-load-image-component/src/effects/blur.css";
import "../../../../css/LocationCard.css";

// 🔒 Güvenli HTML render
import SafeHtml from "@/Components/Common/SafeHtml";

// 🔠 Slug helper
const toSlug = (s = "") =>
    s
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

// 🧹 Basit HTML tag temizleyici (alt / aria-label / slug için)
const stripHtml = (s = "") => s.replace(/<[^>]*>/g, "").trim();

// 🚀 SSR-safe LazyLoadImage (fallback: normal img)
let FallbackImg = (props) => <img {...props} />;

export default function LocationCard({ location, onHover, isActive }) {
    const [Img, setImg] = useState(() => FallbackImg);

    // Client’ta modül geldikten sonra LazyLoadImage ile değiştir
    useEffect(() => {
        if (typeof window !== "undefined") {
            import("react-lazy-load-image-component").then((mod) => {
                const Lazy = mod.LazyLoadImage || mod.default?.LazyLoadImage;
                if (Lazy) setImg(() => Lazy);
            });
        }
    }, []);

    // 🔗 /api/v1/services yapısına göre mapping
    // title: eski title varsa onu, yoksa service.name
    const titleHtml = location.title || location.name || "";

    // şehir: varsa city, yoksa district, yoksa country, yoksa name
    const cityRaw =
        location.city ||
        location.district ||
        location.country ||
        location.title ||
        location.name ||
        "";

    const cityText = stripHtml(cityRaw) || "dieser Stadt";

    // slug için base: slug > name > city
    const slugBase = location.slug || location.name || cityRaw || "";
    const slug = location.slug || toSlug(stripHtml(slugBase));

    // maps bilgisi: map'e göre seçmek için data-* attribute'larına koyacağız
    const hasMaps = Array.isArray(location.maps) && location.maps.length > 0;
    const primaryMap = hasMaps ? location.maps[0] : null;

    // Link: API'den özel link geldiyse onu kullan, yoksa slug'a göre
    const href =
        location.link && location.link.trim().length > 0
            ? location.link
            : `/standorte/${slug}`; // route'ı istersen /services/${slug} yapabilirsin

    return (
        <article
            className={`location-card ${isActive ? "active" : ""}`}
            onMouseEnter={onHover}
            onFocus={onHover}
            // 🗺️ map'e göre seçmek için data attribute'lar
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
                    <Link
                        href={href}
                        className="location-card-button"
                        aria-label={`Mehr über unsere Reinigungsservices in ${cityText} erfahren`}
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
