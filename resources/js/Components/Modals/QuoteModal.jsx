import React, { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { createPortal } from "react-dom";
import "../../../css/quote-modal.css";

export default function QuoteModal() {
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
            alert("Bitte stimmen Sie der Datenverarbeitung zu.");
            return;
        }
        setSubmitting(true);

        router.post(
            "/contact",
            {
                name: form.name,
                email: form.email,
                phone: form.phone,
                subject: `Angebotsanfrage - ${form.service || "Allgemein"}`,
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
                    alert("Etwas ist schiefgelaufen. Bitte erneut versuchen.");
                },
            }
        );
    };

    if (!open) return null;

    return createPortal(
        <div className="qdock">
            <button
                className="qdock__scrim"
                aria-label="Modal schließen"
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
                        Angebot anfordern
                    </h2>
                    <button
                        className="qdock__close"
                        aria-label="Schließen"
                        onClick={close}
                    >
                        ×
                    </button>
                </div>

                {!ok ? (
                    <form className="qdock__form" onSubmit={onSubmit}>
                        <div className="qdock__grid">
                            <label className="qdock__field">
                                <span>Name*</span>
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
                                <span>E-Mail*</span>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={onChange}
                                />
                            </label>

                            <label className="qdock__field">
                                <span>Telefon</span>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={onChange}
                                />
                            </label>

                            <label className="qdock__field">
                                <span>Leistung</span>
                                <select
                                    name="service"
                                    value={form.service}
                                    onChange={onChange}
                                >
                                    <option value="">Bitte wählen…</option>
                                    <option>Hotelreinigung</option>
                                    <option>Gebäudereinigung</option>
                                    <option>Fenster/Glasreinigung</option>
                                    <option>Unterhaltsreinigung</option>
                                    <option>Grundreinigung</option>
                                    <option>Teppichreinigung</option>
                                    <option>Sonstiges</option>
                                </select>
                            </label>
                        </div>

                        <label className="qdock__field">
                            <span>Nachricht</span>
                            <textarea
                                name="message"
                                rows={4}
                                placeholder="Was dürfen wir für Sie tun?"
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
                                Ich stimme der Verarbeitung meiner Daten gemäß{" "}
                                <a
                                    href="/datenschutz"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Datenschutzhinweisen
                                </a>{" "}
                                zu.
                            </span>
                        </label>

                        <div className="qdock__actions">
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={close}
                                disabled={submitting}
                            >
                                Abbrechen
                            </button>
                            <button
                                type="submit"
                                className="btn btn--primary"
                                disabled={submitting}
                            >
                                {submitting ? "Senden…" : "Anfordern"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="qdock__ok">
                        <div className="qdock__ok-badge" aria-hidden>
                            ✓
                        </div>
                        <h3>Vielen Dank!</h3>
                        <p>
                            Wir haben Ihre Anfrage erhalten und melden uns
                            zeitnah bei Ihnen.
                        </p>
                        <button className="btn btn--primary" onClick={close}>
                            Schließen
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
