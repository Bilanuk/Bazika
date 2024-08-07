import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '@/decorators';
import { Reflector } from '@nestjs/core';

@Injectable()
export class GraphqlJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isGoogleLogin = this.reflector.getAllAndOverride('google-login', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic || isGoogleLogin) {
      return true;
    }
    return super.canActivate(context);
  }
}
