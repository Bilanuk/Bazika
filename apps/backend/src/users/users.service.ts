import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { GetUserArgs } from './dto/args/get-user';
import { User } from './models/user';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUser(getUserArgs: GetUserArgs): Promise<User> {
    const { id } = getUserArgs;
    return this.usersRepository.GetUser({ where: { id } });
  }
}
