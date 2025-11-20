import { useEffect, useMemo, useState } from "react";
import { getAllSettings } from "../services/settingsService";

const cache = new Map();
const inflight = new Map();

export function useSettings(params = {}) {
  const { tenantId, locale } = params;
  const key = useMemo(() => JSON.stringify({ tenantId, locale }), [tenantId, locale]);
  const [data, setData] = useState(cache.get(key));
  const [loading, setLoading] = useState(!cache.has(key));
  const [error, setError] = useState();

  useEffect(() => {
    let disposed = false;
    if (cache.has(key)) {
      setData(cache.get(key));
      setLoading(false);
      return;
    }
    if (inflight.has(key)) {
      inflight.get(key).then((d) => !disposed && setData(d)).finally(() => !disposed && setLoading(false));
      return;
    }
    setLoading(true);
    const p = getAllSettings({ tenantId, locale });
    inflight.set(key, p);
    p.then((d) => {
      cache.set(key, d);
      if (!disposed) setData(d);
    })
      .catch((e) => {
        if (!disposed) setError(e?.message || "Ayarlar alınamadı");
      })
      .finally(() => {
        inflight.delete(key);
        if (!disposed) setLoading(false);
      });
    return () => { disposed = true; };
  }, [key, tenantId, locale]);

  return { data, loading, error };
}


