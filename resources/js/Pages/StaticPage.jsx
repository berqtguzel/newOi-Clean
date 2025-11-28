import React, { useMemo } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import "@/../css/static-page.css";

import parse, { domToReact, Element } from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import { useTranslation } from "react-i18next";

import { fetchPageBySlug } from "@/services/pageService";
import Loading from "@/Components/Common/Loading";

/* -------------------------------------------------------------------------- */
/* helpers                                                                    */
/* -------------------------------------------------------------------------- */

function safeParse(html = "") {
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
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td", // Tablo etiketlerini de ekledim
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
            return <React.Fragment key={Math.random()}></React.Fragment>; // Script/Style kaldırıldı
        }

        return undefined;
    };

    return parse(clean, { replace });
}

function normalizeLang(code) {
    return String(code || "de")
        .toLowerCase()
        .split("-")[0];
}

function cleanAndTruncate(htmlContent = "", maxLength = 160) {
    if (!htmlContent) return null;
    const textWithoutHtml = String(htmlContent).replace(/<[^>]*>/g, "");
    const cleanText = textWithoutHtml.replace(/\s+/g, " ").trim();
    const truncatedText = cleanText.substring(0, maxLength);
    return truncatedText + (cleanText.length > maxLength ? "..." : "");
}

export default function StaticPage({
    slug,
    page: initialPage = {},
    meta = {},
}) {
    const { t, i18n } = useTranslation();
    const { props, url: inertiaUrl } = usePage();

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.tenantId ||
        "";

    const inertiaLocale = props?.locale || props?.ziggy?.locale || "de";
    const locale = normalizeLang(inertiaLocale);

    const appName = props?.global?.appName || "O&I CLEAN group GmbH";
    const baseLocation = props?.ziggy?.location || "https://oi-clean.de";

    const [page, setPage] = React.useState(initialPage || null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        if (!slug) return;
        let cancelled = false;

        setLoading(true);
        setError(null);

        (async () => {
            try {
                const { page: apiPage } = await fetchPageBySlug(slug, {
                    tenantId,
                    locale,
                });

                if (cancelled) return;

                setPage(apiPage || null);
            } catch (e) {
                if (cancelled) return;

                setError(
                    e?.message ||
                        t("staticPage.error_loading", {
                            defaultValue: "Page could not be loaded.",
                        })
                );
                setPage(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [slug, tenantId, locale, t]);

    const { title, content } = React.useMemo(() => {
        if (!page) {
            return { title: meta?.title || "", content: "" };
        }

        const translations = Array.isArray(page.translations)
            ? page.translations
            : [];

        const activeTr =
            translations.find(
                (tr) => normalizeLang(tr.language_code) === locale
            ) ||
            translations.find(
                (tr) =>
                    normalizeLang(tr.language_code) ===
                    normalizeLang(page?._meta?.default_language)
            ) ||
            translations[0] ||
            null;

        return {
            // NOTE: Buradaki 'title' sadece H1 başlığı içindir, SEO başlığı değil.
            title:
                activeTr?.name ||
                page.title ||
                page.raw?.name ||
                meta?.title ||
                t("staticPage.fallback_h1"),
            content:
                activeTr?.content || page.content || page.raw?.content || "",
        };
    }, [page, locale, meta, t]);

    const heroImage = page?.image || page?.raw?.image || null;
    const heroAlt = title || appName;

    const faq = page?.faq || page?.raw?.faq || null;

    // SEO Meta Tags - API'den gelen veriler
    const seoMetaTitle = React.useMemo(() => {
        return page?.raw?.meta_title || 
               page?.meta_title || 
               `${title} - ${appName}`;
    }, [page?.raw?.meta_title, page?.meta_title, title, appName]);

    const seoDescription = React.useMemo(() => {
        return page?.raw?.meta_description ||
               page?.meta_description ||
               page?.metaDescription ||
               cleanAndTruncate(page?.raw?.content || page.content, 160) ||
               "";
    }, [page?.raw?.meta_description, page?.meta_description, page?.metaDescription, page?.raw?.content, page?.content]);

    const seoKeywords = React.useMemo(() => {
        return page?.raw?.meta_keywords || 
               page?.meta_keywords || 
               "";
    }, [page?.raw?.meta_keywords, page?.meta_keywords]);

    // SSR-safe URL generation
    const canonicalUrl = React.useMemo(() => {
        if (typeof window === "undefined") {
            return slug ? `/${slug}` : "/";
        }
        return `${window.location.origin}${window.location.pathname}`;
    }, [slug]);

    // SSR-safe OG Image URL
    const ogImageUrl = React.useMemo(() => {
        if (!heroImage) return null;
        if (typeof window === "undefined") {
            return heroImage.startsWith("http") ? heroImage : heroImage;
        }
        if (heroImage.startsWith("http")) return heroImage;
        return `${window.location.origin}${heroImage.startsWith("/") ? heroImage : `/${heroImage}`}`;
    }, [heroImage]);

    const faqTitle = React.useMemo(() => {
        if (!faq) return null;

        const trList = Array.isArray(faq.translations) ? faq.translations : [];
        const active =
            trList.find((tr) => normalizeLang(tr.language_code) === locale) ||
            trList.find(
                (tr) =>
                    normalizeLang(tr.language_code) ===
                    normalizeLang(page?._meta?.default_language)
            ) ||
            trList[0] ||
            null;

        return (
            active?.name ||
            faq.name ||
            t("staticPage.faq_title", {
                defaultValue: "Häufig gestellte Fragen",
            })
        );
    }, [faq, locale, page, t]);

    const faqItems = React.useMemo(() => {
        if (!faq || !Array.isArray(faq.items)) return [];
        return faq.items
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((item) => {
                const baseQuestion = item.question || "";
                const baseAnswer = item.answer || "";
                const translations = Array.isArray(item.translations)
                    ? item.translations
                    : [];

                const byLocale =
                    translations.find(
                        (tr) =>
                            normalizeLang(tr.language_code) === locale &&
                            (tr.question || tr.answer)
                    ) ||
                    translations.find(
                        (tr) =>
                            normalizeLang(tr.language_code) === "de" &&
                            (tr.question || tr.answer)
                    ) ||
                    translations[0] ||
                    {};

                return {
                    id: item.id,
                    question: byLocale.question || baseQuestion,
                    answer: byLocale.answer || baseAnswer,
                };
            })
            .filter((it) => it.question || it.answer);
    }, [faq, locale]);

    const hasFaq = faqItems.length > 0;
    const hasContent = !!content;

    const homeLabel = useMemo(() => {
        return t("staticPage.breadcrumbs_home", { defaultValue: "Startseite" });
    }, [t]);

    const pageLabel = useMemo(() => {
        return t("staticPage.breadcrumbs_page", { defaultValue: "Seite" });
    }, [t]);

    const contentComingSoon = useMemo(() => {
        return t("staticPage.empty_content", {
            defaultValue: "Inhalt wird bald hinzugefügt.",
        });
    }, [t]);

    return (
        <AppLayout>
            {/* 🚀 SEO - API'den gelen meta tag'ler - Kaynak kodunda görünecek */}
            <Head title={seoMetaTitle}>
                <meta name="description" content={seoDescription} />
                {seoKeywords && <meta name="keywords" content={seoKeywords} />}
                
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={appName} />
                <meta property="og:title" content={seoMetaTitle} />
                <meta property="og:description" content={seoDescription} />
                {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
                {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoMetaTitle} />
                <meta name="twitter:description" content={seoDescription} />
                {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebPage",
                            name: seoMetaTitle,
                            description: seoDescription,
                            url: canonicalUrl,
                        }),
                    }}
                />
            </Head>

            {loading && (
                <Loading
                    fullScreen={true}
                    message={t("common.loading", {
                        defaultValue: "Yükleniyor...",
                    })}
                />
            )}

            {!loading && !error && (
                <>
                    <section
                        className={`sp-hero ${
                            heroImage ? "sp-hero--has-img" : ""
                        }`}
                    >
                        <div className="sp-hero__decor" aria-hidden="true" />

                        <div className="sp-hero__media">
                            {heroImage ? (
                                <img
                                    src={heroImage}
                                    alt={heroAlt}
                                    className="sp-hero__img"
                                    loading="eager"
                                />
                            ) : (
                                <div className="sp-hero__fallback" />
                            )}
                            <div
                                className="sp-hero__overlay"
                                aria-hidden="true"
                            />
                        </div>

                        <div className="sp-hero__inner container">
                            <nav className="sp-crumbs" aria-label="Breadcrumb">
                                <ol>
                                    <li>
                                        <Link
                                            className="sp-crumbs__link"
                                            href="/"
                                            // suppressHydrationWarning gerekli değil, metin artık React tarafında stabil
                                        >
                                            {homeLabel}
                                        </Link>
                                    </li>
                                    <li
                                        aria-current="page"
                                        // suppressHydrationWarning gerekli değil
                                    >
                                        {title || pageLabel}
                                    </li>
                                </ol>
                            </nav>

                            <h1 className="sp-title">{title || pageLabel}</h1>
                        </div>
                    </section>

                    <section className="sp-content">
                        <div className="container">
                            <article className="sp-card sp-fadeup">
                                <div className="sp-card__body">
                                    {error && (
                                        <p className="sp-error"> {error} </p>
                                    )}

                                    {!error && !hasContent && !hasFaq && (
                                        <p className="sp-muted">
                                            {contentComingSoon}
                                        </p>
                                    )}

                                    {!error && hasContent && (
                                        <div className="sp-prose">
                                            {safeParse(content)}
                                        </div>
                                    )}
                                </div>
                            </article>
                        </div>
                    </section>

                    {hasFaq && (
                        <section className="sp-faq-section">
                            <div className="container">
                                <div className="sp-faq sp-fadeup">
                                    <h2 className="sp-faq__title">
                                        {faqTitle}
                                    </h2>

                                    <div className="sp-faq__list">
                                        {faqItems.map((item, idx) => (
                                            <details
                                                key={item.id || idx}
                                                className="sp-faq__item"
                                                open={idx === 0}
                                            >
                                                <summary className="sp-faq__question">
                                                    {item.question}
                                                </summary>
                                                <div className="sp-faq__answer">
                                                    {safeParse(item.answer)}
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    <ContactSection />
                </>
            )}

            {/* Eğer yükleme bitti ve bir hata varsa (error state doluysa) */}
            {!loading && error && (
                <div className="container py-12">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">
                            {t("common.error_occurred", {
                                defaultValue: "Hata:",
                            })}
                        </strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
