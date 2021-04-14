import React, { Component } from 'react';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import NVD3Chart from 'react-nvd3';
import * as d3 from 'd3';

import Map from '../../components/map/Map';
import Periods from '../../components/periods/Periods';

import SearchPlots from "../../services/SearchPlots";

import './Plot.css';


//class Locality extends Component {
function Plot() {
    const [plots, setPlots] = React.useState();
    const [form, setForm] = React.useState();
    const [loading, setLoading] = React.useState(false);

    const [map_country, setMap_country] = React.useState({ center: [4.64, -74.2], zoom: 6 });
    const [map_plots, setMap_plots] = React.useState({});

    const [d_summary, setDSummary] = React.useState([]);
    const [d_import, setDImport] = React.useState([]);
    const [d_export, setDExport] = React.useState([]);

    React.useEffect(() => {
        return () => undefined;
    }, []);

    function onChangePlots(e) {
        setPlots(e.target.value);
    }

    function handleSearchPlots(e) {
        e.preventDefault();
        setLoading(true);
        const pl = plots.replace(" ","").replace(";",",").replace("-",",").replace(".",",").replace("/",",");
        SearchPlots.search(pl).then(
            (data) => {
                if (data) {
                    //const datum = d3.map(data,function (d) {
                    /*const datum = data.map((d) => {
                        const k =  {
                            key: d.plot.ext_id,
                            bar: true,
                            //values: d3.map(d.risk,function (d2) { return { label: d2.year_start, value: d2.rt }; })
                            values: d.risk.map((d2) => { return { label: d2.year_start, value: d2.rt }; })
                        };
                        console.log(k);
                        return k;
                    });
                    console.log(datum);
                    setDSummary(datum);*/
                    const plots_json = [];
                    const plots_key = [];
                    for (const [index, value] of data.entries()) {
                        for (const [index2, value2] of value.risk.entries()) {
                            plots_json.push(value2.geojson);
                            plots_key.push(value.plot.ext_id);
                        }
                    }
                    setMap_plots({geo:{key:plots_key,json:plots_json}});

                }
                setLoading(false);
            },
            error => {
                const resMessage = (error.response && error.response.data && error.response.data.message) ||
                    error.message || error.toString();
                setLoading(false);

            }
        );
    }

    return (
        <>
            <div className="container-fluid">
                <h1 className="text-center">Análisis por productor</h1>
                <p className="text-justify">
                    En esta página usted podrá encontrar los resultados de análisis de riesgo de
                    deforestación asociado a ganadería al nivel de nacional por cada productor.
                    Primero deberá ingresar los identificadores de los productores que desea
                    analizar.
                </p>

                <Form ref={c => { setForm(c); }} onSubmit={handleSearchPlots} >
                    <div className="form-group row">
                        <label htmlFor="txtPlots" className="col-sm-2 col-form-label">Listado de productores:</label>
                        <div className="col-sm-8">
                            <Input type="text" className="form-control" id="txtPlots" placeholder="1020, 854753"
                                value={plots} onChange={onChangePlots} />
                        </div>
                        <div className="col-sm-2">
                            <button className="w-100 btn btn-lg btn-primary" disabled={loading}>
                                {loading && (
                                    <span className="spinner-border spinner-border-sm"></span>
                                )}
                                <span>Buscar</span>
                            </button>
                        </div>
                    </div>
                </Form>
                <section className="row">
                    <article className="col-md-6">
                        <h2 className="text-center">Ubicación</h2>
                        <Map center={map_country.center} zoom={map_country.zoom} geo={map_plots} />
                    </article>
                    <article className="col-md-6">
                        <h2 className="text-center">Resumen</h2>
                        <div id="pltRiskSummary" className="RiskSummary">
                            <NVD3Chart id="pltRiskSummary"  datum={d_summary} type="linePlusBarChart"  x="label" y="value" />
                        </div>
                    </article>
                </section>
                <section className="row">
                    <article className="col-md-12">
                        <h2 className="text-center">Mobilización</h2>
                    </article>
                </section>
                <section className="row">
                    <article className="col-md-6">
                        
                    </article>
                    <article className="col-md-6">
                        <h2 className="text-center">Importación</h2>
                        <NVD3Chart id="pltRiskImport" className="RiskMobilization" datum={d_import} type="multiBarChart" />
                        <h2 className="text-center">Exportación</h2>
                        <NVD3Chart id="pltRiskExport" className="RiskMobilization" datum={d_export} type="multiBarChart" />
                    </article>
                </section>

            </div>
        </>
    )



}

export default Plot;