const { formFactory, fields } = require('../../../lib/forms');
const { getPath } = require('../lib/flow-helpers');
const { isInternal } = require('../../../lib/permissions');

const confirmForm = (request, data, action = `/return/nil-return`) => {
  const { csrfToken } = request.view;

  const scopedAction = getPath(action, request);
  const f = formFactory(scopedAction);

  f.fields.push(fields.hidden('csrf_token', {}, csrfToken));

  // Set/clear under query status
  if (isInternal(request)) {
    const { isUnderQuery } = data;
    const checked = isUnderQuery ? ['under_query'] : [];
    f.fields.push(fields.checkbox('isUnderQuery', {
      choices: [{
        label: 'Mark as under query',
        value: 'under_query'
      }]
    }, checked));
  }

  f.fields.push(fields.button(null, { label: 'Submit' }));

  return f;
};

module.exports = confirmForm;
