import IHttpResponse from "./interfaces/IHttpResponse";

class GenerateResponse {
  static success<TResult>(code: number, payload: TResult): IHttpResponse<TResult> {
    return { success: true, code, error: "", result: payload };
  }

  static error(code: number, error: string) {
    return { success: false, code, error, result: null };
  }
}

export default GenerateResponse;
