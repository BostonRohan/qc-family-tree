import { defineType, defineField } from "sanity";

export const bannerType = defineType({
  name: "banner",
  title: "Banner",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(4).max(50),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      validation: (rule) => rule.min(1).max(100),
    }),
    defineField({
      name: "primaryCtaLink",
      title: "Primary CTA Link",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "primaryCtaLabel",
      title: "Primary CTA Label",
      type: "string",
      validation: (rule) => rule.required().min(1).max(25),
    }),
  ],
});
