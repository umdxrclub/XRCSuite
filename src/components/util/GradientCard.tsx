import "./gradient-card.css"
import React from "react";

type GradientCardProps = {
    children?: React.ReactNode
}

export const GradientCard: React.FC<GradientCardProps> = ({ children }) => {
    return <div className="gradient-card">
        {children}
    </div>
}