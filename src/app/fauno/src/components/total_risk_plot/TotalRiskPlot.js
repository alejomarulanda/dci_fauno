import React, { Component } from 'react';
import NVD3Chart from 'react-nvd3';
import Chart from "react-apexcharts";

import { Carousel, CarouselItem } from 'react-bootstrap';

import './TotalRiskPlot.css';

function TotalRiskPlot(props) {
    const [options_radar, setOptionsRadar] = React.useState({        
        xaxis: { categories: ["Riesgo directo", "Riesgo de entrada", "Riesgo de salida"] }
    });

    React.useEffect(() => {
        console.log("cambio");
    }, []);

    return (
        <>
            <section className="row">
                <article className="col-md-6">
                    <h2 className="text-center">Factores de riesgo</h2>
                    <p className="text-justify">
                        El siguiente gráfico le permite observar cuales son los factores que han influido
                        en el riesgo de cada sitio.
                    </p>
                    <Carousel id="carousel_radar">
                        {props.datum_radar ? props.datum_radar.map((item, idx) => (
                            <CarouselItem id={"radar" + idx}>
                                <h3>{item.period.label}</h3>
                                <Chart id={"pltFactorRisk_" + idx} options={options_radar} series={item.radar} type="radar" height={500} />                                
                            </CarouselItem>
                        ))
                            : ""
                        }
                    </Carousel>
                </article>
                <article className="col-md-6">
                    <h2 className="text-center">Riesgo total</h2>
                    <p className="text-justify">
                        El siguiente gráfico le permite observar cual es el riesgo total de cada sitio.
                    </p>
                    <div className="TotalRiskPlot">
                        <NVD3Chart id="pltTotalRisk" forceY={[0, 4]} datum={props.datum} type="multiBarChart" showValues="true" x="label" y="rt" />
                    </div>
                </article>
            </section>
        </>
    );

}

export default TotalRiskPlot;