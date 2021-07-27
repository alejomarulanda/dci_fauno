import React, { Component } from 'react';
import NVD3Chart from 'react-nvd3';

import './PlotLine.css';

function PlotLine(props) {

    return (
        <>
            <h2 className="text-center">{props.title}</h2>
            <p className="text-justify">
                {props.description}
            </p>
            <div id="pltLineSummary" className="PlotLinePlot">
                <NVD3Chart id="pltLineSummary" datum={props.datum}
                    type="lineChart"
                    showValues="true"
                    useInteractiveGuideline="true"
                    x={props.x}
                    y={props.y}
                />
            </div>
        </>
    );

}

export default PlotLine;