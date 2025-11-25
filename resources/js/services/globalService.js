import axios from "axios";

const API_URL = "https://omerdogan.de/api/global/websites";

export const getGlobalWebsites = async () => {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                'Accept': 'application/json',
            }
        });


        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }


        return Array.isArray(response.data) ? response.data : [];

    } catch (error) {

        return [];
    }
};

export default {
    getGlobalWebsites,
};
