import React, { useEffect, useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { useTranslation } from "react-i18next";
import "../../../css/loading.css";

export default function Loading() {
    const { t } = useTranslation();
    const [active, setActive] = useState(false);
    const [message, setMessage] = useState(t("ui.loading.message") || "");

    useEffect(() => {
        let timeout = null;

        function onStart() {
            timeout = setTimeout(() => setActive(true), 120);
            setMessage(t("ui.loading.message") || "");
        }

        function onFinish() {
            clearTimeout(timeout);
            setActive(false);
        }

        Inertia.on("start", onStart);
        Inertia.on("finish", onFinish);
        Inertia.on("error", onFinish);

        if (document.readyState !== "complete") {
            setActive(true);
            const t = setTimeout(() => setActive(false), 700);
            return () => clearTimeout(t);
        }

        return () => {
            clearTimeout(timeout);
            try {
                if (typeof Inertia.off === "function") {
                    Inertia.off("start", onStart);
                    Inertia.off("finish", onFinish);
                    Inertia.off("error", onFinish);
                } else if (
                    Inertia.events &&
                    typeof Inertia.events.off === "function"
                ) {
                    Inertia.events.off("start", onStart);
                    Inertia.events.off("finish", onFinish);
                    Inertia.events.off("error", onFinish);
                }
            } catch (e) {}
        };
    }, []);

    if (!active) return null;

    return (
        <div className="oi-loading" role="status" aria-live="polite">
            <div className="oi-loading__backdrop" />
            <div className="oi-loading__panel">
                <div className="oi-loading__spinner" aria-hidden />
                <div className="oi-loading__text">{message}</div>
            </div>
        </div>
    );
}
