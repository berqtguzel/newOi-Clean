import React, { useMemo, useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import ContactMap from "@/Components/Contact/ContactMaps";
import DOMPurify from "isomorphic-dompurify";
import parse from "html-react-parser";
import { useTranslation } from "react-i18next";
import { FaPhone, FaEnvelope, FaArrowRight } from "react-icons/fa";
import { getContactSettings } from "@/services/settingsService";
import "../../../css/ContactLocations.css";

// SafeParse fonksiyonu olduğu gibi kalıyor
function safeParse(html) {
    if (!html) return null;
    const clean = DOMPurify.sanitize(html, {
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
    return parse(clean, {
        replace(node) {
            if (node.type === "tag" && node.name === "a") {
                const href = node.attribs?.href || "";
                if (/^https?:\/\//i.test(href)) {
                    return (
                        <a
                            {...node.attribs}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {node.children.map((child, i) =>
                                parse(child.data || "", { key: i })
                            )}
                        </a>
                    );
                }
            }
        },
    });
}

// Loading İskeletinin Tek Bir Öğesi
const LocationSkeletonItem = () => (
    <article className="contactx-location-row">
        <div className="contactx-card">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
            <div className="mt-6">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
        <section className="contactx-map-item">
            <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse" />
        </section>
    </article>
);

// Sadece Loading İskeletini Render eden ayrı bir Component
const LocationSkeleton = () => (
    <div className="space-y-16">
        <LocationSkeletonItem key={1} />
        <LocationSkeletonItem key={2} />
        <LocationSkeletonItem key={3} />
    </div>
);

export default function ContactIndex({
    flash,
    currentRoute = "contact",
    introHtml,
}) {
    const { props, url: inertiaUrl } = usePage();
    const { t } = useTranslation();

    const [isMounted, setIsMounted] = useState(false);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

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
                        (info.title || "location")
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, "-"),
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
                    query: `${info.address || ""}, ${info.postal_code || ""} ${
                        info.city || ""
                    }, ${info.country || ""}`,
                }));

                if (active) setLocations(mapped);
            } catch (e) {
                if (active) setLocations([]);
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const introStatic = t(
        "contact.intro_static_text",
        "Kostenlos & unverbindlich –"
    );
    const introDynamic = t(
        "contact.intro_dynamic_text",
        "wir melden uns zeitnah"
    );
    const introParsed = useMemo(
        () =>
            safeParse(
                introHtml || `${introStatic} <strong>${introDynamic}</strong>.`
            ),
        [introHtml, introStatic, introDynamic]
    );

    const base = props?.ziggy?.location || "https://oi-clean.de";
    const currentUrl = `${base.replace(/\/+$/, "")}${inertiaUrl || "/kontakt"}`;
    const pageTitle = t("contact.page_title", "Kontakt");

    return (
        <AppLayout currentRoute={currentRoute}>
            <Head>
                <title>{pageTitle}</title>
                <meta
                    name="description"
                    content={t(
                        "contact.seo_desc",
                        "Kontaktieren Sie uns für professionelle Dienstleistungen."
                    )}
                />
                <link rel="canonical" href={currentUrl} />
            </Head>

            <section
                className="contactx-page-wrapper"
                suppressHydrationWarning={true}
            >
                {/* 1. Kısım: INTRO & FORM (Statik bölümler) */}
                <section className="contactx-intro contactx-page-intro">
                    <h1
                        className="contactx-title"
                        suppressHydrationWarning={true}
                    >
                        {pageTitle}
                    </h1>
                    {/* DÜZELTME: Metin uyumsuzluğunu gidermek için suppression buraya eklendi */}
                    <div
                        className="contactx-desc"
                        suppressHydrationWarning={true}
                    >
                        {introParsed}
                    </div>

                    {/* Flash mesajları, SSR sırasında uyumsuzluğu önlemek için isMounted kontrolüyle sarıldı. */}
                    {isMounted && flash?.success && (
                        <div className="contactx-alert contactx-alert--success">
                            ✅ {flash.success}
                        </div>
                    )}
                    {isMounted && flash?.error && (
                        <div className="contactx-alert contactx-alert--error">
                            ⚠️ {flash.error}
                        </div>
                    )}
                </section>
                <section>
                    <ContactSection />
                </section>

                {/* 2. Kısım: LOCATIONS & MAPS – DİNAMİK BÖLÜM */}
                <section className="contactx-locations-wrapper">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="contactx-section-title">
                            {t(
                                "contact.locations_title",
                                "Standorte & Kontakt"
                            )}
                        </h2>

                        {/* 1. SSR ve Yüklenme İskeleti (Sabit Yapı) */}
                        {(!isMounted || loading) && <LocationSkeleton />}

                        {/* 2. Yüklü Gerçek İçerik (Sadece isMounted=true ve loading=false) */}
                        {isMounted &&
                            !loading &&
                            (locations.length > 0 ? (
                                <div className="space-y-16">
                                    {locations.map((loc) => {
                                        const cleanPhone = (
                                            loc.phone || ""
                                        ).replace(/\s/g, "");

                                        return (
                                            <article
                                                key={loc.id}
                                                className="contactx-location-row"
                                            >
                                                <div className="contactx-card">
                                                    <div>
                                                        <h3 className="contactx-card__title">
                                                            {loc.title}
                                                        </h3>
                                                        <div className="contactx-card__address">
                                                            {loc.lines.map(
                                                                (line, i) => (
                                                                    <div
                                                                        key={i}
                                                                    >
                                                                        {line}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                        {loc.html && (
                                                            <div className="contactx-card__extra">
                                                                {safeParse(
                                                                    loc.html
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="contactx-card__details">
                                                        {loc.phone && (
                                                            <div className="contactx-card__row">
                                                                <FaPhone
                                                                    size={14}
                                                                />
                                                                <span className="font-medium text-sm opacity-80">
                                                                    {t(
                                                                        "contact.phone_label",
                                                                        "Tel"
                                                                    )}
                                                                    :
                                                                </span>{" "}
                                                                <a
                                                                    href={`tel:${cleanPhone}`}
                                                                >
                                                                    {loc.phone}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {loc.email && (
                                                            <div className="contactx-card__row">
                                                                <FaEnvelope
                                                                    size={14}
                                                                />
                                                                <span className="font-medium text-sm opacity-80">
                                                                    {t(
                                                                        "contact.email_label",
                                                                        "E-Mail"
                                                                    )}
                                                                    :
                                                                </span>{" "}
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
                                                            document
                                                                .getElementById(
                                                                    `map-${loc.id}`
                                                                )
                                                                ?.scrollIntoView(
                                                                    {
                                                                        behavior:
                                                                            "smooth",
                                                                        block: "start",
                                                                    }
                                                                );
                                                        }}
                                                    >
                                                        {t(
                                                            "contact.show_map",
                                                            "Karte anzeigen"
                                                        )}{" "}
                                                        <FaArrowRight
                                                            size={12}
                                                        />
                                                    </a>
                                                </div>
                                                <section
                                                    id={`map-${loc.id}`}
                                                    className="contactx-map-item"
                                                >
                                                    <ContactMap
                                                        query={loc.query}
                                                        zoom={loc.zoom}
                                                        title={loc.title}
                                                        description={`${
                                                            loc.title
                                                        } – ${loc.lines.join(
                                                            ", "
                                                        )}`}
                                                    />
                                                </section>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-16">
                                    <div className="text-center py-12 text-gray-500">
                                        {t(
                                            "contact.no_locations",
                                            "Keine Standorte verfügbar."
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </section>
            </section>
        </AppLayout>
    );
}
