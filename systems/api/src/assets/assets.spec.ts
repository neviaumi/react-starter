import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from '@jest/globals';
import { Test } from '@nestjs/testing';

import { ConfigModule, ConfigService } from '../config/config.module';
import {
  AssetsModule,
  AssetsStorageProvider,
  PreSignUploadUrlCommand,
} from './assets.module';

const fixtureRoot = path.join(__dirname, '../../__fixtures__');

describe('Assets Module', () => {
  it('url return from PreSignUploadUrlCommand should able to read/write s3 object', async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [ConfigModule.forRoot(), AssetsModule],
    });
    const module = await moduleBuilder.compile();
    const config = module.get(ConfigService);
    const assetsStorageProvider = module.get(AssetsStorageProvider);
    const { preSignedUploadUrl, publicUrlAfterUpload } =
      await assetsStorageProvider.send(
        new PreSignUploadUrlCommand(
          {
            ACL: 'public-read',
            Bucket: config.get('s3.asset.bucket'),
            Key: `upload/test/test-${randomUUID()}.jpg`,
          },
          {
            expiresIn: 30,
          },
        ),
      );
    await fetch(preSignedUploadUrl, {
      body: await fs.readFile(path.join(fixtureRoot, 'dq-11.png')),
      method: 'PUT',
    });
    await fetch(publicUrlAfterUpload).then(async res => {
      expect(res.ok).toBeTruthy();
    });
  });
});
