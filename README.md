# safe-env 🛡️

A minimal, framework-agnostic environment variable checker with prefix support. Perfect for ensuring your application has all required environment variables before startup.

## Features

- ✅ **Minimal** - Zero dependencies, tiny footprint
- 🔧 **Framework Agnostic** - Works with any Node.js application
- 🏷️ **Prefix Support** - Filter variables by prefix (like Next.js `NEXT_` variables)
- 🎯 **TypeScript First** - Full TypeScript support with detailed types
- 🔒 **Safe Mode** - Non-exit mode for graceful error handling
- 📦 **Custom Sources** - Check variables from any source, not just `process.env`

## Installation

```bash
npm install safe-env
```

## Quick Start

```typescript
import { checkEnv } from "safe-env";

// Basic usage - exits process if variables are missing
checkEnv(["DATABASE_URL", "API_KEY"]);

// Safe mode - returns result without exiting
const result = checkEnv(["DATABASE_URL", "API_KEY"], { exitOnError: false });
if (!result.success) {
  console.log("Missing variables:", result.missing);
}
```

## API Reference

### `checkEnv(requiredVars, options?)`

Checks for required environment variables.

**Parameters:**

- `requiredVars: string[]` - Array of required environment variable names
- `options?: CheckEnvOptions` - Configuration options

**Returns:** `CheckEnvResult`

**Example:**

```typescript
import { checkEnv } from "safe-env";

// Exit on missing variables (default)
checkEnv(["DATABASE_URL", "API_KEY"]);

// Non-exit mode
const result = checkEnv(["DATABASE_URL", "API_KEY"], { exitOnError: false });
console.log(result.success); // boolean
console.log(result.missing); // string[]
```

### `checkEnvSafe(requiredVars, options?)`

Safe version that never exits the process.

**Parameters:**

- `requiredVars: string[]` - Array of required environment variable names
- `options?: CheckEnvOptions` - Configuration options (exitOnError is ignored)

**Returns:** `CheckEnvResult`

**Example:**

```typescript
import { checkEnvSafe } from "safe-env";

const result = checkEnvSafe(["DATABASE_URL", "API_KEY"]);
if (!result.success) {
  // Handle missing variables gracefully
  console.error("Missing required environment variables:", result.missing);
}
```

### `checkEnvSource(source, options?)`

Checks environment variables from a custom source.

**Parameters:**

- `source: Record<string, string | undefined>` - Custom environment source
- `options?: Omit<CheckEnvOptions, 'source'>` - Configuration options

**Returns:** `CheckEnvResult`

**Example:**

```typescript
import { checkEnvSource } from "safe-env";

const config = {
  DATABASE_URL: process.env.DATABASE_URL,
  API_KEY: process.env.API_KEY,
  SECRET: process.env.SECRET,
};

const result = checkEnvSource(config, { exitOnError: false });
```

## Advanced Usage

### Prefix Filtering

Perfect for framework-specific variables:

```typescript
import { checkEnv } from "safe-env";

// Check only Next.js variables
checkEnv(["NEXT_PUBLIC_API_URL", "NEXT_SECRET"], {
  prefix: "NEXT_",
});

// Check only custom app variables
checkEnv(["MYAPP_DATABASE_URL", "MYAPP_API_KEY"], {
  prefix: "MYAPP_",
});
```

### Custom Sources

Check variables from configuration objects:

```typescript
import { checkEnv } from "safe-env";

const config = {
  DATABASE_URL: process.env.DATABASE_URL,
  API_KEY: getApiKeyFromVault(), // Custom source
  REDIS_URL: process.env.REDIS_URL,
};

const result = checkEnv(["DATABASE_URL", "API_KEY", "REDIS_URL"], {
  source: config,
  exitOnError: false,
});
```

### Combined Options

```typescript
import { checkEnv } from "safe-env";

const customConfig = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_SECRET: getSecretFromVault(),
  OTHER_VAR: "ignored due to prefix",
};

const result = checkEnv(["NEXT_PUBLIC_API_URL", "NEXT_SECRET"], {
  source: customConfig,
  prefix: "NEXT_",
  exitOnError: false,
});
```

## Types

```typescript
interface CheckEnvOptions {
  /** Optional prefix to filter environment variables (e.g., 'NEXT_') */
  prefix?: string;
  /** Custom source for environment variables (defaults to process.env) */
  source?: Record<string, string | undefined>;
  /** Whether to exit process on missing variables (default: true) */
  exitOnError?: boolean;
}

interface CheckEnvResult {
  /** Array of missing environment variable names */
  missing: string[];
  /** Whether all required variables are present */
  success: boolean;
}
```

## Error Output

When variables are missing, safe-env outputs a clear error message:

```
☠️  ENVIRONMENT VARIABLES MISSING ☠️
───────────────────────────────────
❌ DATABASE_URL
❌ API_KEY
───────────────────────────────────
```

## Common Patterns

### Application Startup

```typescript
// app.ts
import { checkEnv } from "safe-env";

// Ensure all required variables are present before starting
checkEnv(["DATABASE_URL", "REDIS_URL", "JWT_SECRET", "API_PORT"]);

// Start your application
startServer();
```

### Next.js Configuration

```typescript
// next.config.js
import { checkEnv } from "safe-env";

// Check Next.js specific variables
checkEnv(["NEXT_PUBLIC_API_URL"], { prefix: "NEXT_" });

export default {
  // your config
};
```

### Configuration Validation

```typescript
// config.ts
import { checkEnvSafe } from "safe-env";

export function getConfig() {
  const result = checkEnvSafe(["DATABASE_URL", "API_KEY", "REDIS_URL"]);

  if (!result.success) {
    throw new Error(
      `Missing environment variables: ${result.missing.join(", ")}`,
    );
  }

  return {
    database: process.env.DATABASE_URL!,
    apiKey: process.env.API_KEY!,
    redis: process.env.REDIS_URL!,
  };
}
```

## License

MIT
