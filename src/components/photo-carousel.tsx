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
    <Carousel className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <CarouselContent>
          {images.map(({ src, alt }, index) => (
            <CarouselItem key={index}>
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={src}
                  alt={alt}
                  className="object-cover rounded-2xl w-full aspect-[4/3]"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute -left-10 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute -right-10 top-1/2 -translate-y-1/2" />
      </div>
    </Carousel>
  );
}
