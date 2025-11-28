import React, { lazy, Suspense, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import HeroSection from "@/Components/Home/HeroSection";
import Loading from "@/Components/Common/Loading";

// Lazy load heavy components
const ServiceCategories = lazy(() => import("@/Components/Home/Services/ServiceCategories"));
const ServicesGrid = lazy(() => import("@/Components/Home/Services/ServicesGrid"));
const LocationsGrid = lazy(() => import("@/Components/Home/Locations/LocationsGrid"));
const ContactSection = lazy(() => import("@/Components/Home/Contact/ContactSection"));

export default function Home({
    content,
    services = [],
    locations = [],
    currentRoute,
    settings, // 👈 SSR settings burada geliyor!
}) {
    const { props } = usePage();
    const global = props?.global || {};
    const appName = global?.appName || "O&I CLEAN group GmbH";
    
    // SEO Meta Tags - Settings'ten gelen veriler
    const seoMetaTitle = useMemo(() => {
        return settings?.seo?.meta_title || 
               settings?.general?.site_name || 
               `${appName} - Professionelle Reinigungsservices`;
    }, [settings, appName]);

    const seoDescription = useMemo(() => {
        return settings?.seo?.meta_description || 
               settings?.general?.site_description || 
               "Professionelle Gebäudereinigung, Wohnungsrenovierung und Hotelreinigung. 24/7 Service in ganz Deutschland.";
    }, [settings]);

    const seoKeywords = useMemo(() => {
        return settings?.seo?.meta_keywords || 
               settings?.general?.site_keywords || 
               "";
    }, [settings]);

    // SSR-safe URL generation
    const canonicalUrl = useMemo(() => {
        if (typeof window === "undefined") return "/";
        return window.location.origin;
    }, []);

    // SSR-safe OG Image URL
    const ogImageUrl = useMemo(() => {
        const image = settings?.seo?.og_image || settings?.general?.og_image || "/og-default.jpg";
        if (typeof window === "undefined") {
            return image.startsWith("http") ? image : image;
        }
        if (image.startsWith("http")) return image;
        return `${window.location.origin}${image.startsWith("/") ? image : `/${image}`}`;
    }, [settings]);

    return (
        <AppLayout
            content={content}
            currentRoute={currentRoute}
            settings={settings}
        >
            {/* 🚀 SEO - Settings'ten gelen meta tag'ler - Kaynak kodunda görünecek */}
            <Head title={seoMetaTitle}>
                <meta name="description" content={seoDescription} />
                {seoKeywords && <meta name="keywords" content={seoKeywords} />}
                
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={appName} />
                <meta property="og:title" content={seoMetaTitle} />
                <meta property="og:description" content={seoDescription} />
                {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
                {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoMetaTitle} />
                <meta name="twitter:description" content={seoDescription} />
                {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
            </Head>

            <HeroSection content={content} />
            <Suspense fallback={<Loading />}>
                <ServiceCategories content={content} />
            </Suspense>
            <Suspense fallback={<Loading />}>
                <ServicesGrid services={services} />
            </Suspense>
            <Suspense fallback={<Loading />}>
                <LocationsGrid locations={locations} />
            </Suspense>
            <Suspense fallback={<Loading />}>
                <ContactSection settings={settings} />
            </Suspense>
        </AppLayout>
    );
}
