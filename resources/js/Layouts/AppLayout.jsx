import React, { useEffect } from "react";
import { usePage, Head } from "@inertiajs/react"; // Head bileşeni eklendi
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import OfferDock from "../Components/OfferDock";
import QuoteModal from "../Components/Modals/QuoteModal";
import { useSettings } from "../hooks/useSettings";
import SettingsInjector from "../Components/SettingsInjector";
import { useLocale } from "../hooks/useLocale";

export default function AppLayout({ content, children, currentRoute }) {
    const { props } = usePage();
    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";

    const locale = useLocale("de");

    // Ayarları API'den çekiyoruz
    const { data: settings } = useSettings({ tenantId, locale });

    // --- SEO VE META VERİLERİ ---
    const general = settings?.general || {};
    const branding = settings?.branding || {};

    const siteTitle = general?.site_name || branding?.site_name || "O&I CLEAN";
    const siteDescription =
        general?.site_description || "Professionelle Reinigungsdienste";
    const siteKeywords =
        general?.site_keywords ||
        "reinigung, putzfrau, hamburg, gebäudereinigung";

    // --- FAVICON GÜNCELLEME ---
    useEffect(() => {
        if (!settings) return;

        const getUrl = (src) =>
            src?.url || (typeof src === "string" ? src : null);

        const faviconUrl =
            getUrl(settings?.branding?.favicon) || // En yüksek öncelik
            getUrl(settings?.favicon) ||
            getUrl(settings?.general?.favicon) ||
            "/favicon.ico";

        // Mevcut ikonu bul veya oluştur
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        link.href = faviconUrl;
    }, [settings]);

    return (
        <div className="min-h-screen flex flex-col antialiased relative">
            <Head>
                <title>{siteTitle}</title>
                <meta name="description" content={siteDescription} />
                <meta name="keywords" content={siteKeywords} />
            </Head>

            <SettingsInjector settings={settings} />

            <Header
                content={content}
                currentRoute={currentRoute}
                settings={settings}
            />

            <main className="flex-grow relative z-10">{children}</main>

            <Footer content={content} settings={settings} />

            <OfferDock />
            <QuoteModal />
        </div>
    );
}
