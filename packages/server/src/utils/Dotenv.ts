import * as path from "path";
import * as fs from "fs";

export interface IEnv {
  PORT: string;
  CLIENT_BASE_URL: string;
}

class Dotenv {
  private _envVariables: IEnv;

  constructor(private readonly _envFileName: string = ".env") {
    this._envVariables = {} as IEnv;
  }

  config() {
    const envFilePath = this._checkIfEnvFileExists();
    if (!envFilePath) return {};
    this._setEnvVariables(envFilePath);
  }

  getVars() {
    return this._envVariables;
  }

  private _checkIfEnvFileExists() {
    const envFilePath = path.resolve(this._envFileName);
    if (!fs.existsSync(envFilePath)) return null;
    return envFilePath;
  }

  private _setEnvVariables(envFilePath: string) {
    const envFileContent = fs.readFileSync(envFilePath, "utf-8")!;
    const envLines = envFileContent.split("\n");
    for (let i = 0; i < envLines.length; i++) {
      const [key, value] = envLines[i].split("=");
      if (key && value && !process.env[key]) {
        process.env[key.trim()] = value.trim();
        this._envVariables[key.trim() as keyof typeof this._envVariables] = value.trim();
      }
    }
  }
}

export default Dotenv;
