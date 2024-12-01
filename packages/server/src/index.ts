import { ENV } from "./config/env";
import pingController from "./ping";
import adaptToVanillaNode from "./utils/adaptToVanillaNode";
import App from "./App";

const app = new App();

app.get("/ping", adaptToVanillaNode(pingController.ping));

app.listen(ENV.PORT, () => console.log("Server started at http://localhost:" + ENV.PORT));
