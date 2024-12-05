import GenerateResponse from "../GenerateResponse";
import IHttpRequest from "../interfaces/IHttpRequest";
import IHttpResponse from "../interfaces/IHttpResponse";

class PingController {
  async ping(_: IHttpRequest): Promise<IHttpResponse<"pong">> {
    return GenerateResponse.success(200, "pong");
  }
}

export default PingController;
