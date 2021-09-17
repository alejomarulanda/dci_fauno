import React, { Component } from 'react';

import PlotBar from '../plot_bar/PlotBar';

function TotalRiskLocality(props) {

    return (
        <>
            <section className="row">
                <article className="col-md-12">
                    <PlotBar id="plbDeforestation" 
                        title="Deforestación potencial"
                        description="La deforetación que se presenta en la siguiente gráfica se ubica en las áreas potenciales de los predios
                        de ganadería en cada vereda. Las zonas de los predios son representadas como áreas potenciales de influencia, 
                        donde posiblemente se puede ubicar la zonas para actividad de ganadería."
                        datum={props.datum}
                        x="label" 
                        y="def_area"  />
                </article>
                <article className="col-md-12">
                    <PlotBar id="plbRisk" 
                        title="Riesgo total"
                        description="El siguiente gráfico le permite observar cual ha sido el nivel de riesgo total de
                        las veredas de interés a lo largo del tiempo."
                        datum={props.datum}
                        x="label" 
                        y="rt"
                        forceY={[0,4]}  />
                </article>
            </section>
        </>
    );

}

export default TotalRiskLocality;