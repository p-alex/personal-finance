import { createServer, IncomingMessage, ServerResponse, Server } from "node:http";
import RouterManager from "./RouterManager";
import env from "./config/env";
import PingRouter from "./ping/ping.router";

class FinanceServer {
  private _server: Server | null;
  private readonly _routerManager: RouterManager;

  constructor() {
    this._server = null;

    this._routerManager = new RouterManager();

    this._setup();
  }

  private _applyCors(req: IncomingMessage, res: ServerResponse) {
    const corsOptions = {
      origin: env.clientBaseUrl,
      methods: "GET,POST,PUT,DELETE,OPTIONS",
      allowedHeaders: "Content-Type, Authorization",
      allowCredentials: "true",
    };

    res.setHeader("Access-Control-Allow-Origin", corsOptions.origin);
    res.setHeader("Access-Control-Allow-Methods", corsOptions.methods);
    res.setHeader("Access-Control-Allow-Headers", corsOptions.allowedHeaders);
    res.setHeader("Access-Control-Allow-Credentials", corsOptions.allowCredentials);

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return true;
    }

    return false;
  }

  private _setup() {
    this._server = createServer((req: IncomingMessage, res: ServerResponse) => {
      this._applyCors(req, res);
      this._setupRouterManager(req, res);
    });
  }

  private _setupRouterManager(req: IncomingMessage, res: ServerResponse) {
    this._routerManager.setRouter("ping", new PingRouter());
    this._routerManager.useRouters(req, res);
  }

  start() {
    if (this._server === null) return console.log("Server failed to start");
    this._server.listen(env.port, () =>
      console.log("🚀 Server running at http://localhost:" + env.port),
    );
  }
}

export default FinanceServer;
