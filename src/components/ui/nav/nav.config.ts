export type NavItem = {
  title: string;
  href?: string;
  target?: string;
  description?: string; // desktop only
  children?: {
    title: string;
    href: string;
    description?: string;
  }[];
};

import { donateLink } from "@constants";

export const nav: NavItem[] = [
  {
    title: "About",
    href: "/about",
    children: [
      {
        title: "Mission & Values",
        href: "/about#mission",
        description:
          "Cultivating community for the common good with justice, imagination, and mutual care.",
      },
      {
        title: "Programs & Pillars",
        href: "/about#programs-about",
        description:
          "Our four program pillars and how they translate the mission into housing, culture, and care.",
      },
    ],
  },
  {
    title: "Get Involved",
    children: [
      {
        title: "Events",
        href: "/#events",
        description:
          "Upcoming gatherings that celebrate, connect, and strengthen community.",
      },
      {
        title: "Membership",
        href: "/rhizome",
        description: "Join the Rhizome Coalition and co-create cultural power.",
      },
      {
        title: "Freedom Fridge",
        href: "/freedom-fridge",
        description: "See how mutual aid keeps food flowing 24/7.",
      },
      {
        title: "Here for Good Business Cooperative",
        href: "/here-for-good",
        description:
          "Learn about HFGB, our corridor revitalization initiative.",
      },
    ],
  },
  {
    title: "Donate",
    href: donateLink,
    target: "_blank",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];
