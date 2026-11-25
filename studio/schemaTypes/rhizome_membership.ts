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
    defineField({
      name: "signupUrl",
      title: "Sign-up link",
      description: "The destination for the Rhizome Membership sign-up buttons.",
      type: "url",
      initialValue: "https://docs.google.com/forms/d/e/1FAIpQLSea5129FAq4Z_JIOhByXJFjGYem2_Y3kNDzDTx17BlMVK6TfA/viewform",
      validation: (rule) => rule.required().uri({ scheme: ["http", "https"] }),
    }),
  ],
});
