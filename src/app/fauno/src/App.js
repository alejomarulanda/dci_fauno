import React, { Component } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import Menu from './components/menu/Menu';
import Footer from './components/footer/Footer';

import Home from './pages/home/Home';
import About from './pages/about/About';
import Login from './pages/login/Login';
import User from './pages/user/User';
import Locality from './pages/locality/Locality';
import Plot from './pages/plot/Plot';
import Data from './pages/data/Data';

import './App.css';

class App extends Component {
  render() {
    return (
      <>
        <Menu />
        <Router>
          <div>
            <Switch>
              {/* Pages */}
              <Route exact path='/' component={Home} />
              <Route path='/login' component={Login} />
              <Route path='/usuario' component={User} />
              <Route path='/productor' component={Plot} />
              <Route path='/vereda' component={Locality} />
              <Route path='/datos' component={Data} />
              <Route path='/acercade' component={About} />
              
            </Switch>
          </div>
        </Router>
        <Footer />
      </>
    );
  }

}

export default App;
