import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import "@/../css/static-page.css";
import parse, { domToReact, Element } from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import { useTranslation } from "react-i18next";

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

export default function StaticPage({ slug, page = {}, meta = {} }) {
    const { t } = useTranslation();

    const title =
        meta?.title ||
        page?.title ||
        t("static.default_title", "Seite - O&I CLEAN group GmbH");

    const description =
        meta?.description ||
        page?.subtitle ||
        t(
            "static.default_description",
            "Informationen zu unseren Leistungen und unserem Unternehmen."
        );

    const currentUrl =
        typeof window !== "undefined"
            ? window.location.href
            : meta?.canonical || "https://oi-clean.de/" + (slug || "");

    const originUrl =
        typeof window !== "undefined"
            ? window.location.origin
            : "https://oi-clean.de/";

    const schemaWebPage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url: currentUrl,
    };

    const heroImage = page?.hero?.image;
    const heroAlt = page?.hero?.alt || title;

    const homeLabel = t("breadcrumbs.home", "Startseite");
    const contentComingSoon = t(
        "static.content_coming_soon",
        "Inhalt wird bald hinzugefügt."
    );

    return (
        <AppLayout>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta
                    name="robots"
                    content="index,follow,max-image-preview:large"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta name="theme-color" content="#0f172a" />

                <link rel="canonical" href={meta?.canonical || currentUrl} />

                <meta property="og:type" content="website" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={currentUrl} />
                {heroImage && <meta property="og:image" content={heroImage} />}
                <meta property="og:site_name" content="O&I CLEAN group GmbH" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                {heroImage && <meta name="twitter:image" content={heroImage} />}

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
                                name: title || t("static.page", "Seite"),
                                item: currentUrl,
                            },
                        ],
                    })}
                </script>
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
                                <Link href="/">{homeLabel}</Link>
                            </li>
                            <li aria-current="page">
                                {page?.title || t("static.page", "Seite")}
                            </li>
                        </ol>
                    </nav>

                    <h1 className="sp-title">
                        {page?.title || t("static.page", "Static Page")}
                    </h1>

                    {page?.subtitle && (
                        <p className="sp-subtitle">{page.subtitle}</p>
                    )}
                </div>
            </section>

            <section className="sp-content">
                <div className="container">
                    <article className="sp-card sp-fadeup">
                        <div className="sp-card__body">
                            {(page?.sections ?? []).length === 0 && (
                                <p className="sp-muted">{contentComingSoon}</p>
                            )}

                            {(page?.sections ?? []).map((s, i) => (
                                <section
                                    key={i}
                                    className="sp-section sp-fadeup"
                                >
                                    {s.heading && (
                                        <h2 className="sp-h2">{s.heading}</h2>
                                    )}

                                    {s.body && (
                                        <div className="sp-prose">
                                            {safeParse(s.body)}
                                        </div>
                                    )}

                                    {Array.isArray(s.items) &&
                                        s.items.length > 0 && (
                                            <ul className="sp-list">
                                                {s.items.map((li, k) => (
                                                    <li
                                                        key={k}
                                                        className="sp-list__item"
                                                    >
                                                        <span className="sp-bullet" />
                                                        <span>{li}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                </section>
                            ))}
                        </div>
                    </article>
                </div>
            </section>

            <ContactSection />
        </AppLayout>
    );
}
