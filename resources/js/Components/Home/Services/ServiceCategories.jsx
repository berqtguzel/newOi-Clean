import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePage } from "@inertiajs/react";
import useWidgets from "@/hooks/useWidgets";
import SafeHtml from "@/Components/Common/SafeHtml";
import Aurora from "@/Components/ReactBits/Backgrounds/Aurora";
import "./ServiceCategories.css";

const useAuroraColors = () => {
    const [colors, setColors] = useState(["#0894D7", "#2967EC", "#0284C7"]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const styles = getComputedStyle(document.documentElement);

        const primary = styles.getPropertyValue("--site-primary-color").trim();
        const accent = styles.getPropertyValue("--site-accent-color").trim();
        const headerBg = styles
            .getPropertyValue("--header-background-color")
            .trim();

        setColors([
            primary || "#0894D7",
            accent || "#2967EC",
            headerBg || "#0284C7",
        ]);
    }, []);

    return colors;
};

export default function ServiceCategories({ content = {} }) {
    const { t } = useTranslation();
    const { props } = usePage();

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        "oi_cleande_690e161c3a1dd";

    const locale = props?.locale || "de";

    const { widgets, loading, error } = useWidgets({
        tenant: tenantId,
        locale,
    });

    const auroraColors = useAuroraColors(); // ✨ burada

    const services = useMemo(() => {
        const raw = widgets?.highlights;
        const list = Array.isArray(raw) ? raw : raw?.data || [];

        return list.map((s) => {
            const tr = s.translations?.find(
                (i) => i.language_code?.toLowerCase() === locale.toLowerCase()
            );

            return {
                ...s,
                name: tr?.name || s.name,
                description: tr?.description || s.description,
            };
        });
    }, [widgets, locale]);

    return (
        <section className="svc-section">
            <div className="svc-aurora">
                <Aurora
                    className="svc-aurora-canvas"
                    colorStops={auroraColors}
                    amplitude={0.5}
                    speed={0.8}
                    blend={0}
                />
            </div>

            <div className="svc-container">
                <motion.div
                    className="svc-header"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="svc-title">
                        <SafeHtml
                            html={
                                content.section_services ||
                                t("services.section_title")
                            }
                        />
                    </h2>

                    <p className="svc-subtitle">
                        <SafeHtml
                            html={
                                content.section_services_subtitle ||
                                t("services.section_subtitle")
                            }
                        />
                    </p>
                </motion.div>

                <div className="svc-grid">
                    {!loading &&
                        !error &&
                        services.map((svc, index) => (
                            <motion.article
                                key={svc.id}
                                className="svc-card"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.05 }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.08,
                                }}
                                viewport={{ once: true }}
                            >
                                <div className="svc-card-bar" />

                                {svc.image && (
                                    <img
                                        src={svc.image}
                                        className="svc-card-img"
                                        loading="lazy"
                                        alt={svc.name}
                                    />
                                )}

                                <div className="svc-card-body">
                                    <h3 className="svc-card-title">
                                        <SafeHtml html={svc.name} />
                                    </h3>
                                    <p className="svc-card-desc">
                                        <SafeHtml html={svc.description} />
                                    </p>
                                </div>
                            </motion.article>
                        ))}
                </div>
            </div>
        </section>
    );
}
