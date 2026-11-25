import { defineField, defineType } from "sanity";

export const featuredSectionType = defineType({
  name: "featuredSection",
  title: "Featured Section",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow / Update Type",
      description: "Optional short label such as Upcoming Event, Announcement, or Community Story.",
      type: "string",
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(4).max(100),
    }),
    defineField({
      name: "dateLine",
      title: "Date or Supporting Line",
      description: "Optional bold line beneath the title, such as an event date or short callout.",
      type: "string",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "string",
      validation: (rule) => rule.required().min(1).max(10000),
    }),
    defineField({
      name: "image",
      title: "Featured Image",
      description: "Shown first, above the text. Add a new image for each featured update.",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "imageAlt",
      title: "Featured Image Description",
      description: "Describe the people or activity shown for visitors using a screen reader.",
      type: "string",
      validation: (rule) =>
        rule.max(200).custom((value, context) => {
          const document = context.document as { image?: unknown } | undefined;
          return document?.image && !value
            ? "Add a description for the featured image."
            : true;
        }),
    }),
    defineField({
      name: "primaryCtaLink",
      title: "Primary CTA Link",
      type: "string",
    }),
    defineField({
      name: "primaryCtaLabel",
      title: "Primary CTA Label",
      type: "string",
      validation: (rule) => rule.max(25),
    }),

    defineField({
      name: "highlights",
      title: "Highlights",
      description: "Optional short items shown as a compact list (for example, event activities or key details).",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: "secondaryCtaLink",
      title: "Secondary CTA Link",
      type: "string",
    }),
    defineField({
      name: "secondaryCtaLabel",
      title: "Secondary CTA Label",
      type: "string",
      validation: (rule) => rule.max(25),
    }),
  ],
});
