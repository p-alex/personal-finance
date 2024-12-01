import extractParams from "../extractParams";

describe("extractParams.ts", () => {
  it("should extract params properly", () => {
    const params = extractParams("/users/:id", "/users/123");
    expect(params).toEqual({ id: "123" });
  });
});
