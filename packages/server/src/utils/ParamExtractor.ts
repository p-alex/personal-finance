class ParamExtractor {
  execute<TResult>(pattern: string, url: string): TResult {
    const patternParts = pattern.split("/");
    const urlParts = url.split("/");

    if (patternParts.length !== urlParts.length) return {} as TResult;

    const params: { [key: string]: string } = {};

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].charAt(0) === ":" && urlParts[i]) {
        const key = patternParts[i].substring(1);
        params[key] = urlParts[i];
      }
    }

    return params as TResult;
  }
}

export default ParamExtractor;
