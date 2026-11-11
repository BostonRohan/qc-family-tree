import { defineField, defineType } from "sanity";

export const rhizomeMembershipType = defineType({
  name: "rhizomeMembership",
  title: "Rhizome Membership",
  type: "document",
  fields: [
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
