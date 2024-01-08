import React, { useState, useEffect, useRef } from "react";
import "./carousel.css";

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

type CarouselProps = {
  interval: number;
  children?: React.ReactNode;
};

const Carousel: React.FC<CarouselProps> = ({ interval, children }) => {
  let progressBarRef = useRef<HTMLDivElement>(null);
  let [index, setIndex] = useState<number>(-1);

  let slides = children
    ? Array.isArray(children)
      ? children
      : [children]
    : [];

  function nextSlide() {
    if (slides.length < 2) return;
    setIndex((i) => (i + 1) % (slides.length ?? 0));
    if (progressBarRef.current) {
      progressBarRef.current.animate([{ width: "0%" }, { width: "100%" }], {
        duration: interval,
        iterations: 1
      });
    }
  }

  useEffect(() => {
    console.log("init")
    let id = setInterval(nextSlide, interval);
    nextSlide();

    return () => {
      clearInterval(id);
    };
  }, [interval]);

  return (
    <div className="carousel">
      <div className="carousel-children">
        {slides.map((c, i) => {
          var activeClass: string = "";
          if (i == index) {
            activeClass = "carousel-active-child-enter";
          } else if (i == mod(index - 1, slides.length)) {
            activeClass = "carousel-active-child-leave";
          }
          return (
            <div
              key={`carousel-child-${i}`}
              className={`carousel-child ${activeClass}`}
            >
              {c}
            </div>
          );
        })}
      </div>
      <div className="carousel-progress-bar">
        <div
          ref={progressBarRef}
          className={"carousel-progress-bar-indicator"}
        />
      </div>
    </div>
  );
};

export default Carousel;
