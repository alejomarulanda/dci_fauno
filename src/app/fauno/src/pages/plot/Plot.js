import React, { Component } from 'react';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";

import Map from '../../components/map/Map';

import Periods from '../../components/periods/Periods';
import * as d3 from 'd3';

//class Locality extends Component {
function Plot() {
    const [plots, setPlots] = React.useState();
    const [form, setForm] = React.useState();
    const [loading, setLoading] = React.useState(false);

    const [map_country, setMap_country] = React.useState({ center: [4.64, -74.2], zoom: 6 });

    React.useEffect(() => {
        return () => undefined;
    }, []);

    function onChangePlots(e) {
        setPlots(e.target.value);
    }

    function handleChangeAdm(data) {
        data.map(function (d) {


        });
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

                <Form ref={c => { setForm(c); }} >
                    <div class="form-group row">
                        <label for="txtPlots" className="col-sm-2 col-form-label">Listado de productores:</label>
                        <div class="col-sm-8">
                            <Input type="text" className="form-control" id="txtPlots" placeholder="1020, 854753"
                                value={plots} onChange={onChangePlots} />
                        </div>
                        <div class="col-sm-2">
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
                        <Map center={map_country.center} zoom={map_country.zoom} />
                    </article>
                    <article className="col-md-6">
                        <h2 className="text-center">Resumen</h2>
                    </article>
                </section>
            </div>
        </>
    )



}

export default Plot;