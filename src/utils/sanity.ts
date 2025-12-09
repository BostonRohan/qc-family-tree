/**
 * Safely retrieves environment variables across different JavaScript contexts.
 *
 * This helper is necessary because Sanity Studio needs to work in two environments:
 *
 * 1. **Node.js (CLI context)**: When running Sanity CLI commands, we're in a Node.js
 *    environment where `process.env` is available and contains environment variables.
 *
 * 2. **Browser (Astro island hydration)**: When Astro hydrates components on the client-side,
 *    we're in a browser environment where `process` is not defined. Accessing `process`
 *    directly throws a ReferenceError. In this context, Astro/Vite exposes environment
 *    variables through `import.meta.env`.
 *
 * Without this safe check, the code would crash during client-side hydration with:
 * "ReferenceError: process is not defined"
 */
export function getEnvVar(key: string): string | undefined {
  if (typeof process !== "undefined") {
    return process.env[key];
  }
  return import.meta.env?.[key];
}

export function getRequiredEnvVar(key: string): string {
  const value = getEnvVar(key);
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Please add ${key} to your .env file or environment configuration.`,
    );
  }
  return value;
}
