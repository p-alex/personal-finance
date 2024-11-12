import ParamExtractor from "../ParamExtractor";

describe("ParamExtractor.ts", () => {
  let paramExtractor: ParamExtractor;

  beforeEach(() => {
    paramExtractor = new ParamExtractor();
  });

  it("should extract params correctly", () => {
    const params = paramExtractor.execute<{ id: string; username: string }>(
      "/users/:id/:username",
      "/users/123/username",
    );

    expect(params).toEqual({ id: "123", username: "username" });
  });

  it("should handle invalid pattern correctly", () => {
    const invalidPatternParams = paramExtractor.execute<{}>("/users:id", "users");

    expect(invalidPatternParams).toEqual({});
  });
});
