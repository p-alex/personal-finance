import { createServer, Server, IncomingMessage, ServerResponse } from "node:http";
import GenerateResponse from "./GenerateResponse";
import parseRoute from "./utils/parseRoute";
import extractParams from "./utils/extractParams";
import getCorsHeaders from "./utils/getCorsHeaders";
import getSecurityHeaders from "./utils/getSecurityHeaders";
import { NotFoundException } from "./exceptions";
import Exception from "./exceptions/Exception";

export interface Request extends IncomingMessage {
  body: any;
  params: Record<string, string>;
}

export interface Response extends ServerResponse {
  statusCode: number;
}

export type NextFunction = () => Promise<void>;

export type Middleware = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export type Route = {
  path: string;
  method: string;
  pathRegex: RegExp;
  paramKeys: string[];
  middlewares: Middleware[];
};

export interface IServer {
  get(path: string, ...middlewares: Middleware[]): void;
  post(path: string, ...middlewares: Middleware[]): void;
  put(path: string, ...middlewares: Middleware[]): void;
  patch(path: string, ...middlewares: Middleware[]): void;
  delete(path: string, ...middlewares: Middleware[]): void;
  listen(port: string, cb: () => void): void;
  handleRequests(req: Request, res: Response): void;
  processRequest(req: Request, res: Response, data: string): Promise<void>;
}

class App implements IServer {
  private readonly _routes: Route[];
  private readonly _server: Server;

  constructor() {
    this._routes = [];
    this._server = createServer((req, res) => {
      this._applyHeaders(res, [
        ...getCorsHeaders(),
        ...getSecurityHeaders(),
        ["Content-Type", "application/json"],
      ]);
      this.handleRequests(req as Request, res as Response);
    });
  }

  get(path: string, ...middlewares: Middleware[]) {
    const { pathRegex, paramKeys } = parseRoute(path);
    this._routes.push({ path, method: "GET", paramKeys, pathRegex, middlewares });
  }

  post(path: string, ...middlewares: Middleware[]) {
    const { pathRegex, paramKeys } = parseRoute(path);
    this._routes.push({ path, method: "POST", paramKeys, pathRegex, middlewares });
  }

  put(path: string, ...middlewares: Middleware[]) {
    const { pathRegex, paramKeys } = parseRoute(path);
    this._routes.push({ path, method: "PUT", paramKeys, pathRegex, middlewares });
  }

  patch(path: string, ...middlewares: Middleware[]) {
    const { pathRegex, paramKeys } = parseRoute(path);
    this._routes.push({ path, method: "PATCH", paramKeys, pathRegex, middlewares });
  }

  delete(path: string, ...middlewares: Middleware[]) {
    const { pathRegex, paramKeys } = parseRoute(path);
    this._routes.push({ path, method: "DELETE", paramKeys, pathRegex, middlewares });
  }

  getRoute(path: string) {
    return this._routes.find((r) => r.path === path);
  }

  async processRequest(req: Request, res: Response, data: string): Promise<void> {
    if (!req.method || !req.url) throw new Error("Invalid request");

    if (req.method === "OPTIONS") {
      res.statusCode = 200;
      res.end();
      return;
    }

    const route = this._routes.find((r) => r.method === req.method && r.pathRegex.test(req.url!));

    if (!route) {
      throw new NotFoundException("Route not found");
    }

    req.params = extractParams(route.path, req.url);
    req.body = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) ? JSON.parse(data) : {};

    let index = 0;

    const next = async () => {
      if (index < route.middlewares.length) {
        const middleware = route.middlewares[index++];
        await middleware(req, res, next);
      }
    };

    await next();
  }

  listen(port: string, cb: () => void) {
    this._server.listen(port, cb);
  }

  private _applyHeaders(res: Response, headers: string[][]) {
    headers.forEach((header) => res.setHeader(header[0], header[1]));
  }

  handleRequests(req: Request, res: Response) {
    let data = "";

    req.on("data", (chunk) => (data += chunk));

    req.on("end", async () => {
      try {
        await this.processRequest(req, res, data);
      } catch (error: any) {
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
    });
  }
}

export default App;
