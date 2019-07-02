const { expect } = require('code');
const { it, experiment, beforeEach, afterEach } = exports.lab = require('lab').script();
const sinon = require('sinon');
const sandbox = sinon.createSandbox();

const services = require('external/lib/connectors/services');
const baseController = require('external/modules/view-licences/base');

experiment('view-licences/base', () => {
  const viewName = 'water/view-licences/licences';
  let h;

  beforeEach(async () => {
    sandbox.stub(services.idm.users, 'findOneByEmail');
    sandbox.stub(services.crm.documents, 'findMany');
    h = {
      view: sandbox.spy()
    };
  });

  afterEach(async () => {
    sandbox.restore();
  });

  experiment('when the form is invalid', () => {
    let request;

    beforeEach(async () => {
      request = {
        view: {},
        formError: { email: true }
      };
      baseController.getLicences(request, h);
    });

    it('the view is shown again', async () => {
      expect(h.view.calledWith(viewName, request.view)).to.be.true();
    });

    it('the controller does not get the user', async () => {
      expect(services.idm.users.findOneByEmail.notCalled).to.be.true();
    });

    it('the controller does not get the licences', async () => {
      expect(services.crm.documents.findMany.notCalled).to.be.true();
    });
  });

  experiment('when the user adds an unknown email address', () => {
    let request;

    beforeEach(async () => {
      request = {
        auth: {
          credentials: {
            userId: 'user_1'
          }
        },
        defra: {
          entityId: '123'
        },
        view: {},
        query: {
          emailAddress: 'test@example.com'
        },
        yar: {
          get: sandbox.stub().returns('company_1')
        }
      };

      services.idm.users.findOneByEmail.resolves();
      services.crm.documents.findMany.resolves({
        data: [],
        error: null,
        pagination: {}
      });

      await baseController.getLicences(request, h);
    });

    it('an attempt is made to get the user by email', async () => {
      expect(services.idm.users.findOneByEmail.calledWith('test@example.com')).to.be.true();
    });

    it('an error is added to the view', async () => {
      expect(request.view.error).to.be.true();
    });
  });

  experiment('when the request is valid', async () => {
    let request;

    beforeEach(async () => {
      request = {
        auth: {
          credentials: {
            userId: 'user_1'
          }
        },
        defra: {
          entityId: '123'
        },
        view: {},
        query: { page: 1 },
        yar: {
          get: sandbox.stub().returns('company_1')
        }
      };

      services.crm.documents.findMany.resolves({
        data: [{ id: 1 }],
        error: null,
        pagination: { page: 1 }
      });

      baseController.getLicences(request, h);
    });

    it('the view is shown using the expected view template', async () => {
      expect(h.view.firstCall.args[0]).to.equal(viewName);
    });

    it('the data is added to the response', async () => {
      const viewContext = h.view.firstCall.args[1];
      expect(viewContext.licenceData[0].id).to.equal(1);
      expect(viewContext.pagination.page).to.equal(1);
    });
  });
});
