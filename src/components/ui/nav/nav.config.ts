import { donateLink } from "@constants";

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

export const nav: NavItem[] = [
  {
    title: "Home",
    href: "/",
    children: [
      {
        title: "Contact",
        href: "/#contact",
        description:
          "Get in touch via phone or email, and check our business hours and location.",
      },
    ],
  },
  {
    title: "About Us",
    children: [
      {
        title: "Who we are",
        href: "#about",
        description: "Learn about our mission and the people behind it.",
      },
      {
        title: "What we do",
        href: "/",
        description:
          "See how we cultivate community, creativity, and justice together.",
      },
    ],
  },
  {
    title: "Get Involved",
    children: [
      {
        title: "Contribute",
        href: "/",
        description:
          "Give your time, skills, or resources to support the community.",
      },
      {
        title: "Events",
        href: "/",
        description:
          "Join gatherings that celebrate, connect, and strengthen our community.",
      },
      {
        title: "Sponsor a Community Meal",
        href: "/",
        description:
          "Help provide a shared meal that nourishes bodies and relationships.",
      },
    ],
  },
  {
    title: "Donate",
    href: donateLink,
    target: "_blank",
  },
];
