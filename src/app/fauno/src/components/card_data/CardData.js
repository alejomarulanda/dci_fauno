import React, { Component } from 'react';


function CardData(props) {

    return (
        <>
            <div className="card">
                <div className="card-header">
                    {props.header}
                </div>
                <div className="card-body">
                    <h5 className="card-title">{props.title}</h5>
                    <p className="card-text">
                        {props.description}                        
                    </p>
                    <div className="form-horizontal">
                        <div className="form-group row">
                            <label className="col-sm-11 col-form-label">
                                <a href={props.url} target="_blank">{props.url}</a>
                            </label>
                            <div className="col-sm-1">
                                <a role="button" className="btn btn-success"  href="{props.url}" target="_blank">Descargar</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}

export default CardData;