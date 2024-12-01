function parseRoute(path: string): { pathRegex: RegExp; paramKeys: string[] } {
  const paramKeys: string[] = [];

  const pathRegex = new RegExp(
    `^${path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
      paramKeys.push(key);
      return "([^/]+)";
    })}$`,
  );

  return { paramKeys, pathRegex };
}

export default parseRoute;
