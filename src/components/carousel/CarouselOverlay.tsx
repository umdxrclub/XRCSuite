import React from "react";
import "./carousel.css"

type CarouselOverlayProps = {
    children?: React.ReactNode;
}

const CarouselOverlay: React.FC<CarouselOverlayProps> = ({children}) => {
    return <div className="carousel-overlay">
        {children}
    </div>
}

export default CarouselOverlay;
