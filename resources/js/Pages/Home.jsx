import React from "react";
import { Head } from "@inertiajs/react";
import HeroSection from "@/Components/Home/HeroSection";
import ServiceCategories from "@/Components/Home/Services/ServiceCategories";
import AppLayout from "@/Layouts/AppLayout";
import ServicesGrid from "@/Components/Home/Services/ServicesGrid";
import LocationsGrid from "@/Components/Home/Locations/LocationsGrid";
import ContactSection from "@/Components/Home/Contact/ContactSection";

export default function Home({
    content,
    services = [],
    locations = [],
    settings = {},
    currentRoute,
}) {
    const siteName = settings?.company?.name || "O&I CLEAN group GmbH";
    const title =
        settings?.seo?.homeTitle ||
        content?.hero?.title ||
        `${siteName} – Professionelle Reinigung`;
    const description =
        settings?.seo?.homeDescription ||
        content?.hero?.subtitle ||
        "Gebäudereinigung, Unterhaltsreinigung und mehr – kostenloses, unverbindliches Angebot.";

    const originUrl =
        typeof window !== "undefined"
            ? window.location.origin
            : settings?.siteUrl || "https://oi-clean.de/";
    const currentUrl =
        typeof window !== "undefined"
            ? window.location.href
            : settings?.siteUrl || "https://oi-clean.de/";

    const logoUrl = settings?.brand?.logoUrl || `${originUrl}/logo.png`;

    const schemaWebSite = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteName,
        url: originUrl,
        inLanguage: "de",
        potentialAction: {
            "@type": "SearchAction",
            target: `${originUrl}/search?q={query}`,
            "query-input": "required name=query",
        },
    };

    const schemaOrganization = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteName,
        url: originUrl,
        logo: logoUrl,
        email: settings?.company?.email || "info@oi-clean.de",
        telephone: settings?.company?.phone || "+49 40 0000000",
        sameAs: settings?.company?.socials || [],
    };

    const schemaBreadcrumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Startseite",
                item: originUrl,
            },
        ],
    };

    const schemaLocations =
        Array.isArray(locations) && locations.length > 0
            ? {
                  "@context": "https://schema.org",
                  "@type": "Collection",
                  hasPart: locations.slice(0, 20).map((l) => ({
                      "@type": "LocalBusiness",
                      name: l?.title || l?.name || siteName,
                      address: l?.address
                          ? {
                                "@type": "PostalAddress",
                                streetAddress: l.address.street || undefined,
                                postalCode: l.address.postalCode || undefined,
                                addressLocality: l.address.city || undefined,
                                addressCountry: l.address.countryCode || "DE",
                            }
                          : undefined,
                      telephone: l?.phone || undefined,
                      email: l?.email || undefined,
                  })),
              }
            : null;

    const schemaServices =
        Array.isArray(services) && services.length > 0
            ? {
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  itemListElement: services.slice(0, 20).map((s, idx) => ({
                      "@type": "ListItem",
                      position: idx + 1,
                      item: {
                          "@type": "Service",
                          name: s?.title || s?.name,
                          url: s?.url ? `${originUrl}${s.url}` : undefined,
                          description: s?.excerpt || undefined,
                          areaServed: "DE",
                          provider: {
                              "@type": "Organization",
                              name: siteName,
                          },
                      },
                  })),
              }
            : null;

    return (
        <AppLayout
            content={content}
            currentRoute={currentRoute}
            settings={settings}
        >
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta
                    name="robots"
                    content="index,follow,max-image-preview:large"
                />
                <link rel="canonical" href={currentUrl} />

                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={currentUrl} />
                {settings?.seo?.homeImage && (
                    <meta
                        property="og:image"
                        content={settings.seo.homeImage}
                    />
                )}

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                {settings?.seo?.homeImage && (
                    <meta
                        name="twitter:image"
                        content={settings.seo.homeImage}
                    />
                )}

                <script type="application/ld+json">
                    {JSON.stringify(schemaWebSite)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(schemaOrganization)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(schemaBreadcrumbs)}
                </script>
                {schemaLocations && (
                    <script type="application/ld+json">
                        {JSON.stringify(schemaLocations)}
                    </script>
                )}
                {schemaServices && (
                    <script type="application/ld+json">
                        {JSON.stringify(schemaServices)}
                    </script>
                )}
            </Head>

            <HeroSection content={content} />
            <ServiceCategories content={content} />
            <ServicesGrid services={services} />
            <LocationsGrid locations={locations} />
            <ContactSection settings={settings} />
        </AppLayout>
    );
}
