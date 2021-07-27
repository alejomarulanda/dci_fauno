import React, { Component } from 'react';
import Form from "react-validation/build/form";
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';


import Map from '../../components/map/Map';
import TotalRiskLocality from '../../components/total_risk_locality/TotalRiskLocality';
import Centrality from '../../components/centrality/Centrality';
import ImportExport from '../../components/import_export/ImportExport';

import LocalityService from "../../services/LocalityService";
import CentralityService from "../../services/CentralityService";

//class Locality extends Component {
function Locality() {
    const [list_localities, setListLocalities] = React.useState([]);
    const [localities, setLocalities] = React.useState();
    const [list_analysis, setListAnalysis] = React.useState([{ label: "Anual", id: "detail" }, { label: "Acumulado", id: "summary" }]);
    const [list_periods, setListPeriods] = React.useState([{ start: 2017, label: "2017-2017" }, { start: 2018, label: "2018-2018" }]);
    const [c_period, setCPeriod] = React.useState();
    const [analysis, setAnalysis] = React.useState(list_analysis[0]);
    const [form, setForm] = React.useState();
    const [loading, setLoading] = React.useState(false);

    const [map_country, setMap_country] = React.useState({ center: [4.64, -74.2], zoom: 6 });

    const [d_data, setDData] = React.useState();
    const [map_localities, setMapLocalities] = React.useState();
    const [c_locality, setCLocality] = React.useState({});
    const [d_mobilization, setDMobilization] = React.useState();

    const [d_summary, setDSummary] = React.useState([]);
    const [d_centrality, setDCentrality] = React.useState([]);
    const [d_import, setDImport] = React.useState([]);
    const [d_export, setDExport] = React.useState([]);

    /**
     * Method which gets all localities from the localhost
     */
    const getLocalities = () => {
        LocalityService.list().then(
            (data) => {
                setListLocalities(data.map((d) => {
                    return { value: d.loc_ext_id, label: d.adm_name + ', ' + d.loc_name };
                }));
            },
            error => {
                const resMessage = (error.response && error.response.data && error.response.data.message) ||
                    error.message || error.toString();
            }
        );
    }

    React.useEffect(() => {
        getLocalities();
        return () => undefined;
    }, []);

    /**
    * Event which update the information about mobilization when the user change the plot which 
    * want to analyze
    * @param {*plot} e New plot
    * @param {*data} d_data Data gotten from the services
    */
    function changeCurrentLocality(e, d_data) {
        setCLocality(e);
        // Loading data for mobilization                 
        const d = d_data.filter((d2) => { return d2.locality.ext_id === e.value })[0];
        const m_out = d.m_out.filter((d2) => { return d2.type === analysis.id });
        const m_in = d.m_in.filter((d2) => { return d2.type === analysis.id });
        const m_mobility = [];
        // Loops in which we get the mobilization for both import and export
        for (var i = 0; i < m_out.length; i++) {
            m_mobility.push({ "focus": d.locality, "mob": m_out[i].locality_reference, "total": m_out[i].total, "type": "destination" });
        }
        for (var i = 0; i < m_in.length; i++) {
            m_mobility.push({ "focus": d.locality, "mob": m_in[i].locality_reference, "total": m_in[i].total, "type": "source" });
        }
        changeCurrentPeriod(list_periods[0], d_data, e, analysis);

        // Loading geodata
        const ids = m_mobility.map((da) => { return da.mob.ext_id });
        ids.push(d.locality.ext_id);
        LocalityService.geojson(ids).then(
            (data_geo2) => {
                setDMobilization(data_geo2);
                setLoading(false);
            },
            error => {
                const resMessage = (error.response && error.response.data && error.response.data.message) ||
                    error.message || error.toString();
                setLoading(false);
            }
        );
    }

    /**
     * Event which updates plots of mobilization when period is changed
     * @param {*period} e Current period
     * @param {*} d_data Full data
     * @param {*} m_locality Current locality
     * @param {*} analysis Current analysis
     */
     function changeCurrentPeriod(e, d_data, m_locality, analysis){
        /*console.log(e);
        console.log(d_data);
        console.log(m_locality);
        console.log(analysis);*/
        setCPeriod(e);
       
        const d = d_data.filter((d2)=>{ return d2.locality.ext_id === m_locality.value})[0];
        const m_out_tmp = d.m_out.filter((d2)=>{ return d2.type === analysis.id && d2.year_start == e.start});
        const m_in_tmp = d.m_in.filter((d2)=>{ return d2.type === analysis.id && d2.year_start == e.start});
        
        setDExport(getMobilization(m_out_tmp));
        setDImport(getMobilization(m_in_tmp));
    }

    /**
     * Method which extracts mobilization data from general data in specific format
     * to draw plots about mobilization
     * @param {*array mobilization} mob_tmp 
     * @returns Array of plots for NDV3
     */
     function getMobilization(mob_tmp){
        var mob = []; 
        for(var i = 0; i< mob_tmp.length; i++){
            mob.push({
                    key: mob_tmp[i].locality_reference.name,
                    bar: true,
                    values: mob_tmp[i].exchange.map((d2) => { return { label: d2.label, value: parseFloat(d2.amount) }; })
                });
        }
        return mob;
    }


    /**
     * Function
     * @param {*} e 
     */
    function handleSearchLocality(e) {
        e.preventDefault();
        setLoading(true);
        const lo = localities.map((d2) => { return d2.value; });
        // Getting data from API about localities
        LocalityService.search(lo).then(
            (data) => {
                if (data) {           
                    setDData(data);
                    // Getting geojson from mapserver
                    LocalityService.geojson(lo).then(
                        (data_geo) => {
                            setMapLocalities(data_geo);
                            const years = list_periods.map((d2) => { return d2.start; });
                            CentralityService.search(years).then(
                                (data_cen)=>{                                    
                                    // Fixing data for plots about risk                            
                                    const datum_summary = data.map((d) => {
                                        return {
                                            key: d.locality.name,
                                            
                                            values: d.risk.filter((d2) => { return d2.type == analysis.id }).map((d2) => {                                                 
                                                return { 
                                                    label: d2.year_start + '-' + d2.year_end, 
                                                    year: d2.year_start,
                                                    rt: parseFloat(d2.rt), 
                                                    def_area: parseFloat(d2.def_area),
                                                    degree_in: parseFloat(d2.degree_in),
                                                    degree_out: parseFloat(d2.degree_in),
                                                    betweenness: parseFloat(d2.betweenness),
                                                    closeness: parseFloat(d2.closeness),
                                                }; })
                                        };
                                    });                                    
                                    const centrality_measures = ["max","min","avg"];                                    
                                    var datum_centrality = [...datum_summary];
                                    for(var i = 0; i< centrality_measures.length; i++){
                                        
                                        datum_centrality.push(
                                            {key: centrality_measures[i],
                                            values: data_cen
                                                .filter((d2) => { return d2.analysis.type == analysis.id })
                                                .map((d2) => {
                                                    return {
                                                        label: d2.analysis.year_start + '-' + d2.analysis.year_end, 
                                                        year: d2.analysis.year_start,
                                                        degree_in: parseFloat(d2.degree_in[centrality_measures[i]]), 
                                                        degree_out: parseFloat(d2.degree_out[centrality_measures[i]]), 
                                                        betweenness: parseFloat(d2.betweenness[centrality_measures[i]]), 
                                                        closeness: parseFloat(d2.closeness[centrality_measures[i]])
                                                    };})
                                            })
                                    }
                                    // Loading information for plots
                                    setDSummary(datum_summary);
                                    setDCentrality(datum_centrality);
                                    // setting the first locality for the
                                    changeCurrentLocality(localities[0], data);
                                    setLoading(false);
                                },
                                error => {
                                    const resMessage = (error.response && error.response.data && error.response.data.message) ||
                                        error.message || error.toString();
                                    
                                    setLoading(false);
                                });
                        },
                        error => {
                            const resMessage = (error.response && error.response.data && error.response.data.message) ||
                                error.message || error.toString();
                            
                            setLoading(false);
                        }
                    );
                }
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
                <h1 className="text-center">Análisis por vereda</h1>
                <p className="text-justify">
                    En esta página usted podrá encontrar los resultados de análisis de riesgo de
                    deforestación asociado a ganadería al nivel de nacional por cada vereda.
                    Primero deberá seleccionar las veredas que desea analizar, luego podrá
                    seleccionar el tipo de análisis que desea revisar.
                    Actualmente se cuenta con dos tipos de análisis: Anual y Acumulado.
                </p>

                <Form ref={c => { setForm(c); }} onSubmit={handleSearchLocality} >
                    <div className="form-group row">
                        <label htmlFor="txtLocalities" className="col-sm-2 col-form-label">Veredas:</label>
                        <div className="col-sm-5">
                            <Typeahead id="example" onChange={setLocalities}
                                options={list_localities}
                                placeholder="Cali, el aguacatal"
                                multiple
                                selected={localities}
                                size={"small"} />
                        </div>
                        <label htmlFor="cboTypes" className="col-sm-2 col-form-label">Tipo de análisis:</label>
                        <div className="col-sm-1">
                            <DropdownButton id="cboAnalysis" title={analysis.label}>
                                {list_analysis.map((item, idx) => (
                                    <Dropdown.Item onClick={e => setAnalysis(item)} key={item.id}>{item.label}</Dropdown.Item>
                                ))}
                            </DropdownButton>
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
                    <article className="col-md-12">
                        <h2 className="text-center">Ubicación</h2>
                        <p className="text-justify">
                            En el siguiente mapa usted podrá observar dondé se encuentran ubicados los
                            predios de ganadería, tambien podrá observar cual es el área potencial
                            con el que se ha realizado el último análisis de riesgo.
                        </p>
                        <Map center={map_country.center} zoom={map_country.zoom} geo={map_localities} type={analysis.id} />
                    </article>
                </section>
                <TotalRiskLocality id="trlRisk" datum={d_summary} />
                <Centrality id="cenMob" datum={d_centrality}  />
                <section className="row">
                    <article className="col-md-12">
                        <h2 className="text-center">Movilización</h2>
                        <p className="text-justify">
                            En esta sección se puede analizar la información correspondiente los movimientos de ganadería realizados por los predios
                        </p>
                    </article>
                </section>
                <div className="row">
                    <label htmlFor="cboLocality" className="col-md-2 col-form-label">Vereda:</label>
                    <div className="col-md-4">
                        <DropdownButton id="cboLocality" title={c_locality.name}>
                            {map_localities && map_localities.length > 0 ? map_localities.map((item, idx) => (
                                <Dropdown.Item onClick={e => changeCurrentLocality(item, d_data)} key={item.value}>{item.label}</Dropdown.Item>
                            )) :
                                ""}
                        </DropdownButton>
                    </div>
                    <label htmlFor="cboPeriod" className="col-md-2 col-form-label">Período:</label>
                    <div className="col-md-4">
                        <DropdownButton id="cboPeriod" title={c_period ? c_period.label : ""}>
                            {list_periods && list_periods.length > 0 ? list_periods.map((item, idx) => (
                                <Dropdown.Item onClick={e => changeCurrentPeriod(item, d_data, c_locality, analysis)} key={item.start}>{item.label}</Dropdown.Item>
                            )) :
                                ""}
                        </DropdownButton>
                    </div>
                </div>
                <section className="row">
                    <article className="col-md-6">
                        <Map center={map_country.center} zoom={map_country.zoom} geo={d_mobilization} type={analysis.id} />
                    </article>
                    <article className="col-md-6">
                        <ImportExport id="iexMobilization" import={d_import} export={d_export} />                        
                    </article>
                </section>

            </div>
        </>
    )



}

export default Locality;