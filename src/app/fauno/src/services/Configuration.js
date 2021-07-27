
const API_URL = "http://localhost:5000/api/v1/";
const GEOSERVER_URL = "http://localhost:8600/geoserver/";
const LOCALITIES_FILE = "data/localities/locality.json";

class Configuration {
    get_api_url() {
        return API_URL;
    }
    get_geoserver_url() {
        return GEOSERVER_URL;
    }
    get_localities_file() {
        return LOCALITIES_FILE;
    }

}

export default new Configuration();