import { IncomingMessage } from "node:http";
import App, { Request, Response } from "../App";
import { ENV } from "../config/env";
import GenerateResponse from "../GenerateResponse";
import { TooManyRequestsException } from "../exceptions";

jest.mock("../utils/getCorsHeaders", () => ({
  __esModule: true,
  default: () => [
    ["Access-Control-Allow-Origin", ENV.CLIENT_BASE_URL],
    ["Access-Control-Allow-Methods", "GET,OPTIONS"],
    ["Access-Control-Allow-Headers", "Content-Type, Authorization"],
    ["Access-Control-Allow-Credentials", "true"],
  ],
}));

jest.mock("../utils/getSecurityHeaders", () => ({
  __esModule: true,
  default: () => [
    ["Content-Security-Policy", "default-src 'self'"],
    ["Cross-Origin-Embedder-Policy", "require-corp"],
    ["Cross-Origin-Opener-Policy", "same-origin"],
  ],
}));

describe("App.ts", () => {
  let app: App;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockMiddleware: jest.Mock;

  beforeEach(() => {
    app = new App();

    mockReq = {
      method: "GET",
      url: "/users",
      on: jest.fn((event, callback) => {
        if (event === "data") {
          return mockReq as Request;
        }
        if (event === "end") {
          callback();
        }
        return mockReq as Request;
      }),
    };

    mockRes = {
      statusCode: 200,
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    };

    mockMiddleware = jest.fn();
  });

  describe("Request processing", () => {
    it("should process valid requests", async () => {
      app.get("/users", mockMiddleware);

      await expect(
        app.processRequest(mockReq as Request, mockRes as Response, ""),
      ).resolves.not.toThrow();
      expect(mockMiddleware).toHaveBeenCalled();
    });

    it("should handle route parameters", async () => {
      mockReq.url = "/users/123";
      app.get("/users/:id", mockMiddleware);

      await app.processRequest(mockReq as Request, mockRes as Response, "");

      expect(mockMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({ params: { id: "123" } }),
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should throw error for non-existent routes", async () => {
      mockReq.url = "/non-existent";

      await expect(app.processRequest(mockReq as Request, mockRes as Response, "")).rejects.toThrow(
        "Route not found",
      );
    });

    it("should parse JSON body for POST requests", async () => {
      mockReq.method = "POST";
      mockReq.url = "/users";
      const testData = JSON.stringify({ name: "test" });

      app.post("/users", mockMiddleware);
      await app.processRequest(mockReq as Request, mockRes as Response, testData);

      expect(mockMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({ body: { name: "test" } }),
        expect.any(Object),
        expect.any(Function),
      );
    });
  });

  describe("HTTP Methods", () => {
    it("should register GET routes correctly", () => {
      app.get("/test-route", mockMiddleware);
      const route = app.getRoute("/test-route");

      expect(route).toEqual({
        method: "GET",
        middlewares: [mockMiddleware],
        paramKeys: [],
        path: "/test-route",
        pathRegex: new RegExp(/^\/test-route$/),
      });
    });

    it("should register POST routes correctly", () => {
      app.post("/test-route", mockMiddleware);
      const route = app.getRoute("/test-route");

      expect(route).toEqual({
        method: "POST",
        middlewares: [mockMiddleware],
        paramKeys: [],
        path: "/test-route",
        pathRegex: new RegExp(/^\/test-route$/),
      });
    });

    it("should register PUT routes correctly", () => {
      app.put("/test-route", mockMiddleware);
      const route = app.getRoute("/test-route");

      expect(route).toEqual({
        method: "PUT",
        middlewares: [mockMiddleware],
        paramKeys: [],
        path: "/test-route",
        pathRegex: new RegExp(/^\/test-route$/),
      });
    });

    it("should register PATCH routes correctly", () => {
      app.patch("/test-route", mockMiddleware);
      const route = app.getRoute("/test-route");

      expect(route).toEqual({
        method: "PATCH",
        middlewares: [mockMiddleware],
        paramKeys: [],
        path: "/test-route",
        pathRegex: new RegExp(/^\/test-route$/),
      });
    });

    it("should register DELETE routes correctly", () => {
      app.delete("/test-route", mockMiddleware);
      const route = app.getRoute("/test-route");

      expect(route).toEqual({
        method: "DELETE",
        middlewares: [mockMiddleware],
        paramKeys: [],
        path: "/test-route",
        pathRegex: new RegExp(/^\/test-route$/),
      });
    });

    it("should handle OPTIONS requests correctly", async () => {
      await app.processRequest(
        { ...mockReq, method: "OPTIONS" } as Request,
        mockRes as Response,
        "",
      );

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.end).toHaveBeenCalledWith();
    });
  });

  describe("Middleware execution", () => {
    it("should execute multiple middlewares in order", async () => {
      let calls: number = 0;

      const middleware1 = jest.fn((_, __, next) => {
        calls++;
        return next();
      });

      const middleware2 = jest.fn((_, __, next) => {
        calls++;
        return next();
      });

      app.get("/test", middleware1, middleware2);

      await app.processRequest({ method: "GET", url: "/test" } as Request, mockRes as Response, "");

      expect(calls).toEqual(2);
    });
  });

  describe("Error handling", () => {
    it("should handle middleware errors", async () => {
      const errorMiddleware = jest.fn().mockRejectedValue(new Error("Middleware error"));
      app.get("/error", errorMiddleware);

      await expect(
        app.processRequest({ method: "GET", url: "/error" } as Request, mockRes as Response, ""),
      ).rejects.toThrow("Middleware error");
    });

    it("should handle errors that are of type other than Exception correctly", (done) => {
      const mockMiddleware = jest.fn(() => {
        throw new TypeError("type error");
      });

      app.get("/error", mockMiddleware);

      mockReq = {
        method: "GET",
        url: "/error",
        on: jest.fn((event, callback) => {
          if (event === "data") {
            return mockReq as Request;
          }

          if (event === "end") {
            callback();
          }

          return mockReq as Request;
        }),
      };

      mockRes.end = jest.fn(() => {
        expect(mockRes.statusCode).toBe(500);
        expect(mockRes.end).toHaveBeenCalledWith(
          JSON.stringify(
            GenerateResponse.error(500, "Something went wrong, please try again later."),
          ),
        );
        done();
        return {} as Response;
      });

      app.handleRequests(mockReq as Request, mockRes as Response);
    });

    it("should handle Exception errors correctly", (done) => {
      const mockMiddleware = jest.fn(() => {
        throw new TooManyRequestsException();
      });

      app.get("/error", mockMiddleware);

      mockReq = { ...mockReq, url: "/error" };

      mockRes.end = jest.fn(() => {
        expect(mockRes.statusCode).toBe(429);
        expect(mockRes.end).toHaveBeenCalledWith(
          JSON.stringify(GenerateResponse.error(429, "Too many requests, please try again later.")),
        );
        done();
        return {} as Response;
      });

      app.handleRequests(mockReq as Request, mockRes as Response);
    });
  });
});
