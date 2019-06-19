// contains generic functions unrelated to a specific component
const rp = require('request-promise-native').defaults({
  proxy: null,
  strictSSL: false
});

const isArray = require('lodash/isArray');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

/**
 * Force value to be array
 * @param {Mixed} val - the value
 * @return {Array} the value wrapped in array
 */
function forceArray (val) {
  if (val === null || val === undefined) {
    return [];
  }
  return isArray(val) ? val : [val];
}

// make a simple http request (without a body), uses promises
function makeURIRequest (uri) {
  return new Promise((resolve, reject) => {
    const options = { method: 'get', uri };

    rp(options)
      .then(response => resolveResponse(response, resolve))
      .catch(response => rejectResponse(response, reject));
  });
}

const createResponse = (body, statusCode = 200, error = null) => ({
  statusCode,
  error,
  body
});

const resolveResponse = (response, resolve) => {
  resolve(createResponse(response));
};

const rejectResponse = (response, reject) => {
  const { body, error, statusCode } = response;
  reject(createResponse(body, statusCode, error));
};

// make an http request (with a body), uses promises
function makeURIRequestWithBody (uri, method, data) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      uri,
      body: data,
      json: true
    };

    rp(options)
      .then(response => resolveResponse(response, resolve))
      .catch(response => rejectResponse(response, reject));
  });
}

exports.makeURIRequest = makeURIRequest;
exports.makeURIRequestWithBody = makeURIRequestWithBody;
exports.forceArray = forceArray;
exports.exec = exec;
