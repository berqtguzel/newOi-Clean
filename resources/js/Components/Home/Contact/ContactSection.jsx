import React, { useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import { useContactForms } from "@/hooks/useContactForms";
import { submitContactForm } from "@/services/contactService";
import { useLocale } from "@/hooks/useLocale";
import "../../../../css/ContactSection.css";
import DotGrid from "@/Components/ReactBits/Backgrounds/DotGrid";

const ContactSection = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({});
    const processing = isSubmitting;

    const { props } = usePage();
    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";
    const locale = useLocale("de");
    const { forms } = useContactForms({ tenantId, locale });
    const form = forms[0];

    const fields = useMemo(
        () => (Array.isArray(form?.fields) ? form.fields : []),
        [form]
    );

    const setField = (name, value) =>
        setData((prev) => ({ ...prev, [name]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        const payload = { ...data };
        submitContactForm({ formId: form?.id, payload, tenantId, locale })
            .then(() => {
                setData({});
            })
            .catch((err) => {
                const msg =
                    err?.response?.data?.errors ||
                    { general: err?.message || "Gönderilemedi" };
                setErrors(msg);
            })
            .finally(() => setIsSubmitting(false));
    };

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
                        <h2 className="contact-title">Kontaktieren Sie uns</h2>
                        <p className="contact-description">
                            Professionelle Reinigungsdienstleistungen für Ihr
                            Unternehmen. Wir beraten Sie gerne persönlich.
                        </p>

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
                                    <h3>Telefon</h3>
                                    <p>
                                        <a href="tel:+4912345678900">
                                            +49 (0) 1234 567 89 00
                                        </a>
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
                                    <h3>E-Mail</h3>
                                    <p>
                                        <a href="mailto:info@oi-clean.de">
                                            info@oi-clean.de
                                        </a>
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
                                    <h3>Adresse</h3>
                                    <p>
                                        Musterstraße 123
                                        <br />
                                        12345 Berlin
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="contact-hours">
                            <h3>Öffnungszeiten</h3>
                            <p>Mo. - Fr.: 08:00 - 17:00 Uhr</p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="contact-form"
                        noValidate
                    >
                        <div className="form-grid">
                            {fields.map((f) => {
                                const common = {
                                    id: f.name,
                                    name: f.name,
                                    required: f.required,
                                    value: data[f.name] || "",
                                    onChange: (e) => setField(f.name, e.target.value),
                                    className: errors[f.name] ? "error" : "",
                                    "aria-invalid": !!errors[f.name],
                                    "aria-describedby": errors[f.name] ? `${f.name}-error` : undefined,
                                    placeholder: f.placeholder || "",
                                };
                                return (
                                    <div key={f.name} className={`form-group ${f.type === "textarea" ? "full-width" : ""}`}>
                                        <label htmlFor={f.name}>
                                            {f.label} {f.required ? "*" : ""}
                                        </label>
                                        {f.type === "textarea" ? (
                                            <textarea rows="5" {...common} />
                                        ) : f.type === "select" ? (
                                            <select {...common}>
                                                <option value="">Bitte wählen</option>
                                                {(f.options || []).map((o, i) => (
                                                    <option key={i} value={o?.value || o}>{o?.label || o}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input type={f.type || "text"} {...common} />
                                        )}
                                        {errors[f.name] && (
                                            <span id={`${f.name}-error`} className="error-message" role="alert">
                                                {errors[f.name]}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="submit"
                            className="submit-button bg-button"
                            disabled={processing || isSubmitting}
                        >
                            {processing ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                "Nachricht senden"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
