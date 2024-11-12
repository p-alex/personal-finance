import { IEnv } from "./src/utils/Dotenv";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends IEnv {}
  }
}

export {};
