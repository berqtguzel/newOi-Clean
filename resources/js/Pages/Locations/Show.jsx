import React, { useEffect, useState, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import ServiceCard from "@/Components/Home/Services/ServiceCard";
import { fetchServices } from "@/services/servicesService";
import { useTranslation } from "react-i18next";

import "../../../css/location-show.css";

export default function LocationShow({ slug, page = {}, structuredData }) {
    const { props } = usePage();
    const { t, i18n } = useTranslation();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const tenantId = props?.global?.tenantId || "";
    const locale = props?.locale || "de";

    const [remoteServices, setRemoteServices] = useState([]);
    const [matchedService, setMatchedService] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const currentUrlSlug = useMemo(() => {
        if (slug) return slug;
        if (!isMounted || typeof window === "undefined") return "";
        return window.location.pathname.split("/").filter(Boolean).pop() || "";
    }, [slug, isMounted]);

    const cityFromUrl = useMemo(() => {
        if (!currentUrlSlug) return "";
        return currentUrlSlug
            .replace("gebaudereinigung-in-", "")
            .replace("gebaudereinigung-", "")
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ");
    }, [currentUrlSlug]);

    const city = useMemo(() => {
        if (matchedService?.city) return matchedService.city;
        if (page?.city) return page.city;
        if (cityFromUrl) return cityFromUrl;

        if (!isMounted && slug) {
            const fallbackCity = slug
                .replace("gebaudereinigung-in-", "")
                .replace("gebaudereinigung-", "")
                .split("-")
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(" ");
            return fallbackCity || "";
        }
        return "";
    }, [matchedService?.city, page?.city, cityFromUrl, isMounted, slug]);

    const heroTitle = useMemo(() => {
        if (matchedService?.title) return matchedService.title;
        if (matchedService?.name) return matchedService.name;
        if (page?.title) return page.title;
        const cityValue = city || "dieser Stadt";
        return t("locations.hero.defaultTitle", {
            city: cityValue,
            defaultValue: `Gebäudereinigung in ${cityValue}`,
        });
    }, [
        matchedService?.title,
        matchedService?.name,
        page?.title,
        city,
        t,
        i18n.language,
    ]);

    const heroDesc = useMemo(() => {
        if (matchedService?.raw?.content) return matchedService.raw.content;
        if (matchedService?.description) return matchedService.description;
        if (matchedService?.shortDescription)
            return matchedService.shortDescription;
        if (page?.intro) return page.intro;
        const cityValue = city || "dieser Stadt";
        return t("locations.hero.content", {
            city: cityValue,
            defaultValue: `Professionelle Gebäudereinigung in ${cityValue}.`,
        });
    }, [
        matchedService?.raw?.content,
        matchedService?.description,
        matchedService?.shortDescription,
        page?.intro,
        city,
        t,
        i18n.language,
    ]);

    const placeholderImage =
        "https://images.unsplash.com/photo-1581578731117-e0a820bd4928?q=80&w=1920&auto=format&fit=crop";

    const heroImageSrc = useMemo(() => {
        return (
            matchedService?.image ||
            page?.image ||
            page?.hero?.image ||
            placeholderImage
        );
    }, [
        matchedService?.image,
        page?.image,
        page?.hero?.image,
        placeholderImage,
    ]);

    useEffect(() => {
        if (!isMounted) return;

        let isComponentMounted = true;

        async function loadData() {
            if (!currentUrlSlug) return;
            setLoading(true);

            try {
                const data = await fetchServices({
                    tenantId,
                    locale,
                    city: cityFromUrl,
                    perPage: 100,
                });

                if (!isComponentMounted) return;

                const servicesList = data.services || [];
                setRemoteServices(servicesList);

                const found = servicesList.find(
                    (s) => s.slug === currentUrlSlug
                );

                let finalMatchedService = null;

                if (found) {
                    finalMatchedService = found;
                } else {
                    const fuzzyMatch = servicesList.find(
                        (s) =>
                            s.city &&
                            s.city.toLowerCase() === cityFromUrl.toLowerCase()
                    );
                    if (fuzzyMatch) {
                        finalMatchedService = fuzzyMatch;
                    }
                }

                if (isComponentMounted) {
                    setMatchedService(finalMatchedService);
                }

                if (finalMatchedService) {
                } else {
                    console.warn(
                        "URL Slug'ı veya Şehir ile Eşleşen Servis Bulunamadı."
                    );
                }
                console.groupEnd();

                if (isComponentMounted) {
                    setError(null);
                }
            } catch (err) {
                console.error("Hata:", err);
                if (isComponentMounted)
                    setError(
                        t("locations.services.error", "Veriler yüklenemedi.")
                    );
            } finally {
                if (isComponentMounted) setLoading(false);
            }
        }

        loadData();

        return () => {
            isComponentMounted = false;
        };
    }, [isMounted, currentUrlSlug, cityFromUrl, tenantId, locale, t]);

    const servicesToRender = useMemo(() => {
        const list = Array.isArray(remoteServices) ? remoteServices : [];

        const filtered = list.filter((s) => {
            const hasCity = s.city && s.city.toString().trim() !== "";

            if (hasCity) return false;

            const slugStr = (s.slug || "").toString().toLowerCase();
            const nameStr = (s.title || s.name || "").toString().toLowerCase();
            const catRaw =
                s.category_name ||
                s.category_slug ||
                s.categorySlug ||
                s.category?.name ||
                s.category?.slug ||
                "";
            const catStr = catRaw.toString().toLowerCase().trim();
            const isSeoCategory = catStr === "seo";
            const isSeoSlug =
                slugStr === "seo" ||
                slugStr.startsWith("seo-") ||
                slugStr.endsWith("-seo") ||
                slugStr.includes("-seo-");
            const isSeoName =
                nameStr === "seo" ||
                nameStr.startsWith("seo ") ||
                nameStr.includes(" seo");

            if (isSeoCategory || isSeoSlug || isSeoName) {
                return false;
            }

            return true;
        });

        return filtered
            .filter((s) => s.parentId == null)
            .map((s) => {
                const baseServiceSlug = s.slug || "";
                const baseTitle = s.title || s.name || "";

                const inCityPart =
                    city &&
                    t("services.location.in_city", {
                        city,
                        defaultValue: `in ${city}`,
                    });

                const title =
                    baseTitle &&
                    city &&
                    !baseTitle.toLowerCase().includes(city.toLowerCase())
                        ? `${baseTitle} ${inCityPart}`
                        : baseTitle || "";

                return {
                    id: s.id,
                    title,
                    description: s.description || "",
                    image: s.image || null,
                    slug: baseServiceSlug,
                    link: null,
                    icon: s.icon,
                    hasTranslations:
                        Array.isArray(s.raw?.translations) &&
                        s.raw.translations.length > 0,
                    rawLang:
                        s.raw?._meta?.languages?.current ||
                        s.raw?._meta?.languages?.default ||
                        null,
                };
            });
    }, [remoteServices, city, t, i18n.language]);

    const pageTitle = useMemo(() => {
        return t("locations.meta.title", {
            heroTitle,
            defaultValue: `${heroTitle} – Standort`,
        });
    }, [heroTitle, t, i18n.language]);

    const metaDesc = useMemo(() => {
        return heroDesc.replace(/<[^>]*>?/gm, "").substring(0, 160);
    }, [heroDesc]);

    const servicesSectionTitle = useMemo(() => {
        if (matchedService?.title) return matchedService.title;
        if (matchedService?.name) return matchedService.name;
        const cityValue = city || "";
        return t("locations.services.title", {
            city: cityValue,
            defaultValue: "Unsere Dienstleistungen",
        });
    }, [matchedService?.title, matchedService?.name, city, t, i18n.language]);

    const servicesSectionContent = useMemo(() => {
        if (matchedService?.content) return matchedService.content;
        if (matchedService?.description) return matchedService.description;
        const cityValue = city || "";
        return t("locations.services.subtitle", {
            city: cityValue,
            defaultValue:
                "Professionelle Reinigungsdienstleistungen in Ihrer Nähe.",
        });
    }, [
        matchedService?.content,
        matchedService?.description,
        city,
        t,
        i18n.language,
    ]);

    const servicesSectionHtmlContent = useMemo(() => {
        return (
            matchedService?.raw?.content ||
            matchedService?.description ||
            servicesSectionContent
        );
    }, [
        matchedService?.raw?.content,
        matchedService?.description,
        servicesSectionContent,
    ]);

    return (
        <AppLayout>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDesc} />
            </Head>

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
                    <div className="locx-hero__content">
                        <div className="locx-hero__inner container">
                            <div className="locx-hero__badge">
                                <svg
                                    className="locx-hero__badge-icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <span>
                                    {t("locations.hero.badge", "Standort")}
                                </span>
                            </div>
                            <h1 className="locx-title">{heroTitle}</h1>
                            <div
                                className="locx-subtitle"
                                dangerouslySetInnerHTML={{ __html: heroDesc }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="locx-services">
                <div className="container">
                    <div className="locx-services__header">
                        <h2 className="locx-services__title">
                            {servicesSectionTitle}
                        </h2>

                        <div
                            className="locx-services__subtitle"
                            dangerouslySetInnerHTML={{
                                __html: servicesSectionHtmlContent,
                            }}
                        />
                    </div>

                    {loading && isMounted && (
                        <div className="locx-services__loading">
                            <div className="locx-services__spinner"></div>
                            <p>
                                {t(
                                    "locations.services.loading",
                                    "Dienstleistungen werden geladen..."
                                )}
                            </p>
                        </div>
                    )}

                    {error && isMounted && (
                        <div className="locx-services__error">
                            <svg
                                className="locx-services__error-icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="locx-services__grid">
                            {servicesToRender.length > 0
                                ? servicesToRender.map((s) => (
                                      <ServiceCard key={s.id} {...s} />
                                  ))
                                : isMounted && (
                                      <div className="locx-services__empty">
                                          <svg
                                              className="locx-services__empty-icon"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                          >
                                              <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M9.172 16.172a4 4 0 015.656 0 4 4 0 01-5.656 0zM9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                              />
                                          </svg>
                                          <p>
                                              {t(
                                                  "locations.services.empty",
                                                  "Keine Dienstleistungen gefunden."
                                              )}
                                          </p>
                                      </div>
                                  )}
                        </div>
                    )}
                </div>
            </section>

            <ContactSection />
        </AppLayout>
    );
}
