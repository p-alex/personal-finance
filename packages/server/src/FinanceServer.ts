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

  private _setup() {
    this._server = createServer((req: IncomingMessage, res: ServerResponse) => {
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
