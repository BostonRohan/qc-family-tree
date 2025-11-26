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
  // {
  //   title: "About Us",
  //   children: [
  //     {
  //       title: "Who we are",
  //       href: "#about",
  //       description: "Learn about our mission and the people behind it.",
  //     },
  //     {
  //       title: "What we do",
  //       href: "/",
  //       description:
  //         "See how we cultivate community, creativity, and justice together.",
  //     },
  //   ],
  // },
  {
    title: "Get Involved",
    children: [
      {
        title: "Contribute",
        href: donateLink,
        description:
          "Give your time, skills, or resources to support the community.",
      },
      {
        title: "Events",
        href: "/events",
        description:
          "Join gatherings that celebrate, connect, and strengthen our community.",
      },
      {
        title: "Membership",
        href: "/rhizome",
        description:
          "We are a group of aligned artists and cultural workers who design and present.",
      },
    ],
  },
  {
    title: "Programs",
    href: "#programs",
    // children: [
    //   {
    //     title: "Featured Programs or Services",
    //     href: "/#programs",
    //     description:
    //       "Explore our featured programs and services that support the community.",
    //   },
    //   {
    //     title: "Housing Justice",
    //     href: "/#programs",
    //     description:
    //       "QCFT is an affordable housing provider and is actively involved in affordable housing advocacy, partnering with organizations like the West Side Community Land Trust to prevent displacement and ensure stable living conditions for residents.",
    //   },
    //   {
    //     title: "Cultural Organizing",
    //     href: "/#programs",
    //     description:
    //       "QCFT is known for its cultural organizing initiatives, like the Rhizome Coalition, which brings together artists and cultural workers to create art that is rooted in communities of place, tradition, or spirit.",
    //   },
    //   {
    //     title: "Community Programming",
    //     href: "/#programs",
    //     description:
    //       "QC Family Tree creates inclusive programs that focus on reducing disparities in access to resources and opportunities.",
    //   },
    //   {
    //     title: "Here for Good Business Cooperative",
    //     href: "/#programs",
    //     description:
    //       "MISSION: To cultivate a thriving, just, and culturally rich economy in the Freedom-Wilkinson Corridor grounded in community-driven development, equity, and collective empowerment.",
    //   },
    // ],
  },
  {
    title: "Donate",
    href: donateLink,
    target: "_blank",
  },
];
