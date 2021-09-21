import axios from "axios";

import Configuration from "./Configuration";

class AuthUser {
    login(email, password) {
        return axios
            .post(Configuration.get_api_url() + "login", {
                email,
                password
            })
            .then(response => {
                if (response.data.token) {                    
                    localStorage.setItem("token", JSON.stringify(response.data.token));
                    localStorage.setItem("user", email);
                }
                return response.data;
            });
    }

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
    
    isLogged(){
        return !!localStorage.getItem("token");
    }

    getCurrentUser() {        
        return localStorage.getItem('user');
    }
}

export default new AuthUser();