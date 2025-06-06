import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SerialsModule } from '@/serials/serials.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { HealthModule } from '@/health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import * as Joi from 'joi';
import { AuthModule } from '@/auth/auth.module';
import { GoogleStrategy } from '@/strategies/google.strategy';
import { JwtStrategy } from '@/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@/users/users.module';
import { ContentMonitoringModule } from '@/content-monitoring/content-monitoring.module';
import { SourcesModule } from '@/sources/sources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        DIRECT_URL: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().required(),
        APP_JWT_SECRET: Joi.string().required(),
        TELEGRAM_BOT_TOKEN: Joi.string().optional(),
        TELEGRAM_CHAT_ID: Joi.string().optional(),
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => {
        return { req };
      },
    }),
    AuthModule,
    PassportModule,
    JwtModule.register({
      global: true,
    }),
    UsersModule,
    SerialsModule,
    HealthModule,
    PrismaModule,
    ContentMonitoringModule,
    SourcesModule,
  ],
  providers: [PrismaService, GoogleStrategy, JwtStrategy],
})
export class AppModule {}
