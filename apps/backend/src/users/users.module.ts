import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UsersService } from '@/users/users.service';
import { UsersRepository } from '@/users/users.repository';
import { UsersResolver } from '@/users/users.resolver';

@Module({
  providers: [UsersService, UsersRepository, UsersResolver, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
