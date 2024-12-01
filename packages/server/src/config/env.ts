import Dotenv from "../utils/Dotenv";

const dotenv = new Dotenv();
dotenv.config();

export const ENV = dotenv.getVars();
