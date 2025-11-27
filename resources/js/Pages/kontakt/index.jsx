import React, { useMemo, useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import ContactMap from "@/Components/Contact/ContactMaps";
import DOMPurify from "isomorphic-dompurify";
import parse from "html-react-parser";
import { useTranslation } from "react-i18next";
import { FaPhone, FaEnvelope } from "react-icons/fa";
import { getContactSettings } from "@/services/settingsService";
import "../../../css/ContactLocations.css";

function safeParse(html) {
    if (!html) return null;
    const clean = DOMPurify.sanitize(html);
    return parse(clean);
}

export default function ContactIndex({
    flash,
    currentRoute = "contact",
    introHtml,
}) {
    const { props, url: inertiaUrl } = usePage();
    // t() fonksiyonunu kullanarak çoklu dil desteği
    const { t } = useTranslation();

    const [isMounted, setIsMounted] = useState(false);
    const [activeMapId, setActiveMapId] = useState(null);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    const isMobile = typeof window !== "undefined" && window.innerWidth <= 1024;

    // Yardımcı fonksiyon: Haritanın o an açık olup olmadığını kontrol eder
    const isMapActive = (locId) => activeMapId === locId;

    useEffect(() => {
        setIsMounted(true);

        let active = true;
        (async () => {
            try {
                const data = await getContactSettings();
                const list = data?.contact_infos || [];

                const mapped = list.map((info) => ({
                    id:
                        info.id ||
                        info.title?.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                    title: info.title || "Standort",
                    lines: [
                        info.address || "",
                        `${info.postal_code || ""} ${info.city || ""}, ${
                            info.country || ""
                        }`.trim(),
                    ].filter(Boolean),
                    phone: info.phone || "",
                    email: info.email || "",
                    html: info.opening_hours || "",
                    zoom: 15,
                    query: `${info.address}, ${info.postal_code} ${info.city}, ${info.country}`,
                }));

                if (active) setLocations(mapped);
            } catch {
                if (active) setLocations([]);
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    return (
        <AppLayout currentRoute={currentRoute}>
            <Head>
                <title>{t("contact.title") || "Kontakt"}</title>
            </Head>

            <section className="contactx-page-wrapper">
                <section className="contactx-intro contactx-page-intro">
                    <h1 className="contactx-title">
                        {t("contact.title") || "Kontakt"}
                    </h1>
                </section>

                <ContactSection />

                <section className="contactx-locations-wrapper">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="contactx-section-title">
                            {t("contact.locations_title") ||
                                "Standorte & Kontakt"}
                        </h2>

                        {locations.length > 0 &&
                            locations.map((loc) => (
                                <article
                                    key={loc.id}
                                    className="contactx-location-row"
                                >
                                    {/* CARD */}
                                    <div
                                        className="contactx-card"
                                        // Kart üzerindeki eski onClick kaldırıldı.
                                        style={{ cursor: "auto" }}
                                    >
                                        <h3 className="contactx-card__title">
                                            {loc.title}
                                        </h3>

                                        <div className="contactx-card__address">
                                            {loc.lines.map((line, i) => (
                                                <div key={i}>{line}</div>
                                            ))}
                                        </div>

                                        {loc.phone && (
                                            <div className="contactx-card__row">
                                                <FaPhone size={14} />
                                                <a href={`tel:${loc.phone}`}>
                                                    {loc.phone}
                                                </a>
                                            </div>
                                        )}

                                        {loc.email && (
                                            <div className="contactx-card__row">
                                                <FaEnvelope size={14} />
                                                <a href={`mailto:${loc.email}`}>
                                                    {loc.email}
                                                </a>
                                            </div>
                                        )}

                                        {/* 📌 MOBİL BUTON: Haritayı açıp kapar */}
                                        {isMounted && isMobile && (
                                            <button
                                                className={`contactx-map-toggle-btn ${
                                                    isMapActive(loc.id)
                                                        ? "is-active"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    setActiveMapId((prev) =>
                                                        prev === loc.id
                                                            ? null
                                                            : loc.id
                                                    );
                                                }}
                                                aria-expanded={isMapActive(
                                                    loc.id
                                                )}
                                                aria-controls={`map-${loc.id}`}
                                            >
                                                {isMapActive(loc.id)
                                                    ? t("map.close")
                                                    : t("map.show")}
                                                <svg
                                                    className="contactx-map-toggle-icon"
                                                    viewBox="0 0 24 24"
                                                    style={{
                                                        transform: isMapActive(
                                                            loc.id
                                                        )
                                                            ? "rotate(180deg)"
                                                            : "rotate(0deg)",
                                                    }}
                                                >
                                                    <path
                                                        fill="currentColor"
                                                        d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* HARİTA BÖLÜMÜ */}
                                    {(!isMobile || isMapActive(loc.id)) && (
                                        <section
                                            id={`map-${loc.id}`}
                                            className="contactx-map-item"
                                            style={{
                                                marginTop: isMobile
                                                    ? "1rem"
                                                    : "0",
                                                animation: isMobile
                                                    ? "fadeIn .3s ease"
                                                    : "none",
                                            }}
                                        >
                                            <ContactMap
                                                query={loc.query}
                                                zoom={loc.zoom}
                                                title={loc.title}
                                                description={`${
                                                    loc.title
                                                } – ${loc.lines.join(", ")}`}
                                            />
                                        </section>
                                    )}
                                </article>
                            ))}
                    </div>
                </section>
            </section>
        </AppLayout>
    );
}
