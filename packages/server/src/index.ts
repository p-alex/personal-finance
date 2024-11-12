import Dotenv from "./utils/Dotenv";

const dotenv = new Dotenv();
dotenv.config();

export const ENV = dotenv.getVars();

import FinanceServer from "./FinanceServer";

const financeServer = new FinanceServer();

financeServer.start();
