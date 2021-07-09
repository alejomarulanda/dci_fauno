import React, { Component } from 'react';

import PlotBar from '../plot_bar/PlotBar';

function Centrality(props) {

    return (
        <>
            <section className="row">
                <article className="col-md-6">
                    <PlotBar id="plbDegreeIn" 
                        title="Grado nodal de entrada"
                        description="El siguiente gráfico le permite analizar el indicador de centralidad
                        grado nodal de entrada."
                        datum={props.datum}
                        x="label" 
                        y="degree_in" />
                </article>
                <article className="col-md-6">
                    <PlotBar id="plbDegreeOut" 
                        title="Grado nodal de salida"
                        description="El siguiente gráfico le permite analizar el indicador de centralidad
                        grado nodal de salida."
                        datum={props.datum}
                        x="label" 
                        y="degree_out"  />
                </article>
            </section>
            <section className="row">
                <article className="col-md-6">
                    <PlotBar id="plbDegreeBe" 
                        title="Intermediación"
                        description="El siguiente gráfico le permite analizar el indicador de centralidad
                        Intermediación."
                        datum={props.datum}
                        x="label" 
                        y="betweenness"  />
                </article>
                <article className="col-md-6">
                    <PlotBar id="plbDegreeCl" 
                        title="Grado nodal de cercania"
                        description="El siguiente gráfico le permite analizar el indicador de centralidad
                        grado de cercanía."
                        datum={props.datum}
                        x="label" 
                        y="closeness"  />
                </article>
            </section>
        </>
    );

}

export default Centrality;