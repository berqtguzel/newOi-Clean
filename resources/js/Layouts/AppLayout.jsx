import React, { useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import SettingsInjector from "@/Components/SettingsInjector";

import { useSettings } from "../hooks/useSettings";
import { useLocale } from "../hooks/useLocale";

export default function AppLayout({ children }) {
    const { props } = usePage();

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

    return (
        <div className="min-h-screen flex flex-col antialiased relative">
            <Head>
                <title>{siteTitle}</title>
                <meta name="description" content={siteDescription} />
                <link rel="icon" href={favicon} />
            </Head>

            <SettingsInjector settings={settings} />
            <Header settings={settings} />

            <main id="app-main" className="flex-grow relative z-10">
                {children}
            </main>

            <Footer settings={settings} />
        </div>
    );
}
