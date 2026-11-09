import { defineType, defineField, getPublishedId } from "sanity";
import { getBannerDocumentId } from "@/utils/banner";

export const bannerType = defineType({
  name: "banner",
  title: "Banner",
  type: "document",
  validation: (rule) =>
    rule.custom(async (document, { getClient }) => {
      if (!document?._id) return true;

      const client = getClient({ apiVersion: "2025-08-08" });
      const bannerId = await getBannerDocumentId(client);
      return getPublishedId(document._id) === bannerId
        ? true
        : "Only one banner can be published. Edit the existing Banner in Content.";
    }),
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
    defineField({
      name: "showBanner",
      title: "Show Banner",
      type: "boolean",
      validation: (rule) => rule.required(),
      initialValue: true,
    }),
  ],
});
