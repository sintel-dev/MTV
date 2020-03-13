import React, { Component } from 'react';
import { Route, Switch, RouteComponentProps } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Header from './components/Header/Header';
import Landing from './components/Landing/Landing';
import Experiment from './components/Timeseries/Overview/Experiment';

const transtitionTimeOut = { enter: 1000, exit: 1000 };

class App extends Component<RouteComponentProps> {
  render() {
    const { location } = this.props;

    const animateDirection = location.pathname === '/' ? 'animate-left' : 'animate-right';
    return (
      <div id="content-wrapper">
        <Header />
        <TransitionGroup component="div" className="page-slider">
          <CSSTransition
            key={location.pathname}
            timeout={transtitionTimeOut}
            classNames="page-slider"
            mountOnEnter
            unmountOnExit={false}
            transitionname="page-slider"
          >
            <div className={animateDirection}>
              <Switch location={location}>
                <Route exact path="/" component={Landing} />
                <Route exact path="/experiment/:id" component={Experiment} />
              </Switch>
            </div>
          </CSSTransition>
        </TransitionGroup>
      </div>
    );
  }
}

export default App;