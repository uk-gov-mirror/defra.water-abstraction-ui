
const controller = require('./controller');

module.exports = {
  getSchemaForm: {
    method: 'GET',
    path: '/admin/abs-reform/edit',
    handler: controller.getSchemaForm
  }
};
