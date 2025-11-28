import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePage } from "@inertiajs/react";
import { useServices } from "@/hooks/useServices";
import SafeHtml from "@/Components/Common/SafeHtml";
import ServiceCard from "./ServiceCard";
import "./ServicesGrid.css";

import { motion } from "framer-motion";

const ServicesGrid = ({ content = {} }) => {
    const { t } = useTranslation();
    const { props } = usePage();

    const locale = props?.locale || "de";

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        "oi_cleande_690e161c3a1dd";

    const { services: fetched, loading } = useServices({
        tenantId,
        locale,
        perPage: 50,
        page: 1,
        categoryId: null,
    });

    const services = useMemo(
        () => (Array.isArray(fetched) ? fetched : []),
        [fetched]
    );

    return (
        <section id="services" className="services-section">
            <div className="services-container">
                <motion.h2
                    className="services-title"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <SafeHtml
                        html={content.services_title || t("servicesList.title")}
                    />
                </motion.h2>

                <motion.div
                    className="services-grid"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {loading &&
                        [...Array(42)].map((_, i) => (
                            <div
                                key={i}
                                className="service-card-skeleton"
                            ></div>
                        ))}

                    {!loading &&
                        services.map((s) => {
                            const tr = s.translations?.find(
                                (t) => t.language_code === locale
                            );
                            const name = tr?.name || s.name;
                            const description =
                                tr?.description || s.description;

                            return (
                                <ServiceCard
                                    key={s.id}
                                    title={name}
                                    description={description}
                                    image={s.image}
                                    slug={s.slug}
                                />
                            );
                        })}
                </motion.div>

                <motion.div
                    className="services-cta"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <a href="/kontakt" className="services-contact-button">
                        {t("servicesList.contact_cta")}
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default ServicesGrid;
