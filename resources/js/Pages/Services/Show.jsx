import React, { useEffect, useState, useMemo } from "react";
import { Head, usePage, router } from "@inertiajs/react";
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

    return isServicePrefix ? null : last;
}

function prettifyCity(citySlug = "") {
    return citySlug
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");
}

export default function ServiceShow() {
    const { props } = usePage();
    const { t } = useTranslation();
    const locale = useLocale("de");

    const {
        slug: propSlug,
        originalSlug,
        citySlug: propCitySlug,
        global,
    } = props;

    const tenantId = global?.tenantId || "";

    const [service, setService] = useState(null);
    const [rawService, setRawService] = useState(null);
    const [loading, setLoading] = useState(true);

    const citySlug = useMemo(() => {
        if (propCitySlug) return String(propCitySlug).toLowerCase();
        if (originalSlug?.includes("-"))
            return extractCityFromSlug(originalSlug);
        if (propSlug?.includes("-")) return extractCityFromSlug(propSlug);
        return null;
    }, [propCitySlug, originalSlug, propSlug]);

    const cityName = citySlug ? prettifyCity(citySlug) : null;

    useEffect(() => {
        const slug = propSlug || originalSlug;
        if (!slug) return;

        setLoading(true);

        fetchServiceByIdOrSlug(slug, { tenantId, locale })
            .then((res) => {
                if (!res?.service) {
                    router.visit("/404");
                    return;
                }
                setService(res.service);
                setRawService(res.raw);
            })
            .catch(() => router.visit("/404"))
            .finally(() => setLoading(false));
    }, [propSlug, originalSlug, tenantId, locale]);

    const activeTranslation =
        rawService?.translations?.find((tr) => tr.language_code === locale) ||
        rawService?.translations?.find((tr) => tr.language_code === "de") ||
        rawService?.translations?.[0] ||
        null;

    const baseTitle =
        activeTranslation?.title ||
        activeTranslation?.name ||
        service?.title ||
        service?.name ||
        humanizeSlug(propSlug);

    const title = cityName ? `${baseTitle}` : baseTitle;

    const content =
        activeTranslation?.content ||
        activeTranslation?.description ||
        service?.description ||
        "";

    const heroImage =
        service?.image ||
        rawService?.image ||
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
                    <p>{t("servicesList.loading", "Yükleniyor...")}</p>
                </section>
            )}

            {!loading && service && (
                <>
                    {/* 🚀 HERO SECTION */}
                    <section className="service-show__hero">
                        <div className="service-show__hero-media">
                            <img
                                src={heroImage}
                                alt={title}
                                className="service-show__hero-img"
                                onError={(e) =>
                                    (e.currentTarget.src = placeholderImage)
                                }
                            />
                            <div className="service-show__hero-overlay"></div>
                        </div>

                        <div className="service-show__hero-content">
                            <div className="service-show__hero-inner">
                                <h1 className="service-show__title">{title}</h1>
                            </div>
                        </div>
                    </section>

                    {/* 📌 CONTENT GRID */}
                    {content && (
                        <section className="service-show__content">
                            <div className="service-show__content-inner">
                                <div className="service-show__content-grid">
                                    <article className="service-show__prose">
                                        <SafeHtml html={content} />
                                    </article>

                                    <aside className="service-show__side-media">
                                        <div className="service-show__side-card">
                                            <img
                                                src={heroImage}
                                                alt={title}
                                                className="service-show__side-img"
                                            />
                                        </div>
                                    </aside>
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )}
        </AppLayout>
    );
}
