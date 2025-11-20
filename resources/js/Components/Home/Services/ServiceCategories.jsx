import React from "react";
import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { FaHotel, FaBuilding, FaTools } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Aurora from "@/Components/ReactBits/Backgrounds/Aurora";
import SafeHtml from "@/Components/Common/SafeHtml";
import "./ServiceCategories.css";

const gradientStyle = (from, to) => ({
    backgroundImage: `linear-gradient(to right, ${from}, ${to})`,
});

const stripHtml = (str = "") =>
    String(str)
        .replace(/<[^>]+>/g, "")
        .trim();

export default function ServiceCategories({ content = {} }) {
    const { t } = useTranslation();

    const sectionTitle =
        content.section_services ||
        t("services.section_title", "Unser breites Leistungsspektrum");

    const sectionSubtitle =
        content.section_services_subtitle ||
        t(
            "services.section_subtitle",
            "Wir bieten schlüsselfertige Lösungen für alle Anforderungen Ihrer Einrichtungen und Gebäude – mit deutscher Präzision und Qualität."
        );

    const categories = [
        {
            key: "hotel",
            title: t(
                "services.categories.hotel.title",
                "Hotelreinigung & Housekeeping"
            ),
            description: t(
                "services.categories.hotel.description",
                "Von der Zimmerreinigung bis zur Spülküche – perfekte Hygiene und effiziente Abläufe in jedem Bereich Ihres Hotels."
            ),
            icon: FaHotel,
            url: "/dienstleistungen/hotel",
            gradient: ["#2563EB", "#60A5FA"],
        },
        {
            key: "building",
            title: t(
                "services.categories.building.title",
                "Professionelle Gebäudereinigung"
            ),
            description: t(
                "services.categories.building.description",
                "Büros, Gewerbeflächen, Bauendreinigung und Spezialreinigungen – wir lassen Ihre Immobilien glänzen."
            ),
            icon: FaBuilding,
            url: "/dienstleistungen/gebaeude",
            gradient: ["#334155", "#64748B"],
        },
        {
            key: "renovation",
            title: t(
                "services.categories.renovation.title",
                "Renovierung, Reparatur & Instandhaltung"
            ),
            description: t(
                "services.categories.renovation.description",
                "Maler-, Spachtel- und Trockenbauarbeiten sowie Bodenverlegung und kleinere Reparaturen."
            ),
            icon: FaTools,
            url: "/dienstleistungen/renovierung",
            gradient: ["#CA8A04", "#F59E0B"],
        },
    ];

    const learnMoreLabel = t("services.learn_more", "Mehr erfahren");

    return (
        <section
            id="services"
            className="svc-section"
            style={{ isolation: "isolate" }}
        >
            <div className="svc-aurora">
                <Aurora
                    className="svc-aurora-canvas"
                    colorStops={["#0894D7", "#2967EC", "#0284C7"]}
                    blend={0}
                    amplitude={0.65}
                    speed={0.6}
                />
            </div>

            <div className="svc-container">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="svc-header"
                >
                    <h2 className="svc-title">
                        <SafeHtml html={sectionTitle} />
                    </h2>
                    <p className="svc-subtitle">
                        <SafeHtml html={sectionSubtitle} />
                    </p>
                </motion.div>

                <div className="svc-grid">
                    {categories.map((cat, index) => {
                        const Icon = cat.icon;
                        const [from, to] = cat.gradient;
                        const plainTitle =
                            stripHtml(cat.title) || "diese Kategorie";

                        return (
                            <motion.article
                                key={cat.key}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.2,
                                }}
                                whileHover={{ scale: 1.03 }}
                                viewport={{ once: true }}
                                className="svc-card"
                            >
                                <div
                                    className="svc-card-bar"
                                    style={gradientStyle(from, to)}
                                />

                                <div className="svc-card-body">
                                    <div
                                        className="svc-card-icon"
                                        style={gradientStyle(from, to)}
                                    >
                                        <Icon size={36} />
                                    </div>

                                    <h3 className="svc-card-title">
                                        <SafeHtml html={cat.title} />
                                    </h3>

                                    <p className="svc-card-desc">
                                        <SafeHtml html={cat.description} />
                                    </p>

                                    <Link
                                        href={cat.url}
                                        className="svc-card-link"
                                        aria-label={`${plainTitle} – ${learnMoreLabel}`}
                                    >
                                        {learnMoreLabel}
                                        <motion.svg
                                            className="svc-card-link-arrow"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                            whileHover={{ x: 4 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                            }}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 5l7 7-7 7"
                                            />
                                        </motion.svg>
                                    </Link>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
