const controller = require('./controller');

module.exports = {
  getSearch: {
    method: 'GET',
    path: '/geo-search',
    handler: controller.getSearch
  },
  postSearch: {
    method: 'POST',
    path: '/geo-search',
    handler: controller.postSearch
  }
};
