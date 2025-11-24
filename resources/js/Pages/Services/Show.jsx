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

/**
 * Slug içinden denenecek aday service-slug listesini üretir.
 *
 * wohnungsrenovierung-bad-vilbel ->
 *   ["wohnungsrenovierung-bad-vilbel",
 *    "wohnungsrenovierung-bad",
 *    "wohnungsrenovierung"]
 *
 * teppichreinigung-bad ->
 *   ["teppichreinigung-bad", "teppichreinigung"]
 *
 * wohnungsrenovierung ->
 *   ["wohnungsrenovierung"]
 */
function buildServiceSlugCandidates(rawSlug) {
    if (!rawSlug) return [];

    const parts = String(rawSlug).split("-");
    const cands = [];

    for (let cut = parts.length; cut >= 1; cut--) {
        cands.push(parts.slice(0, cut).join("-"));
    }

    // olası tekrarları temizle
    return Array.from(new Set(cands));
}

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
            "style",
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

    const locale = useLocale("de");

    const [service, setService] = useState(null);
    const [rawService, setRawService] = useState(null);
    const [baseSlug, setBaseSlug] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadingText = t("service.loading", "Service wird geladen…");
    const defaultErrorText = t(
        "service.error",
        "Service konnte nicht geladen werden."
    );
    const emptyText = t("service.empty", "Inhalt wird bald hinzugefügt.");

    // --- API: birden fazla slug adayı ile dene ---
    useEffect(() => {
        if (!slug) return;

        let cancelled = false;
        setLoading(true);
        setError(null);
        setBaseSlug(null);

        (async () => {
            try {
                const candidates = buildServiceSlugCandidates(slug);
                let res = null;
                let successSlug = null;
                let lastError = null;

                for (const candidate of candidates) {
                    try {
                        res = await fetchServiceBySlug(candidate, {
                            tenantId,
                            locale,
                        });
                        successSlug = candidate;
                        break; // ilk başarılı istekte dur
                    } catch (e) {
                        lastError = e;
                        const status = e?.response?.status;
                        // 404 ise sıradaki adaya geç; başka hata ise direkt fırlat
                        if (status && status !== 404) {
                            throw e;
                        }
                    }
                }

                if (!res && lastError) {
                    throw lastError;
                }

                if (cancelled) return;

                const { service, raw } = res || {};
                setService(service || null);
                setRawService(raw || null);
                setBaseSlug(successSlug || null);
            } catch (e) {
                if (cancelled) return;
                console.error("Service fetch failed:", {
                    slug,
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

    // --- Şehir adını doğrudan `slug`'dan çıkar (örn. "wohnungsrenovierung-aalen" -> "aalen") ---
    const citySlug = useMemo(() => {
        if (!slug) return null;
        const parts = String(slug).split("-");
        if (parts.length < 2) return null;
        return parts.slice(1).join("-"); // "bad-vilbel" veya "aalen"
    }, [slug]);

    const cityFromSlug = useMemo(() => {
        if (!citySlug) return null;
        return citySlug
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ");
    }, [citySlug]);

    // --- translations / içerik seçimi ---
    const activeTranslation = useMemo(() => {
        const list = rawService?.translations;
        if (!Array.isArray(list) || list.length === 0) return null;

        let found = list.find((tr) => tr.language_code === locale);
        if (!found) {
            found = list.find((tr) => tr.language_code === "de");
        }
        if (!found) {
            found = list[0];
        }

        return found || null;
    }, [rawService, locale]);

    // Eğer servis objesi yüklendiyse ve URL'den bir şehir çıktıysa,
    // servis başlığını client-side olarak güncelle (ör: "Gebäudereinigung in Vilbel").
    useEffect(() => {
        if (!service) return;

        const name =
            activeTranslation?.name ||
            activeTranslation?.title ||
            service?.name ||
            service?.title ||
            page?.title ||
            "Service";

        if (
            cityFromSlug &&
            name &&
            !name.toLowerCase().includes(cityFromSlug.toLowerCase())
        ) {
            setService((prev) =>
                prev ? { ...prev, title: `${name} in ${cityFromSlug}` } : prev
            );
        }
    }, [service, activeTranslation, cityFromSlug, page]);

    // --- VERİ HAZIRLIK ---
    const baseTitle =
        activeTranslation?.name ||
        activeTranslation?.title ||
        service?.name ||
        service?.title ||
        page?.title ||
        "Service";

    const title =
        cityFromSlug &&
        !baseTitle.toLowerCase().includes(cityFromSlug.toLowerCase())
            ? `${baseTitle} in ${cityFromSlug}`
            : baseTitle;

    const descriptionText =
        activeTranslation?.description ||
        service?.description ||
        service?.shortDescription ||
        page?.subtitle ||
        `Leistung: ${title}`;

    const heroImage = service?.image || page?.hero?.image || null;
    const heroAlt = page?.hero?.alt || title;
    const sectionsFromPage = Array.isArray(page?.sections) ? page.sections : [];

    const introHtml = descriptionText || null;

    const introParsed = useMemo(
        () => (introHtml ? safeParse(introHtml) : null),
        [introHtml]
    );

    const currentUrl =
        typeof window !== "undefined"
            ? window.location.href
            : page?.canonical || `https://oi-clean.de/${slug || ""}`;

    const schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: title,
        description:
            typeof descriptionText === "string"
                ? descriptionText.substring(0, 160)
                : "",
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

    return (
        <AppLayout>
            <Head>
                <title>{title}</title>
                <meta
                    name="description"
                    content={
                        typeof descriptionText === "string"
                            ? descriptionText
                                  .replace(/<[^>]*>?/gm, "")
                                  .substring(0, 160)
                            : ""
                    }
                />
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            </Head>

            {/* LOADING */}
            {loading && (
                <section className="svx-loading container">
                    <p>{loadingText}</p>
                </section>
            )}

            {/* HATA */}
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
                    </div>
                </section>
            )}

            {/* İÇERİK */}
            {!loading && (
                <section className="svx-content">
                    <div className="container">
                        {introParsed && (
                            <article className="svx-card svx-fadeup svx-intro">
                                <div className="svx-prose">{introParsed}</div>
                            </article>
                        )}

                        {!introParsed && (
                            <article className="svx-card svx-fadeup">
                                <p className="svx-muted">{emptyText}</p>
                            </article>
                        )}

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
