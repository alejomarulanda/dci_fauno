import React, { Component } from 'react';
import Form from "react-validation/build/form";
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';

import CardData from '../../components/card_data/CardData';
import Configuration from '../../services/Configuration';


//class Locality extends Component {
function Data() {


    React.useEffect(() => {

        return () => undefined;
    }, []);



    return (
        <>
            <div className="container-fluid">
                <h1 className="text-center">Base de datos</h1>
                <p className="text-justify">
                    En esta página usted podrá acceder a los resultados de análisis de riesgo de
                    deforestación asociado a ganadería, tanto a nivel de nacional por cada vereda,
                    como a nivel predial (si cuenta con la autorización necesaria).
                </p>

                <CardData id="crdLocality" 
                    header="Veredas"
                    title="Listado de veredas" 
                    description="Esta base de datos contiene información sobre las veredas
                        que se encuentran disponibles con los resultados de los análisis que se ofrecen en la plataforma.
                        Es necesaria para poder establecer la relación con otras base de datos de esta plataforma."
                    url={Configuration.get_api_url() + "locality"} />

                <CardData id="crdPeriods" 
                    header="Períodos"
                    title="Períodos de análisis" 
                    description="Esta base de datos contiene información sobre los períodos
                        en los cuales se han realizado análisis de riesgo.
                        Es necesaria para poder establecer la relación con otras base de datos de esta plataforma."
                    url={Configuration.get_api_url() + "analysis/periods"} />
                
                <CardData id="crdAnalysisLocalities" 
                    header="Análisis de vereda"
                    title="Análisis de vereda" 
                    description="Esta base de datos contiene información sobre los niveles de riesgo e indicadores de
                        centralidad a escala veredal. Esta base de datos tambien ofrece información sobre la movilización
                        de ganado, entre las veredas, especificando el grupo etario."
                    url={Configuration.get_api_url()} />

                <CardData id="crdAnalysisCentrality" 
                    header="Indicadores de centralidad"
                    title="Estadísticos de indicadores" 
                    description="Esta base de datos contiene información los valores máximos, mínimos y promedios 
                        sobre los indicadores de centralidad calculados en los diferente períodos."
                    url={Configuration.get_api_url()} />

                <CardData id="crdAnalysisPlots" 
                    header="Análisis de predios"
                    title="Indicadores de riesgo de predios" 
                    description="Esta base de datos contiene información sobre los niveles de riesgo y sus componentes
                        de cada predio. Esta base de datos tambien ofrece información sobre la movilización
                        de ganado, entre los predios ganaderos, especificando el grupo etario."
                    url={Configuration.get_api_url()} />
            </div>

        </>
    )



}

export default Data;