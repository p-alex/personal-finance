import ParamExtractor from "../ParamExtractor";

describe("ParamExtractor.ts", () => {
  it("should extract params correctly", () => {
    const paramExtractor = new ParamExtractor();

    const params = paramExtractor.execute("/users/:id/:username", "/users/123/username");

    expect(params).toEqual({ id: "123", username: "username" });
  });
});
