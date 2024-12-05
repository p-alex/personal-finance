import App, { Request, Response } from "../../App";
import RateLimiter from "../RateLimiter";

describe("RateLimiter.ts", () => {
  let app: App;
  let rateLimiter: RateLimiter;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    app = new App();
    rateLimiter = new RateLimiter();

    mockRequest = {
      url: "/users",
      method: "GET",
      socket: {
        remoteAddress: "123",
      } as Request["socket"],
      on: jest.fn((event, callback) => {
        if (event === "data") {
          return mockRequest as Request;
        }

        if (event === "end") {
          callback();
        }
        return mockRequest as Request;
      }),
    } as Partial<Request>;

    mockResponse = {
      statusCode: 200,
      setHeader: jest.fn(),
      end: jest.fn(),
    };
  });

  afterEach(() => {
    rateLimiter.destroy();
    jest.clearAllMocks();
  });

  it("should rate limit correctly", async () => {
    const mockMiddleware = jest.fn();
    const maxRequests = 1;
    const windowMs = 100;

    app.get("/users", rateLimiter.limit({ windowMs, maxRequests }), mockMiddleware);

    await app.processRequest(mockRequest as Request, mockResponse as Response, "");
    expect(mockMiddleware).toHaveBeenCalledTimes(1);

    await expect(
      app.processRequest(mockRequest as Request, mockResponse as Response, ""),
    ).rejects.toThrow("Too many requests, please try again later.");
    expect(mockMiddleware).toHaveBeenCalledTimes(1);

    await new Promise((resolve) => setTimeout(resolve, windowMs + 10));

    await app.processRequest(mockRequest as Request, mockResponse as Response, "");
    expect(mockMiddleware).toHaveBeenCalledTimes(2);
  });

  it("should delete expired limited ips correctly", async () => {
    const deleteIntervalMs = 200;

    rateLimiter.setDeleteInterval(deleteIntervalMs);

    app.get("/users", rateLimiter.limit({ windowMs: 100, maxRequests: 1 }), jest.fn());

    await app.processRequest(mockRequest as Request, mockResponse as Response, "");

    expect(rateLimiter.getLimitedIPsSize()).toBe(1);

    await new Promise((resolve) => setTimeout(resolve, deleteIntervalMs + 150));

    expect(rateLimiter.getLimitedIPsSize()).toBe(0);
  });

  it("should delete the oldest limited ip if the max limited ips map size is exceded", async () => {
    rateLimiter.setMaxLimitedIPsSize(1);

    app.get("/users", rateLimiter.limit({ windowMs: 1000, maxRequests: 5 }), jest.fn());

    await app.processRequest(
      { ...mockRequest, socket: { remoteAddress: "ip1" } } as Request,
      mockResponse as Response,
      "",
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    await app.processRequest(
      { ...mockRequest, socket: { remoteAddress: "ip2" } } as Request,
      mockResponse as Response,
      "",
    );

    expect(rateLimiter.getLimitedIPsSize()).toBe(1);
  });
});
