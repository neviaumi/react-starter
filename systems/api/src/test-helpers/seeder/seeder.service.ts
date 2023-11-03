import { Injectable } from '@nestjs/common';

import { GameRepository } from '../../game-gallery/game.repository';

@Injectable()
export class SeederService {
  constructor(private gameRepository: GameRepository) {}

  async create(data: any) {
    if (data.items) {
      return await this.gameRepository.saveInBatch(data.items);
    }
    return await this.gameRepository.save(data);
  }

  async fineMany(conditions: any) {
    const records = await this.gameRepository.find({ where: conditions });
    return records;
  }

  async fineOne(id: string) {
    const record = await this.gameRepository.findOneOrFail(id);
    return record;
  }
}
