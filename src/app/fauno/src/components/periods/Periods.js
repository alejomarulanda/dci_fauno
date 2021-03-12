import React, { Component } from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';

class Periods extends Component {
    state = { current: this.props.periods[0] };

    changePeriod = (new_period, evt) => {
        evt.preventDefault();
        this.setState({ current: new_period });
    }

    render() {
        return (
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h3>Período de análisis</h3>
                <DropdownButton id="cboPeriods" title={this.state.current.label}>                    
                    {this.props.periods.map((item, idx) => (
                        <Dropdown.Item onClick={e => this.changePeriod(item, e)} key={idx}>{item.label}</Dropdown.Item>
                    ))}
                </DropdownButton>
            </div>
        );
    }
}

export default Periods;