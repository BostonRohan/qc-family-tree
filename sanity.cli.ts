import { defineCliConfig } from "sanity/cli";

const projectId = process.env.PUBLIC_SANITY_STUDIO_PROJECT_ID || "224rluxp";
const dataset = process.env.PUBLIC_SANITY_STUDIO_DATASET || "staging";

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
});
