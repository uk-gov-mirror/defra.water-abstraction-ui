const View = require('../../lib/view');

const rp = require('request-promise-native').defaults({
  proxy: null,
  strictSSL: false
});

/**
 * Render geo search form
 */
function getSearch (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'Geographic search';
  return reply.view('water/notifications/geo-search', viewContext);
}

/**
 * Post handler for geo search form
 */
async function postSearch (request, reply) {
  const { lat, long, radius } = request.payload;

  const result = await rp({
    uri: `${process.env.CRM_URI}/documentHeader/search`,
    method: 'GET',
    headers: {
      Authorization: process.env.JWT_TOKEN
    },
    json: true,
    qs: {
      filter: JSON.stringify({lat, long, radius})
    }
  });

  // const mapData = result.data.map((row) => {
  //   return {
  //     document_id: row.document_id,
  //     licence_number: row.system_external_id,
  //     lat: row.lat,
  //     long: row.long
  //   };
  // });

  const viewContext = View.contextDefaults(request);
  viewContext.data = result.data;

  viewContext.pageTitle = 'Geographic search';
  return reply.view('water/notifications/geo-search', viewContext);
}

module.exports = {
  getSearch,
  postSearch
};
