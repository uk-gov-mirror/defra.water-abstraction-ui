const Joi = require('joi');
const controller = require('./controller');

module.exports = {

  // Edit a licence
  getLicence: {
    method: 'GET',
    path: '/admin/abs-reform/licence/{documentId}',
    handler: controller.getLicence,
    config: {
      validate: {
        params: {
          documentId: Joi.string().guid().required()
        }
      },
      plugins: {
        viewContext: {
          pageTitle: 'Abstraction reform data'
        }
      }
    }
  },

  // Create data point in licence
  // postAddData: {
  //   method: 'POST',
  //   path: '/admin/abs-reform/licence/{licenceId}',
  //   handler: controller.postLicence
  // },

  // Edit data point within licence
  getSchemaForm: {
    method: 'GET',
    path: '/admin/abs-reform/edit',
    handler: controller.getSchemaForm
  }
};
