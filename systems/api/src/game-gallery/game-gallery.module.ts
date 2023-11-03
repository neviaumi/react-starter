import { Module } from '@nestjs/common';

import { AssetsModule } from '../assets/assets.module';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { GameRepository } from './game.repository';
import { GameResolver } from './game.resolver';
import { GameService } from './game.service';

@Module({
  exports: [GameRepository],
  imports: [ConfigModule, DatabaseModule, AssetsModule],
  providers: [GameRepository, GameService, GameResolver],
})
export class GameGalleryModule {}
