import axios from "axios";
import remoteConfig from "./remoteConfig";


const API_BASE = remoteConfig?.apiBaseUrl || "https://omerdogan.de/api";

/**
 *
 *
 * @param {Object} params
 * @param {string|number} [params.tenantId]
 * @param {string}        [params.locale]
 */
export async function fetchMaps({ tenantId, locale } = {}) {
    const url = `${API_BASE}/global/settings/maps`;

    const params = {};


    if (tenantId) {
        params.tenant = tenantId;

    }

    if (locale) {
        params.lang = locale;
    }

    const response = await axios.get(url, {
        params,
        headers: {

        },
    });


    return response.data?.data ?? response.data;
}

export default {
    fetchMaps,
};
