const { expect } = require('code');
const { experiment, test, beforeEach, afterEach } = exports.lab = require('lab').script();

const Hapi = require('hapi');

const sinon = require('sinon');
const sandbox = sinon.createSandbox();

const crmConnector = require('../../../src/lib/connectors/crm');
const crmDocumentConnector = require('../../../src/lib/connectors/crm/documents');
const routes = require('../../../src/modules/add-licences/routes');
const licenceLoaderPlugin = require('../../../src/lib/hapi-plugins/licence-loader');
const viewContextPlugin = require('../../../src/lib/hapi-plugins/view-context');
const requestStubPlugin = require('../../lib/hapi-plugins/request-stub-plugin');
const { scope } = require('../../../src/lib/constants');
const controller = require('../../../src/modules/add-licences/controller');
const notifyConnector = require('../../../src/lib/connectors/notify');

const { set } = require('lodash');

const getRequestSetupForAuthenticatedUser = request => {
  set(request, 'auth.isAuthenticated', true);
  set(request, 'auth.credentials.entity_id', '123');
  set(request, 'auth.credentials.companyId', '456');
  set(request, 'state.sid', 'something');
  set(request, 'auth.credentials.scope', [
    scope.licenceHolder
  ]);
};

/**
 * Creates a test server with as few dependencies as possible
 * to allow the testing of the output view context/
 */
const getServer = async () => {
  const server = Hapi.server();
  server.decorate('toolkit', 'view', sandbox.stub().resolves('testing'));
  await server.register([
    {
      plugin: requestStubPlugin,
      options: { onPostAuth: getRequestSetupForAuthenticatedUser }
    },
    { plugin: licenceLoaderPlugin },
    { plugin: viewContextPlugin }
  ]);

  server.route(Object.values(routes));

  return server;
};

experiment('getSecurityCode', () => {
  let request;

  beforeEach(async () => {
    sandbox.stub(crmDocumentConnector, 'getLicenceCount');
    request = {
      method: 'GET',
      url: '/security-code'
    };
  });

  afterEach(async () => {
    sandbox.restore();
  });

  test('when the user has already got licences all main nav links are shown', async () => {
    crmDocumentConnector.getLicenceCount.resolves(1);
    const server = await getServer();
    const response = await server.inject(request);
    const mainNavLinks = response.request.view.mainNavLinks;
    expect(mainNavLinks.length).to.equal(3);
  });

  test('when the user has no licences only the first link is shown', async () => {
    crmDocumentConnector.getLicenceCount.resolves(0);
    const server = await getServer();
    const response = await server.inject(request);
    const mainNavLinks = response.request.view.mainNavLinks;
    expect(mainNavLinks.length).to.equal(1);
    expect(mainNavLinks[0].id).to.equal('view');
  });
});

experiment('postAddressSelect', () => {
  let request;
  let h;

  beforeEach(async () => {
    request = {
      sessionStore: {
        get: () => ({
          selectedIds: [1, 2]
        }),
        delete: sinon.spy()
      },
      auth: {
        credentials: {
          entity_id: 'test-entity-id'
        }
      },
      payload: {
        address: 1
      },
      view: {},
      cookieAuth: {
        set: sinon.spy()
      }
    };

    h = {
      redirect: sinon.spy(),
      view: sinon.spy()
    };

    sandbox.stub(crmConnector.documents, 'findMany').resolves({
      error: null,
      data: [{ metadata: { Name: 'test-company-name' } }]
    });

    sandbox.stub(crmConnector.documents, 'findOne').resolves({
      error: null,
      data: { licence_ref: 'test-licence-id' }
    });

    sandbox.stub(crmConnector, 'getOrCreateCompanyEntity').resolves('test-company-entity-id');
    sandbox.stub(crmConnector, 'createVerification').resolves({
      verification_code: 'test-verification-code'
    });

    sandbox.stub(notifyConnector, 'sendSecurityCode').resolves();
  });

  afterEach(async () => {
    sandbox.restore();
  });

  experiment('when payload address id is not in the selected documents', () => {
    test('an error is not thrown', async () => {
      request.payload.address = 999;
      await expect(controller.postAddressSelect(request, h)).to.not.reject();
    });

    test('a redirect is returned', async () => {
      request.payload.address = 999;
      await controller.postAddressSelect(request, h);

      const [path] = h.redirect.lastCall.args;
      expect(path).to.equal('/select-address?error=invalidAddress');
    });
  });

  test('throws if the crm licences cannot be read', async () => {
    crmConnector.documents.findMany.resolves({
      error: 'bad news',
      data: null
    });

    await expect(controller.postAddressSelect(request, h)).to.reject();
  });

  test('gets the company id user entity id', async () => {
    await controller.postAddressSelect(request, h);
    const [companyEntityId, companyName] = crmConnector.getOrCreateCompanyEntity.lastCall.args;
    expect(companyEntityId).to.equal('test-entity-id');
    expect(companyName).to.equal('test-company-name');
  });

  test('uses the company id to create the verification', async () => {
    await controller.postAddressSelect(request, h);
    const [entityId, companyEntityId, selectedIds] = crmConnector.createVerification.lastCall.args;

    expect(entityId).to.equal('test-entity-id');
    expect(companyEntityId).to.equal('test-company-entity-id');
    expect(selectedIds).to.equal([1, 2]);
  });

  test('throws if the licences cannot be read', async () => {
    crmConnector.documents.findMany.onSecondCall().resolves({
      error: 'bang',
      data: null
    });

    await expect(controller.postAddressSelect(request, h)).to.reject();
  });

  test('delete the licence flow data from session', async () => {
    await controller.postAddressSelect(request, h);
    expect(request.sessionStore.delete.calledWith('addLicenceFlow')).to.be.true();
  });

  test('renders the expected view', async () => {
    await controller.postAddressSelect(request, h);
    const [viewName] = h.view.lastCall.args;
    expect(viewName).to.equal('water/licences-add/verification-sent');
  });

  test('passes the expected data to the view', async () => {
    await controller.postAddressSelect(request, h);
    const [, viewData] = h.view.lastCall.args;
    expect(viewData.pageTitle).to.equal('We are sending you a letter');
    expect(viewData.activeNavLink).to.equal('manage');
    expect(viewData.verification.verification_code).to.equal('test-verification-code');
    expect(viewData.licence.licence_ref).to.equal('test-licence-id');
    expect(viewData.licenceCount).to.equal(1);
  });

  test('adds the company id to the cookie', async () => {
    await controller.postAddressSelect(request, h);

    expect(request.cookieAuth.set.calledWith('companyId', 'test-company-entity-id'))
      .to.be.true();

    expect(request.cookieAuth.set.calledWith('companyName', 'test-company-name'))
      .to.be.true();
  });
});
