import type { Request } from 'express';
import type { SessionActor } from './session.service.js';

export interface AuthenticatedRequest extends Request {
  user: SessionActor;
}
