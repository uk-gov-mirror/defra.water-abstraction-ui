'use strict';

const { set } = require('lodash');

/**
 * @class provides an abstraction on top of request.yar to manage
 * session data with a prefix key to avoid collisions
 */

class SessionSlice {
  /**
   * Create a new session slice
   *
   * @param {String} keyPrefix prefixes all session data keys in this slice
   */
  constructor (keyPrefix) {
    this._keyPrefix = keyPrefix;
  }

  /**
   * Gets the key that will be used in Yar by joining the
   * key prefix with the supplied key
   *
   * @param {String} key
   * @return {String}
   */
  _getYarKey (key) {
    return `${this._keyPrefix}.${key}`;
  }

  /**
   * Gets the data stored at the supplied key in this slice
   *
   * @param {Object} request - hapi request
   * @param {String} key - session key
   * @return {Mixed} - the value
   */
  get (request, key) {
    const fullKey = this._getYarKey(key);
    return request.yar.get(fullKey);
  }

  /**
   * Sets the data stored at the supplied key in this slice
   *
   * @param {Object} request - hapi request
   * @param {String} key - session key
   * @param {Mixed} data - the data to set
   * @return {Object} - all data in slice
   */
  set (request, key, data) {
    const fullKey = this._getYarKey(key);
    return request.yar.set(fullKey, data);
  }

  /**
   * Shallow merges the existing and supplied data
   * (only top-level data items)
   *
   * @param {Object} request - hapi request
   * @param {String} key - session key
   * @param {Object} data - the data to set
   * @return {Object} - all data in slice
   */
  merge (request, key, data = {}) {
    const existingData = this.get(request, key);
    return this.set(request, key, {
      ...existingData,
      ...data
    });
  }

  /**
   * Sets an individual property at the specified path
   *
   * @param {Object} request - hapi request
   * @param {String} key - session key
   * @param {String} propertyPath - e.g. "item.child.grandChild"
   * @param {Mixed} value - the data to set
   * @return {Object} - all data in slice
   */
  setProperty (request, key, propertyPath, value) {
    const fullKey = this._getYarKey(key);
    const data = set(
      request.yar.get(fullKey),
      propertyPath,
      value
    );
    return request.yar.set(fullKey, data);
  }
}

module.exports = SessionSlice;
