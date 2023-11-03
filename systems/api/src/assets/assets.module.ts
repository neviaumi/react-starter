import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Module } from '@nestjs/common';

import { AppEnvironment } from '../config/config.constants';
import { ConfigModule, ConfigService } from '../config/config.module';

export class PreSignUploadUrlCommand {
  constructor(
    private input: PutObjectCommandInput,
    private options: Parameters<typeof getSignedUrl>[2] = undefined,
  ) {}

  async execute({ config, s3 }: { config: ConfigService; s3: S3Client }) {
    const preSignedUploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand(this.input),
      this.options,
    );
    const publicHost = config.get('s3.asset.host');
    const publicUrlAfterUpload = new URL(
      `${publicHost}/${this.input.Key!}`,
    ).toString();
    return {
      preSignedUploadUrl,
      publicUrlAfterUpload,
    };
  }
}

@Injectable()
export class AssetsStorageProvider {
  private s3: S3Client;

  constructor(private config: ConfigService) {
    const env = this.config.get('env');
    const isPrd = ![AppEnvironment.TEST, AppEnvironment.DEV].includes(env);
    this.s3 = new S3Client({
      region: this.config.get('s3.asset.region'),
      ...(!isPrd
        ? {
            endpoint: 'http://localhost:4566',
            forcePathStyle: true,
          }
        : {}),
    });
  }

  async send(command: PreSignUploadUrlCommand) {
    return command.execute({ config: this.config, s3: this.s3 });
  }
}

@Module({
  exports: [AssetsStorageProvider],
  imports: [ConfigModule],
  providers: [AssetsStorageProvider],
})
export class AssetsModule {}
