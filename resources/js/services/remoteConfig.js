const API_ROOT = (
    import.meta?.env?.OMR_API_BASE || "https://omerdogan.de/api"
).replace(/\/$/, "");

const API_VERSION = import.meta?.env?.OMR_API_VERSION || "v1";


const API_BASE_V1 = `${API_ROOT}/${API_VERSION}`;


const MENU_ENDPOINT =
    import.meta?.env?.OMR_MENU_ENDPOINT || "/v1/menus";

const TIMEOUT = Number(
    import.meta?.env?.OMR_API_TIMEOUT || 10000
);

const TALENT_ID = import.meta?.env?.OMR_TALENT_ID || "";
const DEFAULT_LOCALE =
    import.meta?.env?.OMR_DEFAULT_LOCALE || "de";

const remoteConfig = {
    base: API_ROOT,
    baseV1: API_BASE_V1,
    baseUrl: API_BASE_V1,
    apiBaseUrl: API_BASE_V1,
    menuPath: MENU_ENDPOINT,
    timeout: TIMEOUT,
    tenant: TALENT_ID,
    talentId: TALENT_ID,
    locale: DEFAULT_LOCALE,
};

export { remoteConfig };
export default remoteConfig;
