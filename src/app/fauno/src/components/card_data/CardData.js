import React, { Component } from 'react';

import ListLocalities from '../../components/list_localities/ListLocalities';

function CardData(props) {    
    const [localities, setLocalities] = React.useState();

    const handleChange = event => {        
        props.onChange(event);
    };
    
    React.useEffect(() => {
        
        return () => undefined;
    }, []);

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
                    {props.list_localities ?
                        <div className="form-horizontal">
                            <div className="form-group row">
                                <div className="col-sm-12">
                                    <ListLocalities id="txtLocalities" 
                                        list={props.list_localities} 
                                        onChange={handleChange} />
                                </div>
                            </div>
                        </div> : ""}
                    <div className="form-horizontal">
                        <div className="form-group row">
                            <label className="col-sm-11 col-form-label">
                                <a href={props.url} target="_blank">{props.url}</a>
                            </label>
                            <div className="col-sm-1">
                                <a role="button" className="btn btn-success" href="{props.url}" target="_blank">Descargar</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}

export default CardData;