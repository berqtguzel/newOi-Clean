// resources/js/Pages/StaticPage.jsx
import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import "@/../css/static-page.css";

export default function StaticPage({ slug, page = {}, meta = {} }) {
    const title = meta?.title || page?.title || "";
    const description = meta?.description || page?.subtitle || title;

    const schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url: typeof window !== "undefined" ? window.location.href : undefined,
    };

    const heroImage = page?.hero?.image;
    const heroAlt = page?.hero?.alt || title;

    return (
        <AppLayout>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                {meta?.canonical && (
                    <link rel="canonical" href={meta.canonical} />
                )}
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
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
                    <nav className="sp-crumbs"></nav>

                    <h1 className="sp-title">{page?.title || "Static Page"}</h1>
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
                                <p className="sp-muted">
                                    Inhalt wird bald hinzugefügt.
                                </p>
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
                                            {s.body
                                                .split("\n")
                                                .map((line, k) => (
                                                    <p key={k}>{line}</p>
                                                ))}
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
