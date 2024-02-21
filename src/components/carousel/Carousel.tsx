import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
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

  // The slides to display on the carousel
  const slides = useMemo(
    () => (children ? (Array.isArray(children) ? children : [children]) : []),
    [children]
  );

  // Create a function that cycles between slides and is updated whenever the
  // slides or interval changes.
  useEffect(() => {
    let nextSlide = () => {
      setIndex((i) => (i + 1) % (slides.length ?? 0));
      if (slides.length < 2) return;
      if (progressBarRef.current) {
        progressBarRef.current.animate([{ width: "0%" }, { width: "100%" }], {
          duration: interval,
          iterations: 1,
        });
      }
    };

    let id = setInterval(nextSlide, interval);
    nextSlide();

    return () => {
      clearInterval(id);
    };
  }, [slides.length, interval]);

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
      {slides.length > 1 ? (
        <div className="carousel-progress-bar">
          <div
            ref={progressBarRef}
            className={"carousel-progress-bar-indicator"}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Carousel;
