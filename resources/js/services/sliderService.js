
import { httpRequest } from "../lib/http";
import { remoteConfig } from "./remoteConfig";

function pickImage(it) {

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
 *
 *
 * @param {Object} options
 * @param {string|number} options.tenantId
 * @param {string} [options.locale]
 * @param {string} [options.lang]
 */
export async function fetchSliders({ tenantId, locale, lang } = {}) {
    if (!tenantId) {
        throw new Error("fetchSliders: tenantId required");
    }

    const headers = {
        "X-Tenant-ID": String(tenantId),
    };

    const params = {

        tenant: String(tenantId),
    };


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


    return {
        sliders,
        meta: res?.meta || res?._meta || {},
        raw: res,
    };
}
