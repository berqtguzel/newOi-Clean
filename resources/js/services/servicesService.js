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
  const latitude =
    typeof it?.latitude === "string" || typeof it?.latitude === "number"
      ? Number(it.latitude)
      : null;

  const longitude =
    typeof it?.longitude === "string" || typeof it?.longitude === "number"
      ? Number(it.longitude)
      : null;

  return {
    id: it?.id ?? i,


    title: it?.title || it?.name || `Service #${it?.id ?? i}`,
    name: it?.name || it?.title || `Service #${it?.id ?? i}`,


    description: it?.short_description || it?.description || "",
    shortDescription: it?.short_description || "",

    slug: it?.slug || null,
    url: it?.url || null,

    image: pickImage(it),


    categoryId: it?.category_id ?? it?.categoryId ?? null,
    categoryName: it?.category_name || it?.category?.name || null,

    parentId: it?.parent_id ?? null,
    parentName: it?.parent_name ?? null,


    country: it?.country || null,
    city: it?.city || null,
    district: it?.district || null,
    latitude,
    longitude,


    hasMaps: !!it?.has_maps,
    maps: Array.isArray(it?.maps) ? it.maps : [],

    status: it?.status || null,
    order: typeof it?.order === "number" ? it.order : null,
    views: typeof it?.views === "number" ? it.views : null,


    raw: it,
  };
}

export async function fetchServices({
  page = 1,
  perPage = 50,
  tenantId,
  locale,
  search,
} = {}) {
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

  const list = Array.isArray(res?.data)
    ? res.data
    : Array.isArray(res)
    ? res
    : [];

  const services = list.map(normalizeService);

  return {
    services,
    meta: res?.meta || {},
    pagination: res?.pagination || null,
  };
}
