import { JwtPayload } from './jwt-payload.types';

export type JwtPayloadWithRt = JwtPayload & { refreshToken: string };