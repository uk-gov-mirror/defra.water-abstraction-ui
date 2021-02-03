const { expect } = require('@hapi/code');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const { experiment, test, beforeEach, afterEach, before } = exports.lab = require('@hapi/lab').script();

const services = require('external/lib/connectors/services');
const controller = require('external/modules/notify/controller');

experiment('callback', () => {
  let request = {
    method: 'POST',
    url: '/notify/callback',
    headers: { authorization: `Bearer test` },
    payload: {}
  };

  const h = {
    response: sinon.stub().returns({
      code: sinon.spy()
    }),
    code: sinon.stub().resolves()
  };

  beforeEach(async () => {
    sandbox.stub(services.water.notify, 'postNotifyCallback').resolves();
  });

  afterEach(async () => {
    sandbox.restore();
  });

  experiment('when it has no token', () => {
    before(async () => {
      request.headers = {};
    });
    test('returns Unauthorized', async () => {
      await controller.callback(request, h);
      expect(h.response.calledWith('Unauthorized')).to.be.true();
      expect(h.response.lastCall.returnValue.code.lastCall.args).to.equal([403]);
    });
  });

  experiment('when it has an invalid token', () => {
    before(async () => {
      request.headers = {
        authorization: `Bearer an-invalid-token`
      };
      await controller.callback(request, h);
    });
    test('returns Unauthorized', async () => {
      await controller.callback(request, h);
      expect(h.response.calledWith('Unauthorized')).to.be.true();
      expect(h.response.lastCall.returnValue.code.lastCall.args).to.equal([403]);
    });
  });

  experiment('when it has a valid token', () => {
    before(async () => {
      request.headers = {
        authorization: `Bearer ${process.env.NOTIFY_CALLBACK_TOKEN}`
      };
    });
    test('returns 204 with blank body', async () => {
      await controller.callback(request, h);
      expect(h.response.lastCall.returnValue.code.lastCall.args).to.equal([204]);
    });
  });
});
