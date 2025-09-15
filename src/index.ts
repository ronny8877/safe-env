export interface CheckEnvOptions {
  /** Optional prefix to filter environment variables (e.g., 'PREFIX_') */
  prefix?: string;
  /** Custom source for environment variables (defaults to process.env) */
  source?: Record<string, string | undefined>;
  /** Whether to exit process on missing variables (default: true) */
  exitOnError?: boolean;
}

export interface CheckEnvResult {
  /** Array of missing environment variable names */
  missing: string[];
  /** Whether all required variables are present */
  success: boolean;
}

/**
 * Creates a formatted error message for missing environment variables
 */
function formatErrorMessage(missing: string[]): string {
  return `
☠️  ENVIRONMENT VARIABLES MISSING ☠️
───────────────────────────────────
${missing.map((v) => `❌ ${v}`).join("\n")}
───────────────────────────────────
`;
}

/**
 * Gets environment variables with optional prefix filtering
 */
function getEnvSource(
  source?: Record<string, string | undefined>,
  prefix?: string,
): Record<string, string | undefined> {
  const envSource = source || process.env;

  if (!prefix) return envSource;

  const filteredEnv: Record<string, string | undefined> = {};
  Object.keys(envSource).forEach((key) => {
    if (key.startsWith(prefix)) {
      filteredEnv[key] = envSource[key];
    }
  });

  return filteredEnv;
}

/**
 * Checks for required environment variables
 * @param requiredVars Array of required environment variable names
 * @param options Configuration options
 * @returns Result object with missing variables and success status
 */
export function checkEnv(
  requiredVars: string[],
  options: CheckEnvOptions = {},
): CheckEnvResult {
  const { prefix, source, exitOnError = true } = options;
  const envSource = getEnvSource(source, prefix);

  // If prefix is provided, filter required vars to only those with the prefix
  const varsToCheck = prefix
    ? requiredVars.filter((v) => v.startsWith(prefix))
    : requiredVars;

  const missing = varsToCheck.filter((v) => !envSource[v]);
  const success = missing.length === 0;

  if (!success && exitOnError) {
    console.error(formatErrorMessage(missing));
    process.exit(1);
  }

  if (!success && !exitOnError) {
    console.warn(formatErrorMessage(missing));
  }

  return { missing, success };
}

/**
 * Safe version that never exits the process
 * @param requiredVars Array of required environment variable names
 * @param options Configuration options
 * @returns Result object with missing variables and success status
 */
export function checkEnvSafe(
  requiredVars: string[],
  options: CheckEnvOptions = {},
): CheckEnvResult {
  return checkEnv(requiredVars, { ...options, exitOnError: false });
}

/**
 * Checks environment variables from a custom source
 * @param source Custom environment source
 * @param options Configuration options
 * @returns Result object with missing variables and success status
 */
export function checkEnvSource(
  source: Record<string, string | undefined>,
  options: Omit<CheckEnvOptions, "source"> = {},
): CheckEnvResult {
  const requiredVars = Object.keys(source);
  return checkEnv(requiredVars, { ...options, source });
}
