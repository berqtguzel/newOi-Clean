// resources/js/Components/Home/QuoteModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import "../../../css/quote-modal.css";

export default function QuoteModal() {
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [ok, setOk] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
        consent: false,
    });

    const dialogRef = useRef(null);
    const openerRef = useRef(null);

    useEffect(() => {
        const openHandler = () => {
            openerRef.current = document.activeElement;
            setOpen(true);
        };
        window.addEventListener("open-quote-modal", openHandler);
        return () =>
            window.removeEventListener("open-quote-modal", openHandler);
    }, []);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") close();

            if (e.key === "Tab" && dialogRef.current) {
                const focusables = dialogRef.current.querySelectorAll(
                    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
                );
                const list = Array.from(focusables);
                if (!list.length) return;
                const first = list[0];
                const last = list[list.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const close = () => {
        setOpen(false);
        setSubmitting(false);
        setOk(false);

        if (openerRef.current && openerRef.current.focus) {
            openerRef.current.focus();
        }
    };

    const onChange = (e) => {
        const { name, type, value, checked } = e.target;
        setForm((f) => ({
            ...f,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!form.consent) {
            alert(
                t(
                    "quote_modal.error_consent",
                    "Bitte stimmen Sie der Datenverarbeitung zu."
                )
            );
            return;
        }
        setSubmitting(true);

        router.post(
            "/contact",
            {
                name: form.name,
                email: form.email,
                phone: form.phone,
                subject:
                    t("quote_modal.subject_prefix", "Angebotsanfrage") +
                    " - " +
                    (form.service ||
                        t("quote_modal.service_general", "Allgemein")),
                message: form.message,
                service: form.service,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOk(true);
                    setSubmitting(false);
                },
                onError: () => {
                    setSubmitting(false);
                    alert(
                        t(
                            "quote_modal.error_generic",
                            "Etwas ist schiefgelaufen. Bitte erneut versuchen."
                        )
                    );
                },
            }
        );
    };

    if (!open) return null;

    return createPortal(
        <div className="qdock">
            <button
                className="qdock__scrim"
                aria-label={t("quote_modal.scrim_aria", "Modal schließen")}
                onClick={close}
            />

            <div
                className="qdock__dialog qdock-anim-in"
                role="dialog"
                aria-modal="true"
                aria-labelledby="quote-title"
                ref={dialogRef}
            >
                <div className="qdock__head">
                    <h2 id="quote-title" className="qdock__title">
                        {t("quote_modal.title", "Angebot anfordern")}
                    </h2>
                    <button
                        className="qdock__close"
                        aria-label={t("quote_modal.close_aria", "Schließen")}
                        onClick={close}
                    >
                        ×
                    </button>
                </div>

                {!ok ? (
                    <form className="qdock__form" onSubmit={onSubmit}>
                        <div className="qdock__grid">
                            <label className="qdock__field">
                                <span>
                                    {t("quote_modal.field_name", "Name")}*
                                </span>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={onChange}
                                    autoFocus
                                />
                            </label>

                            <label className="qdock__field">
                                <span>
                                    {t("quote_modal.field_email", "E-Mail")}*
                                </span>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={onChange}
                                />
                            </label>

                            <label className="qdock__field">
                                <span>
                                    {t("quote_modal.field_phone", "Telefon")}
                                </span>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={onChange}
                                />
                            </label>

                            <label className="qdock__field">
                                <span>
                                    {t("quote_modal.field_service", "Leistung")}
                                </span>
                                <select
                                    name="service"
                                    value={form.service}
                                    onChange={onChange}
                                >
                                    <option value="">
                                        {t(
                                            "quote_modal.service_placeholder",
                                            "Bitte wählen…"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_hotel_cleaning",
                                            "Hotelreinigung"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_building_cleaning",
                                            "Gebäudereinigung"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_window_cleaning",
                                            "Fenster/Glasreinigung"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_maintenance_cleaning",
                                            "Unterhaltsreinigung"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_basic_cleaning",
                                            "Grundreinigung"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_carpet_cleaning",
                                            "Teppichreinigung"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_other",
                                            "Sonstiges"
                                        )}
                                    </option>
                                </select>
                            </label>
                        </div>

                        <label className="qdock__field">
                            <span>
                                {t("quote_modal.field_message", "Nachricht")}
                            </span>
                            <textarea
                                name="message"
                                rows={4}
                                placeholder={t(
                                    "quote_modal.message_placeholder",
                                    "Was dürfen wir für Sie tun?"
                                )}
                                value={form.message}
                                onChange={onChange}
                            />
                        </label>

                        <label className="qdock__check">
                            <input
                                type="checkbox"
                                name="consent"
                                checked={form.consent}
                                onChange={onChange}
                                required
                            />
                            <span>
                                {t(
                                    "quote_modal.consent_prefix",
                                    "Ich stimme der Verarbeitung meiner Daten gemäß "
                                )}
                                <a
                                    href="/datenschutz"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {t(
                                        "quote_modal.consent_link",
                                        "Datenschutzhinweisen"
                                    )}
                                </a>{" "}
                                {t("quote_modal.consent_suffix", "zu.")}
                            </span>
                        </label>

                        <div className="qdock__actions">
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={close}
                                disabled={submitting}
                            >
                                {t("quote_modal.cancel", "Abbrechen")}
                            </button>
                            <button
                                type="submit"
                                className="btn btn--primary"
                                disabled={submitting}
                            >
                                {submitting
                                    ? t("quote_modal.sending", "Senden…")
                                    : t("quote_modal.submit", "Anfordern")}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="qdock__ok">
                        <div className="qdock__ok-badge" aria-hidden>
                            ✓
                        </div>
                        <h3>
                            {t("quote_modal.thank_you_title", "Vielen Dank!")}
                        </h3>
                        <p>
                            {t(
                                "quote_modal.thank_you_text",
                                "Wir haben Ihre Anfrage erhalten und melden uns zeitnah bei Ihnen."
                            )}
                        </p>
                        <button className="btn btn--primary" onClick={close}>
                            {t("quote_modal.close_button", "Schließen")}
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
