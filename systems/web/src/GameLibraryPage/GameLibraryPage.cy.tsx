import { cy, describe, it } from '@busybox/cypress';

import {
  aliasQuery,
  hasOperationName,
  testGraphqlUrl,
} from '../../cypress/support/graphql-test-utils.ts';
import GameLibraryPage from './GameLibraryPage.tsx';

describe('GameLibraryPage', () => {
  it('should render', () => {
    cy.intercept('POST', testGraphqlUrl, req => {
      if (hasOperationName(req, 'queryGameList')) {
        aliasQuery(req, 'queryGameList');
        req.reply({
          body: {
            data: {
              gameList: {
                edges: [
                  {
                    node: {
                      boxArtImageUrl: 'https://http.cat/images/200.jpg',
                      id: '1',
                      name: 'Fake Game',
                      platform: 'PS4',
                      publisher: 'Fake Publisher',
                    },
                  },
                  {
                    node: {
                      boxArtImageUrl: 'https://http.cat/images/200.jpg',
                      id: '2',
                      name: 'Fake Game 1',
                      platform: 'PS4',
                      publisher: 'Fake Publisher',
                    },
                  },
                  {
                    node: {
                      boxArtImageUrl: 'https://http.cat/images/200.jpg',
                      id: '3',
                      name: 'Fake Game 2',
                      platform: 'PS4',
                      publisher: 'Fake Publisher',
                    },
                  },
                ],
              },
            },
          },
          statusCode: 200,
        });
      }
    });
    cy.mount(<GameLibraryPage />);
    cy.findAllByTestId('game-container').should('have.length', 3);
  });
});
