import React, { Component } from 'react';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON, LayersControl, WMSTileLayer } from 'react-leaflet'

function Map(props) {
    const url_def = "http://localhost:8600/geoserver/deforestation_annual/wms";
    const { BaseLayer } = LayersControl;

    return (
        <>
            <MapContainer center={props.center} zoom={props.zoom} style={{ height: '600px' }} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LayersControl position="topright">
                    <BaseLayer name="Deforestacion 2010">
                        <WMSTileLayer
                            layers={'deforestation_annual:2010'}
                            attribution=''
                            url={url_def}
                        />
                    </BaseLayer>
                    <BaseLayer name="Deforestacion 2012">
                        <WMSTileLayer
                            layers={'deforestation_annual:2012'}
                            attribution=''
                            url={url_def}
                        />
                    </BaseLayer>
                </LayersControl>
                {console.log(props.geo)}
                {props.geo ? <GeoJSON attribution="" key={props.geo.key} data={props.geo.json} /> : <GeoJSON attribution="" />}

            </MapContainer>
        </>
    );


}

export default Map;