import { Resolver, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './models/user';
import { JwtAuthGuard } from '@/guards/http-jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { GraphQLUser, Public } from '@/decorators';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { name: 'user', nullable: false })
  @Public()
  async getUser(@GraphQLUser() user: User): Promise<User> {
    console.log('user', user);
    return this.usersService.getUser({ id: user.id });
  }
}
