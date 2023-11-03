import { Module } from '@nestjs/common';

import { ConfigModule } from '../../config/config.module';
import { GameGalleryModule } from '../../game-gallery/game-gallery.module';
import { SeederController } from './seeder.controller';
import { SeederService } from './seeder.service';

@Module({
  controllers: [SeederController],
  imports: [ConfigModule, GameGalleryModule],
  providers: [SeederService],
})
export class SeederModule {}
