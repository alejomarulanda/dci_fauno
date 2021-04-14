import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/";

class SearchPlots {
    search(plots_list) {
        return axios
            .get(API_URL + "analysis/plots?ids=" + plots_list, {
                
            })
            .then(response => {
                return response.data;
            });
    }

}

export default new SearchPlots();