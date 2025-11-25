import React, { useEffect, useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { useTranslation } from "react-i18next";
import "../../../css/loading.css";

export default function Loading() {
    const { t } = useTranslation();

    // 🚨 SSR → false, Client mount sonrası → true
    const [mounted, setMounted] = useState(false);
    const [active, setActive] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Client mount olduktan hemen sonra "mounted" true olur
        setMounted(true);
    }, []);

    // Inertia event binding
    useEffect(() => {
        if (!mounted) return;

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

        return () => {
            clearTimeout(timeout);
            try {
                Inertia.off("start", onStart);
                Inertia.off("finish", onFinish);
                Inertia.off("error", onFinish);
            } catch (_) {}
        };
    }, [mounted, t]);

    // 🚨 SSR & İlk Client Render → hiçbir şey render ETME
    if (!mounted || !active) {
        return null;
    }

    // Client tarafında aktif loading UI
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
