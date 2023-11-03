/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/**/*.{ts,tsx}',
    './cypress/**/*.{ts,tsx}',
    './node_modules/@busybox/react-components/dist/*.js',
  ],
  presets: [require('@busybox/react-components/tailwind-config')],
};

export default config;
