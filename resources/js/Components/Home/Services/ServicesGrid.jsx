// resources/js/Components/Home/Services/ServicesGrid.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePage } from "@inertiajs/react";
import { useServices } from "@/hooks/useServices";
import SafeHtml from "@/Components/Common/SafeHtml";
import ServiceCard from "./ServiceCard";
import "./ServicesGrid.css";

import { motion } from "framer-motion"; // ✨ Ekledik

const getTranslatedValue = (item, locale) => {
    const tr = item.translations?.find((t) => t.language_code === locale);

    return {
        name: tr?.name || item.name,
        description: tr?.description || item.description,
    };
};

const animationVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i = 1) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.15, // ✨ Kartlar sırayla animasyonlu
            duration: 0.6,
            ease: "easeOut",
        },
    }),
};

const ServicesGrid = ({ content = {} }) => {
    const { t } = useTranslation();
    const { props } = usePage();

    const locale = props?.locale || "de";

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        "oi_cleande_690e161c3a1dd";

    const {
        services: fetched,
        loading,
        durationMs,
        error,
    } = useServices({
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
                <div className="services-header">
                    <motion.h2
                        className="services-title"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <SafeHtml
                            html={
                                content.services_title ||
                                t("servicesList.title")
                            }
                        />
                    </motion.h2>
                </div>

                <div className="services-grid">
                    {!loading &&
                        services.map((s, index) => {
                            const { name, description } = getTranslatedValue(
                                s,
                                locale
                            );

                            return (
                                <motion.div
                                    key={s.id}
                                    variants={animationVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.2 }}
                                    custom={index}
                                >
                                    <ServiceCard
                                        title={name}
                                        description={description}
                                        image={s.image}
                                        slug={s.slug}
                                    />
                                </motion.div>
                            );
                        })}

                    {loading && <div>{t("loading")}</div>}
                </div>

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
