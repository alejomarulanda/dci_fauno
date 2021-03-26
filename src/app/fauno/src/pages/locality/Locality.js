import React, { Component } from 'react';
import Menu from '../../components/menu/Menu';
import Footer from '../../components/footer/Footer';
import Periods from '../../components/periods/Periods';
import SelectPlace from './select_place/SelectPlace';
import Map from './map/Map';
import * as d3 from 'd3';

//class Locality extends Component {
function Locality() {
    const [adm_list, setAdm_list] = React.useState([]);
    const [periods, setPeriods] = React.useState([{ value: "2010-2011", label: "2010-2011" }, { value: "2012-2012", label: "2012" }]);
    const [map_country, setMap_country] = React.useState({ center: [4.64, -74.2], zoom: 6 });
    const [map_country_geodata, setMap_country_geodata] = React.useState([]);

    React.useEffect(() => {       
        // Loading data for text adm 
        d3.csv('/data/csv/adm.csv').then((data) => {
            const options = data.map(function (d) { return { value: d.id, label: d.name } });
            setAdm_list(options);
        });
        
                
        return () => undefined;
    }, []);

    function handleChangeAdm(data) {
        data.map(function(d){
            /*const geodata = localStorage.getItem("adm_" +  d.value);
            if(geodata){
                
                setMap_country_geodata(JSON.parse(data));
            }else{
              */  
                // loading geojson            
                d3.json('/data/geojson/adm/' + d.value +'.json').then((data) => {
                    //localStorage.setItem("adm_" + d.value,JSON.stringify(data));
                    setMap_country_geodata(data);
                });
            //}
            
        });
    }

    return (
        <>
            <Menu />
            <div className="container-fluid">
                <h1 className="text-center">Análisis nacional</h1>
                <p className="text-justify">
                    En esta página usted podrá encontrar los resultados de análisis de riesgo de
                    deforestación asociado a ganadería al nivel de nacional. Usted podrá seleccionar
                    los departamentos y veredas de los cuales quiere obtener información de manera agregada.
                    <br />
                    Primero deberá seleccionar los departamentos en los cuales se encuentran las
                    veredas en la que está interesado realizar el análisis. Posterior a eso deberá seleccionar
                    el período para el cuál quiere revisar
                </p>
                <section className="row">
                    <article className="col-md-6">
                        <SelectPlace title="Departamentos" options={adm_list} onChange={handleChangeAdm}/>
                        <Periods periods={periods} />
                        <Map center={map_country.center} zoom={map_country.zoom} data={map_country_geodata} />
                    </article>
                    <article className="col-md-6">

                    </article>
                </section>
            </div>
            <Footer />
        </>
    )



}

export default Locality;