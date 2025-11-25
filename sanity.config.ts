import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "studio/schemaTypes/index";

// Define the actions that should be available for singleton documents
const singletonActions = new Set(["publish", "discardChanges", "restore"]);

const singletonTypes = new Set(["featuredSection"]);

export default defineConfig({
  projectId:
    import.meta.env?.PUBLIC_SANITY_PROJECT_ID ??
    process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset:
    import.meta.env?.PUBLIC_SANITY_DATASET ?? process.env.PUBLIC_SANITY_DATASET,
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
  ],
  schema: {
    types: schemaTypes,
  },
});
