import dotenv from "dotenv";
dotenv.config();

import FinanceServer from "./FinanceServer";

const financeServer = new FinanceServer();

financeServer.start();
