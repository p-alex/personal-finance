import getSecurityHeaders from "../getSecurityHeaders";

describe("getSecurityHeaders", () => {
  let headers: string[][];

  beforeEach(() => {
    headers = getSecurityHeaders();
  });

  it("should return an array of header tuples", () => {
    expect(Array.isArray(headers)).toBe(true);
    expect(headers.length).toBe(13);
    headers.forEach((header) => {
      expect(Array.isArray(header)).toBe(true);
      expect(header.length).toBe(2);
      expect(typeof header[0]).toBe("string");
      expect(typeof header[1]).toBe("string");
    });
  });

  it("should include Content-Security-Policy with correct values", () => {
    const csp = headers.find(([name]) => name === "Content-Security-Policy");
    expect(csp).toBeDefined();
    expect(csp![1]).toContain("default-src 'self'");
    expect(csp![1]).toContain("base-uri 'self'");
    expect(csp![1]).toContain("font-src 'self' https: data:");
  });

  it("should include all required security headers", () => {
    const requiredHeaders = [
      "Content-Security-Policy",
      "Cross-Origin-Embedder-Policy",
      "Cross-Origin-Opener-Policy",
      "Cross-Origin-Resource-Policy",
      "Origin-Agent-Cluster",
      "Referrer-Policy",
      "Strict-Transport-Security",
      "X-Content-Type-Options",
      "X-DNS-Prefetch-Control",
      "X-Download-Options",
      "X-Frame-Options",
      "X-Permitted-Cross-Domain-Policies",
      "X-XSS-Protection",
    ];

    requiredHeaders.forEach((headerName) => {
      const header = headers.find(([name]) => name === headerName);
      expect(header).toBeDefined();
      expect(header![1]).not.toBe("");
    });
  });

  it("should have correct values for critical security headers", () => {
    const expectedValues: Record<string, string> = {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "X-XSS-Protection": "0",
    };

    Object.entries(expectedValues).forEach(([headerName, expectedValue]) => {
      const header = headers.find(([name]) => name === headerName);
      expect(header![1]).toBe(expectedValue);
    });
  });
});
