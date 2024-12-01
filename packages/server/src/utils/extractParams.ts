function extractParams<TResult>(pattern: string, url: string): TResult {
  let params: { [key: string]: string } = {};

  const urlParts = url.split("/");
  const patternParts = pattern.split("/");

  for (let i = 0; i < urlParts.length; i++)
    if (patternParts[i][0] === ":") params[patternParts[i].substring(1)] = urlParts[i];

  return params as TResult;
}

export default extractParams;
