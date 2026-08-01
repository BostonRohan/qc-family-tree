import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Alumni = {
  name?: string;
  cohort?: string;
  url?: string;
  alt: string;
  portraitUrl: string;
};

export default function AlumniCarousel({ alumni }: { alumni: Alumni[] }) {
  return (
    <Carousel className="mx-auto w-full max-w-6xl" opts={{ align: "start" }}>
      <CarouselContent className="-ml-4">
        {alumni.map((artist) => {
          const card = (
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <div className="aspect-[3/4] bg-muted">
                <img
                  src={artist.portraitUrl}
                  alt={artist.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl">{artist.name}</h3>
                <p className="text-base text-muted-foreground">{artist.cohort}</p>
              </div>
            </div>
          );

          return (
            <CarouselItem key={`${artist.name}-${artist.cohort}`} className="basis-[80%] pl-4 sm:basis-1/3 lg:basis-1/4">
              {artist.url ? (
                <a href={artist.url} target="_blank" rel="noreferrer noopener" aria-label={`Visit ${artist.name}`} className="block transition-opacity hover:opacity-80">
                  {card}
                </a>
              ) : (
                card
              )}
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="left-0 cursor-pointer bg-background/90" />
      <CarouselNext className="right-0 cursor-pointer bg-background/90" />
    </Carousel>
  );
}
