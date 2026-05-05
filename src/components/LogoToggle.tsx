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
    const mobileLogo = document.querySelector<HTMLElement>(
      "[data-mobile-nav-logo]",
    );

    const hide = (el: HTMLElement) => {
      el.classList.add("opacity-0", "pointer-events-none");
    };
    const show = (el: HTMLElement) => {
      el.classList.remove("opacity-0", "pointer-events-none");
    };

    const hero = document.querySelector<HTMLElement>(heroSelector);

    if (!hero) {
      if (logo) show(logo);
      if (mobileLogo) show(mobileLogo);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          if (logo) hide(logo);
          if (mobileLogo) hide(mobileLogo);
        } else {
          if (logo) show(logo);
          if (mobileLogo) show(mobileLogo);
        }
      },
      { threshold: 0 },
    );

    if (logo) hide(logo);
    if (mobileLogo) hide(mobileLogo);
    observer.observe(hero);

    return () => observer.disconnect();
  }, [heroSelector, logoSelector]);

  return null;
}
