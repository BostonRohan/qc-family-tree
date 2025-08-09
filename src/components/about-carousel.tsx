import ProgressCarousel from "./ui/progress-carousel";

interface Slide {
  image: string;
  title: string;
  description: string;
}

export default function AboutCarousel({
  slidesContent,
}: {
  slidesContent: Slide[];
}) {
  const slides = slidesContent.map((slide) => (
    <div className="space-y-4">
      <img src={slide.image} alt="" className="rounded-2xl" />
      <div>
        <h2 className="sm:text-lg font-ubuntu font-semibold">{slide.title}</h2>
        <p className="opacity-80 sm:text-base text-sm">{slide.description}</p>
      </div>
    </div>
  ));

  return <ProgressCarousel options={{ dragFree: true }} slides={slides} />;
}
