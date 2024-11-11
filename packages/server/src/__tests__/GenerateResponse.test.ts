import GenerateResponse from "../GenerateResponse";

describe("GenerateResponse.ts", () => {
  let testResult = { test: "test" };
  let code = 200;

  it("should generate success response correctly", () => {
    const response = GenerateResponse.success(code, testResult);

    expect(response).toEqual({
      success: true,
      error: "",
      code,
      result: testResult,
    });
  });

  it("should generate error response correctly", () => {
    const response = GenerateResponse.error(500, "error message");

    expect(response).toEqual({
      success: false,
      error: "error message",
      code: 500,
      result: null,
    });
  });
});
