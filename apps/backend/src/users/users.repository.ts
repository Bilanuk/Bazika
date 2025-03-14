import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@database';
import { PrismaService } from 'src/database/prisma.service';;

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  public async GetUser(params: {
    where?: Prisma.UserWhereUniqueInput;
  }): Promise<User> {
    const { where } = params;
    const user = await this.prisma.user.findUnique({ where });
    if (!user) {
      throw new NotFoundException(`Can't find user with id ${where.id}`);
    }
    return user;
  }
}
