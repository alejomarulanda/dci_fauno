import React, { Component } from 'react';
import Select from 'react-select';
import './SelectPlace.css';

class SelectPlace extends Component {
    state = { current: null };

    onChange = (values) => {
        this.setState({ current: values });
    }

    render() {
        return (
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h3>{this.props.title}</h3>
                <Select id="cboAdmin" className="AdmSelect" 
                        isMulti={true} isSearchable={true} 
                        options={this.props.options} 
                        onChange={(e) => {this.props.onChange(e)}} />
            </div>
        );
    }
}

export default SelectPlace;