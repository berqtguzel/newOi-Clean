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
/* helpers                                                                    */
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

    return parse(clean, { replace });
}

function normalizeLang(code) {
    return String(code || "de")
        .toLowerCase()
        .split("-")[0];
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

                setError(e?.message || "Page konnte nicht geladen werden.");
                setPage(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [slug, tenantId, locale]);

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
            title:
                activeTr?.name ||
                page.title ||
                page.raw?.name ||
                meta?.title ||
                "",
            content:
                activeTr?.content || page.content || page.raw?.content || "",
        };
    }, [page, locale, meta]);

    const heroImage = page?.image || page?.raw?.image || null;
    const heroAlt = title || "O&I CLEAN group GmbH";

    const faq = page?.faq || page?.raw?.faq || null;

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
    }, [faq, locale, page, t, i18n.language]);

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

    const fallbackTitle = useMemo(() => {
        return t("staticPage.default_title", {
            defaultValue: "Seite - O&I CLEAN group GmbH",
        });
    }, [t, i18n.language]);

    const fallbackDescription = useMemo(() => {
        return t("staticPage.default_description", {
            defaultValue:
                "Informationen zu unseren Leistungen und unserem Unternehmen.",
        });
    }, [t, i18n.language]);

    const seoTitle = title || fallbackTitle;
    const seoDescription =
        page?.metaDescription ||
        page?.meta_description ||
        page?.raw?.meta_description ||
        meta?.description ||
        fallbackDescription;

    const baseLocation = props?.ziggy?.location || "https://oi-clean.de";
    const normalizedBase = String(baseLocation).replace(/\/+$/, "");
    const path = inertiaUrl || (slug ? `/${slug}` : "/");
    const currentUrl = meta?.canonical || `${normalizedBase}${path}`;

    const schemaWebPage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: seoTitle,
        description: seoDescription,
        url: currentUrl,
    };

    const homeLabel = useMemo(() => {
        // HYDRATION FIX: i18n.language'i kaldırdık
        return t("staticPage.breadcrumbs_home", {
            defaultValue: "Startseite",
        });
    }, [t]);

    const pageLabel = useMemo(() => {
        // HYDRATION FIX: i18n.language'i kaldırdık
        return t("staticPage.breadcrumbs_page", {
            defaultValue: "Seite",
        });
    }, [t]);

    const contentComingSoon = useMemo(() => {
        // HYDRATION FIX: i18n.language'i kaldırdık
        return t("staticPage.empty_content", {
            defaultValue: "Inhalt wird bald hinzugefügt.",
        });
    }, [t]);

    const hasContent = !!content;

    return (
        <AppLayout>
            <Head>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={currentUrl} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schemaWebPage),
                    }}
                />
            </Head>

            <section
                className={`sp-hero ${heroImage ? "sp-hero--has-img" : ""}`}
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
                    <div className="sp-hero__overlay" aria-hidden="true" />
                </div>

                <div className="sp-hero__inner container">
                    <nav className="sp-crumbs" aria-label="Breadcrumb">
                        <ol>
                            <li>
                                {/* 🚨 DÜZELTME: Anasayfa Linki Metin Uyuşmazlığını Gider */}
                                <Link
                                    className="sp-crumbs__link"
                                    href="/"
                                    suppressHydrationWarning={true}
                                >
                                    {homeLabel}
                                </Link>
                            </li>
                            <li
                                aria-current="page"
                                suppressHydrationWarning={true}
                            >
                                {title || pageLabel}
                            </li>
                        </ol>
                    </nav>

                    <h1 className="sp-title" suppressHydrationWarning={true}>
                        {title || pageLabel}
                    </h1>
                </div>
            </section>

            <section className="sp-content">
                <div className="container">
                    <article className="sp-card sp-fadeup">
                        <div className="sp-card__body">
                            {loading && <Loading />}

                            {error && !loading && (
                                <p
                                    className="sp-error"
                                    suppressHydrationWarning={true}
                                >
                                    {error}
                                </p>
                            )}

                            {!loading && !error && !hasContent && !hasFaq && (
                                <p
                                    className="sp-muted"
                                    suppressHydrationWarning={true}
                                >
                                    {contentComingSoon}
                                </p>
                            )}

                            {!loading && !error && hasContent && (
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
                            <h2
                                className="sp-faq__title"
                                suppressHydrationWarning={true}
                            >
                                {faqTitle}
                            </h2>

                            <div className="sp-faq__list">
                                {faqItems.map((item, idx) => (
                                    <details
                                        key={item.id || idx}
                                        className="sp-faq__item"
                                        open={idx === 0}
                                        // Detay etiketini korumak için, içindeki metin düğümlerini koru
                                        suppressHydrationWarning={true}
                                    >
                                        <summary
                                            className="sp-faq__question"
                                            suppressHydrationWarning={true}
                                        >
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
        </AppLayout>
    );
}
