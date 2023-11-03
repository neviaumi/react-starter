// eslint-disable-next-line import/no-unresolved
import tailwindConfig from '@busybox/tailwindcss-config';

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{ts,tsx}', './cypress/**/*.{ts,tsx}'],
  presets: [tailwindConfig],
};

export default config;
