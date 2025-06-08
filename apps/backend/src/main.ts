import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BullBoardService } from './queue/services/bull-board.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set up Bull Board dashboard
  const bullBoardService = app.get(BullBoardService);
  app.use('/admin/queues', bullBoardService.getRouter());
  
  app.enableShutdownHooks();
  await app.listen(process.env.SERVER_PORT || 4001);
  
  console.log(`🚀 Server running on http://localhost:${process.env.SERVER_PORT || 4001}`);
  console.log(`📊 Bull Board dashboard: http://localhost:${process.env.SERVER_PORT || 4001}/admin/queues`);
}
bootstrap();
