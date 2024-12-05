import NotFoundException from "./NotFoundException";
import TooManyRequestsException from "./TooManyRequestsException";

export interface IException {
  message: string;
  code: number;
}

export { TooManyRequestsException, NotFoundException };
