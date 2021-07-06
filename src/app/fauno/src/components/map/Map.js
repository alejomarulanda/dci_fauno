import React, { Component } from 'react';
import * as turf from '@turf/turf'

import { MapContainer, TileLayer, GeoJSON, LayersControl, WMSTileLayer, Polygon, CircleMarker, Tooltip, Marker, Popup, Polyline } from 'react-leaflet'

function Map(props) {
    const [url_def, setUrlDef] = React.useState("http://localhost:8600/geoserver/deforestacion_anual/wms");
    //const [color_risk, setColorRisk] = React.useState(["#33cc33", "#ffff66", "#ffcc66", "#ff9966", "#ff0066"]);
    const { BaseLayer } = LayersControl;

    return (
        <>
            <MapContainer center={props.center} zoom={props.zoom} style={{ height: '600px' }} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {props.type === 'detail' ?
                    <LayersControl position="topright">
                        <BaseLayer name="Deforestacion 2010">
                            <WMSTileLayer
                                layers={'deforestacion_anual:2010'}
                                attribution=''
                                url={url_def}
                                format={"image/png"}
                                transparent={true}
                            />
                        </BaseLayer>
                        <BaseLayer name="Deforestacion 2012">
                            <WMSTileLayer
                                layers={'deforestacion_anual:2012'}
                                attribution=''
                                url={url_def}
                                format={"image/png"}
                                transparent={true}
                            />
                        </BaseLayer>
                        <BaseLayer name="Deforestacion 2013">
                            <WMSTileLayer
                                layers={'deforestacion_anual:2013'}
                                attribution=''
                                url={url_def}
                                format={"image/png"}
                                transparent={true}
                            />
                        </BaseLayer>
                    </LayersControl> :
                    <LayersControl position="topright"></LayersControl>
                }

                {props.buffers_main && props.buffers_main.length > 0 ?
                    props.buffers_main.map((item) => {
                        var pt = {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [item.lat, item.lon]
                            },
                            properties: {}
                        };
                        var buffered = turf.buffer(pt, parseFloat(item.buffer_radio) / 1000.0, { units: 'kilometers' });
                        return (
                            <Polygon key={'buffer_' + item.ext_id} positions={buffered.geometry.coordinates}>
                                <Marker key={'plot_' + item.ext_id} position={[item.lat, item.lon]}>
                                    <Popup>
                                        <span>Predio: {item.ext_id}</span>
                                    </Popup>
                                </Marker>
                            </Polygon>
                        )
                    }) :
                    ""}
                {props.mobilization && props.mobilization.length > 0 ?
                    props.mobilization.map((item) => {
                        return (
                            <Marker key={'marker_' + item.mob.ext_id + '_' + item.type} position={[item.mob.lat, item.mob.lon]}>
                                <Popup>
                                    <span>{item.mob.ext_id}, Total animales: {item.total}</span>
                                </Popup>
                            </Marker>
                        )
                    }) :
                    ""}
                {props.mobilization && props.mobilization.length > 0 ?
                    props.mobilization.map((item) => {
                        return (
                            <Polyline key={'line_' + item.mob.ext_id + '_' + item.type} positions={[[item.focus.lat, item.focus.lon], [item.mob.lat, item.mob.lon]]} color={'red'} />
                        )
                    }) :
                    ""}
                {props.geo  ? <GeoJSON attribution="" key={"localities_geojson"} data={props.geo} /> : <GeoJSON attribution="" />}

            </MapContainer>
        </>
    );


}

export default Map;