import { ConfigService } from '@nestjs/config';

import { bootstrap } from './bootstrap';
import { serializeError } from './utils/serialize-error';

async function start() {
  const app = await bootstrap();
  const config = app.get(ConfigService);
  const port = config.get<number>('port')!;
  return app.listen(port);
}

start().catch(async e => {
  // eslint-disable-next-line no-console
  console.error(await serializeError(e));
  throw e;
});
