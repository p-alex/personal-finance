import { createServer, Server, IncomingMessage, ServerResponse } from "node:http";
import GenerateResponse from "./GenerateResponse";
import parseRoute from "./utils/parseRoute";
import extractParams from "./utils/extractParams";
import getCorsHeaders from "./utils/getCorsHeaders";
import getSecurityHeaders from "./utils/getSecurityHeaders";

export type Request = IncomingMessage;

export type Response = ServerResponse;

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
  listen(port: string, cb: () => void): void;
  handleRequest(req: Request, res: Response): void;
}

class App implements IServer {
  private readonly _routes: Route[];
  private readonly _serverImpl: Server;

  constructor() {
    this._routes = [];
    this._serverImpl = createServer((req, res) => {
      this.applyHeaders(res, [...getCorsHeaders(), ...getSecurityHeaders()]);
      this.handleRequest(req as Request, res as Response);
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
      return;
    }

    const route = this._routes.find((r) => r.method === req.method && r.pathRegex.test(req.url!));

    if (!route) {
      throw new Error("Route not found");
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

  handleRequest(req: Request, res: Response) {
    let data = "";

    req.on("data", (chunk) => (data += chunk));

    req.on("end", async () => {
      try {
        await this.processRequest(req, res, data);

        if (req.method === "OPTIONS") {
          res.statusCode = 200;
          res.end();
          return;
        }
      } catch (error: any) {
        const statusCode = error.message === "Route not found" ? 404 : 500;
        res.writeHead(statusCode, { "Content-Type": "application/json" });
        res.end(JSON.stringify(GenerateResponse.error(statusCode, error.message)));
      }
    });
  }

  listen(port: string, cb: () => void) {
    this._serverImpl.listen(port, cb);
  }

  applyHeaders(res: Response, headers: string[][]) {
    headers.forEach((header) => res.setHeader(header[0], header[1]));
  }
}

export default App;
