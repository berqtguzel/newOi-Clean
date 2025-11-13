import { httpRequest } from "../lib/http";
import { remoteConfig } from "./remoteConfig";

// Basit bellek içi cache ve aynı anda birden fazla isteği engellemek için inflight haritası
const menuCache = new Map(); // key -> { menus, meta }
const inflight = new Map();  // key -> Promise

function buildKey({ page, perPage, search, tenantId, locale }) {
  return JSON.stringify({ page, perPage, search, tenantId, locale });
}

// --- normalize yardımcıları ---
function buildTreeFromFlat(items = []) {
  const byId = new Map();
  const roots = [];
  // İlk geçiş: düğümleri oluştur
  items.forEach((it, i) => {
    const id = it?.id ?? i;
    const idStr = String(id);
    const node = {
      id,
      label: it?.title ?? it?.name ?? it?.slug ?? "(no title)",
      url: it?.url ?? it?.href ?? null,
      children: [],
      raw: it,
    };
    byId.set(idStr, node);
  });

  items.forEach((it, i) => {
    const id = it?.id ?? i;
    const idStr = String(id);
    const parentRaw =
      it?.parent_id ??
      it?.parentId ??
      it?.menu_parent_id ??
      (typeof it?.parent === "object" ? it?.parent?.id : it?.parent) ??
      null;
    const parentIdStr = parentRaw != null ? String(parentRaw) : null;
    const node = byId.get(idStr);
    if (parentIdStr != null && byId.has(parentIdStr)) {
      byId.get(parentIdStr).children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function normalizeItems(items) {
  const list = Array.isArray(items) ? items : [];
  const hasParentMarkers = list.some(
    (it) =>
      it?.parent_id != null ||
      it?.parentId != null ||
      it?.menu_parent_id != null ||
      typeof it?.parent === "object" ||
      (it?.parent != null && it?.parent !== 0)
  );
  const hasExplicitChildren =
    list.some(
      (it) =>
        Array.isArray(it?.children) ||
        Array.isArray(it?.items) ||
        Array.isArray(it?.links)
    );


  if (hasParentMarkers) {
    const tree = buildTreeFromFlat(list);
    const sortNodes = (arr) => {
      arr.sort(
        (a, b) =>
          (a?.raw?.order ?? 0) - (b?.raw?.order ?? 0) ||
          String(a.label).localeCompare(String(b.label))
      );
      arr.forEach((n) => Array.isArray(n.children) && sortNodes(n.children));
      return arr;
    };
    return sortNodes(tree);
  }

  if (hasExplicitChildren) {
    return list.map((it, i) => {
      const children = Array.isArray(it?.children)
        ? it.children
        : Array.isArray(it?.items)
        ? it.items
        : Array.isArray(it?.links)
        ? it.links
        : [];
      return {
        id: it?.id ?? i,
        label: it?.title ?? it?.name ?? it?.slug ?? "(no title)",
        url: it?.url ?? it?.href ?? null,
        children: normalizeItems(children),
        raw: it,
      };
    });
  }
  return list.map((it, i) => ({
    id: it?.id ?? i,
    label: it?.title ?? it?.name ?? it?.slug ?? "(no title)",
    url: it?.url ?? it?.href ?? null,
    children: [],
    raw: it,
  }));
}
function normalizeMenus(res) {
  let arr = [];
  if (Array.isArray(res)) arr = res;
  else if (Array.isArray(res?.data)) arr = res.data;
  else if (Array.isArray(res?.menus)) arr = res.menus;

  const menus = arr.map((m, idx) => ({
    id: m?.id ?? idx,
    title: m?.title ?? m?.name ?? m?.slug ?? `Menu #${idx + 1}`,
    slug: m?.slug ?? null,
    items: normalizeItems(
      Array.isArray(m?.items) ? m.items :
      Array.isArray(m?.children) ? m.children :
      Array.isArray(m?.links) ? m.links : []
    ),
    raw: m,
  }));

  // burada _meta'yı da dikkate al
  return { menus, meta: res?._meta || res?.meta || {} };
}

export async function getMenus({ page = 1, perPage = 50, search, tenantId, locale } = {}) {
  const cacheKey = buildKey({ page, perPage, search, tenantId, locale });
  if (menuCache.has(cacheKey)) {
    return menuCache.get(cacheKey);
  }
  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey);
  }

  const headers = {};

  if (remoteConfig.talentId) headers["X-Talent-Id"] = remoteConfig.talentId;
  if (tenantId) {
    headers["X-Tenant-ID"] = String(tenantId);
  }

  const params = { page, per_page: perPage };
  if (search) params.search = search;
  if (tenantId) params.tenant = String(tenantId);
  if (locale) params.locale = String(locale);

  const p = (async () => {
    const res = await httpRequest(remoteConfig.menuPath, {
      method: "GET",
      params,
      headers,
      timeoutMs: remoteConfig.timeout,
      retries: 1,
    });
    const normalized = normalizeMenus(res);
    menuCache.set(cacheKey, normalized);
    return normalized;
  })();

  inflight.set(cacheKey, p);
  try {
    const result = await p;
    return result;
  } finally {
    inflight.delete(cacheKey);
  }
}
