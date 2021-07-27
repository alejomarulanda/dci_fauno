import axios from "axios";

import Configuration from "./Configuration";

class CentralityService {

    search(years) {
        return axios
            .get(Configuration.get_api_url() + "analysis/centrality?years=" + years, {})
            .then(response => {
                return response.data;
            });
    };
}

export default new CentralityService();