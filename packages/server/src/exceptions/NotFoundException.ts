import Exception from "./Exception";

class NotFoundException extends Exception {
  code: number;
  constructor(message: string = "Not found.") {
    super(message);
    this.code = 404;
  }
}

export default NotFoundException;
