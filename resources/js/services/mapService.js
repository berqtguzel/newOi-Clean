import axios from "axios";
import remoteConfig from "./remoteConfig";


const API_BASE = remoteConfig?.apiBaseUrl || "https://omerdogan.de/api/v1";

/**
 * Harita verilerini çeker (GET /maps)
 *
 * @param {Object} params
 * @param {string|number} [params.tenantId] - Zorunlu (Dokümanda required)
 * @param {string}        [params.locale]   - Opsiyonel
 */
export async function fetchMaps({ tenantId, locale } = {}) {

    const url = `${API_BASE}/maps`;

    const config = {
        params: {},
        headers: {
            'Accept': 'application/json',
        },
    };

    if (tenantId) {

        config.params.tenant = tenantId;


        config.headers['X-Tenant-ID'] = tenantId;
    }

    if (locale) {

        config.params.locale = locale;
    }

    try {
        const response = await axios.get(url, config);

        return response.data?.data ?? response.data ?? [];
    } catch (error) {

        return [];
    }
}

export default {
    fetchMaps,
};
