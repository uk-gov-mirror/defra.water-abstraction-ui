const { handleRequest, getValues } = require('shared/lib/forms');
const { reducer } = require('./reducer');
const sessionForms = require('shared/lib/session-forms');
const { isFunction, isEmpty } = require('lodash');
const routing = require('../lib/routing');

const getPostedForm = (request, formContainer) => {
  const schema = formContainer.schema(request);
  return handleRequest(formContainer.form(request), request, schema);
};

const applyFormResponse = (request, form, actionCreator) => {
  const { licenceId } = request.params;
  const action = actionCreator(request, getValues(form));
  const nextState = reducer(request.pre.draftChargeInformation, action);

  return isEmpty(nextState)
    ? request.clearDraftChargeInformation(licenceId)
    : request.setDraftChargeInformation(licenceId, nextState);
};

const getRedirectPath = (request, nextPageInFlowUrl) => {
  const { returnToCheckData } = request.query;
  if (returnToCheckData === 1) {
    return routing.getCheckData(request.params.licenceId);
  }
  return nextPageInFlowUrl;
};

const createPostHandler = (formContainer, actionCreator, redirectPathFunc) => async (request, h) => {
  const form = getPostedForm(request, formContainer);

  if (form.isValid) {
    await applyFormResponse(request, form, actionCreator);
    const redirectPath = getRedirectPath(request, redirectPathFunc(request, getValues(form)));
    return h.redirect(redirectPath);
  }
  return h.postRedirectGet(form);
};

const getDefaultView = (request, backLink, formContainer) => {
  const { licence } = request.pre;
  const back = isFunction(backLink) ? backLink(licence.id) : backLink;

  const view = {
    ...request.view,
    caption: `Licence ${licence.licenceNumber}`,
    back
  };
  if (formContainer) {
    view.form = sessionForms.get(request, formContainer.form(request));
  }
  return view;
};

exports.getPostedForm = getPostedForm;
exports.applyFormResponse = applyFormResponse;
exports.createPostHandler = createPostHandler;
exports.getDefaultView = getDefaultView;
