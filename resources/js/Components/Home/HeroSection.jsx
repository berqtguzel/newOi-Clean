import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePage } from "@inertiajs/react";
import SafeHtml from "../Common/SafeHtml";
import { useSliders } from "@/hooks/useSliders";
import { useLocale } from "@/hooks/useLocale";
import "../../../css/HeroSection.css";

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

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const normalizeUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url}`;
};

export default function HeroSection({ content = {} }) {
    const { t, i18n } = useTranslation();
    const { props } = usePage();

    const tenantId = props?.global?.tenantId || props?.global?.tenant_id || "";
    const locale = useLocale("de");
    const backendLocale = props?.locale || locale || "de";

    const [useFallbackVideo, setUseFallbackVideo] = useState(false);

    useEffect(() => {
        if (backendLocale && i18n.language !== backendLocale) {
            i18n.changeLanguage(backendLocale);
        }
    }, [backendLocale, i18n]);

    const { sliders } = useSliders({ tenantId, locale });

    const primary = sliders?.[0] || {};
    const slide = primary?.raw || primary;

    const video_url = normalizeUrl(slide?.video_url);
    const image_url = normalizeUrl(slide?.image);

    const heroTitleHtml = slide.title || t("hero.title", "");
    const heroSubtitleHtml = slide.description || t("hero.subtitle", "");
    const primaryCtaLabel = slide.button_text || t("hero.button_services", "");
    const primaryCtaHref = slide.button_link || "#services";
    const secondaryCtaLabel = t("hero.button_contact", "");
    const secondaryCtaHref = content.hero_secondary_cta_href || "#contact";

    const isEmbedVideo =
        video_url && /youtube\.com|youtu\.be|vimeo\.com/.test(video_url);

    return (
        <section
            id="top"
            className="hero-section"
            aria-labelledby="hero-heading"
        >
            {image_url && !useFallbackVideo && (
                <motion.img
                    src={image_url}
                    alt={heroTitleHtml}
                    className="hero-bg"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    onError={() => setUseFallbackVideo(true)}
                />
            )}

            {!image_url &&
                video_url &&
                !useFallbackVideo &&
                (isEmbedVideo ? (
                    <motion.iframe
                        src={video_url}
                        title="Hero Video"
                        className="hero-bg"
                        allow="autoplay; fullscreen; picture-in-picture"
                        loading="lazy"
                        style={{ border: "none" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />
                ) : (
                    <motion.video
                        src={video_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        className="hero-bg"
                        onError={() => setUseFallbackVideo(true)}
                    />
                ))}

            <motion.div className="hero-overlay" />

            <motion.div
                className="hero-content"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <motion.h1
                    id="hero-heading"
                    className="hero-title"
                    variants={item}
                >
                    <SafeHtml html={heroTitleHtml} />
                </motion.h1>

                <motion.div className="hero-subtitle" variants={item}>
                    <SafeHtml html={heroSubtitleHtml} />
                </motion.div>

                <motion.div className="hero-cta-group" variants={item}>
                    <a
                        href={primaryCtaHref}
                        className="hero-cta hero-cta--primary"
                    >
                        {primaryCtaLabel}
                    </a>
                    <a
                        href={secondaryCtaHref}
                        className="hero-cta hero-cta--secondary"
                    >
                        {secondaryCtaLabel}
                    </a>
                </motion.div>
            </motion.div>
        </section>
    );
}
