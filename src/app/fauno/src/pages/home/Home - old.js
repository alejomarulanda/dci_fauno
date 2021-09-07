import React, { Component } from 'react';

import './Home.css';

class Home extends Component {

	render() {
		return (
			<>
				<div className="container-fluid" >
					<div className="position-relative overflow-hidden p-3 p-md-5 m-md-3 text-center" id="slide">
						<div className="col-md-5 p-lg-5 mx-auto my-5" >
							<h1 className="display-4 fw-normal">Gana Bosques</h1>
							<p className="lead fw-normal">
								 Sistema que evalúa el nivel de riesgo de deforestación relacionado con la ganadería a nivel nacional.
							</p>
						</div>
						<div className="product-device shadow-sm d-none d-md-block"></div>
						<div className="product-device product-device-2 shadow-sm d-none d-md-block"></div>
					</div>
					<div className="row text-center">
						<div className="col-lg-4">
							<svg className="bd-placeholder-img rounded-circle" width="140" height="140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 140x140" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#777"></rect><text x="50%" y="50%" fill="#777" dy=".3em">140x140</text></svg>
							<h2>Ganadería</h2>
							<p>
								Los análisis generados por el sistema se realizan a nivel predial, para lo cual usa el 
								sistema SAGARI.
							</p>
						</div>
						<div className="col-lg-4">
							<svg className="bd-placeholder-img rounded-circle" width="140" height="140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 140x140" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#777"></rect><text x="50%" y="50%" fill="#777" dy=".3em">140x140</text></svg>
							<h2>Movilización</h2>
							<p>
								SIGMA es una fuente de información para establecer las relaciones entre los predios de ganadería,
								basados en la movilización de ganadería.
							</p>
						</div>
						<div className="col-lg-4">
							<svg className="bd-placeholder-img rounded-circle" width="140" height="140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 140x140" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#777"></rect><text x="50%" y="50%" fill="#777" dy=".3em">140x140</text></svg>
							<h2>Deforestación</h2>
							<p>
								El sistema usa información del Sistema de Monitoreo de Bosques y Carbono (SMByC),
								para determinar las áreas deforestadas en Colombia
							</p>
						</div>
					</div>

				</div>
			</>
		)

	}

}

export default Home;