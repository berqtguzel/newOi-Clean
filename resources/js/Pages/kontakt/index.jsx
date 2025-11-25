import React, { useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import ContactMap from "@/Components/Contact/ContactMaps";
import parse, { domToReact, Element } from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import { useTranslation } from "react-i18next"; // i18n Import
import {
    FaPhone,
    FaEnvelope,
    FaArrowRight,
    FaMapMarkerAlt,
} from "react-icons/fa";

import "../../../css/ContactLocations.css";

// --- HTML Parsing Helper ---
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
    const { t } = useTranslation();

    const pageTitle = t("contact.seo_title", "Kontakt – O&I CLEAN group GmbH");
    const pageDescription = t(
        "contact.seo_desc",
        "Kontaktieren Sie O&I CLEAN group GmbH für professionelle Reinigungsdienstleistungen und Standorte in ganz Deutschland."
    );

    const baseLocation = props?.ziggy?.location || "https://oi-clean.de";
    const normalizedBase = String(baseLocation).replace(/\/+$/, "");
    const path = inertiaUrl || "/kontakt";
    const currentUrl = `${normalizedBase}${path}`;
    const originUrl = `${normalizedBase}/`;

    const schemaWebPage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: pageTitle,
        description: pageDescription,
        url: currentUrl,
    };

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

    const schemaBreadcrumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: t("nav.home", "Startseite"),
                item: originUrl,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: t("contact.page_title", "Kontakt"),
                item: currentUrl,
            },
        ],
    };

    // 🚨 DÜZELTME: HTML'i ve metni ayırıyoruz
    const introStaticText = t(
        "contact.intro_static_text",
        "Kostenlos & unverbindlich – "
    );
    const introDynamicText = t(
        "contact.intro_dynamic_text",
        "wir melden uns zeitnah"
    );

    // HTML structure'ı manuel olarak oluştur
    const introParsed = useMemo(() => {
        const text = `${introStaticText} <strong>${introDynamicText}</strong>.`;
        return introHtml ? safeParse(introHtml) : safeParse(text);
    }, [introHtml, introStaticText, introDynamicText]);

    return (
        <AppLayout currentRoute={currentRoute}>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={currentUrl} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schemaWebPage),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schemaOrganization),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schemaBreadcrumbs),
                    }}
                />
            </Head>

            <div className="contactx-page">
                <section className="contactx-intro">
                    {/* 🚨 DÜZELTME 1: Ana başlık metin uyuşmazlığını giderir (Kontakt vs Contact) */}
                    <h1
                        className="contactx-title"
                        suppressHydrationWarning={true}
                    >
                        {t("contact.page_title")}
                    </h1>

                    {/* 🚨 DÜZELTME 2: Giriş metni uyuşmazlığını giderir (Kostenlos & unverbindlich...) */}
                    <div
                        className="contactx-desc"
                        suppressHydrationWarning={true}
                    >
                        {introParsed}
                    </div>

                    {flash?.success && (
                        <div className="contactx-alert contactx-alert--success">
                            <span>✅</span> {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="contactx-alert contactx-alert--error">
                            <span>⚠️</span> {flash.error}
                        </div>
                    )}
                </section>

                {/* ContactSection (Form) */}
                <ContactSection />

                {/* Lokasyon Detayları */}
                <section className="contactx-locations-wrapper">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2
                            className="contactx-section-title"
                            suppressHydrationWarning={true}
                        >
                            {t(
                                "contact.locations_title",
                                "Standorte & Kontakt"
                            )}
                        </h2>

                        <div className="contactx-location-grid">
                            {LOCATIONS.map((loc) => {
                                // loc.html içinde parse işlemi yapıldığı için SafeHtml'e gerek yok
                                const detailsParsed = loc.html
                                    ? safeParse(loc.html)
                                    : null;

                                // Telefon numarasını temizle
                                const cleanPhone = loc.phone.replace(/\s/g, "");

                                return (
                                    <article
                                        key={loc.id}
                                        className="contactx-card"
                                    >
                                        <div>
                                            <h3 className="contactx-card__title">
                                                {loc.title}
                                            </h3>

                                            <div className="contactx-card__address">
                                                {loc.lines.map((line, i) => (
                                                    <div key={i}>{line}</div>
                                                ))}
                                            </div>

                                            {detailsParsed && (
                                                <div className="contactx-card__extra">
                                                    {detailsParsed}
                                                </div>
                                            )}
                                        </div>

                                        <div className="contactx-card__details">
                                            {loc.phone && (
                                                <div
                                                    className="contactx-card__row"
                                                    // Telefon numarası uyuşmazlığını gidermek için
                                                    suppressHydrationWarning={
                                                        true
                                                    }
                                                >
                                                    <FaPhone size={14} />
                                                    <span
                                                        className="font-medium text-sm opacity-80"
                                                        suppressHydrationWarning={
                                                            true
                                                        }
                                                    >
                                                        {t(
                                                            "contact.phone_label",
                                                            "Tel"
                                                        )}
                                                        :
                                                    </span>
                                                    <a
                                                        href={`tel:${cleanPhone}`}
                                                        // 🚨 ÇİFT YAZILAN METİN SORUNU İÇİN (SSR/Client mismatch)
                                                        suppressHydrationWarning={
                                                            true
                                                        }
                                                    >
                                                        {loc.phone}
                                                    </a>
                                                </div>
                                            )}

                                            {loc.email && (
                                                <div className="contactx-card__row">
                                                    <FaEnvelope size={14} />
                                                    <span
                                                        className="font-medium text-sm opacity-80"
                                                        suppressHydrationWarning={
                                                            true
                                                        }
                                                    >
                                                        {t(
                                                            "contact.email_label",
                                                            "E-Mail"
                                                        )}
                                                        :
                                                    </span>
                                                    <a
                                                        href={`mailto:${loc.email}`}
                                                    >
                                                        {loc.email}
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        <a
                                            href={`#map-${loc.id}`}
                                            className="contactx-card__action"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const el =
                                                    document.getElementById(
                                                        `map-${loc.id}`
                                                    );
                                                if (el) {
                                                    const offset = 100;
                                                    const bodyRect =
                                                        document.body.getBoundingClientRect()
                                                            .top;
                                                    const elementRect =
                                                        el.getBoundingClientRect()
                                                            .top;
                                                    const elementPosition =
                                                        elementRect - bodyRect;
                                                    const offsetPosition =
                                                        elementPosition -
                                                        offset;
                                                    window.scrollTo({
                                                        top: offsetPosition,
                                                        behavior: "smooth",
                                                    });
                                                }
                                            }}
                                            suppressHydrationWarning={true} // Harita butonu metni için
                                        >
                                            {t(
                                                "contact.show_map",
                                                "Karte anzeigen"
                                            )}
                                            <FaArrowRight size={12} />
                                        </a>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="contactx-maps-wrapper">
                    <div className="contactx-map-grid">
                        {LOCATIONS.map((loc) => (
                            <section
                                key={loc.id}
                                id={`map-${loc.id}`}
                                className="contactx-map-item"
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
            </div>
        </AppLayout>
    );
}
