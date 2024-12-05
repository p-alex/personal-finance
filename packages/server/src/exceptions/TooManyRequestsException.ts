import Exception from "./Exception";

class TooManyRequestsException extends Exception {
  code: number;
  constructor(message: string = "Too many requests, please try again later.") {
    super(message);
    this.code = 429;
  }
}

export default TooManyRequestsException;
