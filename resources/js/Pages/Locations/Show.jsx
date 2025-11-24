// resources/js/Pages/Locations/Show.jsx

import React, { useEffect, useState, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import ServiceCard from "@/Components/Home/Services/ServiceCard";
import { fetchServices } from "@/services/servicesService";

import "../../../css/location-show.css";

export default function LocationShow({ slug, page = {}, structuredData }) {
    const { props } = usePage();
    const tenantId = props?.global?.tenantId || "";
    const locale = props?.locale || "de";

    const [remoteServices, setRemoteServices] = useState([]);
    const [matchedService, setMatchedService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUrlSlug =
        typeof window !== "undefined"
            ? window.location.pathname.split("/").filter(Boolean).pop()
            : slug;

    const cityFromUrl = currentUrlSlug
        ? currentUrlSlug
              .replace("gebaudereinigung-in-", "")
              .replace("gebaudereinigung-", "")
              .split("-")
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(" ")
        : "";

    const city = matchedService?.city || page?.city || cityFromUrl;

    const heroTitle =
        matchedService?.title ||
        matchedService?.name ||
        page?.title ||
        `Gebäudereinigung in ${city}`;

    // 🔴 ÖNEMLİ KISIM: Önce API’den gelen content’i kullanıyoruz
    const heroDesc =
        matchedService?.raw?.content || // <--- backend JSON'daki content
        matchedService?.description ||
        matchedService?.shortDescription ||
        page?.intro ||
        `Professionelle Gebäudereinigung in ${city}.`;

    const placeholderImage =
        "https://images.unsplash.com/photo-1581578731117-e0a820bd4928?q=80&w=1920&auto=format&fit=crop";
    const heroImageSrc =
        matchedService?.image ||
        page?.image ||
        page?.hero?.image ||
        placeholderImage;

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            if (!currentUrlSlug) return;
            setLoading(true);

            try {
                const data = await fetchServices({
                    tenantId,
                    locale,
                    // burada istersen city filtresi de yolluyoruz
                    city: cityFromUrl,
                    perPage: 100,
                });

                if (!isMounted) return;

                const servicesList = data.services || [];
                setRemoteServices(servicesList);

                // URL slug’ı ile bire bir eşleşen servisi bul
                const found = servicesList.find(
                    (s) => s.slug === currentUrlSlug
                );

                if (found) {
                    setMatchedService(found);
                } else {
                    // slug tutmazsa city üzerinden fallback eşleşme
                    const fuzzyMatch = servicesList.find(
                        (s) =>
                            s.city &&
                            s.city.toLowerCase() === cityFromUrl.toLowerCase()
                    );
                    if (fuzzyMatch) {
                        setMatchedService(fuzzyMatch);
                    }
                }

                setError(null);
            } catch (err) {
                console.error("Hata:", err);
                if (isMounted) setError("Veriler yüklenemedi.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadData();

        return () => {
            isMounted = false;
        };
    }, [currentUrlSlug, cityFromUrl, tenantId, locale]);

    const servicesToRender = useMemo(() => {
        const list = Array.isArray(remoteServices) ? remoteServices : [];

        const citySlug =
            city
                ?.toString()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "") || "";

        return list
            .filter((s) => s.parentId == null)
            .map((s) => {
                const baseServiceSlug = s.slug; // örn: "wohnungsrenovierung"
                const seoSlug = citySlug
                    ? `${baseServiceSlug}-${citySlug}` // "wohnungsrenovierung-amberg"
                    : baseServiceSlug;

                // detect whether server provided translations for this service
                const hasTranslations =
                    Array.isArray(s.raw?.translations) &&
                    s.raw.translations.length > 0;
                const rawLang =
                    s.raw?._meta?.languages?.current ||
                    s.raw?._meta?.languages?.default ||
                    null;

                return {
                    id: s.id,
                    title: (s.title || s.name || "").includes(city)
                        ? s.title || s.name
                        : `${s.title || s.name} in ${city}`,
                    description: s.description || "",
                    image: s.image || null,
                    slug: seoSlug,
                    link: `/${seoSlug}`,
                    icon: s.icon,
                    hasTranslations,
                    rawLang,
                };
            });
    }, [remoteServices, city]);

    return (
        <AppLayout>
            <Head>
                <title>{`${heroTitle} – Standort`}</title>
                <meta
                    name="description"
                    content={heroDesc
                        .replace(/<[^>]*>?/gm, "")
                        .substring(0, 160)}
                />
            </Head>

            {/* HERO BÖLÜMÜ */}
            <section className="locx-hero">
                <div className="locx-hero__media">
                    <img
                        src={heroImageSrc}
                        alt={heroTitle}
                        className="locx-hero__img"
                        onError={(e) => {
                            if (e.currentTarget.src !== placeholderImage) {
                                e.currentTarget.src = placeholderImage;
                            }
                        }}
                    />
                    <div className="locx-hero__overlay" />
                </div>

                <div className="locx-hero__inner container">
                    <h1 className="locx-title">{heroTitle}</h1>

                    {/* Burada artık API'den gelen content HTML’i gösteriliyor */}
                    <div
                        className="locx-subtitle prose prose-invert max-w-3xl mx-auto"
                        dangerouslySetInnerHTML={{ __html: heroDesc }}
                    />
                </div>
            </section>

            {/* HİZMETLER LİSTESİ */}
            <section className="locx-services">
                <div className="container">
                    <h2 className="locx-h2">
                        Unsere Dienstleistungen in {city}
                    </h2>

                    {loading && (
                        <div className="text-center py-10 text-gray-500">
                            Lade Daten...
                        </div>
                    )}

                    {!loading && servicesToRender.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {servicesToRender.map((s) => (
                                <ServiceCard key={s.id} {...s} />
                            ))}
                        </div>
                    )}

                    {!loading && servicesToRender.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            Keine Services gefunden.
                        </div>
                    )}
                </div>
            </section>

            <ContactSection />
        </AppLayout>
    );
}
