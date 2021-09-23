import axios from "axios";

import Configuration from "./Configuration";

class SearchPlots {
    search(plots_list) {
        return axios
            .get(Configuration.get_api_url() + "analysis/plots?ids=" + plots_list, {headers: Configuration.get_aut_header()})
            .then(response => {
                return response.data;
            });
    }

}

export default new SearchPlots();