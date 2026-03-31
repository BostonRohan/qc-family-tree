import { defineType, defineField } from "sanity";

export const heroType = defineType({
  name: "hero",
  title: "Hero",
  type: "document",
  fields: [
    defineField({
      name: "descriptor",
      title: "Descriptor",
      type: "string",
      validation: (rule) => rule.required().min(10).max(140),
    }),
    defineField({
      name: "primaryCtaLabel",
      title: "Primary CTA Label",
      type: "string",
      validation: (rule) => rule.required().min(1).max(25),
    }),
    defineField({
      name: "primaryCtaLink",
      title: "Primary CTA Link",
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "secondaryCtaLabel",
      title: "Secondary CTA Label",
      type: "string",
      validation: (rule) => rule.max(25),
    }),
    defineField({
      name: "secondaryCtaLink",
      title: "Secondary CTA Link",
      type: "url",
    }),
    defineField({
      name: "showHero",
      title: "Show Hero",
      type: "boolean",
      validation: (rule) => rule.required(),
      initialValue: true,
    }),
  ],
});
