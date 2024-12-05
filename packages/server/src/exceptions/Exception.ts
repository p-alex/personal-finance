abstract class Exception extends Error {
  abstract code: number;
  constructor(public message: string) {
    super();
    this.message = message;
  }
}

export default Exception;
