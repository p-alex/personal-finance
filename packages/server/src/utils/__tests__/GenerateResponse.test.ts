import GenerateResponse from "../../GenerateResponse";

describe("GenerateResponse", () => {
  describe("success", () => {
    it("should generate a successful response with payload", () => {
      const payload = { id: 1, name: "Test" };
      const response = GenerateResponse.success(200, payload);

      expect(response).toEqual({
        success: true,
        code: 200,
        error: "",
        result: payload,
      });
    });

    it("should work with different payload types", () => {
      const stringPayload = "test string";
      const response = GenerateResponse.success(201, stringPayload);

      expect(response).toEqual({
        success: true,
        code: 201,
        error: "",
        result: stringPayload,
      });
    });
  });

  describe("error", () => {
    it("should generate an error response", () => {
      const errorMessage = "Something went wrong";
      const response = GenerateResponse.error(400, errorMessage);

      expect(response).toEqual({
        success: false,
        code: 400,
        error: errorMessage,
        result: null,
      });
    });

    it("should handle different error codes", () => {
      const response = GenerateResponse.error(500, "Server error");

      expect(response).toEqual({
        success: false,
        code: 500,
        error: "Server error",
        result: null,
      });
    });
  });
});
