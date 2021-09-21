import React from 'react';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";

import Authorize from '../../components/authorize/Authorize';

import AuthUser from "../../services/AuthUser";

const required = value => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};


function User() {
    const [c_password, setCPassword] = React.useState("");
    const [n_password, setNPassword] = React.useState("");
    const [con_password, setConPassword] = React.useState("");
    const [form, setForm] = React.useState();

    function onChangeCPassword(e) {
        setCPassword(e.target.value);
    }

    function onChangeNPassword(e) {
        setNPassword(e.target.value);
    }

    function onChangeConPassword(e) {
        setConPassword(e.target.value);
    }

    function handleForm(e) {
        e.preventDefault();
        //setLoading(true);
        //setMessage("");

        form.validateAll();

    }
    return (
        <>
            <h1>Usuario</h1>
            <h2>Información</h2>
            <table className="table">
                <tr>
                    <th>Email</th>
                    <td></td>
                </tr>
                <tr>
                    <th>Password</th>
                    <td><button className="btn btn-warning" data-toggle="modal" data-target="#myModal">Cambiar</button></td>
                </tr>
            </table>
            <h2>Nivel de acceso</h2>

            <div class="modal" id="myModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">Cambio de contraseña</h4>
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <Form ref={c => { setForm(c); }} onSubmit={handleForm} >
                                <div className="form-floating">
                                    <label htmlFor="txtCurrent">Password actual</label>
                                    <Input type="password" className="form-control" id="txtCurrent" placeholder="Password"
                                        value={c_password} onChange={onChangeCPassword} validations={[required]} />
                                </div>
                                <div className="form-floating">
                                    <label htmlFor="txtNew">Nuevo password</label>
                                    <Input type="password" className="form-control" id="txtNew" placeholder="Password"
                                        value={n_password} onChange={onChangeNPassword} validations={[required]} />
                                </div>
                                <div className="form-floating">
                                    <label htmlFor="txtConfirm">Confirmar password</label>
                                    <Input type="password" className="form-control" id="txtConfirm" placeholder="Password"
                                        value={con_password} onChange={onChangeConPassword} validations={[required]} />
                                </div>
                            </Form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-danger" data-dismiss="modal">Cambiar</button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )

}

export default Authorize(User);