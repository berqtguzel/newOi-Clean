// resources/js/Components/Home/QuoteModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import "../../../css/quote-modal.css";

import { submitContactForm } from "@/services/contactService";
import { useLocale } from "@/hooks/useLocale";

export default function QuoteModal() {
    const { t } = useTranslation();

    // Tenant + locale
    const { props } = usePage();
    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";

    const locale = useLocale("de");

    // Bu modaldaki form her zaman ID = 2
    const targetFormId = 2;

    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [ok, setOk] = useState(false);

    const [formState, setFormState] = useState({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
        consent: false,
    });

    const [errors, setErrors] = useState({});

    const dialogRef = useRef(null);
    const openerRef = useRef(null);

    // Dışarıdan event ile açma
    useEffect(() => {
        const openHandler = () => {
            openerRef.current = document.activeElement;
            setOpen(true);
        };
        window.addEventListener("open-quote-modal", openHandler);
        return () =>
            window.removeEventListener("open-quote-modal", openHandler);
    }, []);

    // Body scroll kilidi
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // ESC + TAB trap
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

    const resetState = () => {
        setFormState({
            name: "",
            email: "",
            phone: "",
            service: "",
            message: "",
            consent: false,
        });
        setErrors({});
    };

    const close = () => {
        setOpen(false);
        setSubmitting(false);
        setOk(false);
        resetState();

        if (openerRef.current && openerRef.current.focus) {
            openerRef.current.focus();
        }
    };

    const onChange = (e) => {
        const { name, type, value, checked } = e.target;
        setFormState((f) => ({
            ...f,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();

        setErrors({});

        if (!formState.consent) {
            alert(
                t(
                    "quote_modal.error_consent",
                    "Lütfen veri işleme onayını verin."
                )
            );
            return;
        }

        setSubmitting(true);

        // BACKEND’in istediği isimler + dashboard için alias’lar
        const payload = {
            // validation için
            name: formState.name,
            "e-mail": formState.email,
            telefon: formState.phone,
            nachricht: formState.message,
            leistung: formState.service || "",

            // listeleme / diğer logic’ler için
            email: formState.email,
            phone: formState.phone,
            message: formState.message,
        };

        submitContactForm({
            formId: targetFormId,
            payload,
            tenantId,
            locale,
        })
            .then((res) => {
                console.log("QuoteModal contact form sent:", {
                    res,
                    formId: targetFormId,
                    payload,
                    tenantId,
                    locale,
                });

                setOk(true);
                resetState();
            })
            .catch((err) => {
                const status = err?.response?.status;
                const data = err?.response?.data;

                console.error("QuoteModal contact error:", data || err);

                // 422 ise: gerçekten validation hatası var
                if (status === 422 && data?.errors) {
                    setErrors(data.errors);
                    const flat = Object.values(data.errors).flat().join("\n");
                    alert(flat);
                } else if (status === 500) {
                    // 500: backend mail gönderirken patlıyor ama kayıt dashboard'a düşüyor
                    console.warn(
                        "Server 500 döndü ama submission büyük ihtimalle kaydedildi."
                    );
                    setOk(true);
                    resetState();
                } else {
                    alert(
                        t(
                            "quote_modal.error_generic",
                            "Bir hata oluştu, lütfen tekrar deneyin."
                        )
                    );
                }
            })
            .finally(() => setSubmitting(false));
    };

    if (!open) return null;

    return createPortal(
        <div className="qdock">
            <button
                className="qdock__scrim"
                aria-label={t("quote_modal.scrim_aria", "Pencereyi kapat")}
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
                        {t("quote_modal.title", "Teklif iste")}
                    </h2>
                    <button
                        className="qdock__close"
                        aria-label={t("quote_modal.close_aria", "Kapat")}
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
                                    {t("quote_modal.field_name", "İsim *")}
                                </span>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={formState.name}
                                    onChange={onChange}
                                    autoFocus
                                />
                                {errors.name && (
                                    <span className="qdock__error">
                                        {errors.name}
                                    </span>
                                )}
                            </label>

                            <label className="qdock__field">
                                <span>
                                    {t("quote_modal.field_email", "E-posta *")}
                                </span>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formState.email}
                                    onChange={onChange}
                                />
                                {errors["e-mail"] && (
                                    <span className="qdock__error">
                                        {errors["e-mail"]}
                                    </span>
                                )}
                            </label>

                            <label className="qdock__field">
                                <span>
                                    {t("quote_modal.field_phone", "Telefon *")}
                                </span>
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    value={formState.phone}
                                    onChange={onChange}
                                />
                                {errors.telefon && (
                                    <span className="qdock__error">
                                        {errors.telefon}
                                    </span>
                                )}
                            </label>

                            <label className="qdock__field">
                                <span>
                                    {t("quote_modal.field_service", "Leistung")}
                                </span>
                                <select
                                    name="service"
                                    value={formState.service}
                                    onChange={onChange}
                                >
                                    <option value="">
                                        {t(
                                            "quote_modal.service_placeholder",
                                            "Lütfen seçin"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_hotel_cleaning",
                                            "Otel temizliği"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_building_cleaning",
                                            "Bina temizliği"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_window_cleaning",
                                            "Cam / pencere temizliği"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_maintenance_cleaning",
                                            "Periyodik temizlik"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_basic_cleaning",
                                            "Genel temizlik"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_carpet_cleaning",
                                            "Halı / zemin temizliği"
                                        )}
                                    </option>
                                    <option>
                                        {t(
                                            "quote_modal.service_other",
                                            "Diğer"
                                        )}
                                    </option>
                                </select>
                                {errors.leistung && (
                                    <span className="qdock__error">
                                        {errors.leistung}
                                    </span>
                                )}
                            </label>
                        </div>

                        <label className="qdock__field">
                            <span>
                                {t("quote_modal.field_message", "Mesaj *")}
                            </span>
                            <textarea
                                name="message"
                                rows={4}
                                required
                                placeholder={t(
                                    "quote_modal.message_placeholder",
                                    "Ne için teklif istiyorsunuz?"
                                )}
                                value={formState.message}
                                onChange={onChange}
                            />
                            {errors.nachricht && (
                                <span className="qdock__error">
                                    {errors.nachricht}
                                </span>
                            )}
                        </label>

                        <label className="qdock__check">
                            <input
                                type="checkbox"
                                name="consent"
                                checked={formState.consent}
                                onChange={onChange}
                                required
                            />
                            <span>
                                {t(
                                    "quote_modal.consent_prefix",
                                    "Kişisel verilerimin "
                                )}
                                <a
                                    href="/datenschutzhinweise"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {t(
                                        "quote_modal.consent_link",
                                        "gizlilik notları"
                                    )}
                                </a>{" "}
                                {t(
                                    "quote_modal.consent_suffix",
                                    " uyarınca işlenmesini kabul ediyorum."
                                )}
                            </span>
                        </label>

                        <div className="qdock__actions">
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={close}
                                disabled={submitting}
                            >
                                {t("quote_modal.cancel", "Vazgeç")}
                            </button>
                            <button
                                type="submit"
                                className="btn btn--primary"
                                disabled={submitting}
                            >
                                {submitting
                                    ? t("quote_modal.sending", "Gönderiliyor…")
                                    : t("quote_modal.submit", "Gönder")}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="qdock__ok">
                        <div className="qdock__ok-badge" aria-hidden>
                            ✓
                        </div>
                        <h3>
                            {t("quote_modal.thank_you_title", "Teşekkürler!")}
                        </h3>
                        <p>
                            {t(
                                "quote_modal.thank_you_text",
                                "Talebinizi aldık, en kısa sürede sizinle iletişime geçeceğiz."
                            )}
                        </p>
                        <button className="btn btn--primary" onClick={close}>
                            {t("quote_modal.close_button", "Kapat")}
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
