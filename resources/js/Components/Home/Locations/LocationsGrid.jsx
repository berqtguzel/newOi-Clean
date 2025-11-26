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

    const apiLocale = useLocale("de") || "de";

    // 🔥 YENİ: Sadece Gebäudereinigung şehir sayfalarını al!
    const { services = [], loading, durationMs, error } = useServices({
        tenantId,
        locale: apiLocale,
        perPage: 1000,
        locationOnly: true,
    });

    // Backend zaten filtreledi ama title temizleyelim
    const sortedItems = [...services]
        .map((s) => ({
            ...s,
            name: stripHtml(s.name),
            title: stripHtml(s.title || s.name),
        }))
        .sort((a, b) =>
            (a.city || "").localeCompare(b.city || "", apiLocale)
        );

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

            {/* API Süresi Gösterimi */}
            {durationMs && (
                <p style={{ fontSize: 12, textAlign: "center", color: "#777" }}>
                    ⏱ {Math.round(durationMs)} ms
                </p>
            )}

            {error && (
                <p style={{ textAlign: "center", color: "red" }}>
                    ❌ {error}
                </p>
            )}

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
