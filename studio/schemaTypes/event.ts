import { defineField, defineType } from "sanity";

export const eventType = defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(4).max(100),
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
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "startDateTime",
      title: "Start Date Time",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDateTime",
      title: "End Date Time",
      type: "datetime",
      validation: (rule) =>
        rule.custom((endDateTime, context) => {
          const { document } = context;
          const startDateTime = document?.startDateTime;

          if (!endDateTime) {
            return "End Date Time is required.";
          }

          if (startDateTime && endDateTime < startDateTime) {
            return "End date Time cannot be before the start date.";
          }
          return true;
        }),
    }),
    defineField({
      name: "ctaLink",
      title: "CTA Link",
      type: "url",
    }),
    defineField({
      name: "isFull",
      title: "Is Full",
      type: "boolean",
    }),
  ],
});
