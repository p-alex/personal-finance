import { Request, Response } from "../App";
import GenerateResponse from "../GenerateResponse";
import IHttpRequest from "../interfaces/IHttpRequest";
import IHttpResponse from "../interfaces/IHttpResponse";

function adaptToVanillaNode(controller: (httpRequest: IHttpRequest) => Promise<IHttpResponse>) {
  return async (req: Request, res: Response) => {
    try {
      const result = await controller({ body: req.body, params: req.params });
      res.statusCode = result.code;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(result));
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(GenerateResponse.error(500, "Something went wrong!")));
    }
  };
}

export default adaptToVanillaNode;
