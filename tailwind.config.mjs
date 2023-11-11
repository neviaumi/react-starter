// eslint-disable-next-line import/no-unresolved
import tailwindConfig, {
  withColors,
  withSpacing,
} from '@busybox/tailwindcss-config';

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{ts,tsx}', './cypress/**/*.{ts,tsx}'],
  presets: [withSpacing(withColors(tailwindConfig))],
};

console.log(config);

export default config;
