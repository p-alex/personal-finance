import { IncomingMessage } from "node:http";

declare module "node:http" {
  interface IncomingMessage {
    params?: Record<string, string>;
    body?: Record<string, string>;
  }
}
