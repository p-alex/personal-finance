import { NextFunction, Request, Response } from "../App";
import { TooManyRequestsException } from "../exceptions";

interface ILimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface ILimitedIP extends ILimitConfig {
  requestsLeft: number;
  firstRequestDate: number;
}

class RateLimiter {
  private readonly _limitedIPs: Map<string, ILimitedIP>;
  private _maxLimitedIPsSize: number;
  private _deleteExpiredLimitedIPsInterval: NodeJS.Timeout;

  constructor() {
    this._limitedIPs = new Map<string, ILimitedIP>();

    this._maxLimitedIPsSize = 50;

    this._deleteExpiredLimitedIPsInterval = setInterval(
      this._deleteExpiredLimitedIPs,
      1 * 60 * 60 * 1000,
    );
  }

  getLimitedIPsSize() {
    return this._limitedIPs.size;
  }

  setDeleteInterval(ms: number) {
    clearInterval(this._deleteExpiredLimitedIPsInterval);
    this._deleteExpiredLimitedIPsInterval = setInterval(() => this._deleteExpiredLimitedIPs(), ms);
  }

  setMaxLimitedIPsSize(size: number) {
    this._maxLimitedIPsSize = size;
  }

  limit(config: ILimitConfig) {
    return async (req: Request, _: Response, next: NextFunction) => {
      const now = Date.now();

      const limitedIPKey = req.socket.remoteAddress! + "_" + req.method! + "_" + req.url;

      let limitedIP = this._limitedIPs.get(limitedIPKey);

      if (limitedIP === undefined) limitedIP = this._addLimitedIP(limitedIPKey, config, now);

      const isAllowed = this._shouldAllow(limitedIPKey, limitedIP, now);

      if (!isAllowed) throw new TooManyRequestsException();

      await next();
    };
  }

  private _shouldAllow(limitedIPKey: string, limitedIP: ILimitedIP, now: number) {
    const isWithinWindowMs = now - limitedIP.firstRequestDate <= limitedIP.windowMs;

    if (limitedIP.requestsLeft > 0) {
      this._limitedIPs.set(limitedIPKey, {
        ...limitedIP,
        requestsLeft: limitedIP.requestsLeft - 1,
      });

      return true;
    }

    if (limitedIP.requestsLeft === 0 && !isWithinWindowMs) {
      this._limitedIPs.set(limitedIPKey, {
        ...limitedIP,
        requestsLeft: limitedIP.maxRequests - 1,
        firstRequestDate: now,
      });

      return true;
    }

    return false;
  }

  private _addLimitedIP(limitedIPKey: string, config: ILimitConfig, now: number) {
    if (this._limitedIPs.size + 1 > this._maxLimitedIPsSize) this._deleteOldestLimitedIP(now);

    const newLimitedIP: ILimitedIP = {
      ...config,
      requestsLeft: config.maxRequests,
      firstRequestDate: now,
    };

    this._limitedIPs.set(limitedIPKey, newLimitedIP);

    return newLimitedIP;
  }

  private _deleteExpiredLimitedIPs() {
    if (this._limitedIPs.size === 0) return;
    this._limitedIPs.forEach((value, key) => {
      if (Date.now() - value.firstRequestDate > value.windowMs) this._limitedIPs.delete(key);
    });
  }

  private _deleteOldestLimitedIP(now: number) {
    let oldestLimitedIpKey = "";
    let oldestLimitedIpDate = now;

    this._limitedIPs.forEach((limitedIp, key) => {
      if (limitedIp.firstRequestDate < oldestLimitedIpDate) {
        oldestLimitedIpDate = limitedIp.firstRequestDate;
        oldestLimitedIpKey = key;
      }
    });

    this._limitedIPs.delete(oldestLimitedIpKey);
  }

  destroy() {
    clearInterval(this._deleteExpiredLimitedIPsInterval);
  }
}

export default RateLimiter;
