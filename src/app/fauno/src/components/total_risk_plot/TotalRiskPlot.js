import React, { Component } from 'react';
import Chart from "react-apexcharts";
import { Carousel, CarouselItem } from 'react-bootstrap';

import PlotBar from '../plot_bar/PlotBar';

function TotalRiskPlot(props) {
    const [options_radar, setOptionsRadar] = React.useState({        
        xaxis: { categories: ["Riesgo directo", "Riesgo de entrada", "Riesgo de salida"] },
        yaxis: { min: 0, max:4, forceNiceScale: true},
        legend: { position: 'top' }
    });

    React.useEffect(() => {        
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
                                <h3 className="text-center">Período {item.period.label}</h3>
                                <Chart id={"pltFactorRisk_" + idx} options={options_radar} series={item.radar} type="radar" height={450} />                                
                            </CarouselItem>
                        ))
                            : ""
                        }
                    </Carousel>
                </article>
                <article className="col-md-6">
                    <PlotBar id="plbRisk" 
                        title="Riesgo total"
                        description="El siguiente gráfico le permite observar cual es el riesgo total de cada sitio."
                        datum={props.datum}
                        x="label" 
                        y="rt" 
                        forceY={[0, 4]} />
                </article>
            </section>
        </>
    );

}

export default TotalRiskPlot;