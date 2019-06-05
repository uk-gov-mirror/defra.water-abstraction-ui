const { formFactory, fields } = require('../../../../shared/lib/forms');
const { STEP_START, getPath } = require('../lib/flow-helpers');
const { isInternal } = require('../../../lib/permissions');

const getLabelText = request => {
  return isInternal(request)
    ? 'Has water been abstracted in this return period?'
    : 'Have you abstracted water in this return period?';
};

const amountsForm = (request) => {
  const { csrfToken } = request.view;

  const action = getPath(STEP_START, request);

  const f = formFactory(action);

  f.fields.push(fields.paragraph(null, {
    text: getLabelText(request),
    element: 'h3',
    controlClass: 'govuk-heading-m' }));

  f.fields.push(fields.radio('isNil', {
    mapper: 'booleanMapper',
    errors: {
      'any.required': {
        message: 'Has any water been abstracted?'
      }
    },
    choices: [
      { value: false, label: 'Yes' },
      { value: true, label: 'No' }
    ] }));

  f.fields.push(fields.button(null, { label: 'Continue' }));
  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));

  return f;
};

module.exports = amountsForm;
