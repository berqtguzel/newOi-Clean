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
                    perPage: 9999,
                });

                setRemoteServices(services);

                // 🔥 Şehir slug'ına göre servisleri bul
                // Önce tam slug eşleşmesi dene
                let found = services.find(
                    (s) =>
                        s.slug?.toLowerCase() === currentUrlSlug?.toLowerCase()
                );

                // Eğer bulunamazsa, gebaudereinigung-in-{citySlug} formatını dene
                if (!found && citySlug) {
                    const gebSlug = `gebaudereinigung-in-${citySlug.toLowerCase()}`;
                    found = services.find(
                        (s) => s.slug?.toLowerCase() === gebSlug
                    );
                }

                // Eğer hala bulunamazsa, city field'ına göre ara (hem boşluklu hem tireli, hem normalize edilmiş hem orijinal)
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

    // --- Şehirle ilgili diğer servisler ---
    const servicesToRender = useMemo(() => {
        if (!citySlug) return [];

        const citySlugLower = citySlug.toLowerCase();
        const citySlugWithSpaces = citySlugLower.replace(/-/g, " ");

        const filtered = remoteServices
            .filter((s) => {
                // Mevcut servisi hariç tut
                if (s.id === matchedService?.id) return false;

                // City field'ına göre eşleştir (hem boşluklu hem tireli, hem normalize edilmiş hem orijinal)
                const sCity = s.city?.toLowerCase()?.trim() || "";
                const sCityNormalized = normalizeGermanChars(sCity);
                const sCityWithDashes = sCity.replace(/\s+/g, "-");
                const sCityWithSpaces = sCity.replace(/-/g, " ");
                const sCityNormalizedWithDashes = normalizeGermanChars(
                    sCity
                ).replace(/\s+/g, "-");
                const sCityNormalizedWithSpaces = normalizeGermanChars(
                    sCity
                ).replace(/-/g, " ");

                if (
                    sCity === citySlugLower ||
                    sCity === citySlugWithSpaces ||
                    sCityWithDashes === citySlugLower ||
                    sCityWithSpaces === citySlugLower ||
                    sCityNormalized === citySlugLower ||
                    sCityNormalized === citySlugWithSpaces ||
                    sCityNormalizedWithDashes === citySlugLower ||
                    sCityNormalizedWithSpaces === citySlugLower
                ) {
                    return true;
                }

                // Slug'da şehir adı geçiyor mu kontrol et (hem normalize edilmiş hem orijinal)
                const sSlug = s.slug?.toLowerCase() || "";
                const sSlugNormalized = normalizeGermanChars(sSlug);
                if (
                    sSlug.includes(citySlugLower) ||
                    sSlug.includes(citySlugWithSpaces) ||
                    sSlugNormalized.includes(citySlugLower) ||
                    sSlugNormalized.includes(citySlugWithSpaces)
                ) {
                    return true;
                }

                return false;
            })
            .map((s) => ({ ...s, ...resolveTrans(s) }));

        return filtered;
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

    return (
        <AppLayout>
            <Head>
                <title>{city}</title>
                <meta
                    name="description"
                    content={heroDesc.replace(/<[^>]+>/g, "").slice(0, 160)}
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
