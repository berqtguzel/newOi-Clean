import axios from "axios";
import remoteConfig from "./remoteConfig";

const API_BASE = remoteConfig?.apiBaseUrl || "https://omerdogan.de/api/v1";
const DEFAULT_TENANT = "oi_cleande_690e161c3a1dd";

export async function fetchMaps({ tenantId, locale } = {}) {
    const url = `${API_BASE}/maps`;

    const finalTenant = tenantId || DEFAULT_TENANT;

    const config = {
        params: {
            tenant: finalTenant,
        },
        headers: {
            "Accept": "application/json",
            "X-Tenant-ID": finalTenant,
        },
    };

    if (locale) {
        config.params.locale = locale;
    }

    try {
        const response = await axios.get(url, config);
        return response.data?.data ?? [];
    } catch (error) {
        console.error("❌ Map API ERROR:", error?.response || error);
        return [];
    }
}

export default {
    fetchMaps,
};
