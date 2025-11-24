// resources/js/Components/Home/Services/ServicesGrid.jsx

import React from "react";
import { Head, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import ServiceCard from "./ServiceCard";
import "./ServicesGrid.css";

import LiquidEther from "@/Components/ReactBits/Backgrounds/LiquidEther";
import { useServices } from "@/hooks/useServices";
import { useLocale } from "@/hooks/useLocale";
import SafeHtml from "@/Components/Common/SafeHtml";

const BASE_DOMAIN = "https://oi-clean.de";

function useIsDark() {
    const [isDark, setIsDark] = React.useState(false);

    React.useEffect(() => {
        if (typeof document === "undefined") return;

        const get = () => document.documentElement.classList.contains("dark");
        setIsDark(get());

        const el = document.documentElement;
        const obs = new MutationObserver(() => setIsDark(get()));
        obs.observe(el, { attributes: true, attributeFilter: ["class"] });

        return () => obs.disconnect();
    }, []);

    return isDark;
}

const useIntersectionObserver = (ref) => {
    React.useEffect(() => {
        if (
            typeof window === "undefined" ||
            !("IntersectionObserver" in window)
        )
            return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        const current = ref.current;
        if (current) observer.observe(current);

        return () => current && observer.unobserve(current);
    }, [ref]);
};

const ServicesGrid = ({ services = [], content = {} }) => {
    const { t } = useTranslation();
    const [mounted, setMounted] = React.useState(false);
    const gridRef = React.useRef(null);
    useIntersectionObserver(gridRef);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const { props } = usePage();
    const liquidInnerRef = React.useRef(null);
    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";

    const locale = useLocale("de");

    // ✔ API’den servisleri çek
    const { services: remoteServices, loading } = useServices({
        perPage: 200,
        tenantId,
        locale,
    });

    // ✔ güvenli listeyi al
    const safeRemoteServices = Array.isArray(remoteServices)
        ? remoteServices
        : [];

    // ------------------------------------------------------------
    // 🔥 SEO KATEGORİLERİNİ GİZLE (categoryName = "seo")
    // ------------------------------------------------------------
    const filteredServices = safeRemoteServices.filter(
        (s) =>
            String(s.categoryName).toLowerCase() !== "seo" &&
            s.categoryName !== "seo"
    );

    // ✔ sadece üst servisler (parentId == null)
    const topLevelServices = filteredServices.filter((s) => s.parentId == null);

    // ✔ fallback: eğer API gelmezse props.services kullan
    const servicesToRender = topLevelServices.length
        ? topLevelServices
        : services;

    // ------------------------------------------------------------
    // END FILTERS
    // ------------------------------------------------------------

    const isDark = useIsDark();
    const lightColors = ["#085883", "#0C9FE2", "#2EA7E0"];
    const darkColors = ["#47B3FF", "#7CCBFF", "#B5E3FF"];

    // JSON-LD
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: servicesToRender.map((s, i) => ({
            "@type": "Service",
            position: i + 1,
            name: s.title,
            description: s.description,
            url: s.slug ? `${BASE_DOMAIN}/${s.slug}` : BASE_DOMAIN,
        })),
    };

    const headingHtml =
        content.services_title || t("servicesList.title", "Leistungen");

    const subtitleHtml =
        content.services_subtitle ||
        t("servicesList.subtitle", "Unsere Services");

    return (
        <section
            className="services-section relative overflow-hidden"
            aria-labelledby="services-title"
        >
            <Head>
                <title>
                    {t(
                        "servicesList.meta_title",
                        "Unsere Leistungen - O&I CLEAN group GmbH"
                    )}
                </title>
                <meta
                    name="description"
                    content={t(
                        "servicesList.meta_description",
                        "Professionelle Reinigung und Gebäudemanagement"
                    )}
                />
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Head>

            <div className="absolute inset-0 z-10 liquid-ether-bg">
                <div
                    className="liquid-ether-inner"
                    aria-hidden
                    ref={liquidInnerRef}
                >
                    {mounted && (
                        <LiquidEther
                            containerRef={liquidInnerRef}
                            className="w-full h-full"
                            colors={isDark ? darkColors : lightColors}
                            mouseForce={35}
                            cursorSize={140}
                            isViscous={false}
                            viscous={25}
                            iterationsViscous={32}
                            iterationsPoisson={32}
                            resolution={0.6}
                            autoDemo
                            autoSpeed={0.4}
                            autoIntensity={1.6}
                        />
                    )}
                </div>
            </div>

            <div className="services-container relative z-10">
                <div className="services-header">
                    <h2 id="services-title" className="services-title">
                        <SafeHtml html={headingHtml} />
                    </h2>
                    <div className="services-subtitle">
                        <SafeHtml html={subtitleHtml} />
                    </div>
                </div>

                <div ref={gridRef} className="services-grid">
                    {loading && (
                        <div className="services-loading">
                            {t("servicesList.loading", "Loading…")}
                        </div>
                    )}

                    {!loading &&
                        servicesToRender.map((s) => (
                            <ServiceCard
                                key={s.id}
                                title={s.title}
                                description={s.description}
                                image={s.image}
                                slug={s.slug}
                                translations={s.translations}
                            />
                        ))}
                </div>

                <div className="services-cta">
                    <a href="/kontakt" className="services-contact-button">
                        {t("servicesList.contact_cta", "Kontakt")}
                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M5 12H19M19 12L12 5M19 12L12 19"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ServicesGrid;
