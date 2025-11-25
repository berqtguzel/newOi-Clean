import React from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import HeroSection from "@/Components/Home/HeroSection";
import ServiceCategories from "@/Components/Home/Services/ServiceCategories";
import ServicesGrid from "@/Components/Home/Services/ServicesGrid";
import LocationsGrid from "@/Components/Home/Locations/LocationsGrid";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import { useSettings } from "@/hooks/useSettings";

export default function Home({
    content,
    services = [],
    locations = [],
    currentRoute,
}) {
    const { data: settings } = useSettings();

    return (
        <AppLayout
            content={content}
            currentRoute={currentRoute}
            settings={settings}
        >
            <HeroSection content={content} />
            <ServiceCategories content={content} />
            <ServicesGrid services={services} />
            <LocationsGrid locations={locations} />
            <ContactSection settings={settings} />
        </AppLayout>
    );
}
