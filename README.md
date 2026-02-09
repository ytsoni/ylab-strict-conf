<div align="center">

# 🛡️ env-guard

**Type-safe, validated environment variables that fail fast.**

[![npm version](https://img.shields.io/npm/v/env-guard?style=flat-square)](https://www.npmjs.com/package/env-guard)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ytsoni/ylab-strict-conf/ci.yml?branch=main&style=flat-square)](https://github.com/ytsoni/ylab-strict-conf/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074C1.svg?style=flat-square&logo=typescript&logoColor=white)](http://www.typescriptlang.org/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

</div>

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

Standard `dotenv` loads strings into process.env, but it leaves you guessing about the types and presence of variables. `env-guard` solves this by guaranteeing strict types and safe configuration.

| Feature | Standard `dotenv` | `env-guard` |
| :--- | :---: | :---: |
| **.env File Support** | ✅ | ✅ |
| **Type Safety** | ❌ `string` or `undefined` | ✅ Fully Typed Object |
| **Validation** | ❌ Manual checks required | ✅ Automatic (Zod Schema) |
| **Data Coercion** | ❌ None (all strings) | ✅ Free (Strings → Numbers/Booleans) |
| **Error Handling** | ❌ Crashes randomly at runtime | ✅ Fails immediately at startup |
| **Developer Exp.** | ❌ Vague "undefined" errors | ✅ **Beautiful CLI Dashboard** |

## License

MIT
