import "./gradient-card.css"
import React from "react";

type GradientCardProps = {
    children?: React.ReactNode,
    style?: React.CSSProperties
}

export const GradientCard: React.FC<GradientCardProps> = ({ children, style }) => {
    return <div className="gradient-card" style={{padding: 16}}>
        {children}
    </div>
}