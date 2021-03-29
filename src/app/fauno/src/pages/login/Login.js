import React, { Component } from 'react';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { Redirect } from 'react-router-dom';
import { isEmail } from "validator";

import AuthUser from "../../services/AuthUser";

import './Login.css';

const required = value => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

function Login() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [form, setForm] = React.useState();
    const [chkBtn, setChkButton] = React.useState();
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState("");

    function onChangeUsername(e) {
        setEmail(e.target.value);
    }

    function onChangePassword(e) {
        setPassword(e.target.value);
    }

    function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        form.validateAll();

        if (chkBtn.context._errors.length === 0) {            
            AuthUser.login(email, password).then(
                () => {
                    //push("/user");
                    //window.location.reload();
                    return <Redirect to='/usuario' />
                },
                error => {
                    const resMessage = (error.response && error.response.data && error.response.data.message) ||
                        error.message || error.toString();
                    setLoading(false);
                    setMessage(resMessage);
                }
            );
        } else {
            setLoading(false);
        }
    }

    return (
        <>
            <main className="form-signin">
                <Form ref={c => { setForm(c); }} onSubmit={handleLogin} >
                    <h1 className="h3 mb-3 fw-normal text-center">Iniciar sesión</h1>
                    <div className="form-floating">
                        <label for="txtEmail">Email</label>
                        <Input type="text" className="form-control" id="txtEmail" placeholder="name@example.com"
                            value={email} onChange={onChangeUsername} validations={[required]} />
                    </div>
                    <div className="form-floating">
                        <label for="txtPassword">Password</label>
                        <Input type="password" className="form-control" id="txtPassword" placeholder="Password"
                            value={password} onChange={onChangePassword} validations={[required]} />
                    </div>
                    <button className="w-100 btn btn-lg btn-primary" disabled={loading}>
                        {loading && (
                            <span className="spinner-border spinner-border-sm"></span>
                        )}
                        <span>Enviar</span>
                    </button>
                    {message && (
                        <div className="form-group">
                            <div className="alert alert-danger" role="alert">
                                {message}
                            </div>
                        </div>
                    )}
                    <CheckButton style={{ display: "none" }} ref={c => { setChkButton(c); }} />
                </Form>
            </main>
        </>
    )

}

export default Login;