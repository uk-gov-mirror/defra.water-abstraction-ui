'use strict';

const Joi = require('joi');
const controller = require('./controller');
const { charging } = require('internal/lib/constants').scope;
const { VALID_GUID } = require('shared/lib/validators');

const allowedScopes = [charging];
const isAcceptanceTestTarget = ['local', 'dev', 'development', 'test', 'preprod'].includes(process.env.NODE_ENV);

if (isAcceptanceTestTarget) {
  module.exports = {
    getCompany: {
      method: 'GET',
      path: '/invoice-accounts/create/{regionId}/{companyId}',
      handler: controller.getCompany,
      config: {
        auth: { scope: allowedScopes },
        description: 'select invoice account company contact',
        plugins: {
          viewContext: {
            activeNavLink: 'notifications'
          }
        },
        validate: {
          params: {
            regionId: VALID_GUID,
            companyId: VALID_GUID
          },
          query: {
            form: Joi.string().optional(),
            redirectPath: Joi.string().optional(),
            licenceId: Joi.string().uuid().optional()
          }
        }
      }
    },
    postCompany: {
      method: 'POST',
      path: '/invoice-accounts/create/select-company',
      handler: controller.postCompany,
      config: {
        auth: { scope: allowedScopes },
        description: 'select invoice account company contact'
      }
    },
    getAddress: {
      method: 'GET',
      path: '/invoice-accounts/create/{regionId}/{companyId}/select-address',
      handler: controller.getAddress,
      config: {
        auth: { scope: allowedScopes },
        description: 'select invoice account address',
        plugins: {
          viewContext: {
            activeNavLink: 'notifications'
          }
        },
        validate: {
          params: {
            regionId: VALID_GUID,
            companyId: VALID_GUID
          },
          query: {
            form: Joi.string().optional()
          }
        }
      }
    },
    postAddress: {
      method: 'POST',
      path: '/invoice-accounts/create/select-address',
      handler: controller.postAddress,
      config: {
        auth: { scope: allowedScopes },
        description: 'select invoice account address'
      }
    },
    getFao: {
      method: 'GET',
      path: '/invoice-accounts/create/{regionId}/{companyId}/add-fao',
      handler: controller.getFao,
      config: {
        auth: { scope: allowedScopes },
        description: 'select invoice account FAO',
        plugins: {
          viewContext: {
            activeNavLink: 'notifications'
          }
        },
        validate: {
          params: {
            regionId: VALID_GUID,
            companyId: VALID_GUID
          },
          query: {
            form: Joi.string().optional()
          }
        }
      }
    },
    postFao: {
      method: 'POST',
      path: '/invoice-accounts/create/add-fao',
      handler: controller.postFao,
      config: {
        auth: { scope: allowedScopes },
        description: 'select invoice account FAO'
      }
    },
    getCheckDetails: {
      method: 'GET',
      path: '/invoice-accounts/create/{regionId}/{companyId}/check-details',
      handler: controller.getCheckDetails,
      config: {
        auth: { scope: allowedScopes },
        description: 'check and confirm invoice account details',
        plugins: {
          viewContext: {
            activeNavLink: 'notifications'
          }
        },
        validate: {
          params: {
            regionId: VALID_GUID,
            companyId: VALID_GUID
          }
        }
      }
    },
    postCheckDetails: {
      method: 'POST',
      path: '/invoice-accounts/create/save-details',
      handler: controller.postCheckDetails,
      config: {
        auth: { scope: allowedScopes },
        description: 'save invoice account details',
        plugins: {
          viewContext: {
            activeNavLink: 'notifications'
          }
        }
      }
    }
  };
};
