import React, { useEffect, useState, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import ServiceCard from "@/Components/Home/Services/ServiceCard";
import { fetchServices } from "@/services/servicesService";
import { useTranslation } from "react-i18next";
import "../../../css/location-show.css";

export default function LocationShow() {
    const { props } = usePage();
    const { t } = useTranslation();

    const tenantId = props?.global?.tenantId || "";
    const locale = props?.locale || "de";

    const [matchedService, setMatchedService] = useState(null);
    const [remoteServices, setRemoteServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // 👇 Slug → şehir sayfası slug'ı (ör: üsküdar, aalen vs)
    const currentUrlSlug = useMemo(() => {
        if (typeof window === "undefined") return "";
        return window.location.pathname.split("/").filter(Boolean).pop() || "";
    }, []);

    // 👇 Slug’dan şehir ismi üret
    const city = useMemo(() => {
        return currentUrlSlug
            .replace("gebaudereinigung-in-", "")
            .replace("gebaudereinigung-", "")
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ");
    }, [currentUrlSlug]);

    useEffect(() => {
        async function loadData() {
            setLoading(true);

            try {
                const data = await fetchServices({
                    tenantId,
                    locale,
                    perPage: 500,
                });

                const list = data.services || [];
                setRemoteServices(list);

                console.log("📦 Services Loaded:", list.length);

                // 👇 Slug eşleşmesi → en doğru sonuç
                let found = list.find((s) => s.slug === currentUrlSlug);

                // 👇 Eğer slug ile bulamazsa → city eşleşmesi
                if (!found) {
                    found = list.find(
                        (s) =>
                            s.city &&
                            s.city.toLowerCase() === city.toLowerCase()
                    );
                }

                setMatchedService(found || null);
            } catch (e) {
                console.error("❌ API ERROR:", e);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [currentUrlSlug, tenantId, locale, city]);

    const heroTitle = matchedService
        ? `${matchedService.title} in ${city}`
        : `Gebäudereinigung in ${city}`;

    const heroDescription =
        matchedService?.raw?.content ||
        matchedService?.description ||
        `<p>Professionelle Gebäudereinigung in ${city}.</p>`;

    const heroImage =
        matchedService?.image ||
        "https://images.unsplash.com/photo-1581578731117-e0a820bd4928?q=80&w=1920&auto=format&fit=crop";

    // ❌ Bu kelimeleri içeren servisleri hiç gösterme
    const forbiddenWords = ["gebaudereinigung", "gebäudereinigung"];

    const servicesToRender = remoteServices.filter((s) => {
        const serviceCity = s.city ? s.city.toLowerCase() : "";
        const currentCity = city.toLowerCase();
        const title = (s.title || s.name || "").toLowerCase();
        const slug = (s.slug || "").toLowerCase();

        const containsForbidden = forbiddenWords.some(
            (bad) => slug.includes(bad) || title.includes(bad)
        );

        return (
            !containsForbidden && // yasaklı kelime yok
            serviceCity === currentCity && // aynı şehir
            s.slug !== currentUrlSlug && // kendisi değil
            (s.parentId == null || s.parentId === 0) // ana servis
        );
    });

    return (
        <AppLayout>
            <Head>
                <title>{heroTitle}</title>
                <meta
                    name="description"
                    content={heroDescription
                        .replace(/<[^>]*>?/gm, "")
                        .substring(0, 160)}
                />
            </Head>

            {/* HERO */}
            <section className="locx-hero">
                <div className="locx-hero__media">
                    <img
                        src={heroImage}
                        alt={heroTitle}
                        className="locx-hero__img"
                    />
                    <div className="locx-hero__overlay" />
                    <div className="locx-hero__content">
                        <h1 className="locx-title">{heroTitle}</h1>
                    </div>
                </div>
            </section>

            {/* DESC */}
            <section className="locx-content">
                <div className="container">
                    {/* 🔥 Şehrin adı için ek başlık */}
                    <h2 className="locx-city-title">{city}</h2>

                    <div
                        className="locx-content-html"
                        dangerouslySetInnerHTML={{ __html: heroDescription }}
                    />
                </div>
            </section>

            {/* OTHER RELATED SERVICES */}
            <section className="locx-services">
                <div className="container">
                    {loading && <p>Yükleniyor...</p>}

                    {!loading && (
                        <div className="locx-services__grid">
                            {servicesToRender.map((s) => (
                                <ServiceCard key={s.id} {...s} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <ContactSection />
        </AppLayout>
    );
}
