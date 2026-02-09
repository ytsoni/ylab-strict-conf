# env-guard

[![npm version](https://img.shields.io/npm/v/env-guard.svg)](https://www.npmjs.com/package/env-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)

Type-safe environment variable management for Node.js applications. `env-guard` combines the power of [Zod](https://github.com/colinhacks/zod) schema validation with [dotenv](https://github.com/motdotla/dotenv) loading to ensure your app crashes immediately and descriptively if its configuration is invalid.

## Features

- 🔒 **Runtime Validation**: Validates `process.env` against a rigid Zod schema.
- 🚀 **Type Inference**: Returns a fully typed configuration object based on your schema.
- 📄 **Dotenv Support**: Automatically loads variables from `.env` files.
- 🎨 **Beautiful Error Reporting**: Clear, colorful error messages listing *all* missing or invalid variables at once.
- 🛡️ **Fail Fast**: Prevents your app from starting with bad configuration.

## Installation

```bash
npm install env-guard zod
# or
yarn add env-guard zod
# or
pnpm add env-guard zod
```

## Usage

Create a configuration file (e.g., `src/config.ts`) to define your environment schema.

```typescript
import { createConfig } from "env-guard";
import { z } from "zod";

// Define your schema using Zod
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000), // coerce string "3000" to number 3000
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
  ENABLE_FEATURE_X: z.enum(["true", "false"]).transform((v) => v === "true"),
});

// Load and validate
// This will process.exit(1) if validation fails
export const config = createConfig(schema);
```

Then import it safely anywhere in your application:

```typescript
import { config } from "./config";

console.log(`Server starting on port ${config.PORT}`);
// config.PORT is typed as number
// config.NODE_ENV is typed as "development" | "production" | "test"
```

### Example Failure Output

If you start your app with missing or invalid variables, `env-guard` prints a helpful message and exits:

```text
env-guard validation failed

Missing variables:
  - DATABASE_URL
  - API_KEY

Invalid variables:
  - PORT (Expected number, received nan)
```

## Why use this?

Standard `dotenv` loads strings into `process.env`, but it leaves you guessing about the types and existence of variables.

| Feature | Standard `dotenv` | `env-guard` |
| :--- | :---: | :---: |
| **Loads .env file** | ✅ | ✅ |
| **Type Safety** | ❌ (everything is `string | undefined`) | ✅ (fully typed object) |
| **Validation** | ❌ (manual checks needed) | ✅ (Zod schema) |
| **Coercion** | ❌ | ✅ (e.g. "3000" -> 3000) |
| **Error Handling** | ❌ (app crashes randomly later) | ✅ (crashes immediately with report) |

## License

MIT
