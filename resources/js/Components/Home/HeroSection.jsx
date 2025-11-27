import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePage } from "@inertiajs/react";
import SafeHtml from "../Common/SafeHtml";
import { useSliders } from "@/hooks/useSliders";
import { useLocale } from "@/hooks/useLocale";

const FALLBACK_POSTER_IMAGE = null;
const FALLBACK_VIDEO_URL = null;

const LIVE_BASE_URL = "https://omerdogan.de";

const getAbsoluteUrl = (url) => {
    if (!url) return url;

    // Eğer URL zaten tam (http/https ile) başlıyorsa dokunma
    if (url.startsWith("http")) return url;

    // Video ve görsel assetleri için her zaman canlı adresi kullan
    const baseUrl = LIVE_BASE_URL;

    // Yolu temizle: URL başındaki slash'ı kaldır
    const cleanedUrl = url.replace(/^\/+/, "");

    // Geriye kalan tek slash ile birleştir
    return `${baseUrl}/${cleanedUrl}`;
};

export default function HeroSection({ content = {} }) {
    const { t, i18n } = useTranslation();
    const { props } = usePage();
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.tenantId ||
        "";

    const locale = useLocale("de");
    const backendLocale = props?.locale || locale || "de";

    useEffect(() => {
        if (isMounted && backendLocale && i18n.language !== backendLocale) {
            i18n.changeLanguage(backendLocale);
        }
    }, [isMounted, backendLocale, i18n]);

    const { sliders, loading: slidersLoading } = useSliders({
        tenantId,
        locale,
    });
    const primarySlide = sliders && sliders.length ? sliders[0] : null;

    const heroTitleHtml =
        primarySlide?.title ||
        t("hero.title", "İhtiyaçlarınızı karşılayan güvenilir ortağınız");
    const heroSubtitleHtml =
        primarySlide?.description ||
        t(
            "hero.subtitle",
            "25 yılı aşkın deneyimimizle temizlik, bakım ve bakım-onarım için size özel, entegre çözümler sunuyoruz."
        );

    const primaryCtaLabel =
        primarySlide?.button_text ||
        t("hero.button_services", "Hizmetlerimizi keşfet");
    const primaryCtaHref = primarySlide?.button_link || "#services";
    const secondaryCtaLabel = t("hero.button_contact", "Şimdi iletişime geç");
    const secondaryCtaHref = "#contact";

    const poster = primarySlide?.poster_image || primarySlide?.image || null;

    const rawVideoUrl = primarySlide?.video_url || primarySlide?.raw?.video_url;
    const videoUrl = rawVideoUrl ? getAbsoluteUrl(rawVideoUrl) : null;

    const slideType = primarySlide?.raw?.type || primarySlide?.type;
    const isVideoType = slideType === "video";

    const hasSlideVideo = !!videoUrl && isVideoType;
    const hasSlideImage = !!primarySlide?.image && !hasSlideVideo;

    // 💡 BACKGROUND MEDIA RENDER FONKSİYONU
    const renderBackgroundMedia = () => {
        // API verisi yüklenene kadar Sunucunun gördüğüyle aynı kalması için:
        if (slidersLoading) return null;

        if (hasSlideImage) {
            return (
                <img
                    key="img"
                    src={primarySlide.image}
                    alt="Hero Background"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ pointerEvents: "none" }}
                />
            );
        }

        if (hasSlideVideo) {
            const handleVideoError = (e) => {
                console.error(
                    "❌ VİDEO YÜKLEME HATASI:",
                    e.target.error.code,
                    e.target.error.message
                );
            };

            return (
                <video
                    key="video"
                    autoPlay
                    loop
                    muted
                    poster={poster}
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ pointerEvents: "none" }}
                    onError={handleVideoError}
                >
                    <source src={videoUrl} type="video/mp4" />
                    Tarayıcınız video etiketini desteklemiyor.
                </video>
            );
        }

        return null;
    };

    return (
        <section
            id="top"
            className="relative min-h-[70svh] md:min-h-[600px] lg:min-h-[720px]
             flex items-center justify-center text-white px-4 py-16 sm:py-20 overflow-hidden"
        >
            {/* ⭐️ HYDRATION FIX: BACKGROUND MEDIA WRAPPER ⭐️
               Sunucuda (SSR) her zaman render edilen ilk DIV.
               Bu DIV, içeriğini (renderBackgroundMedia) sadece client tarafında (CSR) yüklenince gösterir.
            */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                {/* RenderBackgroundMedia, slidersLoading TRUE iken NULL döndüğü için,
                   SSR'da bu DIV boş kalır. CSR'da veri gelince <video> veya <img> ile dolar.
                   Bu, Section'ın ilk çocuğunun yapısını bozmaz.
                */}
                {renderBackgroundMedia()}
            </div>

            {/* Arka Plan Gradient Kaplaması (2. çocuk öğesi) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 md:from-black/50 md:via-black/40 md:to-black/50" />

            {/* İçerik (3. çocuk öğesi) */}
            <div className="relative z-10 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold">
                    <SafeHtml html={heroTitleHtml} />
                </h1>

                <div className="mt-4 text-base sm:text-lg md:text-2xl max-w-3xl mx-auto">
                    {/* ⚠️ NOTE: SafeHtml varsayılanı 'span' olarak ayarlandıysa (SafeHtml.jsx'te), burası güvenlidir. */}
                    <SafeHtml html={heroSubtitleHtml} />
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href={primaryCtaHref}
                        className="px-8 py-3 bg-button text-gray-900 rounded-full font-bold"
                    >
                        {primaryCtaLabel}
                    </a>
                    <a
                        href={secondaryCtaHref}
                        className="px-8 py-3 border-2 border-white rounded-full font-bold hover:bg-white hover:text-gray-900"
                    >
                        {secondaryCtaLabel}
                    </a>
                </div>
            </div>
        </section>
    );
}
