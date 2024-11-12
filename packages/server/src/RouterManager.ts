import { IncomingMessage, ServerResponse } from "node:http";
import GenerateResponse from "./GenerateResponse";

export interface IRouter {
  useRouter: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
}

class RouterManager {
  public readonly routers: { [key: string]: IRouter };

  constructor() {
    this.routers = {};
  }

  setRouter(key: string, router: IRouter) {
    this.routers[key] = router;
  }

  useRouters(req: IncomingMessage, res: ServerResponse) {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", async () => {
      const validationResult = this.validateRoute(req.url);

      if (validationResult.validRoute === null) {
        res.statusCode = validationResult.code;
        res.end(validationResult.message);
        return;
      }

      const validRoute = validationResult.validRoute;

      const body = this.extractBody(data, req.method!);
      if (body) {
        req.body = body;
      }

      try {
        await this.routers[validRoute].useRouter(req, res);
      } catch (error) {
        console.error(error);
        res.statusCode = 500;
        res.end(
          JSON.stringify(
            GenerateResponse.error(500, "Something went wrong. Please try again later."),
          ),
        );
      }
    });
  }

  private validateRoute(url?: string): {
    message: string;
    validRoute: string | null;
    code: number;
  } {
    if (!url) return { message: "No url provided", validRoute: null, code: 400 };

    const route = url.substring(1).split("/")[0];

    if (typeof this.routers[route]?.useRouter !== "function") {
      return {
        message: "Route does not exist",
        validRoute: null,
        code: 404,
      };
    }

    return { message: "Route found", validRoute: route, code: 200 };
  }

  private extractBody(data: string, method: string) {
    if (/get/i.test(method)) return undefined;
    return JSON.parse(data);
  }
}

export default RouterManager;
