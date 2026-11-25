import { defineField, defineType } from "sanity";

export const rhizomeMembershipType = defineType({
  name: "rhizomeMembership",
  title: "Rhizome Membership",
  type: "document",
  fields: [
    defineField({
      name: "season",
      title: "Season Year",
      type: "number",
      initialValue: 2027,
      validation: (rule) => rule.required().integer().min(2000).max(9999),
    }),
    defineField({
      name: "annualFee",
      title: "Annual Fee (USD)",
      type: "number",
      initialValue: 45,
      validation: (rule) => rule.required().min(0).precision(2),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Rhizome Membership" }),
  },
});
