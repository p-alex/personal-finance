import { createServer, IncomingMessage, ServerResponse, Server } from "node:http";
import RouterManager from "./RouterManager";
import PingRouter from "./ping/ping.router";
import { ENV } from ".";

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
      origin: ENV.CLIENT_BASE_URL,
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

  private _applySecurityHeaders(res: ServerResponse) {
    const securityHeaders = {
      "Content-Security-Policy":
        "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Origin-Agent-Cluster": "?1",
      "Referrer-Policy": "no-referrer",
      "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
      "X-Content-Type-Options": "nosniff",
      "X-DNS-Prefetch-Control": "off",
      "X-Download-Options": "noopen",
      "X-Frame-Options": "SAMEORIGIN",
      "X-Permitted-Cross-Domain-Policies": "none",
      "X-XSS-Protection": "0",
    };

    Object.keys(securityHeaders).forEach((key) => {
      res.setHeader(key, securityHeaders[key as keyof typeof securityHeaders]);
    });
  }

  private _setup() {
    this._server = createServer((req: IncomingMessage, res: ServerResponse) => {
      this._applyCors(req, res);
      this._applySecurityHeaders(res);
      this._setupRouterManager(req, res);
    });
  }

  private _setupRouterManager(req: IncomingMessage, res: ServerResponse) {
    this._routerManager.setRouter("ping", new PingRouter());
    this._routerManager.useRouters(req, res);
  }

  start() {
    if (this._server === null) return console.log("Server failed to start");
    this._server.listen(ENV.PORT, () =>
      console.log("🚀 Server running at http://localhost:" + ENV.PORT),
    );
  }
}

export default FinanceServer;
