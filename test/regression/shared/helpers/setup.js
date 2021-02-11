'use strict';

/**
 * Contains methods to set up/tear down acceptance test data in water service
 */
const rp = require('request-promise-native').defaults({
  proxy: null,
  strictSSL: false
});
const urlJoin = require('url-join');

/**
 * HTTP request to the water service
 * @param {String} uri
 * @param {Object} [overrides]
 * @return {Promise}
 */
const waterRequest = async (tail, overrides = {}, method) => {
  const opts = Object.assign({}, {
    uri: urlJoin(process.env.WATER_URI, tail),
    method,
    headers: {
      Authorization: `Bearer ${process.env.JWT_TOKEN}`
    }
  }, overrides);
  console.log(`Calling ${opts.method} ${opts.uri}`);
  const data = await rp(opts);
  console.log(`Calling ${opts.method} ${opts.uri} - success!`);
  console.log(data);
};

/**
 * Sets up acceptance test data
 * @return {Promise}
 */
const setUp = () => waterRequest('/acceptance-tests/set-up', {
  form: {
    includeInternalUsers: true
  }
}, 'POST');

/**
 * Sets up acceptance test data
 * @return {Promise}
 */
const waterServerStatus = () => waterRequest('/service-status', {}, 'GET');

/**
 * Tears down acceptance test data
 * @return {Promise}
 */
const tearDown = () => waterRequest('/acceptance-tests/tear-down', {}, 'POST');

exports.setUp = setUp;
exports.tearDown = tearDown;
exports.waterServerStatus = waterServerStatus;
