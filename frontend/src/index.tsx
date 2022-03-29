import { ThemeProvider } from '@emotion/react';
import { createTheme, CssBaseline } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import packageJson from "../package.json";
import { App } from './core/app';
import './index.css';

const xrcTheme = createTheme({
  palette: {
    primary: {
      main: "#a52256"
    },
    secondary: {
      main: "#4d1798"
    },
  }
})

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={xrcTheme}>
      <CssBaseline>
        <BrowserRouter basename={packageJson.homepage}>
          <App />
        </BrowserRouter>
      </CssBaseline>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);