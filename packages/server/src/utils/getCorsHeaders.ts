import { ENV } from "../config/env";

function getCorsHeaders() {
  const corsOptions = {
    origin: ENV.CLIENT_BASE_URL,
    methods: "GET,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    allowCredentials: "true",
  };

  return [
    ["Access-Control-Allow-Origin", corsOptions.origin],
    ["Access-Control-Allow-Methods", corsOptions.methods],
    ["Access-Control-Allow-Headers", corsOptions.allowedHeaders],
    ["Access-Control-Allow-Credentials", corsOptions.allowCredentials],
  ];
}

export default getCorsHeaders;
