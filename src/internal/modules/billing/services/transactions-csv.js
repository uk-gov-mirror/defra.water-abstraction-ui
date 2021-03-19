'use strict';
const moment = require('moment');
const numberFormatter = require('../../../../shared/lib/number-formatter');
const { mapValues, isNull, sortBy, get } = require('lodash');
const mappers = require('../lib/mappers');

const isNullOrUndefined = value => isNull(value) || value === undefined;
const valueToString = value => isNullOrUndefined(value) ? '' : value.toString();
const rowToStrings = row => mapValues(row, valueToString);

const getAbsStartAndEnd = absPeriod => ({
  'Abstraction period start date': moment().month(absPeriod.startMonth - 1).date(absPeriod.startDay).format('D MMM'),
  'Abstraction period end date': moment().month(absPeriod.endMonth - 1).date(absPeriod.endDay).format('D MMM')
});

const getAgreementsString = agreements => agreements.map(agreement => agreement.code).join(', ');

const getChargeElementData = trans => {
  if (trans.isMinimumCharge) return {};
  return {
    'Authorised annual quantity': trans.chargeElement.authorisedAnnualQuantity,
    'Billable annual quantity': trans.chargeElement.billableAnnualQuantity,
    'Source': trans.chargeElement.source,
    'Adjusted source': trans.chargeElement.eiucSource,
    'Season': trans.chargeElement.season,
    'Loss': trans.chargeElement.loss,
    'Purpose code': trans.chargeElement.purposeUse.code,
    'Purpose name': trans.chargeElement.purposeUse.name,
    ...getAbsStartAndEnd(trans.chargeElement.abstractionPeriod)
  };
};

const getTransactionData = trans => ({
  description: trans.description,
  'Compensation charge': trans.isCompensationCharge ? 'Y' : 'N',
  ...getChargeElementData(trans),
  'Agreement code': getAgreementsString(trans.agreements),
  'Charge period start date': trans.chargePeriod.startDate,
  'Charge period end date': trans.chargePeriod.endDate,
  'Authorised days': trans.authorisedDays,
  'Billable days': trans.billableDays,
  'Calculated quantity': trans.billingVolume ? trans.billingVolume.calculatedVolume : null,
  'Quantity': trans.volume
});

const getInvoiceAccountData = invoiceAccount => ({
  'Billing account number': invoiceAccount.accountNumber,
  'Customer name': invoiceAccount.company.name
});

const getDebitCreditLines = (value, isCredit, debitLabel, creditLabel) => {
  const formattedValue = numberFormatter.penceToPound(value, true);
  if (isCredit) {
    return {
      [debitLabel]: null,
      [creditLabel]: formattedValue
    };
  }
  return {
    [debitLabel]: formattedValue,
    [creditLabel]: null
  };
};

const getInvoiceData = invoice => {
  const { netTotal, isCredit } = invoice;
  return {
    ...invoice.invoiceNumber && { 'Bill number': invoice.invoiceNumber },
    'Financial year': invoice.financialYear.yearEnding,
    ...getDebitCreditLines(netTotal, isCredit, 'Invoice amount', 'Credit amount')
  }
  ;
};

const getTransactionAmounts = trans => {
  const { value, isCredit } = trans;

  if (isNull(value)) {
    return {
      'Net transaction line amount(debit)': 'Error - not calculated',
      'Net transaction line amount(credit)': 'Error - not calculated'
    };
  }
  return getDebitCreditLines(value, isCredit, 'Net transaction line amount(debit)', 'Net transaction line amount(credit)');
};

const getChangeReason = (chargeVersions, transaction) => {
  const chargeVersionId = get(transaction, 'chargeElement.chargeVersionId');
  const chargeVersion = chargeVersions.find(cv => cv.id === chargeVersionId);
  return (chargeVersion && chargeVersion.changeReason)
    ? chargeVersion.changeReason.description
    : null;
};

const createCSV = async (invoices, chargeVersions) => {
  const sortedInvoices = sortBy(invoices, 'invoiceAccount.accountNumber', 'invoiceLicences[0].licences.licenceNumber');
  return sortedInvoices.reduce((dataForCSV, invoice) => {
    invoice.invoiceLicences.forEach(invLic => {
      const { isDeMinimis } = invoice;
      invLic.transactions.forEach(trans => {
        const { description, ...transactionData } = getTransactionData(trans);
        const csvLine = {
          ...getInvoiceAccountData(invoice.invoiceAccount),
          'Licence number': invLic.licence.licenceNumber,
          ...getInvoiceData(invoice),
          ...getTransactionAmounts(trans),
          'Charge information reason': getChangeReason(chargeVersions, trans),
          'Region': invLic.licence.region.displayName,
          'De minimis rule': isDeMinimis ? 'Y' : 'N',
          'Description': description,
          'Water company': invLic.licence.isWaterUndertaker ? 'Y' : 'N',
          'Historical area': invLic.licence.historicalArea.code,
          ...transactionData
        };
        dataForCSV.push(rowToStrings(csvLine));
      });
    });
    return dataForCSV;
  }, []);
};

const getCSVFileName = batch => {
  const batchType = mappers.mapBatchType(batch.type);
  return `${batch.region.displayName} ${batchType.toLowerCase()} bill run ${batch.billRunNumber}.csv`;
};
exports._getInvoiceData = getInvoiceData;
exports._getInvoiceAccountData = getInvoiceAccountData;
exports._getTransactionData = getTransactionData;
exports._getTransactionAmounts = getTransactionAmounts;
exports.createCSV = createCSV;
exports.getCSVFileName = getCSVFileName;
