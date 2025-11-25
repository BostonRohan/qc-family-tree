import * as React from "react";

import { type Slide } from "./slide.types";

import Content from "./content";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousels/carousel";

export function DefaultCarousel({ slides }: { slides: Slide[] }) {
  return (
    <Carousel className="w-full md:max-w-[90%] max-w-[80%] mx-auto">
      <CarouselContent className="-ml-1">
        {slides.map((slide, index) => (
          <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Content slide={slide} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
