import { useEffect, useMemo, useState } from "react";
import { getMenus } from "../services/menuService";

export function useMenus(params = {}) {
  const { page = 1, perPage = 50, search, tenantId, locale } = params;
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const key = useMemo(
    () => JSON.stringify({ page, perPage, search, tenantId, locale }),
    [page, perPage, search, tenantId, locale]
  );

  useEffect(() => {
    let disposed = false;
    (async () => {
      setLoading(true);
      setError(undefined);
      try {
        const { menus, meta } = await getMenus({ page, perPage, search, tenantId, locale });
        if (!disposed) { setData(menus); setMeta(meta || {}); }
      } catch (e) {
        if (!disposed) setError(e?.message || "Beklenmeyen hata");
      } finally {
        if (!disposed) setLoading(false);
      }
    })();
    return () => { disposed = true; };
  }, [key]);

  return { data, meta, loading, error };
}
