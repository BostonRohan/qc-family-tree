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
  arrowClassName = "",
}: {
  images: { src: string; alt: string }[];
  arrowClassName?: string;
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
                  width={4}
                  height={3}
                  loading="lazy"
                  className="object-cover rounded-2xl w-full aspect-[4/3]"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className={`absolute left-3 top-1/2 z-10 -translate-y-1/2 ${arrowClassName}`} />
        <CarouselNext className={`absolute right-3 top-1/2 z-10 -translate-y-1/2 ${arrowClassName}`} />
      </div>
    </Carousel>
  );
}
