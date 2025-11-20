import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import "../../../css/location-show.css";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import { useLocationServices } from "@/hooks/useServices";

function titleFromSlug(slug = "") {
    return slug
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export default function LocationShow({ slug, page = {}, structuredData }) {
    const city = page?.city || titleFromSlug(slug);
    const title = page?.title || `Reinigungsservice in ${city}`;
    const desc =
        page?.intro ||
        `Professionelle Reinigungsservices in ${city} und Umgebung.`;

    const { services, loading, error } = useLocationServices(slug);

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
                    <p className="locx-subtitle">{desc}</p>
                </div>
            </section>

            <section className="locx-services">
                <div className="container">
                    <h2 className="locx-h2">
                        Unsere Dienstleistungen in {city}
                    </h2>

                    {loading && (
                        <p className="locx-services-loading">
                            Services werden geladen…
                        </p>
                    )}

                    {error && !loading && (
                        <p className="locx-services-error">
                            Services konnten nicht geladen werden.
                        </p>
                    )}

                    {!loading && !error && services.length === 0 && (
                        <p className="locx-services-empty">
                            Für diesen Standort sind aktuell keine Services
                            vorhanden.
                        </p>
                    )}

                    {!loading && !error && services.length > 0 && (
                        <div className="locx-services-grid">
                            {services.map((service) => (
                                <Link
                                    key={service.id}
                                    href={route("services.show", service.slug)}
                                    className="locx-service-card"
                                >
                                    <div className="locx-service-card-inner">
                                        <h3 className="locx-service-title">
                                            {service.title}
                                        </h3>
                                        {service.shortDescription && (
                                            <p className="locx-service-desc">
                                                {service.shortDescription}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <ContactSection />
        </AppLayout>
    );
}
