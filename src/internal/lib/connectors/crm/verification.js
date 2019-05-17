/**
 * Creates a client connector for the CRM verification API endpoint
 * @module lib/connectors/crm-verification
 */
const { APIClient } = require('@envage/hapi-pg-rest-api');
const rp = require('request-promise-native').defaults({
  proxy: null,
  strictSSL: false
});

// Create API client
const client = new APIClient(rp, {
  endpoint: `${process.env.CRM_URI}/verification`,
  headers: {
    Authorization: process.env.JWT_TOKEN
  }
});

/**
 * Get outstanding verifications for the supplied entityId
 * @param {String} entityId - the individual entity who claimed the licences
 * @return {Promise} resolves with list of verifications
 */
client.getOutstandingVerifications = function (entityId) {
  return client.findMany({
    entity_id: entityId,
    date_verified: null
  });
};

/**
 * Create a list of documents for a verification
 * @param {String} verificationId - GUID for the verification ID
 * @param {Array} documentIds - array of document Ids
 * @return {Promise}
 */
client.addDocuments = (verificationId, documentIds) => {
  const uri = `${process.env.CRM_URI}/verification/${verificationId}/documents`;
  return rp({
    uri,
    method: 'POST',
    headers: {
      Authorization: process.env.JWT_TOKEN
    },
    json: true,
    body: {
      document_id: documentIds
    }
  });
};

/**
 * Get a list of documents for a verification
 * @param {String} verificationId - GUID for the verification ID
 * @return {Promise}
 */
client.getDocuments = (verificationId, documentIds) => {
  const uri = `${process.env.CRM_URI}/verification/${verificationId}/documents`;
  return rp({
    uri,
    method: 'GET',
    headers: {
      Authorization: process.env.JWT_TOKEN
    },
    json: true
  });
};

module.exports = client;
