import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import "../../../css/location-show.css";
import ContactSection from "@/Components/Home/Contact/ContactSection";

export default function LocationShow({ slug, page = {}, structuredData }) {
    const title = page?.title || page?.city || "Standort";
    const desc = page?.intro || `Reinigungsservice in ${page?.city || ""}`;

    return (
        <AppLayout>
            <Head>
                <title>{`${title} – Standorte`}</title>
                <meta name="description" content={desc} />
                {structuredData && (
                    <script type="application/ld+json">
                        {JSON.stringify(structuredData)}
                    </script>
                )}
            </Head>

            {/* HERO */}
            <section className="locx-hero">
                <div className="locx-hero__media">
                    {page?.hero?.image ? (
                        <img
                            src={page.hero.image}
                            alt={page.hero.alt || title}
                            className="locx-hero__img"
                            loading="eager"
                        />
                    ) : (
                        <div className="locx-hero__fallback" />
                    )}
                    <div className="locx-hero__overlay" />
                </div>

                <div className="locx-hero__inner container">
                    <h1 className="locx-title">{title}</h1>
                    {page?.intro && (
                        <p className="locx-subtitle">{page.intro}</p>
                    )}
                </div>
            </section>

            <section className="locx-content">
                <div className="container">
                    {(page?.sections || []).map((s, i) => {
                        const rev = i % 2 === 1;
                        return (
                            <article
                                key={i}
                                className={`locx-section ${
                                    rev ? "locx-section--rev" : ""
                                }`}
                            >
                                {s.image && (
                                    <div className="locx-media">
                                        <img
                                            src={s.image}
                                            alt={s.alt || s.heading || title}
                                            className="locx-img"
                                            loading="lazy"
                                        />
                                    </div>
                                )}

                                <div className="locx-body">
                                    {s.heading && (
                                        <h2 className="locx-h2">{s.heading}</h2>
                                    )}
                                    {s.body && (
                                        <div className="locx-prose">
                                            {String(s.body)
                                                .split("\n")
                                                .filter(Boolean)
                                                .map((p, k) => (
                                                    <p key={k}>{p}</p>
                                                ))}
                                        </div>
                                    )}
                                    {Array.isArray(s.items) &&
                                        s.items.length > 0 && (
                                            <ul className="locx-list">
                                                {s.items.map((li, k) => (
                                                    <li
                                                        key={k}
                                                        className="locx-list__item"
                                                    >
                                                        <span className="locx-bullet" />
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
            <ContactSection />
        </AppLayout>
    );
}
