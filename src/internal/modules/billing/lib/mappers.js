const { omit, flatMap, mapValues, sortBy, groupBy, uniq, compact } = require('lodash');
const groupArray = require('group-array');
const sentenceCase = require('sentence-case');
const helpers = require('@envage/water-abstraction-helpers');
const routing = require('./routing');

/**
 * Maps a batch for the batch list view, adding the badge, batch type and
 * bill count
 * @param {Object} batch
 * @return {Object}
 */
const mapBatchListRow = batch => ({
  ...batch,
  batchType: mapBatchType(batch.type),
  billCount: batch.totals ? batch.totals.invoiceCount + batch.totals.creditNoteCount : null,
  link: routing.getBillingBatchRoute(batch)
});

const isTransactionEdited = transaction => {
  if (!transaction.billingVolume) return false;
  return transaction.billingVolume.calculatedVolume !== transaction.billingVolume.volume;
};

const mapTransaction = transaction => ({
  ...omit(transaction, ['chargeElement']),
  isEdited: isTransactionEdited(transaction)
});

const getTransactionTotals = transactions => {
  const initialValue = {
    debits: 0,
    credits: 0,
    netTotal: 0
  };

  return transactions.reduce((acc, row) => ({
    debits: acc.debits + (row.isCredit ? 0 : row.value),
    credits: acc.credits + (row.isCredit ? row.value : 0),
    netTotal: acc.netTotal + row.value
  }), initialValue);
};

const mapChargeElementTransactions = (transactions, chargeElementId) => {
  const chargeElementTransactions = transactions.filter(trans => {
    if (!trans.isMinimumCharge) return trans.chargeElement.id === chargeElementId;
  });

  return {
    transactions: chargeElementTransactions.map(mapTransaction),
    chargeElement: chargeElementTransactions[0].chargeElement };
};

const getChargeElementIds = transactions => uniq(compact(transactions.map(trans => {
  if (!trans.isMinimumCharge) return trans.chargeElement.id;
})));

const getMinimumChargeTransactions = transactions => {
  const minChargeTransactions = transactions.filter(trans => trans.isMinimumCharge);
  return {
    transactions: minChargeTransactions,
    totals: getTransactionTotals(minChargeTransactions)
  };
};

const mapLicence = licenceTransactions => {
  const transactions = licenceTransactions.map(row => row.transaction);

  const chargeElementIds = getChargeElementIds(transactions);
  const chargeElements = chargeElementIds.map(id => mapChargeElementTransactions(transactions, id));
  return {
    link: licenceTransactions[0].link,
    totals: getTransactionTotals(transactions),
    minimumChargeTransactions: getMinimumChargeTransactions(transactions),
    chargeElements
  };
};

const mapFinancialYear = licences => mapValues(licences, mapLicence);

/**
   *
   * @param {Object} invoice - payload from water service invoice detail call
   * @param {Map} documentIds - map of licence numbers / CRM document IDs
   */
const mapInvoiceTransactions = (invoice, documentIds) => {
  const transactions = flatMap(invoice.invoiceLicences.map(invoiceLicence => {
    const { licenceNumber } = invoiceLicence.licence;
    return invoiceLicence.transactions.map(transaction => ({
      transaction,
      financialYear: helpers.charging.getFinancialYear(transaction.chargePeriod.startDate),
      licenceNumber,
      link: `/licences/${documentIds.get(licenceNumber)}`
    }));
  }));
  // Group by financial year, licence number
  const grouped = groupArray(transactions, 'financialYear', 'licenceNumber');

  // Map the returned values
  return mapValues(grouped, mapFinancialYear);
};

const mapBatchType = (type) => type === 'two_part_tariff' ? 'Two-part tariff' : sentenceCase(type);

const mapCondition = (conditionType, condition) => ({
  title: sentenceCase(conditionType.displayTitle.replace('Aggregate condition', '')),
  parameter1Label: conditionType.parameter1Label.replace('licence number', 'licence'),
  parameter1: condition.parameter1,
  parameter2Label: conditionType.parameter2Label,
  parameter2: condition.parameter2,
  text: condition.text
});

/**
 * Maps an array of conditions retrieved from licence summary water service call
 * to the shape necessary for display on the two part tariff transaction review screen
 * @param {Array} nested conditions
 * @return {Array} flat list ready for view
 */
const mapConditions = conditions => conditions.reduce((acc, conditionType) => {
  conditionType.points.forEach(point => {
    point.conditions.forEach(condition => {
      acc.push(mapCondition(conditionType, condition));
    });
  });
  return acc;
}, []);

const mapInvoice = invoice => ({
  ...invoice,
  isCredit: invoice.netTotal < 0,
  group: invoice.isWaterUndertaker ? 'waterUndertakers' : 'otherAbstractors',
  sortValue: -Math.abs(invoice.netTotal)
});

const mapInvoices = (batch, invoices) => {
  const mappedInvoices = sortBy(invoices.map(mapInvoice), 'sortValue');
  return batch.type === 'annual' ? groupBy(mappedInvoices, 'group') : mappedInvoices;
};

exports.mapBatchListRow = mapBatchListRow;
exports.mapInvoiceTransactions = mapInvoiceTransactions;
exports.mapBatchType = mapBatchType;
exports.mapConditions = mapConditions;
exports.mapInvoices = mapInvoices;
