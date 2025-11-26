import React, { useMemo, useEffect, useState } from "react";
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

    const [showCookieSettings, setShowCookieSettings] = useState(false);

    useEffect(() => {
        const consent = Cookies.get("cookie_consent");
        if (!consent) {
            setShowCookieSettings(true);
        }

        const handler = () => setShowCookieSettings(false);
        window.addEventListener("cookie-saved", handler);

        return () => window.removeEventListener("cookie-saved", handler);
    }, []);

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";

    const locale = useLocale(props?.locale || "de");

    const { data: asyncSettings, isLoading: settingsLoading } = useSettings({
        tenantId,
        locale,
    });

    const settings = useMemo(() => {
        return asyncSettings || props?.settings || {};
    }, [asyncSettings, props?.settings]);

    const general = settings.general || {};
    const branding = settings.branding || {};

    const siteTitle = general.site_name || branding.site_name || "O&I CLEAN";
    const siteDescription =
        general.site_description || "Professionelle Reinigungsdienste";
    const favicon =
        branding.favicon?.url || general.favicon?.url || "/favicon.ico";

    if (settingsLoading && !Object.keys(settings).length) {
        return <></>;
    }
console.log("TENANT:", tenantId);
console.log("LOCALE:", locale);
    return (
        <div className="min-h-screen flex flex-col antialiased relative">
            <Head>
                <title>{siteTitle}</title>
                <meta name="description" content={siteDescription} />
                <link rel="icon" href={favicon} />
            </Head>

            {/* COOKIE BANNER */}
            <CookieBanner forceVisible={showCookieSettings} />

            <SettingsInjector settings={settings} />
            <Header settings={settings} />

            <main id="app-main" className="flex-grow relative z-10">
                {children}
            </main>

            <Footer settings={settings} />

            {/* COOKIE SETTINGS ICON */}
            {!showCookieSettings && (
                <button
                    type="button"
                    className="
                        fixed
                        bottom-4
                        left-4
                        z-50
                        w-12
                        h-12
                        rounded-full
                        bg-white
                        shadow-lg
                        border
                        flex
                        items-center
                        justify-center
                        text-blue-500 dark:text-blue-400
                        cursor-pointer
                    "
                    aria-label="Çerez ayarları"
                    onClick={() => setShowCookieSettings(true)}
                >
                    <FaCookieBite className="text-xl" />
                </button>
            )}
   <WhatsAppWidget tenant={tenantId} locale={locale} />
        </div>
    );
}
