import parseRoute from "../parseRoute";

describe("parseRoute.ts", () => {
  it("should return the correct path regex", () => {
    const parsedRoute = parseRoute("/users/:id");

    const isMatch = parsedRoute.pathRegex.test("/users/123");

    expect(isMatch).toBe(true);
  });

  it("should return an array containing the param keys", () => {
    const parsedRoute = parseRoute("/users/:id");

    expect(parsedRoute.paramKeys).toEqual(["id"]);
  });
});
