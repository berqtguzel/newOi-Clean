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

// 🔹 Tüm dillerdeki description'ları birleştiren helper (Aynen korundu)
const getAllDescriptions = (service) => {
    if (!service) return "";

    const descriptions = [];

    // 1) Ana description (current language)
    if (service.description) {
        const base = String(service.description).trim();
        if (base) descriptions.push(base);
    }

    // 2) translations dizisindeki description'lar (de, en, tr ...)
    if (Array.isArray(service.translations)) {
        service.translations.forEach((tr) => {
            if (tr?.description) {
                const desc = String(tr.description).trim();
                if (desc && !descriptions.includes(desc)) {
                    descriptions.push(desc);
                }
            }
        });
    }

    return descriptions.join(" ");
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

    const safeRemoteServices = Array.isArray(remoteServices)
        ? remoteServices
        : [];

    // ------------------------------------------------------------
    // 🔥 SEO ve GEBÄUDEREINIGUNG KATEGORİLERİNİ GİZLE
    // ------------------------------------------------------------
    const filteredServices = safeRemoteServices.filter((s) => {
        const catName = String(s.categoryName || "").toLowerCase();
        const catId = s.categoryId;

        // SEO kategorisini filtrele
        if (catName === "seo") return false;

        // Gebäudereinigung kategorisini filtrele (category_id=2 veya name="Gebäudereinigung")
        if (
            catId === 2 ||
            catName === "gebäudereinigung" ||
            catName === "gebaudereinigung"
        ) {
            return false;
        }

        return true;
    });

    const topLevelServices = filteredServices.filter((s) => s.parentId == null);

    const servicesToRender = topLevelServices.length
        ? topLevelServices
        : services;

    const isDark = useIsDark();
    const lightColors = ["#085883", "#0C9FE2", "#2EA7E0"];
    const darkColors = ["#47B3FF", "#7CCBFF", "#B5E3FF"];

    // JSON-LD
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: servicesToRender.map((s, i) => {
            const title = s.title || s.name || "";
            return {
                "@type": "Service",
                position: i + 1,
                name: title,
                description: getAllDescriptions(s),
                url: s.slug ? `${BASE_DOMAIN}/${s.slug}` : BASE_DOMAIN,
            };
        }),
    };

    // ❗ Burada fallback parametresini kaldırdık.
    const headingHtml =
        content.services_title || t("servicesList.title") || "Leistungen";

    const subtitleHtml =
        content.services_subtitle ||
        t("servicesList.subtitle") ||
        "Unsere Services";

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

            {/* Arka Plan Bitleri (Mounted olduktan sonra render edilir) */}
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
                        {/* SafeHtml zaten korumalı */}
                        <SafeHtml html={headingHtml} />
                    </h2>
                    <div className="services-subtitle">
                        <SafeHtml html={subtitleHtml} />
                    </div>
                </div>

                <div ref={gridRef} className="services-grid">
                    {loading && (
                        <div className="services-loading">
                            {/* 🔥 BOŞLUK DÜZELTME: Fazladan boşluk karakteri silindi */}
                            {mounted ? t("servicesList.loading") : ""}
                        </div>
                    )}

                    {!loading &&
                        servicesToRender.map((s) => (
                            <ServiceCard
                                key={s.id}
                                title={s.title || s.name}
                                description={getAllDescriptions(s)}
                                image={s.image}
                                slug={s.slug}
                                translations={s.translations}
                            />
                        ))}
                </div>

                <div className="services-cta">
                    <a
                        href="/kontakt"
                        className="services-contact-button"
                        // Buton metin uyuşmazlığını gidermek için
                        suppressHydrationWarning={true}
                    >
                        {t("servicesList.contact_cta") || "Kontaktiere Uns"}
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
