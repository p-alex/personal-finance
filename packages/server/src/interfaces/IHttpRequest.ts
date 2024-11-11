interface IHttpRequest<TBody = any, TParams = any> {
  body: TBody;
  params: TParams;
}

export default IHttpRequest;
