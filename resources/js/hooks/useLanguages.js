import { useEffect, useState } from "react";
import { getLanguages } from "../services/languageService";

export function useLanguages() {
  const [languages, setLanguages] = useState([]);
  const [defaultCode, setDefaultCode] = useState("de");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    let disposed = false;
    (async () => {
      setLoading(true);
      setError(undefined);
      try {
        const { languages, defaultCode } = await getLanguages();
        if (!disposed) {
          setLanguages(languages);
          setDefaultCode(defaultCode);

          window.dispatchEvent(new CustomEvent("update-languages", { detail: languages }));
        }
      } catch (e) {
        if (!disposed) setError(e?.message || "Diller alınamadı");
      } finally {
        if (!disposed) setLoading(false);
      }
    })();
    return () => { disposed = true; };
  }, []);

  return { languages, defaultCode, loading, error };
}


