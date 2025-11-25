import React, { useEffect, useState, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { fetchServiceByIdOrSlug } from "@/services/servicesService";
import { useLocale } from "@/hooks/useLocale";
import { useTranslation } from "react-i18next";
import SafeHtml from "@/Components/Common/SafeHtml";
import "../../../css/service-show.css";

function humanizeSlug(slug = "") {
    return String(slug)
        .split("-")
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");
}

function extractCityFromSlug(slug = "") {
    const parts = String(slug).split("-").filter(Boolean);
    if (parts.length <= 1) return null;

    const last = parts[parts.length - 1].toLowerCase();

    const isServicePrefix =
        /^(gebaudereinigung|wohnungsrenovierung|hotelreinigung)$/i.test(last);
    if (isServicePrefix) return null;

    return last;
}

function prettifyCity(citySlug = "") {
    return String(citySlug)
        .split("-")
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");
}

export default function ServiceShow() {
    const { props } = usePage();
    const { t, i18n } = useTranslation();
    const locale = useLocale("de");

    const {
        slug: propSlug,
        originalSlug,
        citySlug: propCitySlug,
        global,
    } = props;

    const tenantId =
        global?.tenantId || global?.tenant_id || global?.talentId || "";

    const [service, setService] = useState(null);
    const [rawService, setRawService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const citySlug = useMemo(() => {
        if (propCitySlug) return String(propCitySlug).toLowerCase();
        if (originalSlug && originalSlug.includes("-")) {
            const extracted = extractCityFromSlug(originalSlug);
            if (extracted) return extracted;
        }
        if (propSlug && propSlug.includes("-")) {
            const extracted = extractCityFromSlug(propSlug);
            if (extracted) return extracted;
        }
        return null;
    }, [propCitySlug, originalSlug, propSlug]);

    const cityName = citySlug ? prettifyCity(citySlug) : null;

    useEffect(() => {
        const slug = propSlug || originalSlug;
        if (!slug) return;

        let isMounted = true;

        const loadService = async () => {
            setLoading(true);
            setError(null);

            try {
                const fullSlug = slug;
                let fetchedService = null;
                let raw = null;

                try {
                    const result = await fetchServiceByIdOrSlug(fullSlug, {
                        tenantId,
                        locale,
                    });
                    fetchedService = result.service;
                    raw = result.raw;
                } catch (firstError) {
                    if (fullSlug.includes("-")) {
                        const baseSlug = fullSlug.split("-")[0];
                        try {
                            const result = await fetchServiceByIdOrSlug(
                                baseSlug,
                                {
                                    tenantId,
                                    locale,
                                }
                            );
                            fetchedService = result.service;
                            raw = result.raw;
                        } catch (secondError) {
                            throw firstError;
                        }
                    } else {
                        throw firstError;
                    }
                }

                if (!isMounted) return;

                setService(fetchedService);
                setRawService(raw);
            } catch (err) {
                if (!isMounted) return;
                console.error("Service fetch failed:", err);
                setError(err?.message || "Service yüklenemedi");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadService();

        return () => {
            isMounted = false;
        };
    }, [propSlug, originalSlug, tenantId, locale]);

    const activeTranslation = useMemo(() => {
        const translations = rawService?.translations || [];
        if (!Array.isArray(translations) || translations.length === 0)
            return null;

        let found = translations.find((tr) => tr.language_code === locale);
        if (!found) {
            found = translations.find((tr) => tr.language_code === "de");
        }
        if (!found) {
            found = translations[0];
        }
        return found || null;
    }, [rawService, locale]);

    const baseTitle =
        activeTranslation?.title ||
        activeTranslation?.name ||
        service?.title ||
        service?.name ||
        (propSlug ? humanizeSlug(propSlug) : "Service");

    const title = useMemo(() => {
        if (!cityName) return baseTitle;

        const cityLocationText = t("services.location.in_city", {
            city: cityName,
            defaultValue: `in ${cityName}`,
        });

        if (!baseTitle.toLowerCase().includes(cityName.toLowerCase())) {
            return `${baseTitle} ${cityLocationText}`;
        }
        return baseTitle;
    }, [baseTitle, cityName, t, i18n.language]);

    let content =
        activeTranslation?.content ||
        activeTranslation?.description ||
        rawService?.content ||
        service?.description ||
        "";

    const heroImage =
        service?.image ||
        rawService?.image ||
        rawService?.image_url ||
        rawService?.thumbnail ||
        "https://images.unsplash.com/photo-1581578731117-e0a820bd4928?q=80&w=1920&auto=format&fit=crop";

    const placeholderImage =
        "https://images.unsplash.com/photo-1581578731117-e0a820bd4928?q=80&w=1920&auto=format&fit=crop";

    return (
        <AppLayout>
            <Head>
                <title>{title}</title>
                <meta
                    name="description"
                    content={content.replace(/<[^>]*>/g, "").substring(0, 160)}
                />
            </Head>

            {loading && (
                <section className="service-show__loading">
                    <div className="service-show__spinner"></div>
                    <p>{t("common.loading", "Yükleniyor...")}</p>
                </section>
            )}

            {error && !loading && (
                <section className="service-show__error">
                    <svg
                        className="service-show__error-icon"
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
                </section>
            )}

            {!loading && !error && (
                <>
                    <section className="service-show__hero">
                        <div className="service-show__hero-media">
                            <img
                                src={heroImage}
                                alt={title}
                                className="service-show__hero-img"
                                onError={(e) => {
                                    if (
                                        e.currentTarget.src !== placeholderImage
                                    ) {
                                        e.currentTarget.src = placeholderImage;
                                    }
                                }}
                            />
                            <div className="service-show__hero-overlay" />
                            <div className="service-show__hero-content">
                                <div className="service-show__hero-inner container">
                                    <h1 className="service-show__title">
                                        {title}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </section>

                    {content && (
                        <section className="service-show__content">
                            <div className="container">
                                <div className="service-show__content-inner">
                                    <div className="service-show__prose">
                                        <SafeHtml html={content} />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )}
        </AppLayout>
    );
}
