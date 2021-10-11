import React, { Component } from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';

import Map from '../../components/map/Map';

function National() {
    const [list_analysis, setListAnalysis] = React.useState([{ label: "Anual", id: "detail" }, { label: "Acumulado", id: "summary" }]);
    const [list_periods, setListPeriods] = React.useState([{ start: 2017, label: "2017-2017" }, { start: 2018, label: "2018-2018" }]);
    const [analysis, setAnalysis] = React.useState(list_analysis[0]);
    const [c_period, setCPeriod] = React.useState(list_periods[0]);
    const [loading, setLoading] = React.useState(false);
    const [map_country, setMap_country] = React.useState({ center: [4.64, -74.2], zoom: 6 });
    const [map_localities, setMapLocalities] = React.useState();

    return (
        <div id="containerpages">
            <div className="container pages">
                <section className="row" id="headerpages">
                    <article className="col-md-5">

                        <div className="form-group row">
                            <label htmlFor="cboTypes" className="col-sm-6 col-form-label">Tipo de análisis:</label>
                            <div className="col-sm-3">
                                <DropdownButton id="cboAnalysis" title={analysis.label}>
                                    {list_analysis.map((item, idx) => (
                                        <Dropdown.Item onClick={e => setAnalysis(item)} key={item.id}>{item.label}</Dropdown.Item>
                                    ))}
                                </DropdownButton>
                            </div>

                            <div className="col-sm-3">
                                <button className="w-100 btn btn-primary" disabled={loading}>
                                    {loading && (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    )}
                                    <span>Buscar</span>
                                </button>
                            </div>
                        </div>

                    </article>

                    <article className="col-md-7">
                        <p className="text-justify" id="textoheaderpage">
                            <b>Análisis nacional:</b> En esta página usted podrá encontrar los resultados de análisis de riesgo de
                            deforestación asociado a ganadería al nivel de nacional por cada vereda.
                            Primero deberá seleccionar  el periodo que desea analizar y luego el tipo de analisis.
                            Actualmente se cuenta con dos tipos de análisis: Anual y Acumulado.
                        </p>
                    </article>

                </section>

                <section className="row" id="ubicacion">
                    <article className="col-md-12">

                        <p className="text-justify parrafo-ubicacion">
                            <b>Ubicación: </b>En el siguiente mapa usted podrá observar la información a escala de vereda.
                        </p>
                        <Map center={map_country.center} zoom={map_country.zoom} geo={map_localities} national={true} type={analysis.id} />
                    </article>
                </section>
            </div>
        </div>

    )

}

export default National;