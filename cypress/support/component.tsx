import './commands.ts';

import { cy, Cypress } from '@busybox/cypress';
import { mount } from 'cypress/react18';

import TestBed from './TestBed.tsx';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getComponentCanvasRoot(): Chainable<JQuery<HTMLElement>>;

      mount: typeof mount;
    }
  }
}

// Example use:
// cy.mount(<MyComponent />)
Cypress.Commands.add('mount', element => mount(<TestBed>{element}</TestBed>));

Cypress.Commands.add('getComponentCanvasRoot', () => {
  return cy.get(`div[data-cy-root]`);
});
