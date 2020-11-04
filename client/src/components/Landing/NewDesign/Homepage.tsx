import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { LogoutIcon } from 'src/components/Common/icons';

import { DatabaseIcon, MtvLogo } from './icons/icons';
import './Homepage.scss';
import SelectDropDown from './components/SelectDropdown';

class Homepage extends Component {
  componentDidMount() {
    document.querySelector('body').classList.add('homepage');
  }

  onSelectOption() {
    return console.log('Homepage onSelect option');
  }

  render() {
    return (
      <div>
        <div className="header">
          <NavLink to="/homepage">
            <MtvLogo />
          </NavLink>
          <ul className="user-options">
            <li>User picture here</li>
            <li>User Name here</li>
            <li>
              <LogoutIcon />
            </li>
          </ul>
        </div>

        <div className="home-wrapper">
          <div className="sidebar">
            <div className="item">
              <div className="heading">
                <h5 className="icon">
                  <i>
                    <DatabaseIcon />
                  </i>
                  <span>Dataset</span>
                </h5>
                <span className="filter">0</span>
              </div>
              <div className="details">
                <div className="row">
                  <SelectDropDown onSelect={() => this.onSelectOption()} labelValue="Select a Dataset" />
                </div>
                <div className="row">
                  <p>Dataset Details</p>
                  <div className="item">
                    <span>Signals</span>
                    <span>55</span>
                  </div>
                  <div className="item">
                    <span>Pipelines</span>
                    <span>2</span>
                  </div>
                  <div className="item">
                    <span>Experiments</span>
                    <span>6</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container">container here</div>
          <div className="clear" />
        </div>
      </div>
    );
  }
}

export default Homepage;