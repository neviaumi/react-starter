import { serializeError } from '../../utils/serialize-error';

export function err(error: Error) {
  return serializeError(error, {
    maxDepth: 3,
  });
}
