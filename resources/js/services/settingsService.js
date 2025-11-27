import axios from "axios";
import remoteConfig from "./remoteConfig";

const BASE_URL = remoteConfig.apiBase || "https://omerdogan.de/api/v1";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: remoteConfig.timeout || 10000,
});


function buildRequestConfig({ tenantId, locale, signal } = {}) {
    const headers = {};

    const effectiveTenantId =
        tenantId ||
        remoteConfig.tenantId ||
        remoteConfig.tenantId ||
        import.meta.env.VITE_REMOTE_TENANT_ID;

    if (effectiveTenantId) {
        headers["X-Tenant-ID"] = String(effectiveTenantId);
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
    try {
        const path = endpoint.startsWith('/') ? endpoint : `/settings/${endpoint}`;
        const res = await api.get(path, config);
        return res?.data?.data ?? res?.data ?? {};
    } catch (error) {

        return {};
    }
}


export async function getLanguageSettings(options = {}) {
    const config = buildRequestConfig(options);


    const url = "https://omerdogan.de/api/global/settings/languages";

    try {

        const res = await axios.get(url, config);
        return res?.data?.data ?? res?.data ?? [];
    } catch (error) {

        return [];
    }
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
    const results = await Promise.allSettled([
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
        getLanguageSettings(options),
    ]);

    const val = (index) => (results[index].status === 'fulfilled' ? results[index].value : {});

    return {
        general: val(0),
        contact: val(1),
        social: val(2),
        branding: val(3),
        colors: val(4),
        analytics: val(5),
        seo: val(6),
        performance: val(7),
        email: val(8),
        customCode: val(9),
        footer: val(10),
        languages: val(11),
    };
}
