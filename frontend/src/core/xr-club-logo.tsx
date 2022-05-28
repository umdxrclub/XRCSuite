import { CSSProperties } from "react"
import "./xr-club-logo.css"

export type XRClubLogoProps = {
    style?: CSSProperties | undefined
}

export const XRClubLogo: React.FC<XRClubLogoProps> = ({children, style}) => {
    return <div style={style} className="clublogo-parent">
        <img className="clublogo" src="/frontend/static/img/clublogo.png" />
    </div>
}