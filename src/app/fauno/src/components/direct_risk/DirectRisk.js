import React, { Component } from 'react';
import NVD3Chart from 'react-nvd3';

import './DirectRisk.css';

function DirectRisk(props) {

    return (
        <>
            <section className="row">
                <article className="col-md-6">
                    <h2 className="text-center">Deforestación potencial</h2>
                    <p className="text-justify">
                        El siguiente gráfico le permite observar cual ha sido la deforestación potencial
                        ocurrida en el sitio
                    </p>
                    <div className="DirectRiskPlot">
                        <NVD3Chart id="pltDeforestation" datum={props.datum} type="multiBarChart" showValues="true" x="label" y="def_area" />
                    </div>
                </article>
                <article className="col-md-6">
                    <h2 className="text-center">Distancia a deforestación</h2>
                    <p className="text-justify">
                        El siguiente gráfico le permite observar cual es la distancia al punto más cercano
                        de deforestación a la que se encuentra el sitio
                    </p>
                    <div className="DirectRiskPlot">
                        <NVD3Chart id="pltDistance" datum={props.datum} type="multiBarChart" showValues="true" x="label" y="def_dist" />
                    </div>
                </article>
            </section>
        </>
    );

}

export default DirectRisk;