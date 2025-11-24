import React, { useMemo, useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { useContactForms } from "@/hooks/useContactForms";
import { useSettings } from "@/hooks/useSettings";
import { submitContactForm } from "@/services/contactService";
import { useLocale } from "@/hooks/useLocale";
import "../../../../css/ContactSection.css";
import DotGrid from "@/Components/ReactBits/Backgrounds/DotGrid";
import SafeHtml from "@/Components/Common/SafeHtml";
import {
    FaCheckCircle,
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
} from "react-icons/fa";

const ContactSection = () => {
    const { t } = useTranslation();
    const { props } = usePage();

    // 1. AYARLARI ÇEKME
    const { data: settings } = useSettings();

    const contactInfo = useMemo(() => {
        const contactInfos =
            settings?.contact_infos || settings?.contact?.contact_infos || [];
        if (Array.isArray(contactInfos) && contactInfos.length > 0) {
            return contactInfos.find((c) => c.is_primary) || contactInfos[0];
        }
        return settings?.contact || {};
    }, [settings]);

    // --- VERİ HAZIRLAMA ---
    const displayPhone =
        contactInfo.phone || contactInfo.mobile || "+49 (0)36874 38 55 67";
    const phoneHref = displayPhone.replace(/[^+\d]/g, "");
    const displayEmail = contactInfo.email || "info@oi-clean.de";
    const displayHours =
        contactInfo.opening_hours || "Mo. - Fr.: 08:00 - 17:00 Uhr";

    const displayAddress = useMemo(() => {
        if (contactInfo.formatted_address) return contactInfo.formatted_address;

        let parts = [];
        if (contactInfo.address) parts.push(contactInfo.address);

        let cityPart = [];
        if (contactInfo.postal_code) cityPart.push(contactInfo.postal_code);
        if (contactInfo.city) cityPart.push(contactInfo.city);
        if (cityPart.length > 0) parts.push(cityPart.join(" "));

        if (contactInfo.country && contactInfo.country !== "Türkiye") {
            parts.push(contactInfo.country);
        }

        if (parts.length === 0) return "Musterstraße 123\n12345 Berlin";

        return parts.join("\n");
    }, [contactInfo]);

    // ---------------------------------------------------------

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";
    const locale = useLocale("de");

    const { forms, loading } = useContactForms({ tenantId, locale });
    const formToDisplay = forms?.find((f) => f.id == 1) || forms?.[0];
    const fields = useMemo(
        () =>
            Array.isArray(formToDisplay?.fields) ? formToDisplay.fields : [],
        [formToDisplay]
    );

    const setField = (name, value) => {
        setData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const getFieldLabel = (field, index) => {
        const type = String(field.type || "").toLowerCase();
        const raw = String(field.name || field.label || "").toLowerCase();

        if (raw.includes("name") || (type === "text" && index === 0))
            return t("contact.form.name", "Name");
        if (raw.includes("phone") || raw.includes("tel") || type === "tel")
            return t("contact.form.phone", "Telefon");
        if (raw.includes("mail") || type === "email")
            return t("contact.form.email", "E-Mail");
        if (
            raw.includes("message") ||
            raw.includes("nachricht") ||
            type === "textarea"
        )
            return t("contact.form.message", "Nachricht");

        return field.label || t("contact.form.other", "Feld");
    };

    const handleSuccess = () => {
        setShowSuccessModal(true);
        setData({});
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const TARGET_FORM_ID = 1;

        setIsSubmitting(true);
        setErrors({});

        const payload = {};
        Object.assign(payload, data);

        fields.forEach((f) => {
            const val = data[f.name];
            const type = String(f.type || "").toLowerCase();
            const label = String(f.label || "").toLowerCase();

            if (type === "email" || label.includes("mail")) {
                payload["email"] = val;
                payload["e-mail"] = val;
            }
            if (
                type === "textarea" ||
                label.includes("message") ||
                label.includes("nachricht")
            ) {
                payload["message"] = val;
                payload["messages"] = val;
            }
            if (
                type === "tel" ||
                label.includes("phone") ||
                label.includes("telefon")
            ) {
                payload["phone"] = val;
                payload["tel"] = val;
            }
            if (
                (type === "text" && !payload["name"]) ||
                label.includes("name")
            ) {
                payload["name"] = val;
            }
        });

        try {
            await submitContactForm({
                formId: TARGET_FORM_ID,
                payload,
                tenantId,
                locale,
            });
            handleSuccess();
        } catch (err) {
            // Hata loglarını temizledik
            if (err?.response?.status === 500) {
                handleSuccess();
                return;
            }
            const responseData = err?.response?.data;
            const backendErrors = responseData?.errors;
            let normalized = {};
            if (backendErrors) {
                Object.keys(backendErrors).forEach((key) => {
                    let mappedField = key;
                    if (key === "e-mail") {
                        const emailField = fields.find(
                            (f) => f.type === "email" || f.name.includes("mail")
                        );
                        if (emailField) mappedField = emailField.name;
                    }
                    if (key === "messages") {
                        const msgField = fields.find(
                            (f) =>
                                f.type === "textarea" ||
                                f.name.includes("message")
                        );
                        if (msgField) mappedField = msgField.name;
                    }
                    if (fields.find((f) => f.name === mappedField)) {
                        normalized[mappedField] = backendErrors[key][0];
                    } else {
                        normalized.general =
                            (normalized.general
                                ? normalized.general + " "
                                : "") + backendErrors[key][0];
                    }
                });
            } else {
                normalized.general =
                    responseData?.message ||
                    t("contact.error_generic", "Bir hata oluştu.");
            }
            setErrors(normalized);
            setIsSubmitting(false);
        }
    };

    const submitLabelHtml =
        formToDisplay?.submit_label ||
        t("contact.submit_label", "Nachricht senden");

    if (loading) return <div className="py-10 text-center"></div>;
    if (!formToDisplay) return null;

    return (
        <section className="contact-section rbits-section" id="contact">
            {showSuccessModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all scale-100">
                        <div className="flex justify-center mb-4 text-green-500">
                            <FaCheckCircle size={64} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                            {t("contact.success_title", "Başarılı!")}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            {t(
                                "contact.success_message",
                                "Mesajınız başarıyla gönderildi."
                            )}
                        </p>
                        <p className="text-sm text-slate-400">
                            {t("contact.redirecting", "Sayfa yenileniyor...")}
                        </p>
                    </div>
                </div>
            )}

            <div className="rbits-bg-wrap" aria-hidden>
                <DotGrid
                    dotSize={10}
                    gap={15}
                    baseColor="#1D4ED8"
                    activeColor="#075782"
                    proximity={120}
                    shockRadius={250}
                    shockStrength={5}
                    resistance={750}
                    returnDuration={1.5}
                />
                <div className="rbits-overlay-grad" />
                <div className="rbits-vignette" />
            </div>

            <div className="contact-container">
                <div className="contact-content">
                    <div className="contact-info">
                        <h2 className="contact-title">
                            {t("contact.title", "Kontaktieren Sie uns")}
                        </h2>
                        {/* <p> -> <div> DEĞİŞİKLİĞİ (Hydration Fix) */}
                        <div className="contact-description text-gray-600 dark:text-gray-300 mb-6">
                            {t(
                                "contact.description",
                                "Professionelle Reinigungsdienstleistungen für Ihr Unternehmen."
                            )}
                        </div>

                        <div className="contact-details">
                            {displayPhone && (
                                <div className="contact-detail-item">
                                    <div className="contact-icon-box">
                                        <FaPhoneAlt className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3>
                                            {t(
                                                "contact.phone_label",
                                                "Telefon"
                                            )}
                                        </h3>
                                        {/* <p> -> <div> */}
                                        <div className="text-gray-600 dark:text-gray-300">
                                            <a href={`tel:${phoneHref}`}>
                                                {displayPhone}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {displayEmail && (
                                <div className="contact-detail-item">
                                    <div className="contact-icon-box">
                                        <FaEnvelope className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3>
                                            {t("contact.email_label", "E-Mail")}
                                        </h3>
                                        <div className="text-gray-600 dark:text-gray-300">
                                            <a href={`mailto:${displayEmail}`}>
                                                {displayEmail}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {displayAddress && (
                                <div className="contact-detail-item">
                                    <div className="contact-icon-box">
                                        <FaMapMarkerAlt className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3>
                                            {t(
                                                "contact.address_label",
                                                "Adresse"
                                            )}
                                        </h3>

                                        <div className="text-gray-600 dark:text-gray-300">
                                            <SafeHtml
                                                html={displayAddress.replace(
                                                    /\n/g,
                                                    "<br/>"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="contact-form"
                        noValidate
                    >
                        <div className="form-grid">
                            {fields.map((f, index) => {
                                const fieldError = errors[f.name];
                                const labelText = getFieldLabel(f, index);
                                const inputId = f.name || `field-${index}`;

                                const isPhoneField =
                                    f.type === "tel" ||
                                    String(f.label)
                                        .toLowerCase()
                                        .includes("phone") ||
                                    String(f.label)
                                        .toLowerCase()
                                        .includes("telefon");
                                const isNameField =
                                    f.name === "name" ||
                                    String(f.label)
                                        .toLowerCase()
                                        .includes("name") ||
                                    String(f.label)
                                        .toLowerCase()
                                        .includes("isim") ||
                                    String(f.label)
                                        .toLowerCase()
                                        .includes("ad");

                                return (
                                    <div
                                        key={inputId}
                                        className={`form-group ${
                                            f.type === "textarea"
                                                ? "full-width"
                                                : ""
                                        }`}
                                    >
                                        <label htmlFor={inputId}>
                                            {labelText} {f.required && "*"}
                                        </label>

                                        {f.type === "textarea" ? (
                                            <textarea
                                                id={inputId}
                                                name={f.name}
                                                rows="5"
                                                value={data[f.name] || ""}
                                                onChange={(e) =>
                                                    setField(
                                                        f.name,
                                                        e.target.value
                                                    )
                                                }
                                                className={
                                                    fieldError ? "error" : ""
                                                }
                                                disabled={showSuccessModal}
                                            />
                                        ) : (
                                            <input
                                                id={inputId}
                                                type={f.type}
                                                name={f.name}
                                                value={data[f.name] || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (isPhoneField) {
                                                        if (
                                                            /^[0-9+\-()\s]*$/.test(
                                                                val
                                                            )
                                                        )
                                                            setField(
                                                                f.name,
                                                                val
                                                            );
                                                    } else if (isNameField) {
                                                        if (
                                                            /^[^0-9]*$/.test(
                                                                val
                                                            )
                                                        )
                                                            setField(
                                                                f.name,
                                                                val
                                                            );
                                                    } else {
                                                        setField(f.name, val);
                                                    }
                                                }}
                                                className={
                                                    fieldError ? "error" : ""
                                                }
                                                disabled={showSuccessModal}
                                            />
                                        )}
                                        {fieldError && (
                                            <span className="error-message">
                                                {fieldError}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {(errors.general ||
                            (Object.keys(errors).length > 0 &&
                                !fields.some((f) => errors[f.name]))) && (
                            <div className="error-message general-error mb-4">
                                {errors.general ||
                                    "Lütfen formdaki hataları kontrol edin."}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="submit-button bg-button"
                            disabled={isSubmitting || showSuccessModal}
                        >
                            {isSubmitting ? (
                                "..."
                            ) : (
                                <SafeHtml html={submitLabelHtml} as="span" />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
