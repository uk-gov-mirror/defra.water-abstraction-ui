const Joi = require('@hapi/joi');
const controller = require('./controller');
const { scope } = require('../../lib/constants');
const allowedScopes = scope.internal;

module.exports = {
  getSearchForm: {
    path: '/licences',
    method: 'GET',
    handler: controller.getSearchForm,
    options: {
      auth: { scope: allowedScopes },
      description: 'Internal search',
      plugins: {
        viewContext: {
          pageTitle: 'Search licences, users and returns',
          activeNavLink: 'view'
        }
      },
      validate: {
        query: {
          query: Joi.string().allow(''),
          page: Joi.number().default(1).min(1)
        }
      }
    }
  },

  getUserStatus: {
    method: 'GET',
    path: '/user/{userId}/status',
    handler: controller.getUserStatus,
    config: {
      auth: { scope: allowedScopes },
      description: 'Admin: view the licence, verification and login status of a user',
      plugins: {
        viewContext: {
          pageTitle: 'User status',
          activeNavLink: 'view'
        }
      },
      validate: {
        params: {
          userId: Joi.number()
        }
      }
    }
  }
};
