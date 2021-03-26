import React, { Component } from 'react';

class Menu extends Component {

    render() {

        return (
            <nav className="navbar navbar-dark sticky-top bg-dark navbar-expand-md p-0 shadow">
                <a className="navbar-brand" href="#">Gana Bosques</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarCollapse">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="#">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#/nacional">Análisis nacional</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#/acercade">Acerca de</a>
                        </li>
                    </ul>
                    <div className="d-flex">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item">
                                <a className="nav-link" href="#/login">Iniciar sesión</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        );

    }

}

export default Menu;