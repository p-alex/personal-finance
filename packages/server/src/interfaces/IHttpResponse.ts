interface IHttpResponse<TResult = any> {
  success: boolean;
  code: number;
  error: string;
  result: TResult;
}

export default IHttpResponse;
