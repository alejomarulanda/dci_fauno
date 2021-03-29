import { Redirect } from 'react-router-dom';

const Authorize = (Component) => {
    const AuthRoute = () => {
        const isAuth = !!localStorage.getItem("token");
        if (isAuth) {
            return <Component />;
        } else {
            return <Redirect to="/" />;
        }
    };

    return AuthRoute;
};

export default Authorize;