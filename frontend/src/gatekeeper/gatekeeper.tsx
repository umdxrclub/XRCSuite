import { Button } from "@mui/material"
import { useHref, useNavigate } from "react-router-dom"

export const Gatekeeper: React.FC = ({children}) => {
    const navigate = useNavigate();

    return <div>
        <Button onClick={() => navigate("/gatekeeper/lab")}>Lab Gatekeeper</Button>
    </div>
}