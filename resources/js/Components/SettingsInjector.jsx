import React, { useEffect } from "react";
import {
    applyCssVars,
    upsertMeta,
    upsertLink,
    injectScript,
    injectHtml,
} from "../lib/domUtils";

function applyBrandingColors(settings) {
    const b = settings?.branding || settings?.general || {};
    const map = {
        "site-primary-color": b.primary_color,
        "site-secondary-color": b.secondary_color,
        "site-accent-color": b.accent_color,
        "button-color": b.button_color,
        "link-color": b.link_color,
        "text-color": b.text_color,
        "background-color": b.background_color,
        "header-background-color": b.header_background_color,
        "footer-background-color": b.footer_background_color,
        "h1-color": b.h1_color,
        "h2-color": b.h2_color,
        "h3-color": b.h3_color,
    };
    applyCssVars(map);
}

function applySeo(settings) {
    const seo = settings?.seo || {};
    if (seo.title) document.title = seo.title;
    if (seo.description) upsertMeta("name", "description", seo.description);
    if (seo.keywords) upsertMeta("name", "keywords", seo.keywords);
    if (seo.og_title) upsertMeta("property", "og:title", seo.og_title);
    if (seo.og_description)
        upsertMeta("property", "og:description", seo.og_description);
    if (seo.og_image) upsertMeta("property", "og:image", seo.og_image);
    if (seo.og_site_name)
        upsertMeta("property", "og:site_name", seo.og_site_name);
    if (seo.twitter_card) upsertMeta("name", "twitter:card", seo.twitter_card);
    if (seo.twitter_site) upsertMeta("name", "twitter:site", seo.twitter_site);
}

function applyAnalytics(settings) {
    const a = settings?.analytics || {};

    if (a.google_tag_id) {
        injectScript({
            id: "gtm-src",
            src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
                a.google_tag_id
            )}`,
            attrs: { async: "" },
        });
        const code = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','${a.google_tag_id}');`;
        injectScript({ id: "gtm-inline", code });
    }

    if (a.matomo_url && a.matomo_site_id) {
        const code = `var _paq=window._paq=window._paq||[];_paq.push(['trackPageView']);_paq.push(['enableLinkTracking']);(function(){var u='${a.matomo_url.replace(
            /\/$/,
            "/"
        )}';_paq.push(['setTrackerUrl', u+'matomo.php']);_paq.push(['setSiteId', '${
            a.matomo_site_id
        }']);var d=document,g=d.createElement('script'),s=d.getElementsByTagName('script')[0];g.async=true;g.src=u+'matomo.js';s.parentNode.insertBefore(g,s);})();`;
        injectScript({ id: "matomo-inline", code });
    }
}

function applyPerformance(settings) {
    const p = settings?.performance || {};
    (p.preconnect_hosts || []).forEach((h) =>
        upsertLink("preconnect", h, { crossorigin: "anonymous" })
    );
    (p.preload_fonts || []).forEach((f) =>
        upsertLink("preload", f, { as: "font", crossorigin: "anonymous" })
    );
    (p.preload_scripts || []).forEach((s) =>
        upsertLink("preload", s, { as: "script" })
    );
}

function applyCustomCode(settings) {
    const c = settings?.custom_code || {};
    if (c.head) injectHtml("head", c.head, "custom-head-code");
    if (c.body_start) injectHtml("body", c.body_start, "custom-body-start");
    if (c.body_end) injectHtml("body-end", c.body_end, "custom-body-end");
}

export default function SettingsInjector({ settings }) {
    useEffect(() => {
        if (!settings || typeof document === "undefined") return;
        try {
            applyBrandingColors(settings);
            applySeo(settings);
            applyPerformance(settings);
            applyAnalytics(settings);
            applyCustomCode(settings);
        } catch (e) {
            console.warn("SettingsInjector error", e);
        }
    }, [settings]);

    return null;
}
