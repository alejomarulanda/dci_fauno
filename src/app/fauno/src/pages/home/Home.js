import React, { Component } from 'react';

import './Home.css';
import Circulo1 from '../../imgs/CirculosHOME-1.png'
import Circulo2 from '../../imgs/CirculosHOME-2.png'
import Circulo3 from '../../imgs/CirculosHOME-3.png'




class Home extends Component {

	render() {
		return (
			<>
				<div className="">
					<div className="position-relative overflow-hidden text-center" id="slide">
						
							<p className="lead fw-normal" id="letras-slide">
								 <b>GanaBosques:</b> Sistema que evalúa el nivel de riesgo de deforestación relacionado con la ganadería a nivel nacional.
							</p>
						
						<div className="product-device shadow-sm d-none d-md-block"></div>
						<div className="product-device product-device-2 shadow-sm d-none d-md-block"></div>
					</div>
					<div className="row text-center container" id="tres-circulos">
						<div className="col-lg-4">
							<img src={Circulo1} /> 
							<h2>Ganadería</h2>
							<p>
								Los análisis generados por el sistema se realizan a nivel predial, para lo cual usa el 
								sistema SAGARI.
							</p>
						</div>
						<div className="col-lg-4">
							<img src={Circulo2} /> 
							<h2>Movilización</h2>
							<p>
								SIGMA es una fuente de información para establecer las relaciones entre los predios de ganadería,
								basados en la movilización de ganadería.
							</p>
						</div>
						<div className="col-lg-4">
							<img src={Circulo3} /> 
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