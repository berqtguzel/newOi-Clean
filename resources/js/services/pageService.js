import axios from "axios";
import remoteConfig from "./remoteConfig"; // sende zaten var


export async function fetchPages({
    tenantId,
    locale,
    status = "active",
    perPage = 50,
    search = "",
} = {}) {
    const tenant = tenantId || remoteConfig.tenant;
    const lang = locale || remoteConfig.locale || "de";

    const res = await axios.get(`${remoteConfig.baseUrl}/pages`, {
        params: {
            tenant,
            lang,
            status,
            per_page: perPage,
            ...(search ? { search } : {}),
        },
    });


    const raw = res.data?.data ?? res.data ?? [];

    const pages = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];

    return { pages };
}

export async function fetchPageBySlug({ tenantId, locale, slug }) {
    if (!slug) throw new Error("slug is required");

    const { pages } = await fetchPages({
        tenantId,
        locale,
        perPage: 100,
        search: slug,
    });


    const page = pages.find((p) => p.slug === slug) || null;

    return { page };
}
