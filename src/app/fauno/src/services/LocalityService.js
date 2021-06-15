import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/";

class LocalityService {
    list() {
        return axios
            .get("data/localities/locality.json", {})
            .then(response => {
                return response.data;
            });
    };

    search(ids) {
        return axios
            .get(API_URL + "analysis/locality?ids=" + ids, {})
            .then(response => {
                return response.data;
            });
    };
}

export default new LocalityService();