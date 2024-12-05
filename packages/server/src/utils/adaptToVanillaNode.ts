import { Request, Response } from "../App";
import Exception from "../exceptions/Exception";
import GenerateResponse from "../GenerateResponse";
import IHttpRequest from "../interfaces/IHttpRequest";
import IHttpResponse from "../interfaces/IHttpResponse";

function adaptToVanillaNode(controller: (httpRequest: IHttpRequest) => Promise<IHttpResponse>) {
  return async (req: Request, res: Response) => {
    try {
      const result = await controller({ body: req.body, params: req.params });
      res.statusCode = result.code;
      res.end(JSON.stringify(result));
    } catch (error) {
      if (error instanceof Exception) {
        res.statusCode = error.code;
        res.end(JSON.stringify(GenerateResponse.error(error.code, error.message)));
        return;
      }

      res.statusCode = 500;
      res.end(
        JSON.stringify(
          GenerateResponse.error(500, "Something went wrong, please try again later."),
        ),
      );
    }
  };
}

export default adaptToVanillaNode;
