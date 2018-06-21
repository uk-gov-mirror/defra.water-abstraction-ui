const LicenceTitleLoader = require('../../lib/licence-title-loader');
const licenceTitleLoader = new LicenceTitleLoader();
const {uniq} = require('lodash');
const { gaugingStations } = require('../../lib/connectors/water');

const getSchemaForm = async (request, h) => {
  // Read condition titles from CSV
  const titleData = await licenceTitleLoader.load();

  // Condition codes
  const codeValues = titleData.map(row => row.code + ':' + row.subCode);
  const codeLabels = titleData.map(row => row.displayTitle);

  // Gauging stations
  const { data: stations } = await gaugingStations.findMany({}, {label: +1});
  const stationValues = stations.map(row => row.station_reference);
  const stationLabels = stations.map(row => row.label + ' at ' + row.grid_reference);

  console.log(stations);

  const testSchema = {
    title: 'Condition',
    type: 'object',
    required: ['title'],
    properties: {
      title: {type: 'string', title: 'Blah', default: 'A new task'},
      done: {type: 'boolean', title: 'Done?', default: false},
      conditionCode: {type: 'string', enum: codeValues, title: 'Condition code', enumNames: codeLabels},
      gaugingStation: {type: 'string', enum: stationValues, title: 'Gauging Station', enumNames: stationLabels},
      wr22Code: {type: 'string', enum: ['2.1', '2.2']}
    }
  };

  const view = {
    ...request.view,
    pageTitle: 'Abstraction Reform',
    schema: JSON.stringify(testSchema, null, 2)
  };

  return h.view('water/abs-reform/schema-form', view);
};

module.exports = {
  getSchemaForm
};
