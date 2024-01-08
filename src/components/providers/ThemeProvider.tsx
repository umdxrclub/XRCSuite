import { createTheme, ThemeProvider } from "@mui/material";
import React from "react";
import "./xrc-suite.css"

const theme = createTheme({

})

type ThemeProviderProps = {
    children: React.ReactNode
}

export const MUIThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
    return <ThemeProvider theme={theme}>
        { children }
    </ThemeProvider>
}