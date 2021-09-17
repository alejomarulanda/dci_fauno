import React, { Component } from 'react';


import PlotBar from '../plot_bar/PlotBar';

function DirectRisk(props) {

    return (
        <>
            <section className="row">
                <article className="col-md-12">
                    <PlotBar id="plbDeforestation" 
                        title="Deforestación potencial"
                        description="El siguiente gráfico le permite observar cual ha sido la deforestación potencial
                        ocurrida en el sitio."
                        datum={props.datum}
                        x="label" 
                        y="def_area"  />
                </article>
                <article className="col-md-12">
                    <PlotBar id="plbDistance" 
                        title="Distancia a deforestación"
                        description="El siguiente gráfico le permite observar cual es la distancia al punto más cercano
                        de deforestación a la que se encuentra el sitio"
                        datum={props.datum}
                        x="label" 
                        y="def_dist"  />
                </article>
            </section>
        </>
    );

}

export default DirectRisk;