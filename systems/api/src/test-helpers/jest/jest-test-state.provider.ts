import { Injectable, Logger } from '@nestjs/common';
import { path } from 'ramda';

@Injectable()
export class JestTestStateProvider {
  private logger = new Logger(JestTestStateProvider.name);

  get testConfig() {
    // @ts-expect-error No type here
    return global['testConfig'] ?? {};
  }
}

export function getTestConfig(paths: ['db', 'gameTable']) {
  // @ts-expect-error No type here
  return path(paths, global['testConfig'] ?? {});
}
