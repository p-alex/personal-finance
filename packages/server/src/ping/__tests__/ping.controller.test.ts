import GenerateResponse from "../../GenerateResponse";
import PingController from "../ping.controller";

describe("GET /ping", () => {
  let pingController: PingController;

  beforeAll(() => {
    pingController = new PingController();
  });

  it("should return 'pong'", async () => {
    const response = await pingController.ping({ body: "", params: "" });

    expect(response).toEqual(GenerateResponse.success(200, "pong"));
  });
});
