// resources/js/Components/Home/Services/ServicesGrid.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePage } from "@inertiajs/react";
import { useServices } from "@/hooks/useServices";
import SafeHtml from "@/Components/Common/SafeHtml";
import ServiceCard from "./ServiceCard";
import "./ServicesGrid.css";

const getTranslatedValue = (item, locale) => {
    const tr = item.translations?.find((t) => t.language_code === locale);

    return {
        name: tr?.name || item.name,
        description: tr?.description || item.description,
    };
};

const ServicesGrid = ({ content = {} }) => {
    const { t } = useTranslation();
    const { props } = usePage();

    const locale = props?.locale || "de";

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        "oi_cleande_690e161c3a1dd"; // ✅ doğru default

    // 🔥 categoryId: null → backend ana servisleri döndürüyor
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

    // Şimdilik ekstra filtre yok – backend zaten ana servisleri veriyor
    const services = useMemo(
        () => (Array.isArray(fetched) ? fetched : []),
        [fetched]
    );

    console.log("🎯 MAIN SERVICES:", services);

    return (
        <section id="services" className="services-section">
            {durationMs && !loading && (
                <div
                    style={{
                        color: "#777",
                        fontSize: "12px",
                        textAlign: "center",
                        marginBottom: 8,
                    }}
                >
                    ⏱ {Math.round(durationMs)} ms
                </div>
            )}

            {error && (
                <div
                    style={{ color: "red", textAlign: "center", margin: "8px 0" }}
                >
                    ❌ {error}
                </div>
            )}

            <div className="services-container">
                <div className="services-header">
                    <h2 className="services-title">
                        <SafeHtml
                            html={
                                content.services_title ||
                                t("servicesList.title")
                            }
                        />
                    </h2>
                </div>

                <div className="services-grid">
                    {loading && <div>{t("loading")}</div>}

                    {!loading &&
                        services.map((s) => {
                            const { name, description } = getTranslatedValue(
                                s,
                                locale
                            );

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
                </div>

                <div className="services-cta">
                    <a href="/kontakt" className="services-contact-button">
                        {t("servicesList.contact_cta")}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ServicesGrid;
