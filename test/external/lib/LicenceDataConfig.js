'use strict';

const { experiment, test, afterEach, beforeEach } = exports.lab = require('lab').script();
const { expect } = require('code');
const sandbox = require('sinon').createSandbox();
const LicenceDataConfig = require('../../../src/external/lib/LicenceDataConfig');

const documentId = 'document_1';
const request = {
  defra: {
    companyId: 'company_1'
  }
};

experiment('LicenceDataConfig', () => {
  let licenceData, connectors;

  beforeEach(async () => {
    connectors = {
      water: {
        licences: {
          getSummaryByDocumentId: sandbox.stub().resolves({ error: null }),
          getCommunicationsByDocumentId: sandbox.stub().resolves({ error: null })
        }
      }
    };
    licenceData = new LicenceDataConfig(null, connectors);
  });

  afterEach(async () => {
    sandbox.restore();
  });

  test('_callWaterMethod calls method on water service', async () => {
    await licenceData._callWaterMethod('getSummaryByDocumentId', documentId, request);

    const { args } = connectors.water.licences.getSummaryByDocumentId.lastCall;

    expect(args[0]).to.equal(documentId);
    expect(args[1]).to.equal({ companyId: request.defra.companyId });
  });

  test('_callWaterMethod throws error if error response from API', async () => {
    connectors.water.licences.getSummaryByDocumentId.resolves({ error: 'oh no!' });
    const func = () => licenceData._callWaterMethod('getSummaryByDocumentId', documentId, request);
    expect(func()).to.reject();
  });

  test('getSummaryByDocumentId method calls getSummaryByDocumentId on water service', async () => {
    await licenceData.getSummaryByDocumentId(documentId, request);

    const { args } = connectors.water.licences.getSummaryByDocumentId.lastCall;

    expect(args[0]).to.equal(documentId);
    expect(args[1]).to.equal({ companyId: request.defra.companyId });
  });

  test('getCommunicationsByDocumentId method calls getSummaryByDocumentId on water service', async () => {
    await licenceData.getCommunicationsByDocumentId(documentId, request);

    const { args } = connectors.water.licences.getCommunicationsByDocumentId.lastCall;

    expect(args[0]).to.equal(documentId);
    expect(args[1]).to.equal({ companyId: request.defra.companyId });
  });
});
