import { defineField, defineType } from "sanity";

export const alumniType = defineType({
  name: "alumni",
  title: "Culture Bearer Alumni",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "cohort", title: "Cohort", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "portrait", title: "Portrait", type: "image", options: { hotspot: true } }),
    defineField({ name: "altText", title: "Image alt text", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "url", title: "Website or social URL", type: "url" }),
    defineField({ name: "displayOrder", title: "Display order", type: "number", initialValue: 0 }),
    defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true }),
  ],
  preview: { select: { title: "name", subtitle: "cohort", media: "portrait" } },
});
