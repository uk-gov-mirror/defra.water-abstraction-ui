const LicenceTitleLoader = require('../../lib/licence-title-loader');
const licenceTitleLoader = new LicenceTitleLoader();
const {uniq} = require('lodash');
const { gaugingStations } = require('../../lib/connectors/water');
const CRM = require('../../lib/connectors/crm.js');
const Permit = require('../../lib/connectors/permit.js');
const { waterAbstraction } = require('../../../config.js');

const findOrCreateARLicence = async (licenceNumber) => {
  const filter = {
    licence_ref: licenceNumber,
    licence_regime_id: waterAbstraction.regimeId,
    licence_type_id: waterAbstraction.reformLicenceTypeId
  };

  // Find AR permit repo doc
  const { data: [arLicence], error } = await Permit.licences.findMany(filter);

  if (error) {
    throw error;
  }

  if (arLicence) {
    return arLicence;
  }

  const { data, error2 } = await Permit.licences.create({
    ...filter,
    licence_data_value: '{ "data" : [] }'
  });

  if (error2) {
    throw error2;
  }
  return data;
};

/**
 * View licence AR data
 * @param {String} request.params.documentId - the ID of the record in
 */
const getLicence = async (request, h) => {
  const { documentId } = request.params;

  // Find CRM doc
  const { data: documentHeader, error } = await CRM.documents.findOne(documentId);
  if (error) {
    throw error;
  }

  // Find permit repo doc
  const { data: licence, error: error2} = await Permit.licences.findOne(documentHeader.system_internal_id);
  if (error2) {
    throw error2;
  }

  const arData = await findOrCreateARLicence(licence.licence_ref);

  return h.view('water/abs-reform/licence', {
    licence,
    arData
  });
};

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

  const testSchema = {
    title: 'Condition',
    type: 'object',
    required: ['title'],
    properties: {
      title: {type: 'string', title: 'Blah', default: 'A new task'},
      done: {type: 'boolean', title: 'Done?', default: false},
      conditionCode: {type: 'string', enum: codeValues, title: 'Condition code', enumNames: codeLabels},
      gaugingStation: {type: 'string', enum: stationValues, title: 'Gauging Station', enumNames: stationLabels}
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
  getLicence,
  getSchemaForm
};
