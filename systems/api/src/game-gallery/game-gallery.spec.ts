import { describe, expect, it } from '@jest/globals';
import { randomUUID } from 'crypto';
import gql from 'graphql-tag';

import { createRequestAgent } from '../test-helpers/create-request-agent';
import { expectResponseCode } from '../test-helpers/expect-response-code';
import { getApolloServer } from '../test-helpers/get-apollo-server';
import { withNestServerContext } from '../test-helpers/nest-app-context';
import { Resource } from '../test-helpers/seeder/resource.constants';
import { createResourceSeeder } from '../test-helpers/seeder/resource-seeding';

const appContext = withNestServerContext({
  imports: [],
});

describe('Game gallery Resolver', () => {
  it('upload game box art', async () => {
    const app = appContext.app;
    const server = getApolloServer(app);
    const PREPARE_UPLOAD_GAME_BOX_ART = gql`
      mutation prepareUploadGameBoxArt($fileName: String!) {
        prepareUploadGameBoxArt(fileName: $fileName) {
          id
          resultPublicUrl
          uploadUrl
        }
      }
    `;
    const resp = await server.executeOperation({
      query: PREPARE_UPLOAD_GAME_BOX_ART,
      variables: {
        fileName: 'test.png',
      },
    });
    expect(resp.errors).toBeUndefined();
    const { resultPublicUrl, uploadUrl } = {
      resultPublicUrl: new URL(
        resp.data?.['prepareUploadGameBoxArt']?.resultPublicUrl,
      ),
      uploadUrl: new URL(resp.data?.['prepareUploadGameBoxArt']?.uploadUrl),
    };

    expect(`${resultPublicUrl.protocol}//${resultPublicUrl.host}`).toEqual(
      'http://localhost:4566',
    );
    expect(`${uploadUrl.protocol}//${resultPublicUrl.host}`).toEqual(
      'http://localhost:4566',
    );
  });
  it('mutation addGameToLibrary', async () => {
    const app = appContext.app;
    const resourceSeeder = createResourceSeeder(app.getHttpServer());
    const server = getApolloServer(app);
    const ADD_GAME_TO_LIST = gql`
      mutation addGameToLibrary($data: AddGameToLibraryArgs!) {
        addGameToLibrary(data: $data) {
          id
        }
      }
    `;
    const resp = await server.executeOperation({
      query: ADD_GAME_TO_LIST,
      variables: {
        data: {
          boxArtImageUrl: 'https://www.google.com',
          genre: 'FIGHTING',
          name: 'GOD OF WAR',
          numberOfPlayers: 4,
          platform: 'PS4',
          publisher: 'SONY INTERACTIVE ENTERTAINMENT',
          releaseDate: '2022-03-22',
          userId: randomUUID(),
        },
      },
    });
    expect(resp.errors).toBeUndefined();
    const dbRecord = await resourceSeeder.findResourceById(
      Resource.GAME,
      resp.data?.['addGameToLibrary']?.id,
    );
    expect(dbRecord).toBeDefined();
  });

  it('should 200 status with error code when missing param on addGameToLibrary mutation', async () => {
    const app = appContext.app;
    const ADD_GAME_TO_LIST = `
      mutation addGameToLibrary($data: AddGameToLibraryArgs!) {
        addGameToLibrary(data: $data) {
          id
        }
      }
    `;
    const { body } = await createRequestAgent(app.getHttpServer())
      .post('/graphql')
      .send({
        query: ADD_GAME_TO_LIST,
        variables: {
          data: {
            boxArtImageUrl: 'https://www.google.com',
            genre: 'FIGHTING',
            name: 'GOD OF WAR',
            numberOfPlayers: 4,
            platform: 'PS4',
            publisher: 'SONY INTERACTIVE ENTERTAINMENT',
            releaseDate: null,
            userId: randomUUID(),
          },
        },
      })
      .expect(expectResponseCode({ expectedStatusCode: 200 }));

    expect(body.errors).toBeDefined();
    expect(body.errors).toStrictEqual([
      {
        extensions: expect.objectContaining({
          code: 'BAD_USER_INPUT',
        }),
        locations: [
          {
            column: 33,
            line: 2,
          },
        ],
        message:
          'Variable "$data" got invalid value null at "data.releaseDate"; Expected non-nullable type "Date!" not to be null.',
      },
    ]);
  });

  it('query gameList by platform', async () => {
    const app = appContext.app;
    const resourceSeeder = createResourceSeeder(app.getHttpServer());

    const server = getApolloServer(app);
    const userId = randomUUID();

    await resourceSeeder.createResource(Resource.GAME, {
      items: Array.from({ length: 4 }).map(() => ({
        boxArtImageUrl: 'https://www.google.com',
        genre: 'FIGHTING',
        name: 'GOD OF WAR',
        numberOfPlayers: 4,
        platform: 'PS5',
        publisher: 'SONY INTERACTIVE ENTERTAINMENT',
        releaseDate: '2022-03-22',
        userId: userId,
      })),
    });

    await resourceSeeder.createResource(Resource.GAME, {
      items: Array.from({ length: 4 }).map(() => ({
        boxArtImageUrl: 'https://www.google.com',
        genre: 'FIGHTING',
        name: 'GOD OF WAR',
        numberOfPlayers: 4,
        platform: 'PS4',
        publisher: 'SONY INTERACTIVE ENTERTAINMENT',
        releaseDate: '2022-03-22',
        userId: userId,
      })),
    });

    const GET_GAME_LIST = gql`
      query queryGameList($userId: ID, $platform: String) {
        gameList(userId: $userId, limit: 10, platform: $platform) {
          edges {
            node {
              id
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `;
    const resp = await server.executeOperation({
      query: GET_GAME_LIST,
      variables: {
        platform: 'PS4',
        userId: userId,
      },
    });
    expect(resp.errors).toBeUndefined();
    const result = resp?.data?.['gameList'];
    expect(result.edges).toHaveLength(4);
    expect(result.pageInfo.hasNextPage).toBeFalsy();
  });

  it('query gameList with pagination', async () => {
    const app = appContext.app;
    const resourceSeeder = createResourceSeeder(app.getHttpServer());

    const server = getApolloServer(app);
    const userId = randomUUID();
    await resourceSeeder.createResource(Resource.GAME, {
      items: Array.from({ length: 128 }).map(() => ({
        boxArtImageUrl: 'https://www.google.com',
        genre: 'FIGHTING',
        name: 'GOD OF WAR',
        numberOfPlayers: 4,
        platform: 'PS4',
        publisher: 'SONY INTERACTIVE ENTERTAINMENT',
        releaseDate: '2022-03-22',
        userId: userId,
      })),
    });
    const GET_GAME_LIST = gql`
      query queryGameList($userId: ID, $nextPageToken: String) {
        gameList(userId: $userId, limit: 10, nextPageToken: $nextPageToken) {
          edges {
            node {
              id
            }
          }
          pageInfo {
            hasNextPage
            nextPageToken
          }
        }
      }
    `;
    async function queryUntilNoNextPageToken(nextPageToken?: string) {
      const resp = await server.executeOperation({
        query: GET_GAME_LIST,
        variables: {
          nextPageToken,
          userId: userId,
        },
      });
      expect(resp.errors).toBeUndefined();
      const result = resp?.data?.['gameList'];
      const respNextPageToken = result.pageInfo.nextPageToken;
      expect(result.pageInfo.hasNextPage).toEqual(respNextPageToken !== null);
      if (respNextPageToken) {
        const currentEdges = result.edges;
        const nextResp: typeof resp = await queryUntilNoNextPageToken(
          respNextPageToken,
        );
        return {
          ...nextResp,
          data: {
            gameList: {
              ...nextResp.data?.['gameList'],
              edges: [...currentEdges, ...nextResp.data?.['gameList'].edges],
            },
          },
        };
      }
      return resp;
    }
    const resp = await queryUntilNoNextPageToken();
    const result = resp?.data?.['gameList'];
    expect(result.edges.length).toEqual(128);
  }, 65535);
  it('query game by id', async () => {
    const app = appContext.app;
    const server = getApolloServer(app);
    const resourceSeeder = createResourceSeeder(app.getHttpServer());
    const userId = randomUUID();
    const game = await resourceSeeder.createResource(Resource.GAME, {
      boxArtImageUrl: 'https://www.google.com',
      genre: 'FIGHTING',
      name: 'GOD OF WAR',
      numberOfPlayers: 4,
      platform: 'PS4',
      publisher: 'SONY INTERACTIVE ENTERTAINMENT',
      releaseDate: '2022-03-22',
      userId: userId,
    });
    const GET_GAME = gql`
      query queryGame($gameId: ID!) {
        game(id: $gameId) {
          id
        }
      }
    `;
    const resp = await server.executeOperation({
      query: GET_GAME,
      variables: {
        gameId: game.id,
      },
    });
    expect(resp.errors).toBeUndefined();
    expect(resp?.data?.['game'].id).toStrictEqual(game.id);
  });
});
