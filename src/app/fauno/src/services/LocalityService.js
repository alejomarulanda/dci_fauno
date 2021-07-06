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

    geojson(ids){
        const url = "http://localhost:8600/geoserver/localities/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=localities:adm&maxFeatures=50&outputFormat=application/json&CQL_FILTER=adm3_id in (" + ids + ")&SRSNAME=EPSG:4326";
        return axios.get(url, {})
            .then(response => {
                return response.data;
            });
    }

    search(ids) {
        return axios
            .get(API_URL + "analysis/locality?ids=" + ids, {})
            .then(response => {
                return response.data;
            });
    };
}

export default new LocalityService();