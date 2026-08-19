import { defineField, defineType } from "sanity";

export const cultureBearerCohortType = defineType({
  name: "cultureBearerCohort",
  title: "Culture Bearer Next Cohort",
  type: "document",
  fields: [
    defineField({ name: "enabled", title: "Show next cohort", type: "boolean", initialValue: false }),
    defineField({ name: "title", title: "Application title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "applicationOpening", title: "Application opening copy", type: "string" }),
    defineField({ name: "applicationClosing", title: "Application closing copy", type: "string" }),
    defineField({ name: "residencyDates", title: "Residency dates", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "showcaseDates", title: "Showcase dates", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "applicationUrl", title: "Application URL", type: "url" }),
    defineField({ name: "additionalInformationUrl", title: "Additional information URL", type: "url" }),
    defineField({ name: "applicationButtonLabel", title: "Application button label", type: "string", initialValue: "Apply" }),
    defineField({ name: "additionalInformationButtonLabel", title: "Additional information button label", type: "string", initialValue: "Additional info" }),
  ],
});
