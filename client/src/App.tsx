import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import Session from './components/Session';
import { getLoginStatus } from './model/selectors/users';
import Dashboard from './components/Landing';
import { getIsUserLoggedInAction } from './model/actions/users';
import { RootState } from './model/types';

export interface AppProps {
  loginStatus: 'fail' | 'loading' | 'unauthenticated' | 'authenticated';
  isUserLoggedIn: boolean;
  history?: Array<string>;
  location: {
    pathname: string;
  };
  checkUserStatus: () => void;
}

class App extends Component<AppProps, RouteComponentProps> {
  componentDidMount() {
    this.props.checkUserStatus();
  }

  render() {
    const { location, loginStatus } = this.props;
    return loginStatus === 'authenticated' ? <Dashboard location={location} /> : <Session />;
  }
}

export default connect(
  (state) => ({
    loginStatus: getLoginStatus(state),
  }),
  (dispatch: Function) => ({
    checkUserStatus: () => dispatch(getIsUserLoggedInAction()),
  }),
)(App);
