import { createTheme, ThemeProvider } from "@mui/material";
import React from "react";

const theme = createTheme({

})

type MUIThemeProviderProps = {
    children: React.ReactNode
}

export const MUIThemeProvider: React.FC<MUIThemeProviderProps> = ({children}) => {
    return <ThemeProvider theme={theme}>
        { children }
    </ThemeProvider>
}