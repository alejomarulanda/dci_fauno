import React, { Component } from 'react';

import Menu from '../../components/menu/Menu';
import Footer from '../../components/footer/Footer';

import AuthUser from "../../services/AuthUser";

function Login() {

    return (
        <>
            <Menu />
            <h1>Usuario</h1>
            <Footer />
        </>
    )

}

export default Login;