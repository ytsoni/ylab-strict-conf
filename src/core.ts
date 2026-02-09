import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import type { ZodObject, ZodRawShape, z } from "zod";
import { reportEnvErrors } from "./reporter";

export function createConfig<TSchema extends ZodObject<ZodRawShape>>(
  schema: TSchema
): z.infer<TSchema> {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  const result = schema.safeParse(process.env);
  if (!result.success) {
    reportEnvErrors(result.error);
    process.exit(1);
  }

  return result.data;
}
