import GenerateResponse from "../GenerateResponse";
import IHttpRequest from "../interfaces/IHttpRequest";

class PingController {
  async ping(_: IHttpRequest) {
    return GenerateResponse.success(200, "pong");
  }
}

export default PingController;
