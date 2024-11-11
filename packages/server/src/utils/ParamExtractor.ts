class ParamExtractor {
  execute(pattern: string, url: string) {
    const params: { [key: string]: string } = {};
    const patternParts = pattern.split("/");
    const urlParts = url.split("/");

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].charAt(0) === ":" && urlParts[i]) {
        const key = patternParts[i].substring(1);
        params[key] = urlParts[i];
      }
    }

    return params;
  }
}

export default ParamExtractor;
