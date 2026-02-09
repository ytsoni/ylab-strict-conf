import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { createConfig } from "./index";

describe("createConfig", () => {
    const originalEnv = process.env;
    const envFilePath = path.resolve(process.cwd(), ".env");

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
        vi.spyOn(process, "exit").mockImplementation((() => { }) as any);
        vi.spyOn(console, "error").mockImplementation(() => { });
        // Ensure clean state for .env
        if (fs.existsSync(envFilePath)) {
            fs.unlinkSync(envFilePath);
        }
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
        if (fs.existsSync(envFilePath)) {
            fs.unlinkSync(envFilePath);
        }
    });

    it("should load variables from .env file", () => {
        fs.writeFileSync(envFilePath, "DOTENV_VAR=loaded_from_file");
        // We need to ensure we don't have it in process.env already
        delete process.env.DOTENV_VAR;

        const schema = z.object({
            DOTENV_VAR: z.string(),
        });

        // createConfig loads .env internally
        const config = createConfig(schema);

        expect(config.DOTENV_VAR).toBe("loaded_from_file");
    });


    it("should successfully load valid configuration", () => {
        process.env.APP_PORT = "3000";
        process.env.NODE_ENV = "production";

        const schema = z.object({
            APP_PORT: z.coerce.number(),
            NODE_ENV: z.enum(["development", "production"]),
        });

        const config = createConfig(schema);

        expect(config).toEqual({
            APP_PORT: 3000,
            NODE_ENV: "production",
        });
        expect(process.exit).not.toHaveBeenCalled();
    });

    it("should exit process when variables are missing", () => {
        // Ensure the variable is missing
        delete process.env.API_KEY;

        const schema = z.object({
            API_KEY: z.string(),
        });

        // We expect it to exit, so we can't check the return value meaningfully 
        // if we mock exit to do nothing.
        // However, typescript might complain if we assign the result to 'config'.
        createConfig(schema);

        expect(process.exit).toHaveBeenCalledWith(1);
        expect(console.error).toHaveBeenCalled();
        
        // Verify formatted output contains "Missing variables"
        const consoleCalls = vi.mocked(console.error).mock.calls;
        const output = consoleCalls.map(args => args.join(" ")).join("\n");
        expect(output).toContain("Missing variables");
        expect(output).toContain("API_KEY");
    });

    it("should exit process when variables have invalid formats", () => {
        process.env.MAX_RETRIES = "not-a-number";

        const schema = z.object({
            MAX_RETRIES: z.coerce.number(),
        });

        createConfig(schema);

        expect(process.exit).toHaveBeenCalledWith(1);
        expect(console.error).toHaveBeenCalled();

        // Verify formatted output contains "Invalid variables"
        const consoleCalls = vi.mocked(console.error).mock.calls;
        const output = consoleCalls.map(args => args.join(" ")).join("\n");
        expect(output).toContain("Invalid variables");
        expect(output).toContain("MAX_RETRIES");
    });

    it("should report both missing and invalid variables together", () => {
        delete process.env.REQUIRED_VAR;
        process.env.NUMBER_VAR = "invalid";

        const schema = z.object({
            REQUIRED_VAR: z.string(),
            NUMBER_VAR: z.coerce.number(),
        });

        createConfig(schema);

        expect(process.exit).toHaveBeenCalledWith(1);
        
        const consoleCalls = vi.mocked(console.error).mock.calls;
        const output = consoleCalls.map(args => args.join(" ")).join("\n");
        
        expect(output).toContain("Missing variables");
        expect(output).toContain("REQUIRED_VAR");
        expect(output).toContain("Invalid variables");
        expect(output).toContain("NUMBER_VAR");
    });
});
