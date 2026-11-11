import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "studio/schemaTypes/index";
import { getBannerDocumentId } from "@/utils/banner";
import { getRequiredEnvVar } from "@/utils/sanity";

export default defineConfig({
  projectId: getRequiredEnvVar("PUBLIC_SANITY_STUDIO_PROJECT_ID"),
  dataset: getRequiredEnvVar("PUBLIC_SANITY_STUDIO_DATASET"),
  plugins: [
    structureTool({
      structure: (S, { getClient }) =>
        S.list()
          .title("Content")
          .items([
            // Our singleton type has a list item with a custom child
            S.listItem().title("Featured Section").id("featuredSection").child(
              // Instead of rendering a list of documents, we render a single
              // document, specifying the `documentId` manually to ensure
              // that we're editing the single instance of the document
              S.document()
                .schemaType("featuredSection")
                .documentId("featuredSection"),
            ),
            S.listItem().title("Culture Bearer Next Cohort").id("cultureBearerCohort").child(
              S.document().schemaType("cultureBearerCohort").documentId("cultureBearerCohort"),
            ),
            S.listItem().title("Rhizome Membership").id("rhizomeMembership").child(
              S.document().schemaType("rhizomeMembership").documentId("rhizomeMembership"),
            ),
            S.documentTypeListItem("alumni").title("Culture Bearer Alumni"),
            S.listItem().title("Banner").id("banner").child(async () => {
              const client = getClient({ apiVersion: "2025-08-08" });
              const documentId = await getBannerDocumentId(client);
              return S.document().schemaType("banner").documentId(documentId);
            }),
            S.documentTypeListItem("accountability").title("Accountability"),
          ]),
    }),
  ],
  document: {
    newDocumentOptions: (options) =>
      options.filter((option) => option.templateId !== "banner"),
    actions: (actions, { schemaType }) =>
      schemaType === "banner"
        ? actions.filter(({ action }) => !["duplicate", "delete", "unpublish"].includes(action ?? ""))
        : actions,
  },
  schema: {
    types: schemaTypes,
  },
});
