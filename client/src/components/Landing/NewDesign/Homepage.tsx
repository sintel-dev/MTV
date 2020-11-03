import React, { Component } from 'react';
import StyleGuide from './icons/Styleguide';
import './Homepage.scss';

class Homepage extends Component {
  componentDidMount() {
    document.querySelector('body').classList.add('homepage');
  }

  render() {
    return <StyleGuide />;
  }
}

export default Homepage;
