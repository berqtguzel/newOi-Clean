import { httpRequest } from "../lib/http";
import { remoteConfig } from "./remoteConfig";

function pickImage(it) {
  return (
    it?.image_url ||
    it?.thumbnail ||
    it?.cover ||
    (typeof it?.image === "string" ? it.image : null) ||
    "/images/Wohnungsrenovierung.jpg"
  );
}

function normalizeService(it, i) {
  return {
    id: it?.id ?? i,
    title: it?.title || it?.name || `Service #${(it?.id ?? i)}`,
    description: it?.excerpt || it?.description || "",
    slug: it?.slug || null,
    url: it?.url || null,
    image: pickImage(it),
    categoryId: it?.category_id ?? it?.categoryId ?? null,
    categoryName: it?.category?.name || it?.category_name || null,
    raw: it,
  };
}

export async function fetchServices({ page = 1, perPage = 50, tenantId, locale, search } = {}) {
  const headers = {};
  if (tenantId) headers["X-Tenant-ID"] = String(tenantId);
  const params = { page, per_page: perPage };
  if (search) params.search = search;
  if (locale) params.locale = String(locale);
  const res = await httpRequest("/v1/services", {
    method: "GET",
    headers,
    params,
    timeoutMs: remoteConfig.timeout,
    retries: 1,
  });
  const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  const services = list.map(normalizeService);
  return { services, meta: res?.meta || {} };
}


