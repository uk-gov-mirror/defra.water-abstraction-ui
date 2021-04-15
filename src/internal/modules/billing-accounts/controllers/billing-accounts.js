'use strict';

const { pick } = require('lodash');
const titleCase = require('title-case');

const getBillingAccountCaption = billingAccount =>
  `Billing account ${billingAccount.accountNumber}`;

const getCurrentAddress = billingAccount =>
  billingAccount.invoiceAccountAddresses.find(accountAddress =>
    accountAddress.dateRange.endDate === null);

const getBillingAccountRedirectLink = request => {
  const { billingAccountId } = request.params;
  const { billingAccount } = request.pre;

  const data = {
    caption: `Billing account ${billingAccount.accountNumber}`,
    key: `change-address-${billingAccountId}`,
    back: `/billing-accounts/${billingAccountId}`,
    redirectPath: `/billing-accounts/${billingAccountId}`,
    isUpdate: true,
    data: pick(billingAccount, 'id', 'company')
  };

  return request.billingAccountEntryRedirect(data);
};

/**
 * View billing account
 */
const getBillingAccount = (request, h) => {
  const { billingAccountId } = request.params;
  const { billingAccount, bills } = request.pre;
  const { back } = request.query;

  const moreBillsLink = (bills.pagination.pageCount > 1) &&
    `/billing-accounts/${billingAccountId}/bills`;

  return h.view('nunjucks/billing-accounts/view', {
    ...request.view,
    caption: getBillingAccountCaption(billingAccount),
    pageTitle: `Billing account for ${titleCase(billingAccount.company.name)}`,
    back,
    currentAddress: getCurrentAddress(billingAccount),
    billingAccount,
    changeAddressLink: getBillingAccountRedirectLink(request),
    bills: bills.data,
    moreBillsLink
  });
};

/**
 * View all bills for billing account
 */
const getBillingAccountBills = (request, h) => {
  const { billingAccountId } = request.params;
  const { billingAccount, bills: { data: bills, pagination } } = request.pre;

  return h.view('nunjucks/billing-accounts/view-bills', {
    ...request.view,
    caption: getBillingAccountCaption(billingAccount),
    pageTitle: `Sent bills for ${titleCase(billingAccount.company.name)}`,
    back: `/billing-accounts/${billingAccountId}`,
    billingAccount,
    bills,
    pagination,
    path: request.path
  });
};

exports.getBillingAccount = getBillingAccount;
exports.getBillingAccountBills = getBillingAccountBills;
