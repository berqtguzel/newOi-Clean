import React from "react";
import "../../../css/contact-maps.css";

export default function ContactMap({
    query = "Spaldingstr. 77–79, 20097 Hamburg",
    zoom = 14,
    title = "Unser Standort",
    description = "Besuchen Sie uns oder kontaktieren Sie uns über das Formular. Wir freuen uns auf Ihre Nachricht!",
}) {
    const [loaded, setLoaded] = React.useState(false);

    const q = encodeURIComponent(query);
    // Eski tip embed, API key gerekmez:
    const src = `https://maps.google.com/maps?q=${q}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
    const openLink = `https://maps.google.com/?q=${q}`;

    return (
        <section className="cmap-section">
            <div className="cmap-container">
                <div className="cmap-head">
                    <h2 className="cmap-title">{title}</h2>
                    {description ? (
                        <p className="cmap-sub">{description}</p>
                    ) : null}
                </div>

                <div className="cmap-wrap">
                    {/* Skeleton */}
                    {!loaded && (
                        <div className="cmap-skeleton" aria-hidden="true">
                            <div className="cmap-skeleton-wave" />
                        </div>
                    )}

                    {/* Harita */}
                    <div className="cmap-aspect">
                        <iframe
                            title={title}
                            src={src}
                            className="cmap-iframe"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            onLoad={() => setLoaded(true)}
                        />
                    </div>

                    {/* Adres/CTA Kartı (overlay) */}
                    <div className="cmap-card">
                        <div className="cmap-card-row">
                            <div className="cmap-card-ico" aria-hidden>
                                <svg viewBox="0 0 24 24">
                                    <path
                                        d="M12 22s7-7.58 7-12a7 7 0 10-14 0c0 4.42 7 12 7 12z"
                                        fill="currentColor"
                                        opacity=".12"
                                    />
                                    <circle
                                        cx="12"
                                        cy="10"
                                        r="3.2"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M3 21h18"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                            <div className="cmap-card-body">
                                <div className="cmap-card-title">Adresse</div>
                                <div className="cmap-card-text">{query}</div>
                            </div>
                        </div>

                        <div className="cmap-actions">
                            <a
                                href={openLink}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn--primary"
                                aria-label="Route planen in Google Maps"
                            >
                                Route planen
                                <svg
                                    viewBox="0 0 24 24"
                                    className="cmap-arrow"
                                    aria-hidden
                                >
                                    <path
                                        d="M5 12h14M13 5l7 7-7 7"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Alt bilgi (opsiyonel) */}
                <div className="cmap-note">
                    <span>
                        Tipp: Klicken Sie auf „Route planen“, um die Navigation
                        in Google Maps zu starten.
                    </span>
                </div>
            </div>
        </section>
    );
}
