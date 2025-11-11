// resources/js/Components/Home/Services/ServicesGrid.jsx
import React from "react";
import ServiceCard from "./ServiceCard";
import "./ServicesGrid.css";
import { Head } from "@inertiajs/react";
import {
    FaHome,
    FaBroom,
    FaTemperatureHigh,
    FaPaintRoller,
    FaWindowMaximize,
    FaTools,
    FaBrush,
    FaCouch,
} from "react-icons/fa";
import LiquidEther from "@/Components/ReactBits/Backgrounds/LiquidEther";
import { usePage } from "@inertiajs/react";
import { useServices } from "@/hooks/useServices";
import { useLocale } from "@/hooks/useLocale";

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

/* -------------------------------------------------------------------------- */
/* 👁️ IntersectionObserver Hook (SSR-safe)                                   */
/* -------------------------------------------------------------------------- */
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
        return () => {
            if (current) observer.unobserve(current);
        };
    }, [ref]);
};

/* -------------------------------------------------------------------------- */
/* 🔧 Varsayılan Servisler                                                    */
/* -------------------------------------------------------------------------- */
const defaultServices = [
    {
        id: 1,
        title: "Wohnungsrenovierung",
        description: "Professionelle Renovierungsarbeiten …",
        image: "/images/Wohnungsrenovierung.jpg",
        slug: "wohnungsrenovierung",
        icon: FaHome,
    },
    {
        id: 2,
        title: "Wohnungsreinigung",
        description: "Gründliche und zuverlässige Reinigungsservices …",
        image: "/images/Wohnungsrenovierung.jpg",
        slug: "wohnungsreinigung",
        icon: FaBroom,
    },
    {
        id: 3,
        title: "Wärmedämmung",
        description: "Energieeffiziente Dämmungslösungen …",
        image: "/images/Wohnungsrenovierung.jpg",
        slug: "warmedammung",
        icon: FaTemperatureHigh,
    },
    {
        id: 4,
        title: "Verputz – Verputzarbeiten",
        description: "Hochwertige Verputzarbeiten …",
        image: "/images/Wohnungsrenovierung.jpg",
        slug: "verputzarbeiten",
        icon: FaPaintRoller,
    },
    {
        id: 5,
        title: "Türen und Fensterbau",
        description: "Maßgefertigte Türen und Fenster …",
        image: "/images/Wohnungsrenovierung.jpg",
        slug: "tueren-und-fensterbau",
        icon: FaWindowMaximize,
    },
    {
        id: 6,
        title: "Trockenbau",
        description: "Innovative Trockenbaulösungen …",
        image: "/images/Wohnungsrenovierung.jpg",
        slug: "trockenbau",
        icon: FaTools,
    },
    {
        id: 7,
        title: "Teppichreinigung",
        description: "Professionelle Teppichreinigung …",
        image: "/images/Wohnungsrenovierung.jpg",
        slug: "teppichreinigung",
        icon: FaBrush,
    },
    {
        id: 8,
        title: "Teppich Verlegen",
        description: "Fachgerechtes Verlegen von Teppichen …",
        image: "/images/Wohnungsrenovierung.jpg",
        slug: "teppich-verlegen",
        icon: FaCouch,
    },
    {
        id: 9,
        title: "Tapezieren – Tapezierarbeiten",
        description: "Kreative Wandgestaltung …",
        image: "/images/Wohnungsrenovierung.jpg",
        slug: "tapezieren",
        icon: FaPaintRoller,
    },
];

const BASE_PATH = "/services"; // istersen "/dienstleistungen" yap

/* -------------------------------------------------------------------------- */
/* 🧩 Ana Bileşen                                                             */
/* -------------------------------------------------------------------------- */
const ServicesGrid = ({ services = defaultServices }) => {
    const gridRef = React.useRef(null);
    useIntersectionObserver(gridRef);

    // Uzak servisleri getir (tenant + locale)
    const { props } = usePage();
    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";
    const locale = useLocale("de");
    const { services: remoteServices, loading } = useServices({
        perPage: 100,
        tenantId,
        locale,
    });

    const mappedRemote = React.useMemo(
        () =>
            (remoteServices || []).map((s) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                image: s.image,
                slug: s.slug,
                link: s.url,
            })),
        [remoteServices]
    );

    const servicesToRender =
        mappedRemote?.length ? mappedRemote : services?.length ? services : defaultServices;

    const isDark = useIsDark();
    const lightColors = ["#085883", "#0C9FE2", "#2EA7E0"];
    const darkColors = ["#47B3FF", "#7CCBFF", "#B5E3FF"];

    const schemaData = React.useMemo(
        () => ({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: servicesToRender.map((s, i) => ({
                "@type": "Service",
                position: i + 1,
                name: s.title,
                description: s.description,
                url: `https://oi-clean.de${s.link || `${BASE_PATH}/${s.slug}`}`,
                provider: {
                    "@type": "Organization",
                    name: "O&I CLEAN group GmbH",
                    image: "https://oi-clean.de/images/logo.svg",
                    address: {
                        "@type": "PostalAddress",
                        streetAddress: "Spaldingstr. 77–79",
                        addressLocality: "Hamburg",
                        postalCode: "20097",
                        addressCountry: "DE",
                    },
                },
            })),
        }),
        [servicesToRender]
    );

    return (
        <section
            className="services-section relative overflow-hidden"
            aria-labelledby="services-title"
        >
            <Head>
                <title>Unsere Leistungen - O&I CLEAN group GmbH</title>
                <meta
                    name="description"
                    content="Professionelle Reinigung, Renovierung und Gebäudemanagement in Hamburg. ★ Expertise ★ Deutsche Qualität ★ Zuverlässiger Service"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schemaData),
                    }}
                />
            </Head>

            {/* 🫧 Background animasyonu (SSR korumalı) */}
            {typeof window !== "undefined" && (
                <div className="absolute inset-0 z-10 liquid-ether-bg">
                    <LiquidEther
                        className="w-full h-full"
                        style={{ pointerEvents: "auto" }}
                        colors={isDark ? darkColors : lightColors}
                        mouseForce={35}
                        cursorSize={140}
                        isViscous={false}
                        viscous={25}
                        iterationsViscous={32}
                        iterationsPoisson={32}
                        resolution={0.6}
                        isBounce={false}
                        autoDemo
                        autoSpeed={0.4}
                        autoIntensity={1.6}
                        takeoverDuration={0.45}
                        autoResumeDelay={4000}
                        autoRampDuration={0.8}
                    />
                </div>
            )}

            <div className="services-container relative z-10">
                <div className="services-header">
                    <h2 id="services-title" className="services-title">
                        Leistungen
                    </h2>
                    <p className="services-subtitle">
                        Entdecken Sie unsere umfassenden Dienstleistungen für
                        Ihr Zuhause
                    </p>
                </div>

                <div ref={gridRef} className="services-grid">
                    {loading && <div className="services-loading">Lade Services…</div>}
                    {!loading && servicesToRender.map((s) => (
                        <ServiceCard
                            key={s.slug || s.link || s.title}
                            title={s.title}
                            description={s.description}
                            image={s.image}
                            slug={s.slug}
                            link={s.link}
                            basePath={BASE_PATH}
                        />
                    ))}
                </div>

                <div className="services-cta">
                    <a
                        href="/kontakt"
                        className="services-contact-button"
                        aria-label="Jetzt Kontakt aufnehmen"
                    >
                        Kontaktiere Uns
                        <svg
                            className="services-arrow-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
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
