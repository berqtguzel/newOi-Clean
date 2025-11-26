import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePage } from "@inertiajs/react";
import useWidgets from "@/hooks/useWidgets";
import SafeHtml from "@/Components/Common/SafeHtml";
import Aurora from "@/Components/ReactBits/Backgrounds/Aurora";
import "./ServiceCategories.css";

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
                    colorStops={["#0894D7", "#2967EC", "#0284C7"]}
                    amplitude={0.9}
                    speed={0.6}
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

                {loading && <p className="svc-loading">⏳ {t("loading")}</p>}
                {error && <p className="svc-error">❌ {t("error")}</p>}

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
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: true }}
                            >
                                <div className="svc-card-bar" />

                                {svc.image && (
                                    <img
                                        src={svc.image}
                                        className="svc-card-img"
                                        loading="lazy"
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
