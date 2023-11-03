import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, res: Response, next: NextFunction) {
    const reqId =
      request.get('REQ-ID') || request.get('X-Amz-Cf-Id') || randomUUID();
    res.locals['reqId'] = reqId;
    res.setHeader('request-id', reqId);
    next();
  }
}
