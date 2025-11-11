import { useEffect, useMemo, useState } from "react";
import { fetchServices } from "../services/servicesService";

const cache = new Map();
const inflight = new Map();

export function useServices(params = {}) {
  const { page = 1, perPage = 50, tenantId, locale, search } = params;
  const key = useMemo(() => JSON.stringify({ page, perPage, tenantId, locale, search }), [page, perPage, tenantId, locale, search]);
  const [data, setData] = useState(cache.get(key));
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(!cache.has(key));
  const [error, setError] = useState();

  useEffect(() => {
    let disposed = false;
    if (cache.has(key)) {
      const { services, meta } = cache.get(key);
      setData(services);
      setMeta(meta || {});
      setLoading(false);
      return;
    }
    if (inflight.has(key)) {
      inflight.get(key).then(({ services, meta }) => {
        if (!disposed) { setData(services); setMeta(meta || {}); setLoading(false); }
      }).catch((e) => !disposed && setError(e?.message || "Servis yükleme hatası"));
      return;
    }
    setLoading(true);
    const p = fetchServices({ page, perPage, tenantId, locale, search });
    inflight.set(key, p);
    p.then((r) => {
      cache.set(key, r);
      if (!disposed) { setData(r.services); setMeta(r.meta || {}); }
    }).catch((e) => {
      if (!disposed) setError(e?.message || "Servis yükleme hatası");
    }).finally(() => {
      inflight.delete(key);
      if (!disposed) setLoading(false);
    });
    return () => { disposed = true; };
  }, [key]);

  return { services: data || [], meta, loading, error };
}


