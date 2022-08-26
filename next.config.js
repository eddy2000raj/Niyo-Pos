const withPWA = require('next-pwa');
const { withSentryConfig } = require('@sentry/nextjs');

const dev = process.env.NODE_ENV === 'development';

const nextConfig = {
  env: {},
  useFileSystemPublicRoutes: true,
  eslint: {
    dirs: ['pages', 'components', 'layout', 'hooks'],
  },
  sentry: {
    hideSourceMaps: true,
  },
};

const pwaConfig = {
  pwa: {
    dest: 'public',
    disable: dev,
    register: true,
    sw: './serviceWorker.js',
    scope: '/',
  },
};

const sentryWebpackPluginOptions = { silent: true };

const appConfig = dev
  ? { ...nextConfig, pwaConfig }
  : withPWA({ ...nextConfig, ...pwaConfig });

module.exports = withSentryConfig(appConfig, sentryWebpackPluginOptions);
