import React from 'react';

import AuthUser from '../../services/AuthUser';

const Menu = ({ history }) =>  {
    const [isAuth, setIsAuth] = React.useState();

    React.useEffect(() => {
        setIsAuth(AuthUser.isLogged());
        return () => undefined;
    }, []);

    const logout = () => {
        AuthUser.logout();
        setIsAuth(AuthUser.isLogged());
        //history.push("/");
      };

    return (
        <nav className="navbar navbar-dark sticky-top bg-dark navbar-expand-md p-0 shadow">
            <a className="navbar-brand" href="#">Gana Bosques</a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarCollapse">
                <ul className="navbar-nav mr-auto">                   
                    <li className="nav-item">
                        <a className="nav-link" href="#/nacional">Análisis nacional</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#/productor">Análisis vereda</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#/productor">Análisis productor</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#/acercade">Acerca de</a>
                    </li>
                </ul>
                <div className="d-flex">
                    <ul className="navbar-nav mr-auto">

                        {!isAuth ? (
                            <li className="nav-item">
                                <a className="nav-link" href="#/login">Iniciar sesión</a>
                            </li>
                        ) : (
                            <div>
                                <li className="nav-item">
                                    <a className="nav-link" href="#/usuario">Hola, </a>
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