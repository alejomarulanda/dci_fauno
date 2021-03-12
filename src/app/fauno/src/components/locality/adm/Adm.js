import React, { Component } from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';

class Adm extends Component {
    state = { current: null };

    changeAdm = (new_adm, evt) => {
        evt.preventDefault();
        this.setState({ current: new_adm });
    }

    render() {
        return (
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h3>Departamento</h3>
                <DropdownButton id="cboAdm" title={this.state.current ? this.state.current.name : ""}>                    
                    {this.props.adm ?
                        this.props.adm.map((item, idx) => (
                            <Dropdown.Item onClick={e => this.changeAdm(item, e)} key={item.id}>{item.name}</Dropdown.Item>
                        )):<span />
                    }
                </DropdownButton>
            </div>
        );
    }
}

export default Adm;