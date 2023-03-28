import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LeadTokenGuard implements CanActivate {
  canActivate(
    context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (context.switchToHttp().getRequest().query.lead_token === process.env.LEAD_TOKEN) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
