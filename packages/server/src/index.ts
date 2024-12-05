import { ENV } from "./config/env";
import pingController from "./ping";
import adaptToVanillaNode from "./utils/adaptToVanillaNode";
import App from "./App";
import RateLimiter from "./utils/RateLimiter";

const app = new App();

const rateLimiter = new RateLimiter();

process.on("SIGTERM", () => {
  rateLimiter.destroy();
});

process.on("SIGINT", () => {
  rateLimiter.destroy();
});

const PORT = ENV.PORT || "5000";

app.listen(PORT, () => console.log("Server started at http://localhost:" + PORT));

app.get(
  "/ping",
  rateLimiter.limit({ maxRequests: 1, windowMs: 30000 }),
  adaptToVanillaNode(pingController.ping),
);
