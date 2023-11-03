import type { Options } from 'serialize-error';
import { serializeError as orgSerializeError } from 'serialize-error';

export async function serializeError(error: unknown, options: Options = {}) {
  return orgSerializeError(error, options);
}
