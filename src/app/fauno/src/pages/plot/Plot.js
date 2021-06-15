import React, { Component } from 'react';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import NVD3Chart from 'react-nvd3';
import { DropdownButton, Dropdown } from 'react-bootstrap';

import Map from '../../components/map/Map';

import SearchPlots from "../../services/SearchPlots";

import './Plot.css';


//class Locality extends Component {
function Plot() {
    const [plots, setPlots] = React.useState();    
    const [list_analysis, setListAnalysis] = React.useState([{label:"Anual",id:"detail"},{label:"Acumulado",id:"summary"}]);
    const [list_periods, setListPeriods] = React.useState([{start:2017, label:"2017-2017"},{start:2018,label:"2018-2018"}]);
    const [c_period, setCPeriod] = React.useState();
    const [analysis, setAnalysis] = React.useState(list_analysis[0]);
    const [form, setForm] = React.useState();
    const [loading, setLoading] = React.useState(false);

    const [map_country, setMap_country] = React.useState({ center: [4.64, -74.2], zoom: 6 });
    
    const [d_data, setDData] = React.useState();
    const [map_plots, setMap_plots] = React.useState({});
    const [c_plot, setCurrentPlot] = React.useState({});
    const [m_plot, setMPlot] = React.useState();
    const [d_mobilization, setDMobilization] = React.useState([]);

    const [d_summary, setDSummary] = React.useState([]);
    const [d_import, setDImport] = React.useState([]);
    const [d_export, setDExport] = React.useState([]);

    React.useEffect(() => {
        setAnalysis(list_analysis[0]);
        setCPeriod(list_periods[0]);
        return () => undefined;
    }, []);

    /**
     * Event which change the list of plots available in the web page
     * @param {plot} e 
     */
    function onChangePlots(e) {
        setPlots(e.target.value);
    }


    /**
     * Event which update the information about mobilization when the user change the plot which 
     * want to analyze
     * @param {*plot} e New plot
     * @param {*data} d_data Data gotten from the services
     */
    function changeCurrentPlot(e, d_data){
        setCurrentPlot(e);
        // Loading data for mobilization                 
        const d = d_data.filter((d2)=>{ return d2.plot.ext_id === e.ext_id})[0];
        setMPlot([d.plot]);        
        const m_out = d.m_out.filter((d2)=>{ return d2.type === analysis.id});        
        const m_in = d.m_in.filter((d2)=>{ return d2.type === analysis.id});        
        const m_mobility = [];
        
        for(var i = 0; i< m_out.length; i++){
                m_mobility.push({"focus": d.plot, "mob":m_out[i].plot_reference,  "total": m_out[i].total, "type":"destination"});  
        }
        for(var i = 0; i< m_in.length; i++){
            m_mobility.push({"focus": d.plot, "mob":m_in[i].plot_reference,  "total": m_in[i].total, "type":"source"});
        }
        
        setDMobilization(m_mobility);
        
        changeCurrentPeriod(c_period, d_data, e, analysis);
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
                    key: "Predio " + mob_tmp[i].plot_reference.ext_id,
                    bar: true,
                    values: mob_tmp[i].exchange.map((d2) => { return { label: d2.label, value: parseFloat(d2.amount) }; })
                });
        }
        return mob;
    }

    /**
     * Event which updates plots of mobilization when period is changed
     * @param {*period} e Current period
     * @param {*} d_data Full data
     * @param {*} m_plot Current plot
     * @param {*} analysis Current analysis
     */
    function changeCurrentPeriod(e, d_data, m_plot, analysis){
        /*console.log(e);
        console.log(d_data);
        console.log(m_plot);
        console.log(analysis);*/
        setCPeriod(e);
       
        const d = d_data.filter((d2)=>{ return d2.plot.ext_id === m_plot.ext_id})[0];
        const m_out_tmp = d.m_out.filter((d2)=>{ return d2.type === analysis.id});
        const m_in_tmp = d.m_in.filter((d2)=>{ return d2.type === analysis.id});
        
        setDExport(getMobilization(m_out_tmp));
        setDImport(getMobilization(m_in_tmp));
    }


    function handleSearchPlots(e) {
        e.preventDefault();
        setLoading(true);
        const pl = plots.replace(" ","").replace(";",",").replace("-",",").replace(".",",").replace("/",",");
        SearchPlots.search(pl).then(
            (data) => {
                if (data) {
                    setDData(data);
                    // Fixing data for plots about risk
                    const datum_summary = data.map((d) => {
                        return  {
                            key: "Predio " + d.plot.ext_id,
                            bar: true,
                            values: d.risk.filter((d2)=>{ return d2.type == analysis.id}).map((d2) => { return { label: d2.year_start + '-' + d2.year_end, value_risk: parseFloat(d2.rt), value_def: parseFloat(d2.def_area) }; })
                        };
                    });
                    setDSummary(datum_summary);
                    // Loading plots for map
                    const m_plots = data.map((d)=>{
                        return d.plot;
                    });
                    setMap_plots(m_plots);
                    changeCurrentPlot(m_plots[0], data);
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
                    analizar, luego podrá seleccionar el tipo de análisis que desea revisar.
                    Actualmente se cuenta con dos tipos de análisis: Anual y Acumulado.
                </p>

                <Form ref={c => { setForm(c); }} onSubmit={handleSearchPlots} >
                    <div className="form-group row">
                        <label htmlFor="txtPlots" className="col-sm-2 col-form-label">Listado de productores:</label>
                        <div className="col-sm-5">
                            <Input type="text" className="form-control" id="txtPlots" placeholder="1020, 854753"
                                value={plots} onChange={onChangePlots} />
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
                        <Map center={map_country.center} zoom={map_country.zoom} buffers_main={map_plots} type={analysis.id} />
                    </article>                    
                </section>
                <section className="row">                    
                    <article className="col-md-6">
                        <h2 className="text-center">Riesgo</h2>
                        <p className="text-justify">
                            El siguiente gráfico le permite observar cual ha sido el nivel de riesgo de
                            los predios de interés a lo largo del tiempo.
                        </p>
                        <div id="pltRiskSummary" className="RiskSummary">
                            <NVD3Chart id="pltRiskSummary"  datum={d_summary} type="multiBarChart" showValues="true" x="label" y="value_risk" />
                        </div>
                    </article>
                    <article className="col-md-6">
                        <h2 className="text-center">Deforestación potencial</h2>
                        <p className="text-justify">
                            Las zonas de los predios son representadas como áreas potenciales de influencia, donde posiblemente se puede
                            ubicar la zonas para actividad de ganadería. La deforetación que se presenta en la siguiente gráfica
                            se ubica en esas áreas potenciales de los predios.
                        </p>
                        <div id="pltDeforestation" className="DeforestationSummary">
                            <NVD3Chart id="pltDeforestation"  datum={d_summary} type="multiBarChart" showValues="true" x="label" y="value_def" />
                        </div>
                    </article>         
                </section>
                <section className="row">
                    <article className="col-md-12">
                        <h2 className="text-center">Mobilización</h2>
                        <p className="text-justify">
                            En esta sección se puede analizar la información correspondiente los movimientos de ganadería realizados por los predios                            
                        </p>
                    </article>                                        
                </section>
                <div className="row">
                        <label htmlFor="cboPlot" className="col-md-2 col-form-label">Predio:</label>
                        <div className="col-md-4">
                            <DropdownButton id="cboPlot" title={c_plot.ext_id}>                    
                                {map_plots && map_plots.length > 0 ? map_plots.map((item, idx) => (
                                    <Dropdown.Item onClick={e => changeCurrentPlot(item, d_data)} key={item.ext_id}>{item.ext_id}</Dropdown.Item>
                                )):
                                ""}
                            </DropdownButton>
                        </div>              
                        <label htmlFor="cboPeriod" className="col-md-2 col-form-label">Período:</label>
                        <div className="col-md-4">
                            <DropdownButton id="cboPeriod" title={c_period ? c_period.label : ""}>                    
                                {list_periods && list_periods.length > 0 ? list_periods.map((item, idx) => (
                                    <Dropdown.Item onClick={e => changeCurrentPeriod(item, d_data, m_plot, analysis)} key={item.start}>{item.label}</Dropdown.Item>
                                )):
                                ""}
                            </DropdownButton>
                        </div>              
                    </div>
                <section className="row">
                    <article className="col-md-6">
                    <Map center={map_country.center} zoom={map_country.zoom} buffers_main={m_plot} mobilization={d_mobilization} type={analysis.id}   />
                    </article>
                    <article className="col-md-6">
                        <h2 className="text-center">Importación</h2>
                        <NVD3Chart id="pltRiskImport" className="RiskMobilization" datum={d_import} type="multiBarChart" x="label" y="value" />
                        <h2 className="text-center">Exportación</h2>
                        <NVD3Chart id="pltRiskExport" className="RiskMobilization" datum={d_export} type="multiBarChart" x="label" y="value" />
                    </article>
                </section>

            </div>
        </>
    )



}

export default Plot;