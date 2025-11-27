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
    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.tenantId ||
        "";

    const serverLocale = props?.locale || "de";
    const locale = useLocale(serverLocale);

    const [hydrated, setHydrated] = useState(false);
    const [showCookieSettings, setShowCookieSettings] = useState(false);

    useEffect(() => {
        setHydrated(true);

        const consent = Cookies.get("cookie_consent");
        if (!consent) setShowCookieSettings(true);

        const handler = () => setShowCookieSettings(false);
        window.addEventListener("cookie-saved", handler);
        return () => window.removeEventListener("cookie-saved", handler);
    }, []);

    const { data: asyncSettings, loading } = useSettings({
        tenantId,
        locale,
    });

    const settings =
        hydrated && !loading
            ? asyncSettings || props.settings || {}
            : props.settings || {};

    const general = settings.general || {};
    const branding = settings.branding || {};

    const siteTitle = general.site_name || branding.site_name || "O&I CLEAN";

    const siteDescription =
        general.site_description || "Professionelle Reinigungsdienste";

    const favicon =
        branding.favicon?.url || general.favicon?.url || "/favicon.ico";

    return (
        <div className="min-h-screen flex flex-col antialiased relative">
            <Head>
                <title>{siteTitle}</title>
                <meta name="description" content={siteDescription} />
                <link rel="icon" href={favicon} />
            </Head>

            {/* Settings SSR + CSR */}
            <SettingsInjector settings={settings} />

            <Header settings={settings} />

            <main id="app-main" className="flex-grow relative z-10">
                {children}
            </main>

            {hydrated ? (
                <Footer settings={settings} />
            ) : (
                <footer className="h-20 w-full bg-gray-200 opacity-20" />
            )}

            {hydrated && (
                <>
                    {!showCookieSettings && (
                        <button
                            type="button"
                            className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full
                            bg-white shadow-lg border flex items-center justify-center
                            text-blue-500 dark:text-blue-400 cursor-pointer"
                            onClick={() => setShowCookieSettings(true)}
                        >
                            <FaCookieBite className="text-xl" />
                        </button>
                    )}

                    <CookieBanner forceVisible={showCookieSettings} />
                    <WhatsAppWidget tenant={tenantId} locale={locale} />
                </>
            )}
        </div>
    );
}
