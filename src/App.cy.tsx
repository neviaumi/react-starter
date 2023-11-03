import { cy, describe } from '@busybox/cypress';

import App from './App.tsx';

describe('Simple Test', () => {
  it('Should have class attached', () => {
    cy.mount(<App />);
    cy.findByTestId('test-element').should('have.class', 'tw-font-bold');
  });
});
