import React from "react";
import { Head } from "@inertiajs/react";
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

        const obs = new MutationObserver(() => setIsDark(get()));
        obs.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

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

        if (ref.current) observer.observe(ref.current);

        return () => ref.current && observer.unobserve(ref.current);
    }, [ref]);
};

const getAllDescriptions = (service) => {
    if (!service) return "";
    const desc = [];

    if (service.description) {
        desc.push(String(service.description).trim());
    }

    if (Array.isArray(service.translations)) {
        service.translations.forEach((tr) => {
            if (tr?.description) {
                const d = String(tr.description).trim();
                if (!desc.includes(d)) desc.push(d);
            }
        });
    }

    return desc.join(" ");
};

const ServicesGrid = ({ content = {} }) => {
    const { t } = useTranslation();
    const locale = useLocale("de");
    const [mounted, setMounted] = React.useState(false);
    const gridRef = React.useRef(null);

    useIntersectionObserver(gridRef);

    React.useEffect(() => setMounted(true), []);

    // 🔥 TÜM SAYFALARDAN TÜM SERVİSLERİ ÇEK
    const { services: remoteServices, loading } = useServices({
        perPage: 200,
        locale,
        fetchAll: true,
    });

    const safeRemote = Array.isArray(remoteServices) ? remoteServices : [];

    const parentServices = safeRemote
        .filter((s) => {
            const parentId =
                s.parentId ?? s.parent_id ?? s.raw?.parent_id ?? null;
            const hasLocation =
                !!s.city ||
                !!s.country ||
                !!s.district ||
                !!s.hasMaps ||
                (Array.isArray(s.maps) && s.maps.length > 0);

            return (
                (parentId === null ||
                    parentId === undefined ||
                    parentId === 0 ||
                    parentId === "0") &&
                !hasLocation
            );
        })
        .sort((a, b) => {
            const getOrder = (x) =>
                x.order ??
                x.sort_order ??
                x.raw?.order ??
                x.raw?.sort_order ??
                null;

            const orderA = getOrder(a);
            const orderB = getOrder(b);

            if (orderA != null && orderB == null) return -1;
            if (orderA == null && orderB != null) return 1;
            if (orderA != null && orderB != null && orderA !== orderB)
                return orderA - orderB;

            return (a.title || a.name || "").localeCompare(
                b.title || b.name || "",
                locale || "de"
            );
        });

    const isDark = useIsDark();
    const colors = isDark
        ? ["#47B3FF", "#7CCBFF", "#B5E3FF"]
        : ["#085883", "#0C9FE2", "#2EA7E0"];

    const headingHtml =
        content.services_title ||
        t("servicesList.title") ||
        "Unsere Leistungen";

    const subtitleHtml =
        content.services_subtitle ||
        t("servicesList.subtitle") ||
        "Unsere Services";

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: parentServices.map((s, i) => ({
            "@type": "Service",
            position: i + 1,
            name: s.title || s.name,
            description: getAllDescriptions(s),
            url: s.slug ? `${BASE_DOMAIN}/${s.slug}` : BASE_DOMAIN,
        })),
    };

    return (
        <section
            id="services"
            className="services-section relative overflow-hidden"
            aria-labelledby="services-title"
        >
            <Head>
                <title>{t("servicesList.meta_title")}</title>
                <meta
                    name="description"
                    content={t("servicesList.meta_description")}
                />
                <script id="schema-services" type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Head>

            {mounted && (
                <div className="absolute inset-0 z-10 liquid-ether-bg">
                    <div className="liquid-ether-inner" aria-hidden>
                        <LiquidEther
                            className="w-full h-full"
                            colors={colors}
                            autoDemo
                        />
                    </div>
                </div>
            )}

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
                            {t("servicesList.loading")}
                        </div>
                    )}

                    {!loading &&
                        parentServices.map((s) => (
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
                    <a href="/kontakt" className="services-contact-button">
                        {t("servicesList.contact_cta")}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ServicesGrid;
