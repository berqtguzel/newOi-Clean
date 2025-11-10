import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import "../../../../css/ContactSection.css";
import DotGrid from "@/Components/ReactBits/Backgrounds/DotGrid";

const ContactSection = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        message: "",
        serviceType: "",
        acceptTerms: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        post("/contact", {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
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
                            <div className="form-group">
                                <label htmlFor="name">Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    required
                                    className={errors.name ? "error" : ""}
                                    aria-invalid={!!errors.name}
                                    aria-describedby={
                                        errors.name ? "name-error" : undefined
                                    }
                                />
                                {errors.name && (
                                    <span
                                        id="name-error"
                                        className="error-message"
                                        role="alert"
                                    >
                                        {errors.name}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="company">Unternehmen</label>
                                <input
                                    type="text"
                                    id="company"
                                    value={data.company}
                                    onChange={(e) =>
                                        setData("company", e.target.value)
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">E-Mail *</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    required
                                    className={errors.email ? "error" : ""}
                                    aria-invalid={!!errors.email}
                                    aria-describedby={
                                        errors.email ? "email-error" : undefined
                                    }
                                />
                                {errors.email && (
                                    <span
                                        id="email-error"
                                        className="error-message"
                                        role="alert"
                                    >
                                        {errors.email}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Telefon</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData("phone", e.target.value)
                                    }
                                />
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="serviceType">
                                    Gewünschte Dienstleistung
                                </label>
                                <select
                                    id="serviceType"
                                    value={data.serviceType}
                                    onChange={(e) =>
                                        setData("serviceType", e.target.value)
                                    }
                                >
                                    <option value="">Bitte wählen</option>
                                    <option value="building">
                                        Gebäudereinigung
                                    </option>
                                    <option value="window">
                                        Fensterreinigung
                                    </option>
                                    <option value="floor">
                                        Bodenreinigung
                                    </option>
                                    <option value="special">
                                        Sonderreinigung
                                    </option>
                                    <option value="industrial">
                                        Industriereinigung
                                    </option>
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="message">
                                    Ihre Nachricht *
                                </label>
                                <textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) =>
                                        setData("message", e.target.value)
                                    }
                                    required
                                    rows="5"
                                    className={errors.message ? "error" : ""}
                                    aria-invalid={!!errors.message}
                                    aria-describedby={
                                        errors.message
                                            ? "message-error"
                                            : undefined
                                    }
                                />
                                {errors.message && (
                                    <span
                                        id="message-error"
                                        className="error-message"
                                        role="alert"
                                    >
                                        {errors.message}
                                    </span>
                                )}
                            </div>

                            <div className="form-group full-width">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={data.acceptTerms}
                                        onChange={(e) =>
                                            setData(
                                                "acceptTerms",
                                                e.target.checked
                                            )
                                        }
                                        required
                                    />
                                    <span>
                                        Ich akzeptiere die{" "}
                                        <a
                                            href="/datenschutz"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Datenschutzerklärung
                                        </a>{" "}
                                        *
                                    </span>
                                </label>
                                {errors.acceptTerms && (
                                    <span
                                        className="error-message"
                                        role="alert"
                                    >
                                        {errors.acceptTerms}
                                    </span>
                                )}
                            </div>
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
