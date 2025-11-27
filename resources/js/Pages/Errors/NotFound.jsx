import React from "react";
import { Head, Link, usePage as useInertiaPage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import "../../../css/404.css";
import { fetchPageBySlug } from "@/services/pageService";

const FALLBACK_404 = {
    title: "404 — Seite nicht gefunden",
    desc: "Die angeforderte Seite wurde nicht gefunden.",
    ctaHome: "Zur Startseite",
    ctaContact: "Kontakt aufnehmen",
    hint: "Bitte überprüfen Sie die URL.",
};

const FALLBACK_500 = {
    title: "500 — Serverfehler",
    desc: "Interner Fehler, bitte später erneut versuchen.",
    ctaHome: "Zur Startseite",
    ctaContact: "Support kontaktieren",
    hint: "Wir arbeiten an dem Problem.",
};

export default function NotFound() {
    const { t } = useTranslation();
    const { props, url } = useInertiaPage();

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "oi_cleande_690e161c3a1dd";

    const locale = props?.locale || "de";

    const is500 =
        url.includes("/500") ||
        props?.status == 500 ||
        props?.status == 503;

    const slug = is500 ? "500" : "404";
    const fallback = is500 ? FALLBACK_500 : FALLBACK_404;

    const [page, setPage] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchPageBySlug(slug, { tenantId, locale })
            .then((res) => setPage(res.page || null))
            .finally(() => setLoading(false));
    }, [slug, tenantId, locale]);

    const text = (key) =>
        page?.[key] ||
        t(`errors.${slug}.${key}`, fallback[key]);

    if (loading) {
        return (
            <div className="oi-404-page">
                <Head><title>Loading...</title></Head>
                <p>Loading…</p>
            </div>
        );
    }

    const title = text("title");
    const desc = page?.content || text("desc");

    return (
        <div className="oi-404-page min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Head><title>{title}</title></Head>

            <main className="oi-404__card">
                <div className="oi-404__content">
                    <h1 className="oi-404__title">{title}</h1>
                    <p className="oi-404__desc">{desc}</p>

                    <div className="oi-404__actions">
                        <Link href="/" className="oi-btn oi-btn--primary">
                            {text("ctaHome")}
                        </Link>

                        {!is500 && (
                            <Link href="/kontakt" className="oi-btn oi-btn--ghost">
                                {text("ctaContact")}
                            </Link>
                        )}

                        {is500 && (
                            <button className="oi-btn oi-btn--ghost" onClick={() => location.reload()}>
                                Seite neu laden
                            </button>
                        )}
                    </div>

                    <small className="oi-404__hint">{text("hint")}</small>
                </div>
            </main>
        </div>
    );
}
