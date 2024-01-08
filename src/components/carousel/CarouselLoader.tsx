import { Carousel as CarouselType } from "payload/generated-types";
import React, { useEffect, useState, useMemo } from "react";
import CarouselOverlay from "./CarouselOverlay";
import "./carousel-slides.css";
import Carousel from "./Carousel";

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer T)[] ? T : never;
type CarouselSlide = ArrayElement<CarouselType["slides"]>;
type CarouselSlideBlockType = ArrayElement<CarouselType["slides"]>["blockType"];
type CarouselSlideType<T extends CarouselSlideBlockType> = ArrayElement<
  CarouselType["slides"]
> & { blockType: T };
type CarouselSlideRenderers = {
  [T in CarouselSlideBlockType]: (s: CarouselSlideType<T>) => React.ReactNode;
};

const SlideRenderers: CarouselSlideRenderers = {
  imageAndText: renderImageAndText,
};

function renderImageAndText(
  s: CarouselSlideType<"imageAndText">
): React.ReactNode {
  let img =
    (typeof s.image === "object" ? s.image?.url : undefined) ?? undefined;
  return (
    <>
      <img src={img} style={{objectFit: s.fit}} className="carousel-slide-img" />
      <CarouselOverlay>
        {s.title ? <h1>{s.title}</h1> : null}
        {s.text ? <h3>{s.text}</h3> : null}
      </CarouselOverlay>
    </>
  );
}

function renderSlide(s: CarouselSlide) {
    console.log("render")
  return (
    <div key={s.id} className="carousel-slide">
      {SlideRenderers[s.blockType](s)}
    </div>
  );
}

type CarouselLoaderProps = {
  carouselId: string;
  interval: number;
};

const CarouselLoader: React.FC<CarouselLoaderProps> = ({
  carouselId,
  interval,
}) => {
  let [carousel, setCarousel] = useState<CarouselType | undefined>();
  useEffect(() => {
    fetch(`/api/carousels/${carouselId}`).then(async (r) => {
      let j = await r.json();
      setCarousel(j);
    });
  }, [carouselId]);

  let slides = useMemo<React.ReactNode[]> (() => {
    return carousel ? carousel.slides.map(renderSlide) : [];
  }, [carousel])

  return carousel ? <Carousel interval={carousel.interval * 1000}>{...slides}</Carousel> : undefined;
};

export default CarouselLoader;
