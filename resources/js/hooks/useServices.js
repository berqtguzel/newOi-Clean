import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchServices, fetchServiceBySlug } from "../services/servicesService";

const cache = new Map();
const inflight = new Map();

export function useServices(params = {}) {
  const {
    page = 1,
    perPage = 50,
    tenantId,
    locale,
    search,
    city,
    district,
    locationSlug,
    locationId,
  } = params;

  const { i18n } = useTranslation();
  const effectiveLocale = locale || (i18n?.language ? i18n.language.split("-")[0] : undefined);

  const key = useMemo(
    () =>
      JSON.stringify({
        type: "list",
        page,
        perPage,
        tenantId,
        locale: effectiveLocale,
        search,
        city,
        district,
        locationSlug,
        locationId,
      }),
    [page, perPage, tenantId, locale, search, city, district, locationSlug, locationId]
  );

  const [data, setData] = useState(cache.get(key)?.services);
  const [meta, setMeta] = useState(cache.get(key)?.meta || {});
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
      inflight
        .get(key)
        .then(({ services, meta }) => {
          if (!disposed) {
            setData(services);
            setMeta(meta || {});
            setLoading(false);
          }
        })
        .catch(
          (e) =>
            !disposed &&
            setError(e?.message || "Servis yükleme hatası")
        );
      return;
    }

    setLoading(true);

    const p = fetchServices({
      page,
      perPage,
      tenantId,
      locale: effectiveLocale,
      search,
      city,
      district,
      locationSlug,
      locationId,
    });

    inflight.set(key, p);

    p.then((r) => {
      cache.set(key, r);
      if (!disposed) {
        setData(r.services);
        setMeta(r.meta || {});
      }
    })
      .catch((e) => {
        if (!disposed) setError(e?.message || "Servis yükleme hatası");
      })
      .finally(() => {
        inflight.delete(key);
        if (!disposed) setLoading(false);
      });

    return () => {
      disposed = true;
    };
  }, [key]);

  return { services: data || [], meta, loading, error };
}


export function useLocationServices(slug, options = {}) {
  const {
    page = 1,
    perPage = 50,
    tenantId,
    locale,
  } = options;

  const { i18n } = useTranslation();
  const effectiveLocale = locale || (i18n?.language ? i18n.language.split("-")[0] : undefined);

  const key = useMemo(
    () =>
      JSON.stringify({
        type: "slug",
        slug,
        page,
        perPage,
        tenantId,
        locale: effectiveLocale,
      }),
    [slug, page, perPage, tenantId, locale]
  );

  const [data, setData] = useState(cache.get(key)?.services);
  const [meta, setMeta] = useState(cache.get(key)?.meta || {});
  const [loading, setLoading] = useState(!cache.has(key));
  const [error, setError] = useState();

  useEffect(() => {
    let disposed = false;

    if (!slug) {
      setData([]);
      setMeta({});
      setLoading(false);
      return;
    }

    if (cache.has(key)) {
      const { services, meta } = cache.get(key);
      setData(services);
      setMeta(meta || {});
      setLoading(false);
      return;
    }

    if (inflight.has(key)) {
      inflight
        .get(key)
        .then(({ services, meta }) => {
          if (!disposed) {
            setData(services);
            setMeta(meta || {});
            setLoading(false);
          }
        })
        .catch(
          (e) =>
            !disposed &&
            setError(e?.message || "Servis yükleme hatası")
        );
      return;
    }

    setLoading(true);

    const p = fetchServiceBySlug(slug, {
      tenantId,
      locale: effectiveLocale,
      page,
      perPage,
    });

    inflight.set(key, p);

    p.then((r) => {
      cache.set(key, r);
      if (!disposed) {
        setData(r.services);
        setMeta(r.meta || {});
      }
    })
      .catch((e) => {
        if (!disposed) setError(e?.message || "Servis yükleme hatası");
      })
      .finally(() => {
        inflight.delete(key);
        if (!disposed) setLoading(false);
      });

    return () => {
      disposed = true;
    };
  }, [key, slug]);

  return { services: data || [], meta, loading, error };
}
