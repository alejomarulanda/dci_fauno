import React, { Component } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';

function ListLocalities(props) {
    const [selected, setSelected] = React.useState();

    const handleChange = event => {        
        props.onChange(event);
    };

    React.useEffect(() => {
        return () => undefined;
    }, []);

    return (
        <>
            <Typeahead id="txtLocalities" onChange={handleChange}
                options={props.list}
                placeholder="Cali, el aguacatal"
                multiple
                selected={selected}
                size={"small"} />
        </>
    );

}

export default ListLocalities;