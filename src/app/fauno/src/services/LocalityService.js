import axios from "axios";

import Configuration from "./Configuration";

class LocalityService {
    list() {
        return axios
            .get(Configuration.get_localities_file(), {})
            .then(response => {
                return response.data;
            });
    };

    geojson(ids){
        const url = Configuration.get_geoserver_url()+ "localities/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=localities:adm&maxFeatures=50&outputFormat=application/json&CQL_FILTER=adm3_id in (" + ids + ")&SRSNAME=EPSG:4326";
        return axios.get(url, {})
            .then(response => {
                return response.data;
            });
    }

    search(ids) {
        return axios
            .get(Configuration.get_api_url() + "analysis/locality?ids=" + ids, {})
            .then(response => {
                return response.data;
            });
    };
}

export default new LocalityService();