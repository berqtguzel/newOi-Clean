import React from "react";
import { Head, usePage } from "@inertiajs/react";
import "../../../../css/LocationsGrid.css";
import { useTranslation } from "react-i18next";
import GermanyMap from "./GermanyMap";
import LocationCard from "./LocationCard";
import SafeHtml from "@/Components/Common/SafeHtml";
import { useLocale } from "@/hooks/useLocale";
import { fetchServices } from "@/services/servicesService";

const stripHtml = (s = "") => s.replace(/<[^>]*>/g, "").trim();

const mapServiceToLocation = (svc) => {
    const lat = svc.latitude;
    const lng = svc.longitude;

    const coordinates =
        typeof lat === "number" &&
        !isNaN(lat) &&
        typeof lng === "number" &&
        !isNaN(lng)
            ? { lat, lng }
            : null;

    const city =
        svc.city ||
        svc.district ||
        svc.country ||
        stripHtml(svc.name || svc.title || "");

    return {
        id: svc.id,
        city,
        title: svc.name || svc.title,
        image: svc.image,
        coordinates,
        slug: svc.slug,
        link: svc.url,
        maps: svc.maps || [],
        has_maps: svc.hasMaps ?? svc.has_maps,
        service: svc.raw || svc,
    };
};

const CATEGORY_SLUG = "gebaedereinugung";
const CATEGORY_NAME = "Gebäudereinigung";
const LocationsGrid = () => {
    const { t } = useTranslation();
    const { props } = usePage();

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";

    const uiLocaleRaw = useLocale("de") || "de";
    const apiLocale = String(uiLocaleRaw).toLowerCase();

    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [activeLocation, setActiveLocation] = React.useState(null);

    React.useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setLoading(true);
            try {
                const { services } = await fetchServices({
                    page: 1,
                    perPage: 100,
                    tenantId,
                    locale: apiLocale,
                });

                if (!isMounted) return;

                const list = Array.isArray(services) ? services : [];

                const filtered = list.filter((svc) => {
                    const catSlug = svc.categorySlug;
                    const catName = svc.categoryName;

                    const matchesCategory =
                        (catSlug && catSlug === CATEGORY_SLUG) ||
                        (catName && catName === CATEGORY_NAME);

                    const parentId = svc.parentId;

                    return (
                        matchesCategory &&
                        parentId !== null &&
                        parentId !== undefined
                    );
                });

                const mapped = filtered.map(mapServiceToLocation);
                setItems(mapped);
            } catch (err) {
                console.error("Services fetch failed:", {
                    message: err?.message,
                    status: err?.response?.status,
                    data: err?.response?.data,
                });
                if (isMounted) {
                    setItems([]);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();
        return () => {
            isMounted = false;
        };
    }, [tenantId, apiLocale]);

    const usedItems = items || [];

    const pageTitle = t(
        "locations.page_title",
        "Standorte - O&I CLEAN group GmbH"
    );
    const pageDescription = t(
        "locations.page_description",
        "Professionelle Reinigungsservices an verschiedenen Standorten in Deutschland. Lokale Expertise, bundesweite Qualität."
    );
    const title = t("locations.title", "Standorte");
    const subtitle = t(
        "locations.subtitle",
        "Entdecken Sie unsere Standorte in Deutschland"
    );
    const loadingText = t("locations.loading", "Standorte werden geladen...");
    const emptyText = t(
        "locations.empty",
        "Derzeit sind keine Standorte verfügbar."
    );
    const ctaLabel = t("locations.cta_label", "Standort anfragen");
    const ctaAria = t("locations.cta_aria", "Jetzt Kontakt aufnehmen");
    const contactHref = t("locations.contact_href", "/kontakt");

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "O&I CLEAN group GmbH",
        url: "https://oi-clean.de",
        logo: "https://oi-clean.de/images/logo.svg",
        areaServed: usedItems
            .filter((l) => l && l.coordinates)
            .map((loc) => {
                const city = stripHtml(loc.city || "");
                return {
                    "@type": "City",
                    name: city,
                    geo: {
                        "@type": "GeoCoordinates",
                        latitude: loc.coordinates.lat,
                        longitude: loc.coordinates.lng,
                    },
                };
            }),
        location: usedItems
            .filter((l) => l && l.coordinates)
            .map((loc) => {
                const city = stripHtml(loc.city || "");
                const locTitle = stripHtml(loc.title || loc.city || "");
                return {
                    "@type": "Place",
                    name: locTitle || city,
                    address: {
                        "@type": "PostalAddress",
                        addressLocality: city,
                        addressCountry: "DE",
                    },
                    geo: {
                        "@type": "GeoCoordinates",
                        latitude: loc.coordinates.lat,
                        longitude: loc.coordinates.lng,
                    },
                };
            }),
    };

    return (
        <section
            id="location"
            className="locations-section relative overflow-hidden"
            aria-labelledby="locations-title"
        >
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Head>

            <div className="locations-container">
                <div className="locations-header">
                    <h1 id="locations-title" className="locations-title">
                        <SafeHtml html={title} as="span" />
                    </h1>
                    <SafeHtml
                        html={subtitle}
                        as="p"
                        className="locations-subtitle"
                    />
                </div>

                <div className="map-container">
                    <GermanyMap
                        locations={usedItems}
                        activeId={activeLocation}
                        setActiveId={setActiveLocation}
                    />
                </div>

                <div className="locations-grid">
                    {loading && !usedItems.length && (
                        <p className="locations-loading">{loadingText}</p>
                    )}

                    {!loading && !usedItems.length && (
                        <p className="locations-empty">{emptyText}</p>
                    )}

                    {usedItems.map((location) => (
                        <LocationCard
                            key={`${location.id}-${location.city}`}
                            location={location}
                            onHover={() => setActiveLocation(location.id)}
                            isActive={activeLocation === location.id}
                        />
                    ))}
                </div>

                <div className="locations-cta">
                    <a
                        href={contactHref}
                        className="locations-contact-button"
                        aria-label={ctaAria}
                    >
                        <SafeHtml html={ctaLabel} as="span" />
                        <svg
                            className="locations-arrow-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M5 12H19M19 12L12 5M19 12L12 19"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default LocationsGrid;
