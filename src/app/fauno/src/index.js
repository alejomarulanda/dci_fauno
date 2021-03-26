import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Home from './pages/home/Home';
import About from './pages/about/About';
import Login from './pages/login/Login';
import Locality from './pages/locality/Locality';


ReactDOM.render(
  <Router>
	    <div>
	    	<Switch>
		        {/* Pages */}
		        <Route exact path='/' component={Home} />
				<Route path='/login' component={Login} />
		        <Route path='/nacional' component={Locality} />
            	<Route path='/acercade' component={About} />
	      	</Switch>
	    </div>
    </Router>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
