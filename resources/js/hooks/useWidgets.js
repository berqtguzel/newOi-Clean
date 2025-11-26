// useWidgets.js
import { useState, useEffect } from "react";
import {
    getWhatsappWidget,
    getRatingsWidget,
    getServiceHighlightsWidget,
} from "../services/widgetsService";

const normalizeWidget = (widget) => {
    if (!widget) return [];

    if (Array.isArray(widget)) return widget;
    if (Array.isArray(widget.data)) return widget.data;
    if (Array.isArray(widget.items)) return widget.items;
    if (Array.isArray(widget.services)) return widget.services;
    if (Array.isArray(widget.highlights)) return widget.highlights;

    return [];
};

const useWidgets = ({ tenant, locale = "de", enabled = true } = {}) => {
    const [resolvedLocale, setResolvedLocale] = useState(locale);

    const [widgets, setWidgets] = useState({
        whatsapp: [],
        ratings: [],
        highlights: [],
    });

    const [loading, setLoading] = useState(Boolean(enabled));
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        if (!tenant) {
            const err = "❌ Tenant parametresi eksik!";
            console.error(err);
            setError(err);
            setLoading(false);
            return;
        }

        let cancelled = false;

        const fetchWidgets = async () => {
            setLoading(true);
            try {
                const [whatsapp, ratings, highlights] = await Promise.all([
                    getWhatsappWidget(tenant, resolvedLocale),
                    getRatingsWidget(tenant, resolvedLocale),
                    getServiceHighlightsWidget(tenant, resolvedLocale),
                ]);

                // API locale fallback detection
                const meta =
                    highlights?._meta ||
                    whatsapp?._meta ||
                    ratings?._meta;

                if (
                    meta &&
                    meta.current_language &&
                    meta.current_language !== resolvedLocale
                ) {
                    console.warn(
                        `🌍 Locale fallback detected: ${resolvedLocale} → ${meta.current_language}`
                    );

                    setResolvedLocale(meta.current_language);
                    return; // Yeni locale ile tekrar fetch tetiklenecek
                }

                if (cancelled) return;

                const normalized = {
                    whatsapp: normalizeWidget(whatsapp),
                    ratings: normalizeWidget(ratings),
                    highlights: normalizeWidget(highlights),
                };

                console.log("📌 Widgets Fetched:", normalized);

                setWidgets(normalized);
                setError(null);
            } catch (err) {
                if (cancelled) return;
                console.error("❌ useWidgets error:", err);
                setError(err?.message || "API Hatası");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchWidgets();

        return () => {
            cancelled = true;
        };
    }, [tenant, resolvedLocale, enabled]);

    return { widgets, loading, error };
};

export default useWidgets;
