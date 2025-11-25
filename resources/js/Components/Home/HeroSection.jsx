import React, { useState, useEffect, useMemo } from "react";
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
    const { t, i18n } = useTranslation();
    const { props } = usePage();

    // HYDRATION FIX: Server ve client'ta aynı değerleri kullanmak için mount kontrolü
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";

    const locale = useLocale("de");

    // HYDRATION FIX: Backend'den gelen locale'i kullan
    const backendLocale = props?.locale || locale || "de";

    // Server-side'da i18n'i backend locale ile senkronize et
    // Bu, istemci tarafında i18n'in client diline otomatik geçişini engeller.
    useEffect(() => {
        if (isMounted && backendLocale && i18n.language !== backendLocale) {
            // NOT: Hidrasyon hatalarını azaltmak için app.jsx'teki senkron atamaya güveniyoruz.
            i18n.changeLanguage(backendLocale);
        }
    }, [isMounted, backendLocale, i18n]);

    const { sliders } = useSliders({ tenantId, locale });
    // Video kaynağı buradan çekiliyor
    const primarySlide = sliders && sliders.length ? sliders[0] : null;

    const [useFallbackVideo, setUseFallbackVideo] = useState(false);

    // HYDRATION FIX: useMemo'dan i18n.language bağımlılığını kaldırmak,
    // render sırasında anlık değişimden kaçınır. (Çeviri zaten i18n.language değiştiğinde güncellenir)
    const heroTitleHtml = useMemo(() => {
        return t("hero.title", "");
    }, [t]);

    const heroSubtitleHtml = useMemo(() => {
        return t("hero.subtitle", "");
    }, [t]);

    const primaryCtaLabel = useMemo(() => {
        return t("hero.button_services", "");
    }, [t]);

    const secondaryCtaLabel = useMemo(() => {
        return t("hero.button_contact", "");
    }, [t]);

    const primaryCtaHref =
        primarySlide?.button_link ||
        primarySlide?.buttonUrl ||
        content.hero_primary_cta_href ||
        "#services";

    // Use fragment anchor without leading slash to match server-rendered HTML
    const secondaryCtaHref = content.hero_secondary_cta_href || "#contact";

    // Kontrol: API'den video URL'si gelmiş mi?
    const hasSlideImage = !!primarySlide?.image && !useFallbackVideo;
    const hasSlideVideo = !!primarySlide?.video_url && !useFallbackVideo;

    return (
        <section
            id="top"
            className="relative min-h-[70svh] md:min-h-[600px] lg:min-h-[720px] overflow-hidden flex items-center justify-center text-white px-4 py-16 sm:py-20"
            aria-labelledby="hero-heading"
        >
            {hasSlideImage ? (
                <motion.img
                    src={primarySlide.image}
                    alt={typeof heroTitleHtml === "string" ? heroTitleHtml : ""}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ pointerEvents: "none" }}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    onError={() => setUseFallbackVideo(true)}
                />
            ) : hasSlideVideo ? (
                // 🚨 API'DEN GELEN VIDEO URL'SI KULLANIMI (primarySlide.video_url)
                <motion.iframe
                    src={primarySlide.video_url}
                    title="Hero Video"
                    className="absolute inset-0 w-full h-full object-cover"
                    allow="autoplay; fullscreen; picture-in-picture"
                    loading="lazy"
                    style={{ pointerEvents: "none", border: "none" }}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    onError={() => setUseFallbackVideo(true)}
                />
            ) : (
                // YEDEK STATİK VIDEO KULLANIMI
                <motion.video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ pointerEvents: "none" }}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                >
                    {/* Statik yedek kaynak */}
                    <source src="/videos/headerVideo.mp4" type="video/mp4" />
                    Ihr Browser unterstützt das Video-Tag nicht.
                </motion.video>
            )}

            <motion.div
                className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 md:from-black/50 md:via-black/40 md:to-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />

            <motion.div
                className="relative z-10 text-center"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <motion.h1
                    id="hero-heading"
                    className="text-3xl text-white sm:text-4xl md:text-6xl font-extrabold leading-tight"
                    variants={item}
                >
                    {/* SafeHtml bileşeni zaten korumalı. */}
                    <SafeHtml html={heroTitleHtml} />
                </motion.h1>

                <motion.div
                    className="mt-3 sm:mt-4 text-base sm:text-lg md:text-2xl font-light max-w-[28rem] sm:max-w-2xl md:max-w-3xl mx-auto"
                    variants={item}
                >
                    <SafeHtml html={heroSubtitleHtml} />
                </motion.div>

                <motion.div
                    className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4"
                    variants={item}
                >
                    {/* HYDRATION FIX: Metin uyuşmazlığını engellemek için eklendi */}
                    <a
                        href={primaryCtaHref}
                        className="w-full sm:w-auto bg-button text-gray-900 font-bold py-3 px-6 sm:px-8 rounded-full hover:bg-button transition duration-300"
                        suppressHydrationWarning={true}
                    >
                        {primaryCtaLabel}
                    </a>
                    {/* HYDRATION FIX: Metin uyuşmazlığını engellemek için eklendi */}
                    <a
                        href={secondaryCtaHref}
                        className="w-full sm:w-auto bg-transparent border-2 border-white text-white font-bold py-3 px-6 sm:px-8 rounded-full hover:bg-white hover:text-gray-900 transition duration-300"
                        suppressHydrationWarning={true}
                    >
                        {secondaryCtaLabel}
                    </a>
                </motion.div>
            </motion.div>
        </section>
    );
}
