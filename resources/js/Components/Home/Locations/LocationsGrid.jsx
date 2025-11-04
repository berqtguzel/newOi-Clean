import React from "react";
import { Head } from "@inertiajs/react";
import "../../../../css/LocationsGrid.css";
import GermanyMap from "./GermanyMap";
import LocationCard from "./LocationCard";

const defaultLocations = [
    {
        id: 1,
        city: "Fulda",
        title: "Gebäudereinigung in Fulda",
        image: "/images/aalen.jpg",
        services: [
            "Gebäudereinigung",
            "Fensterreinigung",
            "Hausmeisterdienste",
        ],
        coordinates: { lat: 50.5558, lng: 9.6808 },
    },
    {
        id: 2,
        city: "Amberg",
        title: "Gebäudereinigung in Amberg",
        image: "/images/aalen.jpg",
        services: ["Gebäudereinigung", "Grundreinigung", "Unterhaltsreinigung"],
        coordinates: { lat: 49.4478, lng: 11.8516 },
    },
    {
        id: 3,
        city: "Aschaffenburg",
        title: "Gebäudereinigung in Aschaffenburg",
        image: "/images/aalen.jpg",
        services: ["Gebäudereinigung", "Glasreinigung", "Büroreinigung"],
        coordinates: { lat: 49.9769, lng: 9.1495 },
    },
    {
        id: 3,
        city: "Aschaffenburg",
        title: "Gebäudereinigung in Aschaffenburg",
        image: "/images/aalen.jpg",
        services: ["Gebäudereinigung", "Glasreinigung", "Büroreinigung"],
        coordinates: { lat: 49.9769, lng: 9.1495 },
    },
];

const LocationsGrid = ({ locations = [] }) => {
    const items = locations && locations.length ? locations : defaultLocations;
    const [activeLocation, setActiveLocation] = React.useState(null);

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "O&I CLEAN group GmbH",
        url: "https://oi-clean.de",
        logo: "https://oi-clean.de/images/logo.svg",
        areaServed: (items || [])
            .filter((l) => l && l.coordinates)
            .map((loc) => ({
                "@type": "City",
                name: loc.city,
                geo: {
                    "@type": "GeoCoordinates",
                    latitude: loc.coordinates.lat,
                    longitude: loc.coordinates.lng,
                },
            })),
        location: (items || [])
            .filter((l) => l && l.coordinates)
            .map((loc) => ({
                "@type": "Place",
                name: loc.title || loc.city,
                address: {
                    "@type": "PostalAddress",
                    addressLocality: loc.city,
                    addressCountry: "DE",
                },
                geo: {
                    "@type": "GeoCoordinates",
                    latitude: loc.coordinates.lat,
                    longitude: loc.coordinates.lng,
                },
            })),
    };

    return (
        <section
            id="location"
            className="locations-section relative overflow-hidden"
            aria-labelledby="locations-title"
        >
            <Head>
                <title>Standorte - O&I CLEAN group GmbH</title>
                <meta
                    name="description"
                    content="Professionelle Reinigungsservices an verschiedenen Standorten in Deutschland. Lokale Expertise, bundesweite Qualität."
                />
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Head>

            <div className="locations-container">
                <div className="locations-header">
                    <h1 id="locations-title" className="locations-title">
                        Standorte
                    </h1>
                    <p className="locations-subtitle">
                        Entdecken Sie unsere Standorte in Deutschland
                    </p>
                </div>

                {/* Almanya Haritası */}
                <div className="map-container">
                    <GermanyMap
                        locations={items}
                        activeId={activeLocation}
                        setActiveId={setActiveLocation}
                    />
                </div>

                {/* Lokasyon Grid */}
                <div className="locations-grid">
                    {items.map((location) => (
                        <LocationCard
                            key={location.id}
                            location={location}
                            onHover={() => setActiveLocation(location.id)}
                            isActive={activeLocation === location.id}
                        />
                    ))}
                </div>

                <div className="locations-cta">
                    <a
                        href="/kontakt"
                        className="locations-contact-button"
                        aria-label="Jetzt Kontakt aufnehmen"
                    >
                        Standort Anfragen
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
