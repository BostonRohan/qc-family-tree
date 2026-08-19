import { defineField, defineType } from "sanity";

const reportFields = [
  defineField({
    name: "year",
    title: "Year",
    type: "number",
    validation: (rule) => rule.required().integer().min(1900).max(2100),
  }),
  defineField({
    name: "url",
    title: "URL",
    type: "url",
    validation: (rule) => rule.required(),
  }),
];

export const accountabilityType = defineType({
  name: "accountability",
  title: "Accountability",
  type: "document",
  fields: [
    defineField({
      name: "annualReports",
      title: "Annual Reports",
      type: "array",
      of: [{ type: "object", fields: reportFields }],
      initialValue: [
        {
          year: 2025,
          url: "https://drive.google.com/file/d/1IBK84-g3meMXCCtYt0trhv0DN1Ud2C0g/view?usp=sharing",
        },
        {
          year: 2024,
          url: "https://drive.google.com/file/d/1obkW2SGpPdGztWhuNIfRWrGKMsCNSD7e/view?ts=69dfb735",
        },
        {
          year: 2023,
          url: "https://drive.google.com/file/d/1dyT6Sn5XYs9uibEl5XQNaeutBs-xa7Ly/view?ts=69dfb756",
        },
      ],
    }),
    defineField({
      name: "form990s",
      title: "Form 990s",
      type: "array",
      of: [{ type: "object", fields: reportFields }],
      initialValue: [
        {
          year: 2024,
          url: "https://projects.propublica.org/nonprofits/organizations/204091165/202503149349305480/full",
        },
        {
          year: 2023,
          url: "https://projects.propublica.org/nonprofits/organizations/204091165/202440729349301409/full",
        },
        {
          year: 2022,
          url: "https://projects.propublica.org/nonprofits/organizations/204091165/202313039349301436/full",
        },
      ],
    }),
  ],
});
