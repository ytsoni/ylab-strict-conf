import pc from "picocolors";
import type { ZodError, ZodIssue } from "zod";

export type EnvGuardIssue = {
  key: string;
  message: string;
  kind: "missing" | "invalid";
};

export type EnvGuardError = {
  summary: string;
  issues: EnvGuardIssue[];
};

const isMissing = (issue: ZodIssue): boolean => {
  return issue.code === "invalid_type" && issue.received === "undefined";
};

const formatIssue = (issue: ZodIssue): EnvGuardIssue => {
  const key = issue.path.length > 0 ? issue.path.join(".") : "<root>";
  const kind = isMissing(issue) ? "missing" : "invalid";
  return {
    key,
    kind,
    message: issue.message
  };
};

export function reportEnvErrors(error: ZodError): EnvGuardError {
  // Format and sort by key for deterministic output
  const issues = error.issues
    .map(formatIssue)
    .sort((a, b) => a.key.localeCompare(b.key));

  const maxKeyLength = issues.reduce((max, issue) => Math.max(max, issue.key.length), 0);

  const lines: string[] = [];
  
  // Header
  lines.push("");
  lines.push(` ${pc.bgRed(pc.white(pc.bold(" ERROR ")))} ${pc.red("Environment validation failed")}`);
  lines.push("");

  // Error List
  for (const issue of issues) {
    const symbol = pc.red("✖");
    const key = pc.bold(issue.key.padEnd(maxKeyLength));
    const message = pc.dim(issue.message);
    lines.push(` ${symbol}  ${key}  ${message}`);
  }

  // Footer
  lines.push("");
  lines.push(pc.dim("─".repeat(Math.max(50, maxKeyLength + 20))));
  lines.push("");

  const summary = lines.join("\n");
  console.error(summary);

  return {
    summary,
    issues
  };
}
