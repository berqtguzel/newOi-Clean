import React, { useEffect, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import SettingsInjector from "@/Components/SettingsInjector";
import CookieBanner from "../Components/CookieBanner";
import Cookies from "js-cookie";
import { FaCookieBite } from "react-icons/fa";
import WhatsAppWidget from "@/Components/WhatsAppWidget";
import { useSettings } from "../hooks/useSettings";
import { useLocale } from "../hooks/useLocale";

export default function AppLayout({ children }) {
    const { props } = usePage();

    const layoutData = props?.layoutData || {};
    const tenantId = layoutData?.tenantId || "";
    const serverLocale = layoutData?.locale || "de";
    const locale = useLocale(serverLocale);

    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);

    const [showCookieSettings, setShowCookieSettings] = useState(false);
    useEffect(() => {
        const consent = Cookies.get("cookie_consent");
        if (!consent) setShowCookieSettings(true);
    }, []);

    // SSR'da async fetch DENENMEZ - sadece tarayıcıda
    const { data: asyncSettings } = useSettings({
        tenantId,
        locale,
        enabled: isClient,
    });

    // 🔥 SSR = layoutData.settings
    // 🔥 CSR = API’dan asyncSettings gelirse üzerine yazar
    const settings = isClient
        ? asyncSettings || layoutData.settings || {}
        : layoutData.settings || {};

    // META
    const general = settings?.general || {};
    const branding = settings?.branding || {};

    const siteTitle =
        general.site_name ||
        branding.site_name ||
        layoutData.siteName ||
        "O&I CLEAN";

    const siteDescription =
        general.site_description ||
        branding.site_description ||
        "Professionelle Reinigungsdienste";

    const favicon =
        branding.favicon?.url ||
        general.favicon?.url ||
        layoutData.favicon ||
        "/favicon.ico";

    return (
        <>
            <Head>
                <title>{siteTitle}</title>
                <meta name="description" content={siteDescription} />
                <link rel="icon" href={favicon} />
            </Head>

            {/* 🔥 Renkler + SEO + Analytics */}
            <SettingsInjector settings={settings} />

            <div className="min-h-screen flex flex-col">
                <Header settings={settings} />
                <main className="flex-grow relative z-10">{children}</main>
                <Footer settings={settings} />
            </div>

            {isClient && (
                <>
                    {!showCookieSettings && (
                        <button
                            className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full
                            bg-white shadow-lg border flex items-center justify-center
                            text-blue-600 cursor-pointer"
                            onClick={() => setShowCookieSettings(true)}
                        >
                            <FaCookieBite className="cookie-icon" />
                        </button>
                    )}

                    <CookieBanner forceVisible={showCookieSettings} />
                    <WhatsAppWidget tenant={tenantId} locale={locale} />
                </>
            )}
        </>
    );
}
