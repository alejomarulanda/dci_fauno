
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
    get_aut_header() {
        const token = JSON.parse(localStorage.getItem('token'));
        //console.log(token)
        if (token) {
          //return { Authorization: 'Bearer ' + token };
          console.log(token);
          return {'x-access-token': token };
        } else {
          return {};
        }
      }

}

export default new Configuration();