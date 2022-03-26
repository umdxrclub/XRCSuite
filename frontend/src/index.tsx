import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Gatekeeper } from './gatekeeper/gatekeeper';
import { Home } from './home/Home';
import packageJson from "../package.json"
import { Devices } from './devices/devices';
import { AppBar, Toolbar, Typography } from '@mui/material';

ReactDOM.render(
  <React.StrictMode>
      <BrowserRouter basename={packageJson.homepage}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              XRC Management System
            </Typography>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={ <Home /> }/>
          <Route path="/devices" element={ <Devices /> } />
          <Route path="/gatekeeper/:eventcode" element={ <Gatekeeper /> }/>
        </Routes>
      </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);