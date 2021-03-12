import React, { Component } from 'react';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'

class Map extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>  
                <MapContainer center={this.props.center} zoom={this.props.zoom} style={{ height: '600px' }} scrollWheelZoom={true}>
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {this.props.geodata ? <GeoJSON attribution="" data={this.props.data} /> : <GeoJSON attribution="" /> }
                    
                </MapContainer>
            </>
        );

    }

}

export default Map;