// resources/js/Pages/Services/ServiceShow.jsx

import React, { useEffect, useMemo, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import "../../../css/service-show.css";
import ContactSection from "@/Components/Home/Contact/ContactSection";

import parse, { domToReact, Element } from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";

import { useLocale } from "@/hooks/useLocale";
import { fetchServiceBySlug } from "@/services/servicesService";
import { useTranslation } from "react-i18next";

/** Güvenli HTML parser */
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

export default function ServiceShow({ slug, page = {} }) {
    const { t } = useTranslation();
    const { props } = usePage();

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";

    // locale (de/en/tr) – değişince endpoint de o dile göre dönecek
    const locale = useLocale("de");

    const [service, setService] = useState(null);
    const [rawService, setRawService] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadingText = t("service.loading", "Service wird geladen…");
    const defaultErrorText = t(
        "service.error",
        "Service konnte nicht geladen werden."
    );
    const emptyText = t("service.empty", "Inhalt wird bald hinzugefügt.");

    // 🔥 /api/v1/services/{slug} ile tek service çek
    useEffect(() => {
        if (!slug) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const { service, raw } = await fetchServiceBySlug(slug, {
                    tenantId,
                    locale,
                });

                if (cancelled) return;

                setService(service || null);
                setRawService(raw || null);
            } catch (e) {
                if (cancelled) return;
                console.error("Service fetch failed:", {
                    message: e?.message,
                    status: e?.response?.status,
                    data: e?.response?.data,
                });
                setError(e?.message || defaultErrorText);
                setService(null);
                setRawService(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [slug, tenantId, locale, defaultErrorText]);

    // ------------ VERİLERİ HAZIRLA ------------

    // isim – backend zaten locale paramına göre correct name dönecek
    const title = service?.name || service?.title || page?.title || "Service";

    // açıklama için birkaç fallback
    const translationDescription = useMemo(() => {
        const translations = rawService?.translations || [];
        const current = rawService?._meta?.current_language;
        const currentTr =
            translations.find((t) => t.language_code === current) ||
            translations[0];

        return currentTr?.description || null;
    }, [rawService]);

    const description =
        service?.shortDescription ||
        service?.description ||
        translationDescription ||
        page?.subtitle ||
        `Leistung: ${title}`;

    const heroImage = service?.image || page?.hero?.image || null;
    const heroAlt = page?.hero?.alt || title;

    const sectionsFromPage = Array.isArray(page?.sections) ? page.sections : [];

    // CONTENT: önce description, sonra translation.description
    const introHtml = service?.description || translationDescription || null;

    const introParsed = useMemo(
        () => (introHtml ? safeParse(introHtml) : null),
        [introHtml]
    );

    const currentUrl =
        typeof window !== "undefined"
            ? window.location.href
            : page?.canonical || `https://oi-clean.de/services/${slug || ""}`;

    const schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: title,
        description,
        provider: {
            "@type": "Organization",
            name: "O&I CLEAN group GmbH",
        },
        areaServed: {
            "@type": "Country",
            name: service?.country || "Deutschland",
        },
        image: heroImage,
        url: currentUrl,
    };

    const metaRows = useMemo(() => {
        if (!service) return [];
        return [
            service.categoryName && {
                label: t("service.meta.category", "Kategorie"),
                value: service.categoryName,
            },
            (service.city || service.district || service.country) && {
                label: t("service.meta.location", "Standort"),
                value: service.city || service.district || service.country,
            },
            service.parentName && {
                label: t("service.meta.parent", "Übergeordneter Service"),
                value: service.parentName,
            },
        ].filter(Boolean);
    }, [service, t]);

    return (
        <AppLayout>
            <Head>
                <title>{`${title} – Leistungen`}</title>
                <meta name="description" content={description} />

                <meta
                    name="robots"
                    content="index,follow,max-image-preview:large"
                />
                <link rel="canonical" href={currentUrl} />

                <meta property="og:type" content="website" />
                <meta property="og:title" content={`${title} – Leistungen`} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={currentUrl} />
                {heroImage && <meta property="og:image" content={heroImage} />}
                <meta property="og:site_name" content="O&I CLEAN group GmbH" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${title} – Leistungen`} />
                <meta name="twitter:description" content={description} />
                {heroImage && <meta name="twitter:image" content={heroImage} />}

                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            </Head>

            {/* LOADING / ERROR */}
            {loading && (
                <section className="svx-loading container">
                    <p>{loadingText}</p>
                </section>
            )}

            {error && !loading && !service && (
                <section className="svx-error container">
                    <p>{error}</p>
                </section>
            )}

            {/* HERO */}
            {!loading && (
                <section
                    className={`svx-hero ${
                        heroImage ? "svx-hero--hasimg" : ""
                    }`}
                >
                    <div aria-hidden className="svx-hero__decor" />

                    <div className="svx-hero__media">
                        {heroImage ? (
                            <>
                                <img
                                    src={heroImage}
                                    alt={heroAlt}
                                    className="svx-hero__img"
                                    loading="eager"
                                />
                                <div className="svx-hero__overlay" />
                            </>
                        ) : (
                            <div className="svx-hero__fallback" />
                        )}
                    </div>

                    <div className="svx-hero__inner container">
                        <nav className="svx-crumbs" aria-label="breadcrumb">
                            <Link href="/" className="svx-crumbs__link">
                                {t("service.breadcrumb.home", "Start")}
                            </Link>
                            <span className="svx-crumbs__sep">/</span>
                            <Link href="/services" className="svx-crumbs__link">
                                {t("service.breadcrumb.index", "Leistungen")}
                            </Link>
                            <span className="svx-crumbs__sep">/</span>
                            <span className="svx-crumbs__current">{title}</span>
                        </nav>

                        <h1 className="svx-title">{title}</h1>

                        {description && (
                            <p className="svx-subtitle">{description}</p>
                        )}

                        {metaRows.length > 0 && (
                            <dl className="svx-meta">
                                {metaRows.map((row, idx) => (
                                    <div key={idx} className="svx-meta__row">
                                        <dt>{row.label}</dt>
                                        <dd>{row.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </div>
                </section>
            )}

            {/* İÇERİK */}
            {!loading && (
                <section className="svx-content">
                    <div className="container">
                        {/* API'den gelen CONTENT (description) */}
                        {introParsed && (
                            <article className="svx-card svx-fadeup svx-intro">
                                <div className="svx-prose">{introParsed}</div>
                            </article>
                        )}

                        {/* content hiç yoksa fallback */}
                        {!introParsed && (
                            <article className="svx-card svx-fadeup">
                                <p className="svx-muted">{emptyText}</p>
                            </article>
                        )}

                        {/* CMS sections (isteğe bağlı, istersen silebilirsin) */}
                        {sectionsFromPage.map((s, i) => {
                            const reversed = i % 2 === 1;
                            const items = Array.isArray(s.items) ? s.items : [];
                            const bodyHtml = s.body || s.html || null;
                            const bodyParsed = bodyHtml
                                ? safeParse(bodyHtml)
                                : null;

                            return (
                                <article
                                    key={i}
                                    className={`svx-section svx-fadeup ${
                                        reversed ? "svx-section--rev" : ""
                                    }`}
                                >
                                    {s.image && (
                                        <div className="svx-section__media">
                                            <img
                                                src={s.image}
                                                alt={
                                                    s.alt || s.heading || title
                                                }
                                                className="svx-section__img"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}

                                    <div className="svx-section__body">
                                        {s.heading && (
                                            <h2 className="svx-h2">
                                                {s.heading}
                                            </h2>
                                        )}

                                        {bodyParsed && (
                                            <div className="svx-prose">
                                                {bodyParsed}
                                            </div>
                                        )}

                                        {items.length > 0 && (
                                            <ul className="svx-list">
                                                {items.map((li, k) => (
                                                    <li
                                                        key={k}
                                                        className="svx-list__item"
                                                    >
                                                        <span className="svx-bullet" />
                                                        <span>{li}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

            <ContactSection />
        </AppLayout>
    );
}
