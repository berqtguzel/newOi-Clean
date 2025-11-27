import React, { useEffect, useState, useMemo } from "react";
import { Head, Link, usePage as useInertiaPage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import "../../../css/404.css";
import { fetchPageBySlug } from "@/services/pageService";
import AppLayout from "@/Layouts/AppLayout";

const DEFAULT_404_TITLE = "404 — Seite nicht gefunden";
const DEFAULT_404_DESC =
    "Entschuldigung, die gesuchte Seite wurde nicht gefunden. Bitte überprüfen Sie die URL oder kehren Sie zur Startseite zurück.";

const DEFAULT_500_TITLE = "500 — Serverfehler";
const DEFAULT_500_DESC =
    "Auf unserem Server ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.";

export default function NotFound() {
    const { t } = useTranslation();
    const { props, url } = useInertiaPage();

    const status = props?.status || 404;
    const is500 = status >= 500;
    const slug = is500 ? "500" : "404";

    const [page, setPage] = useState(null);

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.tenantId ||
        "default-tenant-id";
    const locale = props?.locale || "de";

    React.useEffect(() => {
        if (is500 || page) {
            return;
        }

        fetchPageBySlug(slug, { tenantId, locale })
            .then((res) => {
                setPage(res.page || null);
            })
            .catch((error) => {
                console.error(
                    `[NotFound API Error] API'den sayfa çekilemedi (${slug}):`,
                    error
                );
                setPage(null);
            });
    }, [slug, tenantId, locale, is500]);

    const text = (key) => {
        const i18nKey = `errors.${slug}.${key}`;

        let defaultText = DEFAULT_404_TITLE;
        if (slug === "500") {
            defaultText = DEFAULT_500_TITLE;
        }

        if (key === "desc") {
            defaultText = slug === "500" ? DEFAULT_500_DESC : DEFAULT_404_DESC;
        } else if (key === "ctaHome") {
            defaultText = t("errors.ctaHome", "Ana Sayfaya Dön");
        } else if (key === "ctaContact") {
            defaultText =
                slug === "500"
                    ? t("errors.ctaSupport", "Destek ile İletişim")
                    : t("errors.ctaContact", "İletişime Geç");
        } else if (key === "hint") {
            defaultText =
                slug === "500"
                    ? t("errors.hint500", "Biz sorun üzerinde çalışıyoruz.")
                    : t(
                          "errors.hint404",
                          "İpucu: Lütfen URL'yi gözden geçirin."
                      );
        }

        return page?.[key] || t(i18nKey, defaultText);
    };

    const title = text("title");
    const desc = page?.content || text("desc");
    const ctaHome = text("ctaHome");
    const ctaContact = text("ctaContact");
    const hint = text("hint");

    const content = (
        <div className="oi-404-page min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Head>
                <title>{title}</title>
            </Head>
            <main className="oi-404__card max-w-lg w-full p-8 space-y-6 text-center rounded-lg shadow-xl dark:bg-gray-800">
                <div className="oi-404__content space-y-4">
                    <h1 className="oi-404__title text-5xl font-extrabold text-red-600 dark:text-red-400">
                        {status}
                    </h1>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {title}
                    </h2>
                    <p className="oi-404__desc text-gray-600 dark:text-gray-400">
                        {desc}
                    </p>

                    <div className="oi-404__actions pt-4 space-x-4">
                        <Link
                            href="/"
                            className="oi-btn oi-btn--primary inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {ctaHome}
                        </Link>

                        {!is500 && (
                            <Link
                                href="/kontakt"
                                className="oi-btn oi-btn--ghost inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                {ctaContact}
                            </Link>
                        )}

                        {is500 && (
                            <button
                                className="oi-btn oi-btn--ghost inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                onClick={() => window.location.reload()}
                            >
                                {t("errors.reload", "Seite neu laden")}
                            </button>
                        )}
                    </div>

                    <small className="oi-404__hint block pt-2 text-xs text-gray-400 dark:text-gray-500">
                        {hint}
                    </small>
                </div>
            </main>
        </div>
    );

    return <AppLayout>{content}</AppLayout>;
}
