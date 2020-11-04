import React from 'react';
import { Route, Switch } from 'react-router';
import Login from './Login';
import Register from './Register';
import Logout from './Logout';
import ResetPassKey from './ResetPasskey';
import Homepage from '../Landing/NewDesign/Homepage';
import StyleGuide from '../Landing/NewDesign/icons/Styleguide';

const Session = () => (
  <Switch>
    <Route component={Homepage} exact path="/homepage" />
    <Route component={StyleGuide} exact path="/styleguide" />
    <Route component={Register} exact path="/register" />
    <Route component={Logout} exact path="/logout" />
    <Route component={ResetPassKey} exact path="/reset-passkey" />
    <Route component={Login} exact path="/" />
  </Switch>
);

export default Session;
