import React from "react";
import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { FaHotel, FaBuilding, FaTools } from "react-icons/fa";
import Aurora from "@/Components/ReactBits/Backgrounds/Aurora";
import "./ServiceCategories.css";

const categories = [
    {
        title: "Hotelreinigung & Housekeeping",
        description:
            "Von der Zimmerreinigung bis zur Spülküche – perfekte Hygiene und effiziente Abläufe in jedem Bereich Ihres Hotels.",
        icon: FaHotel,
        url: "/dienstleistungen/hotel",
        gradient: ["#2563EB", "#60A5FA"],
    },
    {
        title: "Professionelle Gebäudereinigung",
        description:
            "Büros, Gewerbeflächen, Bauendreinigung und Spezialreinigungen – wir lassen Ihre Immobilien glänzen.",
        icon: FaBuilding,
        url: "/dienstleistungen/gebaeude",
        gradient: ["#334155", "#64748B"],
    },
    {
        title: "Renovierung, Reparatur & Instandhaltung",
        description:
            "Maler-, Spachtel- und Trockenbauarbeiten sowie Bodenverlegung und kleinere Reparaturen.",
        icon: FaTools,
        url: "/dienstleistungen/renovierung",
        gradient: ["#CA8A04", "#F59E0B"],
    },
];

/** Yardımcı: CSS inline gradient stili üretir */
const gradientStyle = (from, to) => ({
    backgroundImage: `linear-gradient(to right, ${from}, ${to})`,
});

export default function ServiceCategories({ content = {} }) {
    return (
        <section
            id="services"
            className="svc-section"
            style={{ isolation: "isolate" }}
        >
            {/* Arka plan aurora */}
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
                        {content.section_services ||
                            "Unser breites Leistungsspektrum"}
                    </h2>
                    <p className="svc-subtitle">
                        Wir bieten schlüsselfertige Lösungen für alle
                        Anforderungen Ihrer Einrichtungen und Gebäude – mit
                        deutscher Präzision und Qualität.
                    </p>
                </motion.div>

                <div className="svc-grid">
                    {categories.map((cat, index) => {
                        const Icon = cat.icon;
                        const [from, to] = cat.gradient;

                        return (
                            <motion.article
                                key={cat.title + index}
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
                                {/* Üst renkli bar */}
                                <div
                                    className="svc-card-bar"
                                    style={gradientStyle(from, to)}
                                />

                                {/* İçerik */}
                                <div className="svc-card-body">
                                    <div
                                        className="svc-card-icon"
                                        style={gradientStyle(from, to)}
                                    >
                                        <Icon size={36} />
                                    </div>

                                    <h3 className="svc-card-title">
                                        {cat.title}
                                    </h3>

                                    <p className="svc-card-desc">
                                        {cat.description}
                                    </p>

                                    <Link
                                        href={cat.url}
                                        className="svc-card-link"
                                        aria-label={`${cat.title} – mehr erfahren`}
                                    >
                                        Mehr erfahren
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
