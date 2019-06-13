require('dotenv').config();
require('app-module-path').addPath(require('path').join(__dirname, 'src/'));

const { createPlugins } = require('./server-common');

// -------------- Require vendor code -----------------
const Hapi = require('@hapi/hapi');

// -------------- Require project code -----------------
const config = require('./src/external/config');
const plugins = require('./src/external/lib/hapi-plugins');
const routes = require('./src/external/modules/routes');
const returnsPlugin = require('./src/external/modules/returns/plugin');
const viewEngine = require('./src/external/lib/view-engine/');
const { logger } = require('./src/external/logger');
const connectors = require('./src/external/lib/connectors/services');

const common = createPlugins(config, logger, connectors);

// Configure auth plugin
const AuthConfig = require('./src/external/lib/AuthConfig');
const authConfig = new AuthConfig(config, connectors);
const authPlugin = {
  plugin: require('shared/plugins/auth'),
  options: authConfig
};

// Define server with REST API cache mechanism
// @TODO replace with redis
const server = Hapi.server({
  ...config.server,
  cache: {
    engine: require('./src/shared/lib/catbox-rest-api')
  } });

/**
 * Async function to start HAPI server
 */
async function start () {
  try {
    await server.register([...common, ...Object.values(plugins), returnsPlugin]);

    // Set up auth strategies
    server.auth.strategy('standard', 'cookie', {
      ...config.hapiAuthCookie,
      validateFunc: (request, data) => authConfig.validateFunc(request, data)
    });
    server.auth.default('standard');

    // Set up Nunjucks view engine
    server.views(viewEngine);

    // Auth plugin
    await server.register(authPlugin);

    server.route(routes);

    await server.start();

    server.log(['info'], `Server started on ${server.info.uri} port ${server.info.port}`);
  } catch (err) {
    logger.error('Failed to start server', err);
  }

  return server;
}

const processError = message => err => {
  logger.error(message, err);
  process.exit(1);
};

process
  .on('unhandledRejection', processError('unhandledRejection'))
  .on('uncaughtException', processError('uncaughtException'));

module.exports = server;
start();
