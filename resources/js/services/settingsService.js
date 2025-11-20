import axios from "axios";
import remoteConfig from "./remoteConfig";

const api = axios.create({
    baseURL: remoteConfig.apiBase || "https://omerdogan.de/api/v1",
    timeout: remoteConfig.timeout || 10000,
});

function buildRequestConfig({ tenantId, locale, signal } = {}) {
    const headers = {};

    if (tenantId) {
        headers["X-Tenant-ID"] = String(tenantId);
    }

    const params = {};
    if (locale) {
        params.locale = String(locale);
    }

    return {
        headers,
        params,
        signal,
    };
}

async function fetchSettings(endpoint, options = {}) {
    const config = buildRequestConfig(options);
    const res = await api.get(`/settings/${endpoint}`, config);

    return res?.data?.data ?? res?.data ?? {};
}


export function getGeneralSettings(options = {}) {
    return fetchSettings("general", options);
}

export function getContactSettings(options = {}) {
    return fetchSettings("contact", options);
}

export function getSocialSettings(options = {}) {
    return fetchSettings("social", options);
}

export function getBrandingSettings(options = {}) {
    return fetchSettings("branding", options);
}

export function getColorsSettings(options = {}) {
    return fetchSettings("colors", options);
}

export function getAnalyticsSettings(options = {}) {
    return fetchSettings("analytics", options);
}

export function getSeoSettings(options = {}) {
    return fetchSettings("seo", options);
}

export function getPerformanceSettings(options = {}) {
    return fetchSettings("performance", options);
}

export function getEmailSettings(options = {}) {
    return fetchSettings("email", options);
}

export function getCustomCodeSettings(options = {}) {
    return fetchSettings("custom-code", options);
}

export function getFooterSettings(options = {}) {
    return fetchSettings("footer", options);
}


export async function getAllSettings(options = {}) {
    const [
        general,
        contact,
        social,
        branding,
        colors,
        analytics,
        seo,
        performance,
        email,
        customCode,
        footer,
    ] = await Promise.all([
        getGeneralSettings(options),
        getContactSettings(options),
        getSocialSettings(options),
        getBrandingSettings(options),
        getColorsSettings(options),
        getAnalyticsSettings(options),
        getSeoSettings(options),
        getPerformanceSettings(options),
        getEmailSettings(options),
        getCustomCodeSettings(options),
        getFooterSettings(options),
    ]);

    return {
        general,
        contact,
        social,
        branding,
        colors,
        analytics,
        seo,
        performance,
        email,
        customCode,
        footer,
    };
}
