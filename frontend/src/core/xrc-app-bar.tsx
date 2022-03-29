import { AppBar, IconButton, Toolbar, Typography } from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu';

interface XRCAppBarProps {
    onMenu: () => void
}

export const XRCAppBar: React.FC<XRCAppBarProps> = ({onMenu}) => {
    return <AppBar position="static">
        <Toolbar>
            <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={onMenu}
            >
                <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                XR Club Management System
            </Typography>
        </Toolbar>
    </AppBar>
}