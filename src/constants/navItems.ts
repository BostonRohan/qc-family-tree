type SectionItem = {
  title: string;
  href: string;
  description: string;
};

export type MenuItem = {
  title: string;
  href?: string;
  target?: string;
  submenu?: { title: string; href: string }[];
};

export const sections = {
  about: [
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
  getInvolved: [
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
    {
      title: "Membership",
      href: "/rhizome",
      description:
        "We are a group of aligned artists and cultural workers who design and present.",
    },
  ],
} satisfies Record<string, SectionItem[]>;

export const menuItems: MenuItem[] = [
  {
    title: "Home",
    href: "/",
    submenu: [{ title: "Contact", href: "/#contact" }],
  },
  {
    title: "About Us",
    submenu: sections.about.map(({ title, href }) => ({ title, href })),
  },
  {
    title: "Get Involved",
    submenu: sections.getInvolved.map(({ title, href }) => ({ title, href })),
  },
  { title: "Blog", href: "/" },
  {
    title: "Donate",
    href: "https://www.paypal.com/donate?hosted_button_id=5CZWHCA4YRQLW",
    target: "_blank",
  },
];
