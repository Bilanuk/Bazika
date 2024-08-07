import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { ApplicationJwtGuard } from '@/guards/application-jwt-guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: ApplicationJwtGuard,
    },
  ],
})
export class AuthModule {}
