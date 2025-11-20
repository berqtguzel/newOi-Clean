import React, { useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
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
            "figure",
            "figcaption",
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
    const { props, url: inertiaUrl } = usePage();

    // --------- SEO Temel Bilgiler ----------
    const pageTitle = "Kontakt – O&I CLEAN group GmbH";
    const pageDescription =
        "Kontaktieren Sie O&I CLEAN group GmbH für professionelle Reinigungsdienstleistungen und Standorte in ganz Deutschland.";

    // Ziggy'den base URL (SSR için güvenli)
    const baseLocation = props?.ziggy?.location || "https://oi-clean.de";
    const normalizedBase = String(baseLocation).replace(/\/+$/, "");

    // Inertia url genelde "/kontakt" veya "/contact" oluyor
    const path = inertiaUrl || "/kontakt";
    const currentUrl = `${normalizedBase}${path}`;
    const originUrl = `${normalizedBase}/`;

    // JSON-LD: WebPage
    const schemaWebPage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: pageTitle,
        description: pageDescription,
        url: currentUrl,
    };

    // JSON-LD: Organization + Standorte
    const schemaOrganization = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "O&I CLEAN group GmbH",
        url: normalizedBase,
        email: "info@oi-clean.de",
        telephone: "+49 40 0000000",
        address: {
            "@type": "PostalAddress",
            streetAddress: "Spaldingstr. 77–79",
            postalCode: "20097",
            addressLocality: "Hamburg",
            addressCountry: "DE",
        },
        areaServed: LOCATIONS.map((loc) => ({
            "@type": "City",
            name: loc.title,
        })),
        location: LOCATIONS.map((loc) => ({
            "@type": "Place",
            name: loc.title,
            address: {
                "@type": "PostalAddress",
                streetAddress: loc.lines[0] || "",
                addressLocality: loc.lines[1] || "",
                addressCountry: "DE",
            },
        })),
    };

    // JSON-LD: Breadcrumbs
    const schemaBreadcrumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Startseite",
                item: originUrl,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Kontakt",
                item: currentUrl,
            },
        ],
    };

    const intro =
        introHtml ||
        "Kostenlos &amp; unverbindlich – <strong>wir melden uns zeitnah</strong>.";

    const introParsed = useMemo(() => safeParse(intro), [intro]);

    return (
        <AppLayout currentRoute={currentRoute}>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta
                    name="robots"
                    content="index,follow,max-image-preview:large"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta name="theme-color" content="#0f172a" />

                <link rel="canonical" href={currentUrl} />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:site_name" content="O&I CLEAN group GmbH" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />

                {/* JSON-LD */}
                <script type="application/ld+json">
                    {JSON.stringify(schemaWebPage)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(schemaOrganization)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(schemaBreadcrumbs)}
                </script>
            </Head>

            <div className="contact-page">
                <section className="contact-intro max-w-4xl mx-auto px-4 pt-10 pb-4">
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

                <section className="contact-location">
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
                                        description={`${
                                            loc.title
                                        } – ${loc.lines.join(", ")}`}
                                    />
                                </section>
                            ))}
                        </div>
                    </section>
                </section>
            </div>
        </AppLayout>
    );
}
