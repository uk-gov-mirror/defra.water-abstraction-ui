const { throwIfError, APIClient } = require('@envage/hapi-pg-rest-api');
const serviceRequest = require('../../service-request');

class UsersAPIClient extends APIClient {
  /**
   * Authenticates a user with the IDM for the application specified in
   * the config object
   * Resolves with a user record from IDM
   * @param  {String}  email    - user email address
   * @param  {String}  password - user password
   * @param  {String}  application - the application to use for authentication
   * @return {Promise<Object>} resolves with object including success flag
   */
  async authenticate (email, password, application) {
    try {
      const uri = `${this.config.endpoint}/login`;

      const response = await serviceRequest.post(uri, {
        body: {
          user_name: email,
          password,
          application
        }
      });

      return response;
    } catch (error) {
      // Unauthorized
      if (error.statusCode === 401) {
        return;
      }
      // Throw other errors
      throw error;
    }
  };

  /**
   * Finds a user by email address within the application specified in the
   * config
   * @param  {String}  email    - user email address
   * @return {Promise}       resolves with user object from IDM
   */
  async findOneByEmail (email, application) {
    const { error, data: [ user ] } = await this.findMany({
      user_name: email,
      application
    });
    throwIfError(error);
    return user;
  }

  /**
   * Update the external_id field for the given user
   * @param {object} user - The user
   * @param {String} externalId - The crm entity id
   * @return {Promise}
   */
  updateExternalId (user, externalId) {
    if (user.external_id) {
      return;
    }
    return this.updateOne(user.user_id, { external_id: externalId });
  };

  /**
     * Reset user's password in IDM
     * Triggers notify message
     * @param {String} application - the application for the user account
     * @param {String} email - user's email address
     * @param {String} mode - can be reset|new|existing
     * @param {Object} [params] - additional optional query string params
     * @return {Promise} resolves with {error, data}, data contains user_id and reset_guid
     */
  resetPassword (application, email, mode = 'reset', params = {}) {
    const endpoint = this.config.endpoint.replace('/user', '');
    const uri = `${endpoint}/reset/${application}/${email}`;
    return serviceRequest.patch(uri, {
      qs: {
        mode,
        ...params
      }
    });
  }

  /**
   * Check reset guid
   * @param {String} application - the application for the user
   * @param {String} resetGuid - the password reset GUID issued by email
   * @return {Promise} resolves with user record if found or null otherwise
   */
  async getUserByResetGuid (application, resetGuid) {
    const filter = {
      application,
      reset_guid: resetGuid
    };
    const { error, data: [user] } = await this.findMany(filter);
    throwIfError(error);
    return user;
  }

  /**
   * Update password in IDM
   * @param {String} resetGuid - the reset GUID issues during reset password
   * @param {String} password - new password
   * @return {Promise} resolves when user updated
   */
  updatePasswordWithGuid (application, resetGuid, password) {
    const filter = {
      application,
      reset_guid: resetGuid
    };
    return this.updateMany(filter, {
      password,
      reset_required: 0,
      bad_logins: 0,
      reset_guid: null
    });
  }
}

module.exports = UsersAPIClient;
