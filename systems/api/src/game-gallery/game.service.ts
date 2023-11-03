import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import path from 'path';

import {
  AssetsStorageProvider,
  PreSignUploadUrlCommand,
} from '../assets/assets.module';
import { ConfigService } from '../config/config.module';
import type { AddGameToLibraryArgs } from './dto/add-game-to-library.args';
import type { GetGameListArgs } from './dto/get-game-list.args';
import { GameRepository } from './game.repository';
import type { GameList } from './models/game.model';

@Injectable()
export class GameService {
  constructor(
    private assetsStorageProvider: AssetsStorageProvider,
    private gameRepository: GameRepository,
    private config: ConfigService,
  ) {}

  async preSignUploadBoxArtUrl({ fileName }: { fileName: string }) {
    const bucket = this.config.get('s3.asset.bucket');
    const id = randomUUID();

    const key = path.join('upload', 'box-art', `${id}-${fileName}`);

    const { preSignedUploadUrl, publicUrlAfterUpload } =
      await this.assetsStorageProvider.send(
        new PreSignUploadUrlCommand(
          {
            Bucket: bucket,
            Key: key,
          },
          {
            expiresIn: 30,
          },
        ),
      );

    return {
      id,
      resultPublicUrl: publicUrlAfterUpload,
      uploadUrl: preSignedUploadUrl,
    };
  }

  async fineGamesList(args: GetGameListArgs): Promise<GameList> {
    const { platform, userId } = args;
    const where = [];
    if (platform) where.push(['platform', platform]);
    if (userId) where.push(['userId', userId]);
    const { data: records, nextPageToken } = await this.gameRepository.find({
      limit: args.limit,
      nextPageToken: args.nextPageToken,
      where: Object.fromEntries(where),
    });
    return {
      edges: records?.map(record => ({
        node: record,
      })),
      pageInfo: {
        hasNextPage: nextPageToken !== undefined,
        nextPageToken,
      },
    };
  }

  fineGame(id: string) {
    return this.gameRepository.findOneOrFail(id);
  }

  async createGame(args: AddGameToLibraryArgs) {
    return this.gameRepository.save({
      boxArtImageUrl: args.boxArtImageUrl ?? '',
      createdAt: new Date().toISOString(),
      genre: args.genre,
      id: randomUUID(),
      name: args.name,
      numberOfPlayers: args.numberOfPlayers,
      platform: args.platform,
      publisher: args.publisher,
      releaseDate: args.releaseDate.toISOString(),
      updatedAt: new Date().toISOString(),
      userId: args.userId,
    });
  }
}
