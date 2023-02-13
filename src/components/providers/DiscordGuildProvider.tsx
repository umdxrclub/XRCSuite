import { DiscordGuildStats } from "../../types/XRCTypes";
import React, { useState, useEffect, useContext } from "react";


const DiscordGuildContext = React.createContext<DiscordGuildStats | null>(null)
type DiscordGuildProps = {
    children: React.ReactNode
}

export function useGuildContext(): DiscordGuildStats | null {
    return useContext(DiscordGuildContext)
}


const DiscordGuildProvider: React.FC<DiscordGuildProps> = ({ children }) => {
    const [ guild, setGuild ] = useState<DiscordGuildStats | null>(null);

    useEffect(() => {
        fetch("/api/globals/bot/stats")
        .then(async res => {
            let j = await res.json();
            setGuild(j)
        })
    }, [])

    return <DiscordGuildContext.Provider value={guild}>
        { children }
    </DiscordGuildContext.Provider>
}

export default DiscordGuildProvider;