import React, { Component } from 'react';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";

import { DropdownButton, Dropdown } from 'react-bootstrap';

import Authorize from '../../components/authorize/Authorize';
import Map from '../../components/map/Map';
import DirectRisk from '../../components/direct_risk/DirectRisk';
import TotalRiskPlot from '../../components/total_risk_plot/TotalRiskPlot';
import ImportExport from '../../components/import_export/ImportExport';

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
    const [d_radar, setDRadar] = React.useState();
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
        setCPeriod(e);
       
        const d = d_data.filter((d2)=>{ return d2.plot.ext_id === m_plot.ext_id})[0];
        const m_out_tmp = d.m_out.filter((d2)=>{ return d2.type === analysis.id && d2.year_start == e.start});
        const m_in_tmp = d.m_in.filter((d2)=>{ return d2.type === analysis.id && d2.year_start == e.start});
        
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
                            values: d.risk.filter((d2)=>{ return d2.type == analysis.id}).map((d2) => { return { 
                                label: d2.year_start + '-' + d2.year_end, 
                                def_area: parseFloat(d2.def_area), 
                                def_dist:parseFloat(d2.def_dist),
                                rd:parseFloat(d2.rd),
                                ri:parseFloat(d2.ri),
                                ro:parseFloat(d2.ro),
                                rt:parseFloat(d2.rt) }; })
                        };
                    });
                    setDSummary(datum_summary);
                    // Data for spider
                    const radar_d = list_periods.map((p) => {                        
                        return {
                            period : p,
                            radar : datum_summary.map((d) => {                                 
                                const tmp = d.values.filter((v) => { return v.label === p.label; });                                
                                const tmp_d = tmp.length > 0 ? [tmp[0].rd, tmp[0].ri, tmp[0].ro] : [0, 0, 0];
                                return { name: d.key, data: tmp_d } 
                            })
                        }
                    });
                    setDRadar(radar_d);
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
        
                
            <div id="containerpages">
                <div className="container pages">

                    <section className="row" id="headerpages">
                    <article className="col-md-5">
                            
                <Form ref={c => { setForm(c); }} onSubmit={handleSearchPlots} >
                    <div className="form-group row">
                        <label htmlFor="txtPlots" className="col-sm-6 col-form-label">Listado de productores:</label>
                        <div className="col-sm-6">
                            <Input type="text" className="form-control" id="txtPlots" placeholder="1020, 854753"
                                value={plots} onChange={onChangePlots} />
                        </div>

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
                </Form>

                </article>

                <article className="col-md-7">        
                <p className="text-justify" id="textoheaderpage">
                    <b>Análisis por productor: </b>En esta página usted podrá encontrar los resultados de análisis de riesgo de
                    deforestación asociado a ganadería al nivel de nacional por cada productor.
                    Primero deberá ingresar los identificadores de los productores que desea
                    analizar, luego podrá seleccionar el tipo de análisis que desea revisar.
                    Actualmente se cuenta con dos tipos de análisis: Anual y Acumulado.
                </p>
                </article>

                </section>


                <section className="row">
                    <article className="col-md-12">
                    
                        <p className="text-justify parrafo-ubicacion">
                            <b>Ubicación: </b>En el siguiente mapa usted podrá observar dondé se encuentran ubicados los
                            predios de ganadería, tambien podrá observar cual es el área potencial
                            con el que se ha realizado el último análisis de riesgo.
                        </p>
                        <Map center={map_country.center} zoom={map_country.zoom} buffers_main={map_plots} type={analysis.id} />
                    </article>                    
                </section>








                <DirectRisk id="comDirectRisk" datum={d_summary} />

                <TotalRiskPlot id="comTotalRisk" datum={d_summary} datum_radar={d_radar}/>

                <section className="row" >
                    <article className="col-md-12">
                        <h2 className="text-center">Movilización</h2>
                        <p className="text-center">
                            En esta sección se puede analizar la información correspondiente los movimientos de ganadería realizados por los predios                            
                        </p>
                    </article>                                        
                </section>

                <div className="row" id="movilizacion">
                        <div className="col-md-2"> </div> 
                        <label htmlFor="cboPlot" className="col-md-1 col-form-label">Predio:</label>
                        <div className="col-md-3">
                            <DropdownButton id="cboPlot" title={c_plot.ext_id}>                    
                                {map_plots && map_plots.length > 0 ? map_plots.map((item, idx) => (
                                    <Dropdown.Item onClick={e => changeCurrentPlot(item, d_data)} key={item.ext_id}>{item.ext_id}</Dropdown.Item>
                                )):
                                ""}
                            </DropdownButton>
                        </div> 
                        <div className="col-md-1"> </div>              
                        <label htmlFor="cboPeriod" className="col-md-1 col-form-label">Período:</label>
                        <div className="col-md-4">
                            <DropdownButton id="cboPeriod" title={c_period ? c_period.label : ""}>                    
                                {list_periods && list_periods.length > 0 ? list_periods.map((item, idx) => (
                                    <Dropdown.Item onClick={e => changeCurrentPeriod(item, d_data, c_plot, analysis)} key={item.start}>{item.label}</Dropdown.Item>
                                )):
                                ""}
                            </DropdownButton>
                        </div>              
                    </div>

                <section className="row">
                    <article className="col-md-12">
                    <Map center={map_country.center} zoom={map_country.zoom} buffers_main={m_plot} mobilization={d_mobilization} type={analysis.id}   />
                    </article>
                    
                    <article className="col-md-12">
                        <ImportExport import={d_import} export={d_export} />                        
                    </article>
                </section> 


            </div>
        </div>
    )



}

export default Authorize(Plot);