import { IncomingMessage, ServerResponse } from "node:http";
import { IRouter } from "../RouterManager";
import pingController from ".";
import GenerateResponse from "../GenerateResponse";

class PingRouter implements IRouter {
  async useRouter(req: IncomingMessage, res: ServerResponse) {
    if (req.method === "GET") {
      if (req.url === "/ping") {
        const result = await pingController.ping({
          body: req.body,
          params: req.params,
        });
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result));
        return;
      }
    }
    res.statusCode = 404;
    res.end(
      JSON.stringify(GenerateResponse.error(404, "Route does not exist"))
    );
  }
}

export default PingRouter;
