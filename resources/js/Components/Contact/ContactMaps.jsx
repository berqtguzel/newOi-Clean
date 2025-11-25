import React, { useState, useEffect, useMemo } from "react";
import "../../../css/contact-maps.css";

export default function ContactMap({
    query = "Spaldingstr. 77–79, 20097 Hamburg",
    zoom = 14,
    title = "Unser Standort",
    description = "Besuchen Sie uns oder kontaktieren Sie uns über das Formular. Wir freuen uns auf Ihre Nachricht!",
}) {
    // HYDRATION FIX: isMounted state
    const [isMounted, setIsMounted] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const q = useMemo(() => encodeURIComponent(query), [query]);
    const src = useMemo(
        () =>
            `https://maps.google.com/maps?q=${q}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`,
        [q, zoom]
    );

    // HYDRATION FIX: Server'da skeleton göster, client'ta yükleme durumuna göre
    const showSkeleton = !isMounted || !loaded;

    return (
        <div className="cmap-wrapper" suppressHydrationWarning={true}>
            <div className="cmap-container">
                <div className="cmap-head">
                    <h2 className="cmap-title" suppressHydrationWarning={true}>
                        {title}
                    </h2>
                    {description && (
                        <p
                            className="cmap-sub"
                            suppressHydrationWarning={true}
                        >
                            {description}
                        </p>
                    )}
                </div>

                <div className="cmap-wrap">
                    {showSkeleton && (
                        <div
                            className="cmap-skeleton"
                            aria-hidden="true"
                            suppressHydrationWarning={true}
                        >
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
                            suppressHydrationWarning={true}
                        />
                    </div>
                </div>

                <div className="cmap-note" suppressHydrationWarning={true}>
                    <span>
                        Tipp: Klicken Sie auf „Route planen", um die Navigation
                        in Google Maps zu starten.
                    </span>
                </div>
            </div>
        </div>
    );
}
