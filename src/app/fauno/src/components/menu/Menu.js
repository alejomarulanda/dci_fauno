import React from 'react';

import AuthUser from '../../services/AuthUser';

function Menu (props) {    
    
    React.useEffect(() => {                
        return () => undefined;
    }, []);

    const logout = () => {
        AuthUser.logout();
        //props.history.push("/login");
    };

    return (

        <nav className="navbar navbar-dark sticky-top bg-dark navbar-expand-md p-0 ">
            <a className="navbar-brand" href="#"></a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarCollapse">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item">
                        <a className="nav-link" href="#/nacional">Nacional</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#/vereda">Vereda</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#/productor">Productor</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#/datos">Base de datos</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#/acercade">Acerca de</a>
                    </li>
                </ul>
                <div className="d-flex">
                    <ul className="navbar-nav mr-auto">

                        {!AuthUser.isLogged() ? (
                            <li className="nav-item">
                                <a className="nav-link" href="#/login">Iniciar sesión</a>
                            </li>
                        ) : (
                            <div>
                                <li className="nav-item">
                                    <a className="nav-link" href="#/usuario">Hola, {AuthUser.getCurrentUser()}</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#" onClick={logout}>Cerrar sesión</a>
                                </li>
                            </div>
                        )}


                    </ul>
                </div>
            </div>
        </nav>

    )
}

export default Menu;