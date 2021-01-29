'use strict';

const Boom = require('@hapi/boom');
const { get } = require('lodash');
const { water } = require('../../lib/connectors/services');

const session = require('./lib/session');

const errorHandler = (err, message) => {
  if (err.statusCode === 404) {
    return Boom.notFound(message);
  }
  throw err;
};

const loadBillingAccount = async request => {
  const { billingAccountId } = request.params;
  try {
    return water.invoiceAccounts.getInvoiceAccount(billingAccountId);
  } catch (err) {
    return errorHandler(err, `Cannot load billing account ${billingAccountId}`);
  }
};

const getSessionDataFromRequest = request => {
  const { key } = request.params;
  return session.get(request, key);
};

const getSessionData = request => {
  const data = getSessionDataFromRequest(request);
  return data || Boom.notFound(`Session data not found for ${request.params.key}`);
};

const getBillingAccounts = async request => {
  const { key } = request.params;
  const { companyId, regionId } = session.get(request, key);

  try {
    const { data } = await water.companies.getCompanyInvoiceAccounts(companyId, regionId);
    return data;
  } catch (err) {
    return errorHandler(err, `Cannot load billing accounts for company ${companyId}`);
  }
};

/**
 * Gets the "company" account
 */
const getAccount = async request => {
  const { key } = request.params;
  const { companyId } = session.get(request, key);
  return water.companies.getCompany(companyId);
};

/**
 * Get licences currently linked to the billing account
 */
const getBillingAccountLicences = async request => {
  const { id } = get(request, 'pre.sessionData.data');
  if (id) {
    const { data } = await water.invoiceAccounts.getLicences(id);
    return data;
  }
};

exports.loadBillingAccount = loadBillingAccount;
exports.getSessionData = getSessionData;
exports.getBillingAccounts = getBillingAccounts;
exports.getAccount = getAccount;
exports.getBillingAccountLicences = getBillingAccountLicences;
