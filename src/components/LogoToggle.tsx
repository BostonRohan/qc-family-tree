import * as React from "react";

interface LogoToggleProps {
  heroSelector: string;
  logoSelector: string;
}

export default function LogoToggle({
  heroSelector,
  logoSelector,
}: LogoToggleProps) {
  React.useEffect(() => {
    const logo = document.querySelector<HTMLElement>(logoSelector);
    const hero = document.querySelector<HTMLElement>(heroSelector);

    if (!logo) {
      return;
    }

    const hide = () => {
      logo.classList.add("opacity-0", "pointer-events-none");
    };
    const show = () => {
      logo.classList.remove("opacity-0", "pointer-events-none");
    };

    if (!hero) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          hide();
        } else {
          show();
        }
      },
      { threshold: 0 },
    );

    hide();
    observer.observe(hero);

    return () => observer.disconnect();
  }, [heroSelector, logoSelector]);

  return null;
}
