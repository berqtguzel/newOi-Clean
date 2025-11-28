import React, { useEffect, useState, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import AppLayout from "@/Layouts/AppLayout";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import ServiceCard from "@/Components/Home/Services/ServiceCard";
import { fetchServices } from "@/services/servicesService";
import "../../../css/location-show.css";

/**
 * Almanca karakterleri normalize et (ß -> ss, ü -> ue, ö -> oe, ä -> ae)
 */
function normalizeGermanChars(text) {
    if (!text) return "";
    return String(text)
        .replace(/ß/g, "ss")
        .replace(/ü/g, "ue")
        .replace(/ö/g, "oe")
        .replace(/ä/g, "ae")
        .replace(/Ü/g, "ue")
        .replace(/Ö/g, "oe")
        .replace(/Ä/g, "ae");
}

export default function LocationShow() {
    const { props } = usePage();
    const { t, i18n } = useTranslation();
    const tenantId = props?.global?.tenantId || "";
    const locale = (props?.locale || "de").toLowerCase();

    // i18n dilini senkronize et
    useEffect(() => {
        if (locale && i18n.language !== locale) {
            i18n.changeLanguage(locale);
        }
    }, [locale, i18n]);

    const [matchedService, setMatchedService] = useState(null);
    const [remoteServices, setRemoteServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔥 Slug'ı props'tan al (backend'den geliyor) veya URL'den çıkar
    const currentUrlSlug = useMemo(() => {
        if (typeof window === "undefined") return "";
        const raw =
            window.location.pathname.split("/").filter(Boolean).pop() || "";
        // URL decode et, Almanca karakterleri normalize et ve boşlukları tireye çevir
        try {
            const decoded = decodeURIComponent(raw);
            const normalized = normalizeGermanChars(decoded);
            return normalized.toLowerCase().trim();
        } catch (e) {
            const normalized = normalizeGermanChars(raw);
            return normalized.toLowerCase().trim();
        }
    }, []);

    // 🔥 Önce props'tan gelen citySlug'ı kullan, yoksa URL'den çıkar
    const citySlug = useMemo(() => {
        // Backend'den gelen citySlug prop'unu kullan
        if (props?.citySlug) {
            let slug = String(props.citySlug).toLowerCase().trim();
            // Almanca karakterleri normalize et
            slug = normalizeGermanChars(slug);
            // Boşlukları tireye çevir
            slug = slug.replace(/\s+/g, "-");
            return slug;
        }

        // Eğer props'ta yoksa, URL'den çıkar
        // Prefix'leri kaldır: gebaudereinigung-in-, gebaudereinigung-
        let slug = currentUrlSlug;

        // Prefix'leri kaldır
        if (slug.startsWith("gebaudereinigung-in-")) {
            slug = slug.replace(/^gebaudereinigung-in-/, "");
        } else if (slug.startsWith("gebaudereinigung-")) {
            slug = slug.replace(/^gebaudereinigung-/, "");
        }

        // Son parçayı almak yerine, tüm slug'ı kullan (bad-kruezbeerg gibi)
        return slug;
    }, [props?.citySlug, currentUrlSlug]);

    const city = useMemo(() => {
        return citySlug
            ?.replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }, [citySlug]);

    // 🔍 Hangi şehir geliyor? Logla
    useEffect(() => {
        console.log("📍 LocationShow city debug:", {
            propsCitySlug: props?.citySlug,
            currentUrlSlug,
            citySlug,
            city,
            matchedServiceCity: matchedService?.city,
        });
    }, [props?.citySlug, currentUrlSlug, citySlug, city, matchedService]);

    // API çevirilerini çöz
    const resolveTrans = (service) => {
        const tr = service?.translations || [];
        const current = tr.find((t) => t.language_code === locale);
        const fallback = tr.find((t) => t.language_code === "de");

        return {
            title: current?.title || fallback?.title || service.name,
            desc:
                current?.content ||
                fallback?.content ||
                service.description ||
                "",
        };
    };

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const { services = [] } = await fetchServices({
                    tenantId,
                    locale,
                    perPage: 100, // Optimize: Gerektiğinde pagination
                });

                setRemoteServices(services);

                let found = services.find(
                    (s) =>
                        s.slug?.toLowerCase() === currentUrlSlug?.toLowerCase()
                );

                if (!found && citySlug) {
                    const gebSlug = `gebaudereinigung-in-${citySlug.toLowerCase()}`;
                    found = services.find(
                        (s) => s.slug?.toLowerCase() === gebSlug
                    );
                }

                if (!found && citySlug) {
                    const citySlugLower = citySlug.toLowerCase();
                    const citySlugWithSpaces = citySlugLower.replace(/-/g, " ");

                    found = services.find((s) => {
                        if (!s.city) return false;
                        const sCity = s.city.toLowerCase().trim();
                        const sCityNormalized = normalizeGermanChars(sCity);
                        const sCityWithDashes = sCity.replace(/\s+/g, "-");
                        const sCityWithSpaces = sCity.replace(/-/g, " ");
                        const sCityNormalizedWithDashes = normalizeGermanChars(
                            sCity
                        ).replace(/\s+/g, "-");
                        const sCityNormalizedWithSpaces = normalizeGermanChars(
                            sCity
                        ).replace(/-/g, " ");

                        return (
                            sCity === citySlugLower ||
                            sCity === citySlugWithSpaces ||
                            sCityWithDashes === citySlugLower ||
                            sCityWithSpaces === citySlugLower ||
                            sCityNormalized === citySlugLower ||
                            sCityNormalized === citySlugWithSpaces ||
                            sCityNormalizedWithDashes === citySlugLower ||
                            sCityNormalizedWithSpaces === citySlugLower
                        );
                    });
                }

                if (found) {
                    setMatchedService({ ...found, ...resolveTrans(found) });
                }
            } catch (err) {
                console.error("Load failed:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [currentUrlSlug, tenantId, citySlug, locale]);

    const servicesToRender = useMemo(() => {
        if (!citySlug || !matchedService?.city) return [];

        const currentCity = matchedService.city.toLowerCase().trim();
        const currentCityNormalized = normalizeGermanChars(currentCity);

        return remoteServices
            .filter((s) => {
                if (!s.city) return false;

                const sc = s.city.toLowerCase().trim();
                const scNorm = normalizeGermanChars(sc);

                return (
                    s.id !== matchedService.id &&
                    (sc === currentCity || scNorm === currentCityNormalized)
                );
            })
            .map((s) => ({ ...s, ...resolveTrans(s) }));
    }, [remoteServices, matchedService, citySlug, locale]);

    // Başlık & açıklama tamamen API’den gelsin
    const trData = matchedService ? resolveTrans(matchedService) : null;
    const heroTitle =
        trData?.title ||
        (city ? `Gebäudereinigung in ${city}` : "Gebäudereinigung");

    const heroDesc =
        trData?.desc ||
        (city
            ? `<p>Professionelle Gebäudereinigung in ${city}.</p>`
            : "<p>Professionelle Gebäudereinigung.</p>");

    const heroImage =
        matchedService?.image ||
        "https://images.unsplash.com/photo-1581578731117-e0a820bd4928?w=1920&auto=format&fit=crop";

    // SEO Meta Tags - API'den gelen veriler
    const seoMetaTitle = useMemo(() => {
        if (matchedService?.meta_title) return matchedService.meta_title;
        if (trData?.title)
            return `${trData.title} - ${props?.global?.appName || "O&I CLEAN"}`;
        return city
            ? `Gebäudereinigung in ${city} - ${
                  props?.global?.appName || "O&I CLEAN"
              }`
            : `Gebäudereinigung - ${props?.global?.appName || "O&I CLEAN"}`;
    }, [matchedService, trData, city, props?.global?.appName]);

    const seoDescription = useMemo(() => {
        if (matchedService?.meta_description)
            return matchedService.meta_description;
        const cleanDesc = heroDesc.replace(/<[^>]+>/g, "").trim();
        return (
            cleanDesc.slice(0, 160) ||
            (city
                ? `Professionelle Gebäudereinigung in ${city}.`
                : "Professionelle Gebäudereinigung.")
        );
    }, [matchedService, heroDesc, city]);

    const seoKeywords = matchedService?.meta_keywords || "";

    // SSR-safe URL generation
    const canonicalUrl = useMemo(() => {
        if (typeof window === "undefined") {
            return currentUrlSlug ? `/${currentUrlSlug}` : "/";
        }
        return `${window.location.origin}${window.location.pathname}`;
    }, [currentUrlSlug]);

    // SSR-safe OG Image URL
    const ogImageUrl = useMemo(() => {
        if (!heroImage) return null;
        if (typeof window === "undefined") {
            return heroImage.startsWith("http") ? heroImage : heroImage;
        }
        if (heroImage.startsWith("http")) return heroImage;
        return `${window.location.origin}${
            heroImage.startsWith("/") ? heroImage : `/${heroImage}`
        }`;
    }, [heroImage]);

    const appName = props?.global?.appName || "O&I CLEAN";

    return (
        <AppLayout>
            <Head title={seoMetaTitle}>
                <meta name="description" content={seoDescription} />
                {seoKeywords && <meta name="keywords" content={seoKeywords} />}

                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

                <meta property="og:type" content="article" />
                <meta property="og:site_name" content={appName} />
                <meta property="og:title" content={seoMetaTitle} />
                <meta property="og:description" content={seoDescription} />
                {ogImageUrl && (
                    <meta property="og:image" content={ogImageUrl} />
                )}
                {canonicalUrl && (
                    <meta property="og:url" content={canonicalUrl} />
                )}

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoMetaTitle} />
                <meta name="twitter:description" content={seoDescription} />
                {ogImageUrl && (
                    <meta name="twitter:image" content={ogImageUrl} />
                )}
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
                    {city && <h2 className="locx-city-title">{city}</h2>}
                    <div
                        className="locx-content-html"
                        dangerouslySetInnerHTML={{ __html: heroDesc }}
                    />
                </div>
            </section>

            {/* OTHER SERVICES */}
            <section className="locx-services">
                <div className="container">
                    {loading && (
                        <div className="locx-services__loading">
                            <div className="locx-services__spinner"></div>
                            <p>{t("locationShow.loading", "Yükleniyor…")}</p>
                        </div>
                    )}

                    {!loading && servicesToRender.length > 0 && (
                        <>
                            <div className="locx-services__header">
                                <h2 className="locx-services__title">
                                    {t(
                                        "locationShow.services_title_prefix",
                                        ""
                                    )}{" "}
                                    {city && (
                                        <span className="locx-services__city">
                                            {city}
                                        </span>
                                    )}{" "}
                                    {t(
                                        "locationShow.services_title_suffix",
                                        "için diğer hizmetler"
                                    )}
                                </h2>
                                <p className="locx-services__subtitle">
                                    {t(
                                        "locationShow.services_subtitle",
                                        "Bu şehirde sunduğumuz diğer temizlik hizmetlerini keşfedin."
                                    )}
                                </p>
                            </div>

                            <div className="locx-services__grid">
                                {servicesToRender.map((s) => (
                                    <ServiceCard key={s.id} {...s} />
                                ))}
                            </div>
                        </>
                    )}

                    {!loading && servicesToRender.length === 0 && (
                        <div className="locx-services__empty">
                            <p>
                                {t(
                                    "locationShow.empty",
                                    "Bu şehir için başka hizmet tanımlı değil."
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <ContactSection />
        </AppLayout>
    );
}
