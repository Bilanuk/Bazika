import { Public } from '@/decorators';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  constructor() {}

  @Get()
  @Public()
  healthCheck() {
    return { status: 'ok' };
  }
}
