import React from "react";
import { Head, Link } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import "../../../css/404.css";

export default function NotFound() {
    const { t } = useTranslation();

    const [hydrated, setHydrated] = React.useState(false);

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    const serverTitle = "404 — Seite nicht gefunden";
    const serverDesc = "Die angeforderte Seite wurde nicht gefunden.";
    const serverCtaHome = "Zur Startseite";
    const serverCtaContact = "Kontakt aufnehmen";
    const serverHint =
        "Bitte überprüfen Sie die URL oder kehren Sie zur Startseite zurück.";

    const clientTitle = t("errors.notFound.title", serverTitle);
    const clientDesc = t("errors.notFound.desc", serverDesc);
    const clientCtaHome = t("errors.notFound.cta_home", serverCtaHome);
    const clientCtaContact = t("errors.notFound.cta_contact", serverCtaContact);
    const clientHint = t("errors.notFound.hint", serverHint);

    const titleToRender = hydrated ? clientTitle : serverTitle;
    const descToRender = hydrated ? clientDesc : serverDesc;
    const ctaHomeToRender = hydrated ? clientCtaHome : serverCtaHome;
    const ctaContactToRender = hydrated ? clientCtaContact : serverCtaContact;
    const hintToRender = hydrated ? clientHint : serverHint;

    return (
        <div className="oi-404-page min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Head>
                <title>{titleToRender}</title>
            </Head>

            <main className="oi-404__card">
                <div className="oi-404__illustration" aria-hidden>
                    <svg
                        width="220"
                        height="160"
                        viewBox="0 0 220 160"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="0"
                            y="0"
                            width="220"
                            height="160"
                            rx="12"
                            fill="#F1F5F9"
                        />
                        <g transform="translate(40,30)">
                            <circle cx="40" cy="40" r="34" fill="#E6EEF9" />
                            <path
                                d="M8 48 L72 48"
                                stroke="#93C5FD"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                            <rect
                                x="10"
                                y="14"
                                width="60"
                                height="6"
                                rx="3"
                                fill="#BFDBFE"
                            />
                            <rect
                                x="10"
                                y="26"
                                width="40"
                                height="6"
                                rx="3"
                                fill="#BFDBFE"
                            />
                        </g>
                    </svg>
                </div>

                <div className="oi-404__content">
                    <h1 className="oi-404__title">{titleToRender}</h1>

                    <p className="oi-404__desc">{descToRender}</p>

                    <div className="oi-404__actions">
                        <Link href="/" className="oi-btn oi-btn--primary">
                            {ctaHomeToRender}
                        </Link>
                        <Link href="/kontakt" className="oi-btn oi-btn--ghost">
                            {ctaContactToRender}
                        </Link>
                    </div>

                    <small className="oi-404__hint">{hintToRender}</small>
                </div>
            </main>
        </div>
    );
}
