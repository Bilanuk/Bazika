import { Resolver, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './models/user';
import { GraphQLUser } from '@/decorators';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { name: 'user', nullable: false })
  async getUser(@GraphQLUser() user: User): Promise<User> {
    return this.usersService.getUser({ id: user.id });
  }
}
