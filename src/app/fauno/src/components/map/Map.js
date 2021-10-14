import React, { Component } from 'react';
import * as turf from '@turf/turf'

import { MapContainer, TileLayer, GeoJSON, LayersControl, WMSTileLayer, Polygon, CircleMarker, Tooltip, Marker, Popup, Polyline } from 'react-leaflet'

function Map(props) {
    const [url_def_annual, setUrlDefAnnual] = React.useState("http://localhost:8600/geoserver/deforestacion_anual/wms");
    const [url_def_summary, setUrlDefSummary] = React.useState("http://localhost:8600/geoserver/deforestacion_acumulada/wms");
    const [url_national_annual, setUrlNatAnnual] = React.useState("http://localhost:8600/geoserver/nacional_anual/wms");
    //const [color_risk, setColorRisk] = React.useState(["#33cc33", "#ffff66", "#ffcc66", "#ff9966", "#ff0066"]);
    const { BaseLayer } = LayersControl;
    const [years, setYears] = React.useState([2010,2012,2013,2014,2015,2016,2017,2018]);

    return (
        <>
            <MapContainer center={props.center} zoom={props.zoom} style={{ height: '600px' }} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LayersControl position="topright">
                    {props.national ? 
                        <>
                            <BaseLayer name={"Riesgo 2017 "}>
                                <WMSTileLayer
                                    layers={'nacional_anual:2017'}  
                                    attribution=''
                                    url={url_national_annual}
                                    format={"image/png"}
                                    transparent={true}
                                />
                            </BaseLayer>
                            <BaseLayer name={"Riesgo 2018 "}>
                                <WMSTileLayer
                                    layers={'nacional_anual:2018'}  
                                    attribution=''
                                    url={url_national_annual}
                                    format={"image/png"}
                                    transparent={true}
                                />
                            </BaseLayer>
                        </>
                        :
                        years.map((item,index)=>{
                        return <BaseLayer name={"Deforestación " + item}>
                                <WMSTileLayer
                                    layers={props.type === 'detail' ? 'deforestacion_anual:' + item: 'deforestacion_acumulada:' + item}  
                                    attribution=''
                                    url={props.type === 'detail' ? url_def_annual : url_def_summary}
                                    format={"image/png"}
                                    transparent={true}
                                />
                        </BaseLayer>
                    })}
                </LayersControl>
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