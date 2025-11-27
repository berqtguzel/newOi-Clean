import React from "react";
import { Head, usePage } from "@inertiajs/react";
import { motion } from "framer-motion"; // motion import'u eklendi
import "../../../../css/LocationsGrid.css";
import { useTranslation } from "react-i18next";
import GermanyMap from "./GermanyMap";
import LocationCard from "./LocationCard";

import { useLocale } from "@/hooks/useLocale";
import { useServices } from "@/hooks/useServices";

const stripHtml = (s = "") => s.replace(/<[^>]*>/g, "").trim();

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const markerVariants = {
    hidden: { scale: 0 },
    show: {
        scale: 1,
        transition: { type: "spring", stiffness: 200, damping: 15 },
    },
};

export default function LocationsGrid() {
    const { t } = useTranslation();
    const { props } = usePage();

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        "oi_cleande_690e161c3a1dd";

    const apiLocale = useLocale("de") || "de";

    const {
        services = [],
        loading,
        durationMs,
        error,
    } = useServices({
        tenantId,
        locale: apiLocale,
        perPage: 1000,
        locationOnly: true,
    });

    const sortedItems = [...services]
        .map((s) => ({
            ...s,
            name: stripHtml(s.name),
            title: stripHtml(s.title || s.name),
        }))
        .sort((a, b) => (a.city || "").localeCompare(b.city || "", apiLocale));

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

            {durationMs && (
                <p style={{ fontSize: 12, textAlign: "center", color: "#777" }}>
                    ⏱ {Math.round(durationMs)} ms
                </p>
            )}

            {error && (
                <p style={{ textAlign: "center", color: "red" }}>❌ {error}</p>
            )}

            <motion.div
                className="locations-container"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <div className="locations-header">
                    <motion.h1
                        className="locations-title"
                        variants={itemVariants}
                    >
                        {title}
                    </motion.h1>
                </div>

                <motion.div className="map-container" variants={itemVariants}>
                    <GermanyMap
                        locations={sortedItems}
                        activeId={activeLocation}
                        setActiveId={setActiveLocation}
                    />
                </motion.div>

                <motion.div
                    className="locations-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {loading && <p>📍 Standorte werden geladen…</p>}

                    {!loading && !sortedItems.length && (
                        <p>⛔ Noch keine Standorte vorhanden.</p>
                    )}

                    {sortedItems.map((loc) => (
                        <motion.div key={loc.id} variants={itemVariants}>
                            <LocationCard
                                location={loc}
                                isActive={activeLocation === loc.id}
                                onHover={() => setActiveLocation(loc.id)}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </section>
    );
}
