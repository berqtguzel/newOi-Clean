import React, { useEffect, useState, useMemo, memo } from "react";
import { Head, usePage } from "@inertiajs/react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import SettingsInjector from "@/Components/SettingsInjector";
import CookieBanner from "../Components/CookieBanner";
import Cookies from "js-cookie";
import { FaCookieBite } from "react-icons/fa";
import WhatsAppWidget from "@/Components/WhatsAppWidget";
import Loading from "@/Components/Common/Loading";
import { useSettings } from "../hooks/useSettings";
import { useLocale } from "../hooks/useLocale";

const AppLayout = memo(function AppLayout({ children }) {
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

    const { data: asyncSettings } = useSettings({
        tenantId,
        locale,
        enabled: isClient,
    });

    const settings = useMemo(() => {
        return isClient
            ? asyncSettings || layoutData.settings || {}
            : layoutData.settings || {};
    }, [isClient, asyncSettings, layoutData.settings]);

    const general = useMemo(() => settings?.general || {}, [settings]);
    const branding = useMemo(() => settings?.branding || {}, [settings]);

    const siteTitle = useMemo(
        () =>
            general.site_name ||
            branding.site_name ||
            layoutData.siteName ||
            "O&I CLEAN",
        [general.site_name, branding.site_name, layoutData.siteName]
    );

    const siteDescription = useMemo(
        () => general.site_description || branding.site_description || "",
        [general.site_description, branding.site_description]
    );

    const favicon = useMemo(
        () =>
            branding.favicon?.url ||
            general.favicon?.url ||
            layoutData.favicon ||
            "/favicon.ico",
        [branding.favicon?.url, general.favicon?.url, layoutData.favicon]
    );

    const handleCookieClick = useMemo(
        () => () => setShowCookieSettings(true),
        []
    );

    return (
        <>
            <SettingsInjector settings={settings} />

            <div className="min-h-screen flex flex-col">
                <Header settings={settings} />
                <main className="flex-grow relative z-10">{children}</main>
                <Footer settings={settings} />
            </div>

            {isClient && (
                <>
                    <Loading />
                    {Cookies.get("cookie_consent") && !showCookieSettings && (
                        <button
                            className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full
                            bg-white shadow-lg border flex items-center justify-center
                            text-blue-600 cursor-pointer"
                            onClick={handleCookieClick}
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
});

export default AppLayout;
