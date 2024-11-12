import { Readable } from "stream";
import { IncomingMessage, ServerResponse } from "node:http";
import PingRouter from "../ping.router";
import GenerateResponse from "../../GenerateResponse";

describe("ping.router.test.ts", () => {
  let mockReq: IncomingMessage;
  let mockRes: jest.Mocked<ServerResponse>;
  let pingRouter: PingRouter;

  beforeEach(() => {
    mockReq = Object.assign(new Readable(), {
      method: "GET",
      url: "/ping",
      headers: {},
    }) as IncomingMessage;

    mockRes = {
      setHeader: jest.fn(),
      end: jest.fn(),
    } as unknown as jest.Mocked<ServerResponse>;

    pingRouter = new PingRouter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should handle GET /ping request successfully", async () => {
    await pingRouter.useRouter(mockReq, mockRes);

    mockReq.emit("end");

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
    expect(mockRes.end).toHaveBeenCalledWith(JSON.stringify(GenerateResponse.success(200, "pong")));
  });

  it("should handle a request to an unknown route successfully", async () => {
    mockReq.url = "/unknown";

    await pingRouter.useRouter(mockReq, mockRes);

    mockReq.emit("end");

    expect(mockRes.statusCode).toBe(404);
    expect(mockRes.end).toHaveBeenCalledWith(
      JSON.stringify(GenerateResponse.error(404, "Route does not exist")),
    );
  });
});
