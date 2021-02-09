'use strict';

const viewLicenceLib = require('../../../lib/view-licence-config');
const services = require('../../../lib/connectors/services');
const { hasScope } = require('internal/lib/permissions');
const { scope } = require('internal/lib/constants');

/**
 * Get a list of returns for a particular licence
 * @param {String} request.params.documenId - the CRM doc ID for the licence
 * @param {Number} request.query.page - the page number for paginated results
 */
const getBillsForLicence = async (request, h) => {
  const { licenceId } = request.params;
  const { page } = request.query;

  const document = await services.water.licences.getDocumentByLicenceId(licenceId);

  const bills = await viewLicenceLib.getLicenceInvoices(licenceId, page, 0);

  const isChargingUser = hasScope(request, scope.charging);

  return h.view('nunjucks/billing/bills', {
    ...request.view,
    pageTitle: document.metadata.Name,
    isChargingUser,
    subHeading: 'All sent bills',
    caption: document.system_external_id,
    bills: bills.data,
    back: `/licences/${licenceId}#bills`
  });
};

module.exports = {
  getBillsForLicence
};
