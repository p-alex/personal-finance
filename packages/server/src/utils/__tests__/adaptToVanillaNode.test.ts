import { Request, Response } from "../../App";
import adaptToVanillaNode from "../adaptToVanillaNode";
import GenerateResponse from "../../GenerateResponse";

describe("adaptToVanillaNode", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      body: { test: "data" },
      params: { id: "123" },
    };

    mockRes = {
      statusCode: 200,
      setHeader: jest.fn(),
      end: jest.fn(),
    };
  });

  it("should handle successful controller execution", async () => {
    const successResponse = { code: 200, data: { message: "success" } };
    const mockController = jest.fn().mockResolvedValue(successResponse);

    const handler = adaptToVanillaNode(mockController);
    await handler(mockReq as Request, mockRes as Response);

    expect(mockController).toHaveBeenCalledWith({
      body: mockReq.body,
      params: mockReq.params,
    });
    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
    expect(mockRes.end).toHaveBeenCalledWith(JSON.stringify(successResponse));
  });

  it("should handle controller errors", async () => {
    const mockError = new Error("Test error");
    const mockController = jest.fn().mockRejectedValue(mockError);

    const handler = adaptToVanillaNode(mockController);
    await handler(mockReq as Request, mockRes as Response);

    expect(mockController).toHaveBeenCalledWith({
      body: mockReq.body,
      params: mockReq.params,
    });
    expect(mockRes.statusCode).toBe(500);
    expect(mockRes.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
    expect(mockRes.end).toHaveBeenCalledWith(
      JSON.stringify(GenerateResponse.error(500, "Something went wrong!")),
    );
  });

  it("should pass different status codes from controller", async () => {
    const createdResponse = { code: 201, data: { id: "new-resource" } };
    const mockController = jest.fn().mockResolvedValue(createdResponse);

    const handler = adaptToVanillaNode(mockController);
    await handler(mockReq as Request, mockRes as Response);

    expect(mockRes.statusCode).toBe(201);
    expect(mockRes.end).toHaveBeenCalledWith(JSON.stringify(createdResponse));
  });
});
