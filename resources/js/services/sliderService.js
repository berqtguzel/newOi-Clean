
import { httpRequest } from "../lib/http";
import { remoteConfig } from "./remoteConfig";

function pickImage(it) {
    // API’den nasıl geldiğini bilmiyorsak birkaç olası alanı deneriz
    return (
        it?.image_url ||
        it?.image ||
        it?.cover ||
        it?.thumbnail ||
        "/images/default-slider.jpg"
    );
}

function normalizeSlider(it, i) {
    return {
        id: it?.id ?? i,
        title: it?.title || it?.name || "",
        subtitle: it?.subtitle || it?.sub_title || "",
        description: it?.description || "",
        buttonLabel:
            it?.button_label ||
            it?.button_text ||
            it?.cta_label ||
            it?.ctaText ||
            "",
        buttonUrl: it?.button_url || it?.link || it?.url || "#",
        image: pickImage(it),
        order: typeof it?.order === "number" ? it.order : i,
        isActive:
            typeof it?.is_active === "boolean"
                ? it.is_active
                : it?.status === "active",
        raw: it,
    };
}

/**
 * Slider listesini çeker.
 *
 * @param {Object} options
 * @param {string|number} options.tenantId  - Tenant ID (zorunlu)
 * @param {string} [options.locale]         - Dil kodu (de, en, tr)
 * @param {string} [options.lang]           - Alternatif dil param (locale yerine)
 */
export async function fetchSliders({ tenantId, locale, lang } = {}) {
    if (!tenantId) {
        throw new Error("fetchSliders: tenantId required");
    }

    const headers = {
        "X-Tenant-ID": String(tenantId),
    };

    const params = {
        // endpoint dokümanında tenant zorunlu
        tenant: String(tenantId),
    };

    // API lang bekliyor; biz hem locale hem lang paramını destekleyelim
    const langParam = lang || locale;
    if (langParam) {
        params.lang = String(langParam);
    }

    const res = await httpRequest("/v1/sliders", {
        method: "GET",
        headers,
        params,
        timeoutMs: remoteConfig.timeout,
        retries: 1,
    });

    const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

    const sliders = list.map(normalizeSlider);

    // Bazı endpointler meta döndürüyor olabilir, saklayalım
    return {
        sliders,
        meta: res?.meta || res?._meta || {},
        raw: res,
    };
}
