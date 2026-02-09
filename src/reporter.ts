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
  const issues = error.issues.map(formatIssue);
  const missing = issues.filter((issue) => issue.kind === "missing");
  const invalid = issues.filter((issue) => issue.kind === "invalid");

  const lines: string[] = [];
  lines.push(pc.bold(pc.red("env-guard validation failed")));
  lines.push("");

  if (missing.length > 0) {
    lines.push(pc.bold("Missing variables:"));
    for (const issue of missing) {
      lines.push(`  ${pc.red("-")} ${pc.cyan(issue.key)}`);
    }
    lines.push("");
  }

  if (invalid.length > 0) {
    lines.push(pc.bold("Invalid variables:"));
    for (const issue of invalid) {
      lines.push(`  ${pc.red("-")} ${pc.cyan(issue.key)} ${pc.dim(`(${issue.message})`)}`);
    }
    lines.push("");
  }

  const summary = lines.join("\n");
  console.error(summary);

  return {
    summary,
    issues
  };
}
