import { useEffect, useMemo, useState } from "react";
import { getContactForms } from "../services/contactService";

const cache = new Map();
const inflight = new Map();

export function useContactForms(params = {}) {
  const { tenantId, locale } = params;
  const key = useMemo(() => JSON.stringify({ tenantId, locale }), [tenantId, locale]);
  const [forms, setForms] = useState(cache.get(key));
  const [loading, setLoading] = useState(!cache.has(key));
  const [error, setError] = useState();

  useEffect(() => {
    let disposed = false;
    if (cache.has(key)) {
      setForms(cache.get(key));
      setLoading(false);
      return;
    }
    if (inflight.has(key)) {
      inflight.get(key).then((d) => !disposed && setForms(d)).finally(() => !disposed && setLoading(false));
      return;
    }
    setLoading(true);
    const p = getContactForms({ tenantId, locale });
    inflight.set(key, p);
    p.then((d) => { cache.set(key, d); if (!disposed) setForms(d); })
      .catch((e) => { if (!disposed) setError(e?.message || "Formlar alınamadı"); })
      .finally(() => { inflight.delete(key); if (!disposed) setLoading(false); });
    return () => { disposed = true; };
  }, [key]);

  return { forms: forms || [], loading, error };
}


