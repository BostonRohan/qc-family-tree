import * as React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function PhotoCarousel({
  images,
}: {
  images: { src: string; alt: string }[];
}) {
  return (
    <Carousel className="w-full">
      <CarouselContent className="w-full">
        {images.map(({ src, alt }, index) => (
          <CarouselItem key={index}>
            <div className="flex items-center justify-center w-full h-full max-w-3xl mx-auto">
              <img
                src={src}
                alt={alt}
                className="object-cover rounded-2xl w-full h-full aspect-[4/3]"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
