// resources/js/Pages/Static/StaticPage.jsx

import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import "@/../css/static-page.css";

import parse, { domToReact, Element } from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import { useTranslation } from "react-i18next";

import { useLocale } from "@/hooks/useLocale";
import { fetchPageBySlug } from "@/services/pageService";

/** Güvenli HTML parser */
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

export default function StaticPage({ slug, page: initialPage = {}, meta = {} }) {
    const { t } = useTranslation();
    const { props, url: inertiaUrl } = usePage();

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";

    // UI dili (de/en/tr) – değişince API tekrar çağrılacak
    const locale = useLocale("de");

    const [page, setPage] = React.useState(initialPage || null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // ---------- API'den sayfa çek ----------
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

                console.log("[StaticPage] apiPage:", apiPage);
                setPage(apiPage || null);
            } catch (e) {
                if (cancelled) return;
                console.error("StaticPage fetchPageBySlug failed:", e);
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

    // ---------- kullanılacak değerler ----------
    const title = page?.title || meta?.title || "";
    const content = page?.content || "";

    const heroImage = page?.image || null;
    const heroAlt = title || "O&I CLEAN group GmbH";

    // SEO
    const fallbackTitle = t("staticPage.default_title", {
        defaultValue: "Seite - O&I CLEAN group GmbH",
    });

    const fallbackDescription = t("staticPage.default_description", {
        defaultValue:
            "Informationen zu unseren Leistungen und unserem Unternehmen.",
    });

    const seoTitle = title || fallbackTitle;
    const seoDescription =
        page?.metaDescription || meta?.description || fallbackDescription;

    // URL / Canonical
    const baseLocation = props?.ziggy?.location || "https://oi-clean.de";
    const normalizedBase = String(baseLocation).replace(/\/+$/, "");
    const path = inertiaUrl || (slug ? `/${slug}` : "/");

    const currentUrl = meta?.canonical || `${normalizedBase}${path}`;
    const originUrl = normalizedBase + "/";

    const schemaWebPage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: seoTitle,
        description: seoDescription,
        url: currentUrl,
    };

    const homeLabel = t("staticPage.breadcrumbs_home", {
        defaultValue: "Startseite",
    });

    const pageLabel = t("staticPage.breadcrumbs_page", {
        defaultValue: "Seite",
    });

    const contentComingSoon = t("staticPage.empty_content", {
        defaultValue: "Inhalt wird bald hinzugefügt.",
    });

    const hasContent = !!content;

    return (
        <AppLayout>
            <Head>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
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

                <meta property="og:type" content="website" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:url" content={currentUrl} />
                {heroImage && <meta property="og:image" content={heroImage} />}
                <meta property="og:site_name" content="O&I CLEAN group GmbH" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                {heroImage && (
                    <meta name="twitter:image" content={heroImage} />
                )}

                <script type="application/ld+json">
                    {JSON.stringify(schemaWebPage)}
                </script>

                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            {
                                "@type": "ListItem",
                                position: 1,
                                name: homeLabel,
                                item: originUrl,
                            },
                            {
                                "@type": "ListItem",
                                position: 2,
                                name: seoTitle || pageLabel,
                                item: currentUrl,
                            },
                        ],
                    })}
                </script>
            </Head>

            {/* HERO */}
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
                                <Link href="/">{homeLabel}</Link>
                            </li>
                            <li aria-current="page">
                                {title || pageLabel}
                            </li>
                        </ol>
                    </nav>

                    <h1 className="sp-title">{title || pageLabel}</h1>
                </div>
            </section>

            {/* CONTENT */}
            <section className="sp-content">
                <div className="container">
                    <article className="sp-card sp-fadeup">
                        <div className="sp-card__body">
                        
                            {loading && (
                                <p className="sp-muted">Seite wird geladen…</p>
                            )}

                            {error && !loading && (
                                <p className="sp-error">{error}</p>
                            )}

                            {!loading && !error && !hasContent && (
                                <p className="sp-muted">
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

            <ContactSection />
        </AppLayout>
    );
}
