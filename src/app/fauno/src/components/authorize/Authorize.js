import { Redirect } from 'react-router-dom';

function Authorize(Component) {
    
    const AuthRoute = () => {
        const isAuth = !!localStorage.getItem("token");
        if (isAuth) {
            return <Component />;
        } else {
            return <Redirect to="/restringido" />;
        }
    };

    return AuthRoute;
};

export default Authorize;