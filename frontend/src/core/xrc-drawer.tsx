import { Devices, Home, Group } from "@mui/icons-material"
import { mdiDiscord } from '@mdi/js';
import { Icon as MDIIcon } from "@mdi/react";
import { Box, Drawer, List, Divider, ListItem, ListItemIcon, ListItemText, Icon } from "@mui/material"
import { useLayoutEffect, useState } from "react"
import { NavigateFunction, useNavigate } from "react-router-dom"
import PanToolIcon from '@mui/icons-material/PanTool';

interface XRCDrawerProps {
    open: boolean,
    onClose: () => void
}

type DrawerOption = {
    icon: JSX.Element | null,
    text: string,
    path: string
}

type DrawerItem = DrawerOption | "divider"

const DRAWER_ITEMS: DrawerItem[] = [
    {
        icon: <Home />,
        text: "Home",
        path: "/"
    },
    {
        icon: <Devices />,
        text: "Devices",
        path: "/devices"
    },
    {
        icon: <PanToolIcon />,
        text: "Gatekeeper",
        path: "/gatekeeper"
    },
    {
        icon: <Group />,
        text: "Members",
        path: "/members"
    },
    {
        icon: <MDIIcon path={mdiDiscord} size={1} />,
        text: "Discord",
        path: "/discord"
    }
]

export const XRCDrawer: React.FC<XRCDrawerProps> = ({open, onClose}) => {
    const [ drawer, setDrawer ] = useState<JSX.Element | null>(null)
    const navigate = useNavigate();

    useLayoutEffect(() => {
        const drawerItems = <List>
            {DRAWER_ITEMS.map(item => {
                if (item === "divider") {
                    return <Divider />
                } else {
                    return <ListItem button key={item.text} onClick={() => {
                        navigate(item.path)
                        onClose()
                    }}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                }
            })}
        </List>
        setDrawer(drawerItems)
    }, [DRAWER_ITEMS])

    return <Drawer anchor="left" open={open} onClose={onClose}>
        <Box sx={{width: 250}}>
            {drawer}
        </Box>
    </Drawer>
}