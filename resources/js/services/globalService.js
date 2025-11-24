// resources/js/services/globalService.js
import axios from "axios";

const API_URL = "https://omerdogan.de/api/global/websites";

export const getGlobalWebsites = async () => {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                'Accept': 'application/json',
            }
        });

        // Gelen JSON: { data: [ {id:1, ...} ] }
        // Axios Response: response.data = { data: [...] }
        // Hedef: response.data.data

        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }

        // Eğer yapı farklıysa veya direkt array dönerse diye yedek:
        return Array.isArray(response.data) ? response.data : [];

    } catch (error) {

        return [];
    }
};

export default {
    getGlobalWebsites,
};
