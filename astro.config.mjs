// Loading environment variables from .env files
// https://docs.astro.build/en/guides/configuring-astro/#environment-variables
import { loadEnv } from "vite";
import { defineConfig, fontProviders } from "astro/config";

const {
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
  PUBLIC_SANITY_STUDIO_DATASET,
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_DATASET,
} = loadEnv(import.meta.env.MODE, process.cwd(), "");

// Different environments use different variables
const projectId = PUBLIC_SANITY_STUDIO_PROJECT_ID || PUBLIC_SANITY_PROJECT_ID;
const dataset = PUBLIC_SANITY_STUDIO_DATASET || PUBLIC_SANITY_DATASET;

import sanity from "@sanity/astro";
import react from "@astrojs/react";

import vercel from "@astrojs/vercel";

import tailwind from "@tailwindcss/vite";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  // server is required to support embedded Sanity Studio
  // opt into static rendering on each page
  output: "server",
  site: "https://qcfamilytree.org",
  adapter: vercel({ imageService: true }),
  vite: {
    plugins: [tailwind()],
  },
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Ubuntu",
        cssVariable: "--font-ubuntu",
      },
    ],
  },
  integrations: [
    // Required for Sanity Studio
    sanity({
      projectId,
      dataset,
      studioBasePath: "/admin",
      useCdn: false,
      apiVersion: "2025-08-08",
    }),
    react(),
    icon(),
  ],
});
