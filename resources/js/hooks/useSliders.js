import { useEffect, useState } from "react";
import { fetchSliders } from "@/services/sliderService";


export function useSliders({ tenantId, locale, lang } = {}) {
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!tenantId) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        fetchSliders({ tenantId, locale, lang })
            .then(({ sliders }) => {
                if (!isMounted) return;
                setSliders(sliders);
            })
            .catch((err) => {
                console.error("useSliders error:", err);
                if (!isMounted) return;
                setError(err);
                setSliders([]);
            })
            .finally(() => {
                if (!isMounted) return;
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [tenantId, locale, lang]);

    return { sliders, loading, error };
}
