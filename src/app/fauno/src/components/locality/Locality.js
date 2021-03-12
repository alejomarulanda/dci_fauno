import React, { Component } from 'react';
import Menu from '../menu/Menu';
import Footer from '../footer/Footer';
import Periods from '../periods/Periods';
import Adm from './adm/Adm';
import Map from './map/Map';
import * as d3 from 'd3';

class Locality extends Component {
    constructor(props) {
        super(props);
        this.state = {
            adm_list: null,
            adm_current: null,
            periods: [{ value: "2010-2011", label: "2010-2011" }, { value: "2012-2012", label: "2012" }],
            map_country: { center: [4.64, -74.2], zoom: 5 },
            map_country_geodata: null
            
        };

    }

    componentWillMount() {
        this.fetchCsvAdm();
    }

    
    fetchCsvAdm() {
        const context = this;
        return d3.csv('/data/csv/adm.csv').then((data) => {
            context.setState({ adm_list: data });
        });
    }

    render() {
        return (
            <>
                <Menu />
                <div className="container-fluid">
                    <h1 className="text-center">Análisis de veredas</h1>
                    <section className="row">
                        <article className="col-md-6">
                            <Adm adm={this.state.adm_list} />
                            <Map center={this.state.map_country.center} zoom={this.state.map_country.zoom} data={this.map_country_geodata} />
                        </article>
                        <article className="col-md-6">
                            <Periods periods={this.state.periods} />

                        </article>
                    </section>
                </div>
                <Footer />
            </>

        )

    }

}

export default Locality;