import React, { Component } from 'react';
import NVD3Chart from 'react-nvd3';

import './ImportExport.css';

function ImportExport(props) {

    React.useEffect(() => {

    }, []);

    return (
        <>
            <div className="ImportExportPlot">
                <h2 className="text-center">Importación</h2>
                <NVD3Chart id="pltRiskImport" datum={props.import} type="multiBarChart" x="label" y="value" />
            </div>
            <div className="ImportExportPlot">
                <h2 className="text-center">Exportación</h2>
                <NVD3Chart id="pltRiskExport" datum={props.export} 
                    type="multiBarChart" 
                    x="label" 
                    y="value"
                    xAxis={{rotateLabels: -45}} />
            </div>
        </>
    );

}

export default ImportExport;