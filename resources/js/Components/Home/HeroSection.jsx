// resources/js/Components/Home/HeroSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePage } from "@inertiajs/react";

import SafeHtml from "../Common/SafeHtml";
import { useSliders } from "@/hooks/useSliders";
import { useLocale } from "@/hooks/useLocale";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.15 },
    },
};

const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function HeroSection({ content = {} }) {
    const { t } = useTranslation();
    const { props } = usePage();

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";

    const locale = useLocale("de");

    // Slider’ları çek (varsa)
    const { sliders } = useSliders({ tenantId, locale });

    const primarySlide = sliders && sliders.length ? sliders[0] : null;

    // ---------------- TEXTLER ----------------

    // Başlık: 1) slider.title 2) content.hero_title 3) i18n fallback
    const heroTitleHtml =
        primarySlide?.title ||
        content.hero_title ||
        content.hero?.title ||
        t(
            "hero.title",
            "Ihr zuverlässiger Partner im Gastgewerbe und Gebäudemanagement."
        );

    // Alt başlık: 1) slider.subtitle/description 2) content 3) i18n
    const heroSubtitleHtml =
        primarySlide?.subtitle ||
        primarySlide?.description ||
        content.hero_subtitle ||
        content.hero?.subtitle ||
        t(
            "hero.subtitle",
            "Mit über 25 Jahren Erfahrung bieten wir maßgeschneiderte, integrierte Lösungen für Reinigung, Pflege und Instandhaltung."
        );

    // Primary CTA label & href
    const primaryCtaLabel =
        primarySlide?.buttonLabel ||
        content.hero_primary_cta ||
        t("hero.button_services", "Unsere Leistungen entdecken");

    const primaryCtaHref =
        primarySlide?.buttonUrl || content.hero_primary_cta_href || "#services";

    // Secondary CTA
    const secondaryCtaLabel =
        content.hero_secondary_cta ||
        t("hero.button_contact", "Kontakt aufnehmen");
    const secondaryCtaHref = content.hero_secondary_cta_href || "#contact";

    // ---------------- RENDER ----------------

    const hasSlideImage = !!primarySlide?.image;

    return (
        <section
            id="top"
            className="relative min-h-[70svh] md:min-h-[600px] lg:min-h-[720px] overflow-hidden flex items-center justify-center text-white px-4 py-16 sm:py-20"
            aria-labelledby="hero-heading"
        >
            {/* Arka plan: önce slider image, yoksa video */}
            {hasSlideImage ? (
                <motion.img
                    src={primarySlide.image}
                    alt={typeof heroTitleHtml === "string" ? heroTitleHtml : ""}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                />
            ) : (
                <motion.video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                >
                    <source src="/videos/headerVideo.mp4" type="video/mp4" />
                    Ihr Browser unterstützt das Video-Tag nicht.
                </motion.video>
            )}

            {/* Gradient overlay */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 md:from-black/50 md:via-black/40 md:to-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />

            {/* İçerik */}
            <motion.div
                className="relative z-10 text-center"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <motion.h1
                    id="hero-heading"
                    className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight"
                    variants={item}
                >
                    <SafeHtml html={heroTitleHtml} />
                </motion.h1>

                <motion.p
                    className="mt-3 sm:mt-4 text-base sm:text-lg md:text-2xl font-light max-w-[28rem] sm:max-w-2xl md:max-w-3xl mx-auto"
                    variants={item}
                >
                    <SafeHtml html={heroSubtitleHtml} />
                </motion.p>

                <motion.div
                    className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4"
                    variants={item}
                >
                    <a
                        href={primaryCtaHref}
                        className="w-full sm:w-auto bg-button text-gray-900 font-bold py-3 px-6 sm:px-8 rounded-full hover:bg-button transition duration-300"
                    >
                        {primaryCtaLabel}
                    </a>
                    <a
                        href={secondaryCtaHref}
                        className="w-full sm:w-auto bg-transparent border-2 border-white text-white font-bold py-3 px-6 sm:px-8 rounded-full hover:bg-white hover:text-gray-900 transition duration-300"
                    >
                        {secondaryCtaLabel}
                    </a>
                </motion.div>
            </motion.div>
        </section>
    );
}
