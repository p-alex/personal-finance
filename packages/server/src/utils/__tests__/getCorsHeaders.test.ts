import getCorsHeaders from "../getCorsHeaders";
import { ENV } from "../../config/env";

describe("getCorsHeaders", () => {
  const originalClientBaseUrl = ENV.CLIENT_BASE_URL;

  beforeEach(() => {
    ENV.CLIENT_BASE_URL = originalClientBaseUrl;
  });

  it("should return correct CORS headers with configured origin", () => {
    ENV.CLIENT_BASE_URL = "https://example.com";

    const headers = getCorsHeaders();

    expect(headers).toEqual([
      ["Access-Control-Allow-Origin", "https://example.com"],
      ["Access-Control-Allow-Methods", "GET,OPTIONS"],
      ["Access-Control-Allow-Headers", "Content-Type, Authorization"],
      ["Access-Control-Allow-Credentials", "true"],
    ]);
  });

  it("should use environment CLIENT_BASE_URL", () => {
    ENV.CLIENT_BASE_URL = "https://different-domain.com";

    const headers = getCorsHeaders();
    const originHeader = headers.find(([key]) => key === "Access-Control-Allow-Origin");

    expect(originHeader?.[1]).toBe("https://different-domain.com");
  });

  it("should always include required CORS headers", () => {
    const headers = getCorsHeaders();
    const headerNames = headers.map(([key]) => key);

    expect(headerNames).toContain("Access-Control-Allow-Origin");
    expect(headerNames).toContain("Access-Control-Allow-Methods");
    expect(headerNames).toContain("Access-Control-Allow-Headers");
    expect(headerNames).toContain("Access-Control-Allow-Credentials");
  });
});
