//contains generic functions unrelated to a specific component
var rp = require('request-promise-native').defaults({
    proxy:null,
    strictSSL :false
  })

const isArray = require('lodash/isArray');


/**
 * Force a value to be an array
 * If an array is passed it is returned
 * Otherwise, a single-value array is returned
 * @param {Mixed} value - value to convert
 * @return {Array} - array value
 */
function forceArray(value) {
  if(isArray(value)) {
    return value;
  }
  return [value];
}


//make a simple http request (without a body), uses promises
function makeURIRequest(uri) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'get',
      uri: uri
    };
    rp(options)
      .then(function(response) {
        var responseData = {};
        responseData.error = null
        responseData.statusCode = 200
        responseData.body = response
        resolve(responseData);
      })
      .catch(function(response) {
        var responseData = {};
        responseData.error = response.error
        responseData.statusCode = response.statusCode
        responseData.body = response.body
        reject(responseData);
      });
  })
}

//make an http request (with a body), uses promises
function makeURIRequestWithBody(uri, method, data) {
  return new Promise((resolve, reject) => {
    var options = {
      method: method,
      uri: uri,
      body: data,
      json: true
    };

    rp(options)
      .then(function(response) {
        var responseData = {};
        responseData.error = null
        responseData.statusCode = 200
        responseData.body = response
        resolve(responseData);
      })
      .catch(function(response) {
        var responseData = {};
        responseData.error = response.error
        responseData.statusCode = response.statusCode
        responseData.body = response.body
        reject(responseData);
      });

  })

}

//create a UUID
function createGUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}

module.exports = {
  createGUID: createGUID,
  makeURIRequest: makeURIRequest,
  makeURIRequestWithBody: makeURIRequestWithBody,
  forceArray


}
