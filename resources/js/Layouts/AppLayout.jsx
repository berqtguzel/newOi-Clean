import React from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import OfferDock from "../Components/OfferDock";
import QuoteModal from "../Components/Modals/QuoteModal";
import { usePage } from "@inertiajs/react";
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
    const { data: settings } = useSettings({ tenantId, locale });
    return (
        <div className="min-h-screen flex flex-col antialiased relative">
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
