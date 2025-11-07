import React, { useMemo } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import ContactMap from "@/Components/Contact/ContactMaps";
import "../../../css/ContactLocations.css";
import parse, { domToReact, Element } from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";

function safeParse(html, options) {
    const clean = DOMPurify.sanitize(html || "", {
        ALLOWED_TAGS: [
            "p",
            "strong",
            "em",
            "a",
            "ul",
            "ol",
            "li",
            "br",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "blockquote",
            "img",
            "iframe",
            "div",
            "span",
            "small",
            "code",
        ],
        ALLOWED_ATTR: [
            "href",
            "title",
            "target",
            "rel",
            "src",
            "alt",
            "width",
            "height",
            "loading",
            "allow",
            "allowfullscreen",
            "class",
            "id",
        ],
    });

    // Dış linkleri yeni sekmede aç + güvenlik attrib’leri
    const replace = (node) => {
        if (node instanceof Element && node.name === "a") {
            const props = node.attribs || {};
            const href = props.href || "";
            const isExternal = /^https?:\/\//i.test(href);
            if (isExternal) {
                return (
                    <a {...props} target="_blank" rel="noopener noreferrer">
                        {domToReact(node.children)}
                    </a>
                );
            }
        }
        // <script> ve <style> gibi istenmeyenleri yok say (DOMPurify zaten filtreliyor ama ekstra emniyet)
        if (
            node instanceof Element &&
            (node.name === "script" || node.name === "style")
        ) {
            return <></>;
        }
        return undefined;
    };

    return parse(clean, { replace, ...(options || {}) });
}

const LOCATIONS = [
    {
        id: "hamburg",
        title: "Hamburg – Zentrale",
        lines: ["Spaldingstr. 77–79", "20097 Hamburg, Deutschland"],
        phone: "+49 40 0000000",
        email: "info@oi-clean.de",
        query: "Spaldingstr. 77–79, 20097 Hamburg, Germany",
        zoom: 15,

        html: '<p><em>Mo–Fr:</em> 08:00–18:00<br/><a href="https://www.hvv.de">Anfahrt (HVV)</a></p>',
    },
    {
        id: "berlin",
        title: "Berlin",
        lines: ["Beispielstraße 12", "10115 Berlin, Deutschland"],
        phone: "+49 30 000000",
        email: "berlin@oi-clean.de",
        query: "Beispielstraße 12, 10115 Berlin, Germany",
        zoom: 15,
        html: "",
    },
    {
        id: "muenchen",
        title: "München",
        lines: ["Musterweg 5", "80331 München, Deutschland"],
        phone: "+49 89 000000",
        email: "muenchen@oi-clean.de",
        query: "Musterweg 5, 80331 München, Germany",
        zoom: 15,
        html: "",
    },
    {
        id: "bremen",
        title: "Bremen",
        lines: ["Hafenallee 3", "28195 Bremen, Deutschland"],
        phone: "+49 421 000000",
        email: "bremen@oi-clean.de",
        query: "Hafenallee 3, 28195 Bremen, Germany",
        zoom: 15,
        html: "",
    },
];

export default function ContactIndex({
    flash,
    currentRoute = "contact",
    introHtml,
}) {
    const intro =
        introHtml ||
        "Kostenlos &amp; unverbindlich – <strong>wir melden uns zeitnah</strong>.";

    const introParsed = useMemo(() => safeParse(intro), [intro]);

    return (
        <AppLayout currentRoute={currentRoute}>
            <Head>
                <title>Kontakt – O&amp;I CLEAN group GmbH</title>
                <meta
                    name="description"
                    content="Kontaktieren Sie uns für ein kostenloses, unverbindliches Angebot. Wir freuen uns auf Ihre Anfrage."
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ContactPage",
                        name: "Kontakt – O&I CLEAN group GmbH",
                        url:
                            typeof window !== "undefined"
                                ? window.location.href
                                : undefined,
                        department: LOCATIONS.map((l) => ({
                            "@type": "Organization",
                            name: l.title,
                            address: {
                                "@type": "PostalAddress",
                                streetAddress: l.lines?.[0],
                                addressLocality: l.lines?.[1]
                                    ?.split(",")?.[0]
                                    ?.trim(),
                                postalCode:
                                    (l.lines?.[1] || "").match(
                                        /\b\d{5}\b/
                                    )?.[0] || "",
                                addressCountry: "DE",
                            },
                            email: l.email,
                            telephone: l.phone,
                        })),
                    })}
                </script>
            </Head>

            <section className="max-w-4xl mx-auto px-4 pt-10 pb-4">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Kontakt
                </h1>

                <div className="mt-2 text-slate-600 dark:text-slate-300 prose prose-slate dark:prose-invert">
                    {introParsed}
                </div>

                {flash?.success && (
                    <div className="mt-4 rounded-lg border border-emerald-300/60 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 px-4 py-3">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mt-4 rounded-lg border border-rose-300/60 bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-200 px-4 py-3">
                        {flash.error}
                    </div>
                )}
            </section>

            <ContactSection />

            <section className="locations max-w-6xl mx-auto px-4 py-10">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    Standorte &amp; Kontakt
                </h2>

                <div className="location-grid mt-6">
                    {LOCATIONS.map((loc) => {
                        const detailsParsed = loc.html
                            ? safeParse(loc.html)
                            : null;

                        return (
                            <div key={loc.id} className="location-card">
                                <h3 className="location-card__title">
                                    {loc.title}
                                </h3>

                                <div className="location-card__lines">
                                    {loc.lines.map((line, i) => (
                                        <div key={i}>{line}</div>
                                    ))}

                                    {/* Lokasyon özel HTML bloğu (opsiyonel) */}
                                    {detailsParsed && (
                                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300 prose prose-sm">
                                            {detailsParsed}
                                        </div>
                                    )}
                                </div>

                                {loc.phone && (
                                    <div className="location-card__row">
                                        Tel:{" "}
                                        <a
                                            href={`tel:${loc.phone.replace(
                                                /\s/g,
                                                ""
                                            )}`}
                                        >
                                            {loc.phone}
                                        </a>
                                    </div>
                                )}
                                {loc.email && (
                                    <div className="location-card__row">
                                        E-Mail:{" "}
                                        <a href={`mailto:${loc.email}`}>
                                            {loc.email}
                                        </a>
                                    </div>
                                )}

                                <a
                                    href={`#map-${loc.id}`}
                                    className="location-card__link"
                                >
                                    Karte anzeigen
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden
                                    >
                                        <path
                                            d="M5 12H19M19 12L12 5M19 12L12 19"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </a>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 py-8">
                <div className="cmap-grid">
                    {LOCATIONS.map((loc) => (
                        <section
                            key={loc.id}
                            id={`map-${loc.id}`}
                            className="cmap-item"
                        >
                            <ContactMap
                                query={loc.query}
                                zoom={loc.zoom ?? 15}
                                title={loc.title}
                                description={`${loc.title} – ${loc.lines.join(
                                    ", "
                                )}`}
                            />
                        </section>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}
