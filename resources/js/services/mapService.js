import axios from "axios";
import remoteConfig from "./remoteConfig";

// API Base URL'in sonuna /v1 eklemeyi unutmuyoruz (Dokümantasyona göre)
const API_BASE = remoteConfig?.apiBaseUrl || "https://omerdogan.de/api/v1";

/**
 * Harita verilerini çeker (GET /maps)
 *
 * @param {Object} params
 * @param {string|number} [params.tenantId] - Zorunlu (Dokümanda required)
 * @param {string}        [params.locale]   - Opsiyonel
 */
export async function fetchMaps({ tenantId, locale } = {}) {
    // Dokümantasyona göre endpoint direkt /maps
    const url = `${API_BASE}/maps`;

    const config = {
        params: {},
        headers: {
            'Accept': 'application/json',
        },
    };

    if (tenantId) {
        // API dokümanında query parameter olarak 'tenant' istiyor
        config.params.tenant = tenantId;

        // Alternatif olarak Header da ekleyelim, garanti olsun
        config.headers['X-Tenant-ID'] = tenantId;
    }

    if (locale) {
        // Genelde Laravel 'locale' parametresi bekler ('lang' yerine)
        config.params.locale = locale;
    }

    try {
        const response = await axios.get(url, config);
        // Veriyi güvenli şekilde döndür
        return response.data?.data ?? response.data ?? [];
    } catch (error) {

        return [];
    }
}

export default {
    fetchMaps,
};
