import axios from "axios";
import remoteConfig from "./remoteConfig";

// Varsayılan API (v1 için)
const BASE_URL = remoteConfig.apiBase || "https://omerdogan.de/api/v1";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: remoteConfig.timeout || 10000,
});

// Header ve Tenant ID oluşturucu
function buildRequestConfig({ tenantId, locale, signal } = {}) {
    const headers = {};

    const effectiveTenantId =
        tenantId ||
        remoteConfig.talentId ||
        remoteConfig.tenantId ||
        import.meta.env.VITE_REMOTE_TALENT_ID;

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

// Standart Fetch (v1 kullananlar için)
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

/* =========================================================
   DÜZELTİLEN KISIM: LANGUAGES (v1 OLMADAN ÇAĞRILMALI)
   ========================================================= */
export async function getLanguageSettings(options = {}) {
    const config = buildRequestConfig(options);

    // URL'yi manuel ve tam olarak veriyoruz ki 'v1' eklemesin.
    const url = "https://omerdogan.de/api/global/settings/languages";

    try {
        // 'api' instance yerine direkt 'axios' kullanıyoruz
        const res = await axios.get(url, config);
        return res?.data?.data ?? res?.data ?? [];
    } catch (error) {

        return [];
    }
}

// --- Diğer Fonksiyonlar (Aynen Kalıyor) ---

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
