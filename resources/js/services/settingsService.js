import axios from "axios";
// Dosya yolunun doğru olduğundan emin ol (örn: ../Config/remoteConfig veya ./remoteConfig)
import remoteConfig from "./remoteConfig";

const api = axios.create({
    baseURL: remoteConfig.apiBase || "https://omerdogan.de/api/v1",
    timeout: remoteConfig.timeout || 10000,
});

function buildRequestConfig({ tenantId, locale, signal } = {}) {
    const headers = {};

    // --- DÜZELTME BURADA ---
    // Eğer parametre olarak tenantId gelmediyse, remoteConfig'den veya .env'den al
    const effectiveTenantId =
        tenantId ||
        remoteConfig.talentId ||
        remoteConfig.tenantId ||
        import.meta.env.VITE_REMOTE_TALENT_ID;

    if (effectiveTenantId) {
        headers["X-Tenant-ID"] = String(effectiveTenantId);
    } else {
        console.warn("⚠️ SettingsService: Tenant ID bulunamadı! İstek muhtemelen 400 dönecek.");
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
        const res = await api.get(`/settings/${endpoint}`, config);
        // API bazen direkt data, bazen data.data dönüyor, garantiye alalım:
        return res?.data?.data ?? res?.data ?? {};
    } catch (error) {
        console.error(`❌ Settings API Error (${endpoint}):`, error?.response?.status, error?.message);
        // Hata durumunda boş obje dön ki site patlamasın
        return {};
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
    // Promise.allSettled kullanarak bir tanesi hata verse bile diğerlerinin yüklenmesini sağlıyoruz
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
    ]);

    // Helper: Sonuç başarılıysa değerini, değilse boş obje dön
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
    };
}
