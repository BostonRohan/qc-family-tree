import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "studio/schemaTypes/index";

export default defineConfig({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
