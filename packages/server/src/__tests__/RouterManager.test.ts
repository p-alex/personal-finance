import { IncomingMessage, ServerResponse } from "node:http";
import PingRouter from "../ping/ping.router";
import RouterManager, { IRouter } from "../RouterManager";
import GenerateResponse from "../GenerateResponse";

describe("RouterManager.ts", () => {
  let routerManager: RouterManager;
  let mockReq: jest.Mocked<IncomingMessage>;
  let mockRes: jest.Mocked<ServerResponse>;

  beforeEach(() => {
    routerManager = new RouterManager();
    routerManager.setRouter("ping", new PingRouter());

    mockReq = {
      url: "/ping",
      method: "GET",
      on: jest.fn().mockImplementation((event, listener) => {
        if (event === "data") listener(JSON.stringify({ test: "test" }));
        if (event === "end") listener();
      }),
    } as unknown as jest.Mocked<IncomingMessage>;

    mockRes = {
      statusCode: 200,
      writeHead: jest.fn(),
      setHeader: jest.fn(),
      end: jest.fn(),
    } as unknown as jest.Mocked<ServerResponse>;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should set the router correctly", () => {
    routerManager.useRouters(mockReq, mockRes);

    expect(routerManager.routers).toHaveProperty("ping");
    expect(routerManager.routers["ping"]).toBeInstanceOf(PingRouter);
  });

  it("should not extract the body if is GET method", () => {
    routerManager.useRouters(mockReq, mockRes);

    expect(mockReq.body).toBe(undefined);
  });

  it("should extract the body if it anything other than a GET request", () => {
    mockReq.method = "POST";

    routerManager.useRouters(mockReq, mockRes);

    expect(mockReq.body).toEqual({ test: "test" });
  });

  it("should handle unknown routes correctly", () => {
    mockReq.url = "/unknown";

    routerManager.useRouters(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(404);
    expect(mockRes.end).toHaveBeenCalledWith("Route does not exist");
  });

  it("should handle not url passed correctly", () => {
    mockReq.url = "";

    routerManager.useRouters(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes.end).toHaveBeenCalledWith("No url provided");
  });

  it("should handle thrown errors correctly", async () => {
    mockReq.url = "/error";

    routerManager.setRouter("error", {
      useRouter: async (mockReq, mockRes) => {
        throw new Error("error");
      },
    });

    routerManager.useRouters(mockReq, mockRes);

    await new Promise(process.nextTick);

    expect(mockRes.statusCode).toBe(500);
    expect(mockRes.end).toHaveBeenCalledWith(
      JSON.stringify(GenerateResponse.error(500, "Something went wrong. Please try again later.")),
    );
  });
});
