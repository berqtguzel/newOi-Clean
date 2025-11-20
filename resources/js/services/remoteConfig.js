

const BASE = (
    import.meta?.env?.OMR_API_BASE || "https://omerdogan.de/api"
).replace(/\/$/, "");

const MENU_ENDPOINT =
    import.meta?.env?.OMR_MENU_ENDPOINT || "/v1/menus";

const TIMEOUT = Number(
    import.meta?.env?.OMR_API_TIMEOUT || 10000
);

const TALENT_ID = import.meta?.env?.OMR_TALENT_ID || "";


const remoteConfig = {
    base: BASE,
    menuPath: MENU_ENDPOINT,
    timeout: TIMEOUT,
    talentId: TALENT_ID,
};


export { remoteConfig };
export default remoteConfig;
