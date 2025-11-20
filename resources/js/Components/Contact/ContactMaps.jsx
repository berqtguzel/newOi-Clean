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
                    {!loaded && (
                        <div className="cmap-skeleton" aria-hidden="true">
                            <div className="cmap-skeleton-wave" />
                        </div>
                    )}

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
                </div>

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
