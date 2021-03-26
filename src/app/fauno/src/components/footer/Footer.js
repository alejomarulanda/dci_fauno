import React, { Component } from 'react';

class Footer extends Component {

    render() {
        return (
            <footer className="container">
                <p className="float-right"></p>
                <p>
                    &copy; 2021 Alliance Bioversity International - CIAT
                    <a href="#">Política de Privacidad</a> <a href="#">Términos y condiciones</a>
                </p>
            </footer>
        );
    }

}

export default Footer;