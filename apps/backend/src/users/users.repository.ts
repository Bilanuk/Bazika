import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, users } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';;

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  public async GetUser(params: {
    where?: Prisma.usersWhereUniqueInput;
  }): Promise<users> {
    const { where } = params;
    const user = await this.prisma.users.findUnique({ where });
    if (!user) {
      throw new NotFoundException(`Can't find user with id ${where.id}`);
    }
    return user;
  }
}
