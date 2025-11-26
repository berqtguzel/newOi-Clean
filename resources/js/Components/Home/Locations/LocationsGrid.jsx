import React from "react";
import { Head, usePage } from "@inertiajs/react";
import "../../../../css/LocationsGrid.css";
import { useTranslation } from "react-i18next";
import GermanyMap from "./GermanyMap";
import LocationCard from "./LocationCard";
import SafeHtml from "@/Components/Common/SafeHtml";
import { useLocale } from "@/hooks/useLocale";
import { useServices } from "@/hooks/useServices";

const stripHtml = (s = "") => s.replace(/<[^>]*>/g, "").trim();

export default function LocationsGrid() {
    const { t } = useTranslation();
    const { props } = usePage();

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        "oi_cleande_690e161c3a1dd";

    const apiLocale = (useLocale("de") || "de").toLowerCase();

    // 🔥 SADECE Gebäudereinigung şehirlerini çek
    const { services = [], loading } = useServices({
        tenantId,
        locale: apiLocale,
        fetchAll: true,
        perPage: 500,
        parentSlug: "Gebäudereinigung",
    });

    const sortedItems = [...services]
        .filter(
            (s) => s.slug?.startsWith("gebaudereinigung-in-") && s.city?.trim()
        )
        .sort((a, b) => {
            const orderA = a.order ?? null;
            const orderB = b.order ?? null;

            if (orderA != null && orderB == null) return -1;
            if (orderA == null && orderB != null) return 1;
            if (orderA !== null && orderB !== null && orderA !== orderB)
                return orderA - orderB;

            return (a.city || "").localeCompare(b.city || "", "de");
        })
        .map((s) => ({
            ...s,
            title: stripHtml(s.title || s.name),
        }));

    const [activeLocation, setActiveLocation] = React.useState(null);

    const title = t("locations.title", "Unsere Standorte");

    return (
        <section id="location" className="locations-section">
            <Head>
                <title>{title}</title>
                <meta
                    name="description"
                    content="Professionelle Gebäudereinigung in Deutschland – wählen Sie Ihren Standort"
                />
            </Head>

            <div className="locations-container">
                <div className="locations-header">
                    <h1 className="locations-title">{title}</h1>
                </div>

                <div className="map-container">
                    <GermanyMap
                        locations={sortedItems}
                        activeId={activeLocation}
                        setActiveId={setActiveLocation}
                    />
                </div>

                <div className="locations-grid">
                    {loading && <p>📍 Standorte werden geladen…</p>}
                    {!loading && !sortedItems.length && (
                        <p>⛔ Noch keine Standorte vorhanden.</p>
                    )}

                    {sortedItems.map((loc) => (
                        <LocationCard
                            key={loc.id}
                            location={loc}
                            isActive={activeLocation === loc.id}
                            onHover={() => setActiveLocation(loc.id)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
