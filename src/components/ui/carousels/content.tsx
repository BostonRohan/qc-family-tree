import type { Slide } from "./slide.types";

function CarouselContent({ slide }: { slide: Slide }) {
  return (
    <div className="space-y-4">
      <img
        src={slide.image}
        alt=""
        className="rounded-2xl aspect-[4/3] w-full min-h-[180px] object-cover sm:min-h-[220px]"
      />
      <div>
        <h2 className="sm:text-lg font-ubuntu font-semibold">{slide.title}</h2>
        <p className="opacity-80 sm:text-base text-sm">{slide.description}</p>
      </div>
    </div>
  );
}

export default CarouselContent;
