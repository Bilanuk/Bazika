import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ToiletsModule } from './toilets/toilets.module';
import { SerialsModule } from '@/serials/serials.module';

@Module({
  imports: [ConfigModule.forRoot(), ToiletsModule, SerialsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
