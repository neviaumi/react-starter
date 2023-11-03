import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { Logger } from './logger';
import { NestLogger } from './nest-logger';

@Module({
  exports: [NestLogger, Logger],
  imports: [ConfigModule],
  providers: [Logger, NestLogger],
})
export class LoggingModule {}

export { Logger } from './logger';
export { NestLogger } from './nest-logger';
