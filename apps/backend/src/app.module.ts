import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SerialsModule } from '@/serials/serials.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    SerialsModule,
  ],
})
export class AppModule {}
