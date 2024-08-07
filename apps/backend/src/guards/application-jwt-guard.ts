import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtAuthGuard } from '@/guards/http-jwt-auth.guard';
import { GraphqlJwtAuthGuard } from '@/guards/graphql-jwt-auth.guard';

@Injectable()
export class ApplicationJwtGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const isGraphql = ctx.getContext().req ? true : false;

    if (isGraphql) {
      const graphqlGuard = new GraphqlJwtAuthGuard(this.reflector);
      return graphqlGuard.canActivate(context) as boolean;
    } else {
      const httpGuard = new JwtAuthGuard(this.reflector);
      return httpGuard.canActivate(context) as boolean;
    }
  }
}
