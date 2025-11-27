import React, { useEffect } from "react";
import { applyCssVars, upsertMeta, upsertLink } from "../lib/domUtils";

function applyBrandingColors(settings) {
    const c =
        settings?.colors?.data ||
        settings?.colors ||
        settings?.branding?.colors ||
        {};

    const map = {
        "--site-primary-color": c.site_primary_color || "#2563eb",
        "--site-secondary-color": c.site_secondary_color || "#6c757d",
        "--site-accent-color": c.site_accent_color || "#f59e0b",
        "--button-color": c.button_color || "#2563eb",
        "--text-color": c.text_color || "#111827",
        "--link-color": c.link_color || "#2563eb",
        "--background-color": c.background_color || "#ffffff",
        "--header-background-color": c.header_background_color || "#ffffff",
        "--footer-background-color": c.footer_background_color || "#f8f9fa",
        "--h1-color": c.h1_color || "#000000",
        "--h2-color": c.h2_color || "#000000",
        "--h3-color": c.h3_color || "#000000",
    };

    const root = document.documentElement;
    Object.entries(map).forEach(([key, value]) => {
        if (!value) return;
        root.style.setProperty(key, value);
    });
}

function applySeo(settings) {
    const seo = settings?.seo?.data || settings?.seo || {};

    if (seo.meta_title) document.title = seo.meta_title;
    if (seo.meta_description)
        upsertMeta("name", "description", seo.meta_description);
    if (seo.meta_keywords) upsertMeta("name", "keywords", seo.meta_keywords);

    if (seo.og_title) upsertMeta("property", "og:title", seo.og_title);
    if (seo.og_description)
        upsertMeta("property", "og:description", seo.og_description);
    if (seo.og_image) upsertMeta("property", "og:image", seo.og_image);
}

export default function SettingsInjector({ settings }) {
    const seoLinks =
        settings?.seo_links ||
        settings?.seoHiddenLinks ||
        settings?.seo?.links ||
        [];

    useEffect(() => {
        if (!settings) return;
        if (typeof window === "undefined") return;

        try {
            applyBrandingColors(settings);
            applySeo(settings);
        } catch (err) {
            console.warn("⚠ SettingsInjector Error:", err);
        }
    }, [settings]);

    return null;
}
