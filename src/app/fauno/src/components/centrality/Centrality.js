import React, { Component } from 'react';

import PlotLine from '../plot_line/PlotLine';

import './Centrality.css';

function Centrality(props) {

    return (
        <>
            <section className="row" id="centrality">
                <article className="col-md-12">
                    <PlotLine id="plbDegreeIn" 
                        title="Grado nodal de entrada"
                        description="El siguiente gráfico le permite analizar el indicador de centralidad
                        grado nodal de entrada."
                        datum={props.datum}
                        x="year" 
                        y="degree_in" />
                </article>
                <article className="col-md-12">
                    <PlotLine id="plbDegreeOut" 
                        title="Grado nodal de salida"
                        description="El siguiente gráfico le permite analizar el indicador de centralidad
                        grado nodal de salida."
                        datum={props.datum}
                        x="year" 
                        y="degree_out"  />
                </article>
            </section>
            <section className="row" id="centrality">
                <article className="col-md-12">
                    <PlotLine id="plbDegreeBe" 
                        title="Intermediación"
                        description="El siguiente gráfico le permite analizar el indicador de centralidad
                        Intermediación."
                        datum={props.datum}
                        x="year" 
                        y="betweenness"  />
                </article>
                <article className="col-md-12">
                    <PlotLine id="plbDegreeCl" 
                        title="Grado nodal de cercania"
                        description="El siguiente gráfico le permite analizar el indicador de centralidad
                        grado de cercanía."
                        datum={props.datum}
                        x="year" 
                        y="closeness"  />
                </article>
            </section>
        </>
    );

}

export default Centrality;