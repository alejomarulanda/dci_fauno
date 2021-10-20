import React, { Component } from 'react';

class About extends Component {

	render() {
		return (
			<>
				<div className="container">
					<h1 className="text-center">Acerca de</h1>
					<br />
					<section className="row">
						<article className="col-md-12">
							<p className="text-justify">
								GanaBosques es un sistema de información que permita establecer el nivel de riesgo
								de deforestación relacionado con la ganadería.
								Para realizar esto, el sistema analiza la deforestación reportada en el sistema de
								Monitoreo de Bosques y Carbono (SMByC) y la relación que existe entre esta,
								los predios de ganadería y la movilización,
								para establecer niveles de riesgo en la dinámica de la ganadería
								referente a la deforestación, estableciendo niveles de riesgo.
								<br />
								<br />
								Este sistema sirve como herramienta de apoyo a los acuerdos de cero deforestación de carne y leche en Colombia.
								El desarrollo de esta herramienta se enmarca dentro del proyecto Declaración Conjunta de Intención  (DCI).
								<br />
								<br />
								Cabe aclarar que el sistema no constituye una línea base de deforestación y ganadería,
								tampoco busca establecer la causalidad de deforestación por la actividad de ganadería.
							</p>
						</article>
					</section>
					<h1 className="text-center">Socios</h1>
					
					
					<section class="row text-center">
						<div class="col-lg-2">
							<a href="#" target="_blank"><img src="images/logos/ciat.png" className="img-rounded" width="140" height="140" /></a>
						</div>
						<div class="col-lg-2">
							<a href="#" target="_blank"><img src="images/logos/bid.jpg" className="img-rounded" width="140" height="140" /></a>
						</div>
						<div class="col-lg-2">
							<a href="#" target="_blank"><img src="images/logos/acuerdos.png" className="img-rounded" width="140" height="140" /></a>
						</div>
						<div class="col-lg-2">
							<a href="#" target="_blank"><img src="images/logos/fedegan.jpg" className="img-rounded" width="140" height="140" /></a>
						</div>
						<div class="col-lg-2">
							<a href="#" target="_blank"><img src="images/logos/ica.jpg" className="img-rounded" width="140" height="140" /></a>
						</div>
						<div class="col-lg-2">
							<a href="#" target="_blank"><img src="images/logos/ideam.svg" className="img-rounded" width="140" height="140" /></a>
						</div>
					</section>
					<section class="row text-center">
						<div class="col-lg-6">
							<a href="#" target="_blank"><img src="images/logos/min_agricultura.png" className="img-rounded" width="300" height="140" /></a>
						</div>
						<div class="col-lg-6">
							<a href="#" target="_blank"><img src="images/logos/min_ambiente.png" className="img-rounded" width="300" height="140" /></a>
						</div>
					</section>
					
				</div>
			</>
		)

	}

}

export default About;