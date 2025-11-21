import React from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import HeroSection from "@/Components/Home/HeroSection";
import ServiceCategories from "@/Components/Home/Services/ServiceCategories";
import ServicesGrid from "@/Components/Home/Services/ServicesGrid";
import LocationsGrid from "@/Components/Home/Locations/LocationsGrid";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import { useSettings } from "@/hooks/useSettings"; // Veriyi burada da çekebilirsin veya Layout'tan alabilirsin

export default function Home({
    content,
    services = [],
    locations = [],
    currentRoute,
}) {
    // Not: AppLayout içinde useSettings kullanılıyor ama Home.jsx içinde
    // verilere hemen erişmek ve Head içine basmak için burada da hook'u çağırıyoruz.
    // React Query veya SWR kullanıyorsan cache'ten geleceği için performans sorunu olmaz.
    const { data: settings } = useSettings();

    // --- 1. VERİLERİ AYRIŞTIRMA (Service Yapısına Göre) ---
    const general = settings?.general || {};
    const seo = settings?.seo || {};
    const branding = settings?.branding || {};
    const contact = settings?.contact || {};
    const social = settings?.social || {};

    // --- 2. SEO MANTIĞI ---
    // Title: Önce SEO sekmesi -> Sonra General Site Name -> Sonra Varsayılan
    const pageTitle =
        seo.meta_title ||
        general.site_name ||
        "Professionelle Gebäudereinigung";

    // Description: Önce SEO sekmesi -> Sonra General Description
    const pageDescription =
        seo.meta_description ||
        general.site_description ||
        "Ihr Partner für Reinigung.";

    // Keywords
    const pageKeywords = seo.meta_keywords || general.site_keywords || "";

    // URL ve Logo
    const originUrl =
        typeof window !== "undefined"
            ? window.location.origin
            : "https://oi-clean.de";
    const logoUrl = branding.logo?.url || `${originUrl}/images/logo/Logo.png`;

    // --- 3. SCHEMA.ORG (JSON-LD) ---

    // Website Şeması
    const schemaWebSite = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: general.site_name || "O&I CLEAN",
        url: originUrl,
        potentialAction: {
            "@type": "SearchAction",
            target: `${originUrl}/search?q={query}`,
            "query-input": "required name=query",
        },
    };

    // Organizasyon Şeması (Sosyal Medya ve İletişim ile)
    const schemaOrganization = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: general.site_name || branding.site_name,
        url: originUrl,
        logo: logoUrl,
        email: contact.email || "info@oi-clean.de",
        telephone: contact.phone || "+49 40 0000000",
        // Admin panelindeki Social kısmından gelenleri ekle
        sameAs: [
            social.facebook_url,
            social.instagram_url,
            social.twitter_url,
            social.linkedin_url,
            social.youtube_url,
            social.tiktok_url,
        ].filter(Boolean), // Boş olanları temizle
    };

    return (
        <AppLayout
            content={content}
            currentRoute={currentRoute}
            settings={settings} // Layout'a da gönderelim, tekrar çekmesin (opsiyonel)
        >
            <HeroSection content={content} />
            <ServiceCategories content={content} />
            <ServicesGrid services={services} />
            <LocationsGrid locations={locations} />
            <ContactSection settings={settings} />
        </AppLayout>
    );
}
