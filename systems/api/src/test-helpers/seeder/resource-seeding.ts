import { randomUUID } from 'node:crypto';

import type { INestApplication } from '@nestjs/common';
import { assocPath, map, pipe } from 'ramda';

import { createRequestAgent } from '../create-request-agent';
import { expectResponseCode } from '../expect-response-code';
import { Resource } from './resource.constants';

export function createResourceSeeder(app: INestApplication) {
  return {
    async createResource(resourceName: Resource, data: any) {
      const withAttributes = pipe(
        assocPath(['createdAt'], new Date().toISOString()),
        assocPath(['updatedAt'], new Date().toISOString()),
        obj => assocPath(['id'], randomUUID())(obj),
      );
      const requestBody: any = !data.items
        ? withAttributes(data)
        : { items: map(withAttributes)(data.items) };
      return createRequestAgent(app)
        .post(`/test/seeder/${resourceName}/`)
        .send(requestBody)
        .expect(expectResponseCode({ expectedStatusCode: 201 }))
        .then(resp => resp.body.data);
    },
    async findResourceById(resourceName: Resource, id: string) {
      return createRequestAgent(app)
        .get(`/test/seeder/${resourceName}/${id}`)
        .send()
        .expect(expectResponseCode({ expectedStatusCode: 200 }))
        .then(resp => resp.body.data);
    },
  };
}
