// Example usage of safe-env
import { checkEnvSafe, checkEnv, checkEnvSource } from "./src/index";
import { config } from "dotenv";
config();

console.log("Example 1: Basic usage (safe mode)");
const result1 = checkEnvSafe(["TEST_API_KEY", "TEST_DATABASE_URL"]);
console.log("Result:", result1);

console.log("\n Example 2: Missing variable (safe mode)");
const result2 = checkEnvSafe(["TEST_API_KEY", "MISSING_VAR"]);
console.log("Result:", result2);

console.log("\n Example 3: Prefix filtering");
const result3 = checkEnvSafe(
  ["API_URLs", "TTL", "REDIRECT_PATH", "MAX_RETRIES"],
  { prefix: "PREFIX_" },
);
//checks for PREFIX_API_URL, PREFIX_TTL, PREFIX_REDIRECT_PATH, PREFIX_MAX_RETRIES

console.log("Result:", result3);

console.log("\n Example 4: Custom source");
const customConfig = {
  DATABASE_URL: "custom-db-url",
  API_KEY: "custom-api-key",
  SECRET: undefined, // This will be missing
};

// //WHEN YOU HAVE SOME WACKY ENV SOURCE LIKE import.meta.env or cloudflare workers
const result4 = checkEnvSource(customConfig, { exitOnError: false });
console.log("Result:", result4);

console.log("\n Example 5: Unsafe mode (will exit if missing)");
const result5 = checkEnv(["NON_EXISTENT_VAR", "DATABASE_URL", "SECRET"]);
console.log("Result:", result5);
