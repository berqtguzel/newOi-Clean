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

    const heroDesc =
        matchedService?.description ||
        matchedService?.short_description ||
        page?.intro ||
        `Professionelle Gebäudereinigung in ${city}.`;

    const placeholderImage =
        "https://images.unsplash.com/photo-1581578731117-e0a820bd4928?q=80&w=1920&auto=format&fit=crop";
    const heroImageSrc =
        matchedService?.image ||
        page?.image ||
        page?.hero?.image ||
        placeholderImage;

    -useEffect(() => {
        let isMounted = true;

        async function loadData() {
            if (!currentUrlSlug) return;
            setLoading(true);

            try {
                const data = await fetchServices({
                    tenantId,
                    locale,
                    locationSlug: currentUrlSlug,
                    city,
                    perPage: 100,
                });

                if (isMounted) {
                    const servicesList = data.services || [];
                    setRemoteServices(servicesList);

                    const found = servicesList.find(
                        (s) => s.slug === currentUrlSlug
                    );

                    if (found) {
                        console.log("✅ EŞLEŞEN SERVİS BULUNDU:", found);
                        setMatchedService(found);
                    } else {
                        const fuzzyMatch = servicesList.find(
                            (s) =>
                                s.city &&
                                s.city.toLowerCase() ===
                                    cityFromUrl.toLowerCase()
                        );
                        if (fuzzyMatch) {
                            console.log(
                                "⚠️ Slug tutmadı ama şehir tuttu, bunu kullanıyorum:",
                                fuzzyMatch
                            );
                            setMatchedService(fuzzyMatch);
                        }
                    }

                    setError(null);
                }
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

        // city -> "Amberg" => "amberg"
        const citySlug =
            city
                ?.toString()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // aksanları temizle
                .replace(/[^a-z0-9]+/g, "-") // boşlukları - yap
                .replace(/^-+|-+$/g, "") || ""; // baş/son - temizle

        return list
            .filter((s) => s.parentId == null)
            .map((s) => {
                const baseServiceSlug = s.slug; // örn: "wohnungsrenovierung"
                const seoSlug = citySlug
                    ? `${baseServiceSlug}-${citySlug}` // "wohnungsrenovierung-amberg"
                    : baseServiceSlug;

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
                };
            });
    }, [remoteServices, city]);

    return (
        <AppLayout>
            <Head>
                <title>{`${heroTitle} – Standort`}</title>
                {/* Meta description için HTML taglerini temizliyoruz */}
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
                    {/* Başlık */}
                    <h1 className="locx-title">{heroTitle}</h1>

                    {/* Açıklama (HTML Render) */}
                    {/* Backend'den gelen <h2> ve <p> taglerini burada işliyoruz */}
                    <div
                        className="locx-subtitle prose prose-invert max-w-3xl mx-auto" // prose class'ı HTML stilleri için (Tailwind Typography varsa)
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
