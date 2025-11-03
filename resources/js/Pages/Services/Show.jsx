// resources/js/Pages/Service/Show.jsx
import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import "../../../css/service-show.css"; // << yeni CSS
import ContactSection from "@/Components/Home/Contact/ContactSection";

export default function ServiceShow({ slug, page = {} }) {
    const title = page?.title || "Service";
    const description = page?.subtitle || `Leistung: ${title}`;

    const heroImage = page?.hero?.image;
    const heroAlt = page?.hero?.alt || title;

    const schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: title,
        description,
        areaServed: { "@type": "Country", name: "Germany" },
        image: heroImage,
        url: typeof window !== "undefined" ? window.location.href : undefined,
    };

    const sections = Array.isArray(page?.sections) ? page.sections : [];

    return (
        <AppLayout>
            <Head>
                <title>{`${title} – Leistungen`}</title>
                <meta name="description" content={description} />
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            </Head>

            {/* HERO */}
            <section
                className={`svx-hero ${heroImage ? "svx-hero--hasimg" : ""}`}
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
                            Start
                        </Link>
                        <span className="svx-crumbs__sep">/</span>
                        <Link href="/services" className="svx-crumbs__link">
                            Leistungen
                        </Link>
                        <span className="svx-crumbs__sep">/</span>
                        <span className="svx-crumbs__current">{title}</span>
                    </nav>

                    <h1 className="svx-title">{title}</h1>
                    {page?.subtitle && (
                        <p className="svx-subtitle">{page.subtitle}</p>
                    )}
                </div>
            </section>

            {/* CONTENT */}
            <section className="svx-content">
                <div className="container">
                    {/* intro kart */}
                    {(!sections || sections.length === 0) && (
                        <article className="svx-card svx-fadeup">
                            <p className="svx-muted">
                                Inhalt wird bald hinzugefügt.
                            </p>
                        </article>
                    )}

                    {/* section’lar */}
                    {sections.map((s, i) => {
                        const hasImg = !!s.image;
                        const reversed = i % 2 === 1; // sırayla ters düzen
                        const items = Array.isArray(s.items) ? s.items : [];

                        return (
                            <article
                                key={i}
                                className={`svx-section svx-fadeup ${
                                    reversed ? "svx-section--rev" : ""
                                }`}
                            >
                                {hasImg && (
                                    <div className="svx-section__media">
                                        <img
                                            src={s.image}
                                            alt={s.alt || s.heading || title}
                                            className="svx-section__img"
                                            loading="lazy"
                                        />
                                    </div>
                                )}

                                <div className="svx-section__body">
                                    {s.heading && (
                                        <h2 className="svx-h2">{s.heading}</h2>
                                    )}

                                    {s.body && (
                                        <div className="svx-prose">
                                            {String(s.body)
                                                .split("\n")
                                                .filter(Boolean)
                                                .map((p, k) => (
                                                    <p key={k}>{p}</p>
                                                ))}
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

                    {/* CTA kartı */}
                    <div className="svx-cta svx-fadeup">
                        <div className="svx-cta__left">
                            <h3>Beratung gewünscht?</h3>
                            <p>
                                Gerne erstellen wir ein unverbindliches Angebot.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <ContactSection />
        </AppLayout>
    );
}
