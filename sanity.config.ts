import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "studio/schemaTypes/index";
import { getEnvVar, getRequiredEnvVar } from "@/utils/sanity";

export default defineConfig({
  projectId: getRequiredEnvVar("PUBLIC_SANITY_STUDIO_PROJECT_ID"),
  dataset: getRequiredEnvVar("PUBLIC_SANITY_DATASET"),
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Featured Section")
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
          ]),
    }),
    structureTool({
      structure: (S) =>
        S.list()
          .title("Banner")
          .items([
            // Our singleton type has a list item with a custom child
            S.listItem().title("Banner").id("banner").child(
              // Instead of rendering a list of documents, we render a single
              // document, specifying the `documentId` manually to ensure
              // that we're editing the single instance of the document
              S.document().schemaType("banner").documentId("banner"),
            ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
