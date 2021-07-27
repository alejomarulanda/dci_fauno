import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/";

class CentralityService {

    search(years) {
        return axios
            .get(API_URL + "analysis/centrality?years=" + years, {})
            .then(response => {
                return response.data;
            });
    };
}

export default new CentralityService();