import { z, ZodError } from "zod";
import type { ImportMetaEnv } from "./vite-env";

/**
 * Environment variable schema
 * Must match the ImportMetaEnv interface in vite-env.d.ts
 */
const EnvSchema = z.object({
  // Vite built-in variables
  BASE_URL: z.string(),
  DEV: z.boolean(),
  PROD: z.boolean(),
  SSR: z.boolean(),

  // Custom environment variables
  REACT_APP_NODE_ENV: z.enum(["development", "production", "test"]),

  // Add your custom environment variables here (must start with VITE_)
  // IMPORTANT: Also add them to ImportMetaEnv in vite-env.d.ts
  // Example:
  // VITE_API_URL: z.string().url("Invalid API URL, provided string is not a URL."),
  // VITE_API_KEY: z.string().min(1, "API key is required."),
}) satisfies z.ZodType<ImportMetaEnv>;

/*
? Note: Could use the superRefine() method to refine the ENV vars depending on the environment

Example usage:

EnvSchema.superRefine((data, ctx) => {
  if (data.MODE === "production") {
    // Require specific vars in production
    if (!data.VITE_API_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "VITE_API_URL is required in production",
        path: ["VITE_API_URL"],
      });
    }
  }
});
*/

export type EnvType = z.infer<typeof EnvSchema>;

/**
 * Retrieves environment variables in a type-safe manner by validating them
 * against a predefined schema. If the environment variables do not match
 * the schema, an error is logged.
 *
 * @returns {EnvType | undefined} The parsed and validated environment variables
 * as an object of type `EnvType`, or `undefined` if validation fails.
 */
function getTypeSafeEnv(): EnvType | undefined {
  try {
    const unsafeEnv = import.meta.env;

    console.log("✨ Creating the type safe env...", unsafeEnv);
    const env: EnvType = EnvSchema.parse(unsafeEnv);

    return env;
  } catch (err) {
    console.error(
      "✖ An unexpected error occurred while creating the type safe env, some environment variables might be missing or have invalid values:"
    );

    const error = err as ZodError;
    console.error(z.treeifyError(error));
  }
}

const env = getTypeSafeEnv()!;

export default env;
