import React, { Component } from 'react';
import Authorize from '../../components/authorize/Authorize';

import AuthUser from "../../services/AuthUser";

function User() {

    return (
        <>
            <h1>Usuario</h1>
        </>
    )

}

export default Authorize(User);