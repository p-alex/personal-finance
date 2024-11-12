import Dotenv from "../Dotenv";
import * as fs from "fs";
import * as path from "path";

jest.mock("fs");
jest.mock("path");

describe("Dotenv.ts", () => {
  let dotenv: Dotenv;

  beforeAll(() => {
    dotenv = new Dotenv();
  });

  it("should set environment variables correctly", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (path.resolve as jest.Mock).mockReturnValue(".env");
    (fs.readFileSync as jest.Mock).mockReturnValue("PORT=5000\nNAME=finance");

    dotenv.config();

    const variables = dotenv.getVars();

    expect(variables).toEqual({ PORT: "5000", NAME: "finance" });
  });

  it("should throw an error if env file does not exist", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    expect(dotenv.config).toThrow(".env file does not exist");
  });
});
