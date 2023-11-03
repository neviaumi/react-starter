import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    devServer: {
      bundler: 'vite',
      framework: 'react',
    },
    viewportHeight: 1024,
    viewportWidth: 768,
  },
  screenshotOnRunFailure: false,
  video: false,
});
