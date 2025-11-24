// resources/js/hooks/useGlobal.js
import { useState, useEffect } from "react";
import { getGlobalWebsites } from "@/services/globalService";

export const useGlobalWebsites = () => {
    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getGlobalWebsites();

                if (isMounted) {
                    // Sadece aktif olanları filtrelemek istersen:
                    // const activeSites = data.filter(site => site.is_active);
                    // setWebsites(activeSites);

                    // Hepsini olduğu gibi kaydet:
                    setWebsites(data);
                }
            } catch (err) {
                if (isMounted) {

                    setError(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    return { websites, loading, error };
};
