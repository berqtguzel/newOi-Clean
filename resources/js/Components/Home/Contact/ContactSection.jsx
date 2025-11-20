import React, { useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { useContactForms } from "@/hooks/useContactForms";
import { submitContactForm } from "@/services/contactService";
import { useLocale } from "@/hooks/useLocale";
import "../../../../css/ContactSection.css";
import DotGrid from "@/Components/ReactBits/Backgrounds/DotGrid";
import SafeHtml from "@/Components/Common/SafeHtml";

const ContactSection = () => {
    const { t } = useTranslation();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({});

    const { props } = usePage();
    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";

    const locale = useLocale("de");

    const { forms } = useContactForms({ tenantId, locale });
    const form = forms?.[0];

    const fields = useMemo(
        () => (Array.isArray(form?.fields) ? form.fields : []),
        [form]
    );

    const processing = isSubmitting;

    const setField = (name, value) =>
        setData((prev) => ({ ...prev, [name]: value }));

    const getFieldLabel = (field, index) => {
        const type = String(field.type || "").toLowerCase();
        const raw = String(field.name || field.label || "").toLowerCase();

        if (raw.includes("name") || (type === "text" && index === 0)) {
            return t("contact.form.name", "Name");
        }

        if (raw.includes("phone") || raw.includes("tel") || type === "tel") {
            return t("contact.form.phone", "Telefon");
        }

        if (raw.includes("mail") || type === "email") {
            return t("contact.form.email", "E-Mail");
        }

        if (
            raw.includes("message") ||
            raw.includes("nachricht") ||
            type === "textarea"
        ) {
            return t("contact.form.message", "Nachricht");
        }

        return t("contact.form.other", "Feld");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form) return;

        setIsSubmitting(true);
        setErrors({});

        const payload = {};
        fields.forEach((f) => {
            if (!f.name) return;
            payload[f.name] = data[f.name] ?? "";
        });

        submitContactForm({ formId: form.id, payload, tenantId, locale })
            .then(() => {
                console.log("Contact form başarıyla gönderildi:", {
                    formId: form.id,
                    payload,
                    locale,
                    tenantId,
                });
                setData({});
            })
            .catch((err) => {
                const backendErrors = err?.response?.data?.errors;
                let normalized = {};

                if (backendErrors && typeof backendErrors === "object") {
                    Object.entries(backendErrors).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            normalized[key] = value[0];
                        } else if (typeof value === "string") {
                            normalized[key] = value;
                        }
                    });
                } else {
                    normalized = {
                        general:
                            err?.message ||
                            t(
                                "contact.submit_failed",
                                "Nachricht konnte nicht gesendet werden."
                            ),
                    };
                }

                setErrors(normalized);
            })
            .finally(() => setIsSubmitting(false));
    };

    const titleHtml = form?.title || t("contact.title", "Kontaktieren Sie uns");

    const descriptionHtml =
        form?.description ||
        t(
            "contact.description",
            "Professionelle Reinigungsdienstleistungen für Ihr Unternehmen. Wir beraten Sie gerne persönlich."
        );

    const submitLabelHtml =
        form?.submit_label ||
        form?.submitLabel ||
        t("contact.submit_label", "Nachricht senden");

    const selectPlaceholder = t("contact.select_placeholder", "Bitte wählen");

    const phoneLabel = t("contact.phone_label", "Telefon");
    const emailLabel = t("contact.email_label", "E-Mail");
    const addressLabel = t("contact.address_label", "Adresse");
    const hoursLabel = t("contact.hours_label", "Öffnungszeiten");
    const hoursValue = t("contact.hours_value", "Mo. - Fr.: 08:00 - 17:00 Uhr");

    const phoneNumber = t("contact.phone_number", "+49 (0)36874 38 55 67");
    const phoneHref = `tel:${phoneNumber.replace(/\s+/g, "")}`;

    const emailAddress = t("contact.email_address", "info@oi-clean.de");
    const emailHref = `mailto:${emailAddress}`;

    const streetHtml = t("contact.address_street", "Musterstraße 123");
    const cityHtml = t("contact.address_city", "12345 Berlin");

    return (
        <section className="contact-section rbits-section" id="contact">
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
                            <SafeHtml html={titleHtml} as="span" />
                        </h2>

                        <SafeHtml
                            html={descriptionHtml}
                            as="p"
                            className="contact-description"
                        />

                        <div className="contact-details">
                            <div className="contact-detail-item">
                                <svg
                                    className="contact-icon"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                </svg>
                                <div>
                                    <h3>{phoneLabel}</h3>
                                    <p>
                                        <a href={phoneHref}>{phoneNumber}</a>
                                    </p>
                                </div>
                            </div>

                            <div className="contact-detail-item">
                                <svg
                                    className="contact-icon"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                <div>
                                    <h3>{emailLabel}</h3>
                                    <p>
                                        <a href={emailHref}>{emailAddress}</a>
                                    </p>
                                </div>
                            </div>

                            <div className="contact-detail-item">
                                <svg
                                    className="contact-icon"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <div>
                                    <h3>{addressLabel}</h3>
                                    <p>
                                        <SafeHtml html={streetHtml} />
                                        <br />
                                        <SafeHtml html={cityHtml} />
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="contact-hours">
                            <h3>{hoursLabel}</h3>
                            <p>{hoursValue}</p>
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

                                const common = {
                                    id: f.name || `field-${index}`,
                                    name: f.name || `field_${index}`,
                                    required: f.required,
                                    value: data[f.name] || "",
                                    onChange: (e) =>
                                        setField(
                                            f.name || `field_${index}`,
                                            e.target.value
                                        ),
                                    className: fieldError ? "error" : "",
                                    "aria-invalid": !!fieldError,
                                    "aria-describedby": fieldError
                                        ? `${f.name}-error`
                                        : undefined,
                                    placeholder: f.placeholder || "",
                                };

                                return (
                                    <div
                                        key={f.name || index}
                                        className={`form-group ${
                                            f.type === "textarea"
                                                ? "full-width"
                                                : ""
                                        }`}
                                    >
                                        <label htmlFor={common.id}>
                                            {labelText} {f.required ? "*" : ""}
                                        </label>

                                        {f.type === "textarea" ? (
                                            <textarea rows="5" {...common} />
                                        ) : f.type === "select" ? (
                                            <select {...common}>
                                                <option value="">
                                                    {selectPlaceholder}
                                                </option>
                                                {(f.options || []).map(
                                                    (o, i) => (
                                                        <option
                                                            key={i}
                                                            value={
                                                                o?.value || o
                                                            }
                                                        >
                                                            {o?.label || o}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        ) : (
                                            <input
                                                type={f.type || "text"}
                                                {...common}
                                            />
                                        )}

                                        {fieldError && (
                                            <SafeHtml
                                                html={fieldError}
                                                as="span"
                                                id={`${f.name}-error`}
                                                className="error-message"
                                                role="alert"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="submit"
                            className="submit-button bg-button"
                            disabled={processing || !form}
                        >
                            {processing ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                <SafeHtml html={submitLabelHtml} as="span" />
                            )}
                        </button>

                        {errors.general && (
                            <SafeHtml
                                html={errors.general}
                                as="p"
                                className="error-message general-error"
                                role="alert"
                            />
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
