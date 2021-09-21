import React, { Component } from 'react';
import NVD3Chart from 'react-nvd3';

import './PlotBar.css';

function PlotBar(props) {

    return (
        <>
            <h2 className="text-center">{props.title}</h2>
            <p className="text-center">
                {props.description}
            </p>
            <div id="pltRiskSummary" className="PlotBarPlot">
                <NVD3Chart id="pltRiskSummary" datum={props.datum}
                    type="multiBarChart"
                    showValues="true"
                    x={props.x}
                    y={props.y}
                    forceY={props.forceY ? props.forceY : undefined}                    
                />
            </div>
        </>
    );

}

export default PlotBar;