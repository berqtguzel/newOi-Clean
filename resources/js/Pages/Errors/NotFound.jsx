import React from "react";
import { Head, Link } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import "../../../css/404.css";

export default function NotFound() {
    const { t } = useTranslation();
    return (
        <div className="oi-404-page min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Head>
                <title>{t("errors.notFound.title")}</title>
            </Head>

            <main className="oi-404__card">
                <div className="oi-404__illustration" aria-hidden>
                    {/* simple SVG illustration */}
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
                    <h1 className="oi-404__title">
                        {t("errors.notFound.title")}
                    </h1>
                    <p className="oi-404__desc">{t("errors.notFound.desc")}</p>

                    <div className="oi-404__actions">
                        <Link href="/" className="oi-btn oi-btn--primary">
                            {t("errors.notFound.cta_home")}
                        </Link>
                        <Link href="/kontakt" className="oi-btn oi-btn--ghost">
                            {t("errors.notFound.cta_contact")}
                        </Link>
                    </div>

                    <small className="oi-404__hint">
                        {t("errors.notFound.hint")}
                    </small>
                </div>
            </main>
        </div>
    );
}
