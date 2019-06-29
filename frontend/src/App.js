import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom'
import 'normalize.css';
import './App.css';
import './Time.scss'
import Timer from './containers/Timer'


class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Timer/>
      </BrowserRouter>
    );
  }
}

export default App;
