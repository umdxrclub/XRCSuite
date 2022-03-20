import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Gatekeeper } from './gatekeeper/gatekeeper';
import { Home } from './home/Home';
import packageJson from "../package.json"
import { Devices } from './devices/devices';

ReactDOM.render(
  <React.StrictMode>
      <BrowserRouter basename={packageJson.homepage}>
        <Routes>
          <Route path="/" element={ <Home /> }/>
          <Route path="/devices" element={ <Devices /> } />
          <Route path="/gatekeeper/:eventcode" element={ <Gatekeeper /> }/>
        </Routes>
      </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);