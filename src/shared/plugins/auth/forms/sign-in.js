const Joi = require('@hapi/joi');
const { formFactory, fields, applyErrors } = require('shared/lib/forms');

const createEmailField = () => {
  return fields.text('email', {
    label: 'Email address',
    type: 'email',
    controlClass: 'govuk-!-width-one-half',
    errors: {
      'any.empty': {
        message: 'Enter an email address'
      },
      'string.email': {
        message: 'Enter an email address in the correct format, like name@example.com'
      }
    }
  });
};

const createPasswordField = () => {
  return fields.text('password', {
    label: 'Password',
    type: 'password',
    controlClass: 'govuk-!-width-one-half',
    errors: {
      'any.empty': {
        message: 'Enter your password'
      }
    },
    attr: {
      autocomplete: 'off'
    }
  });
};

/**
 * @return {Object} - form object
 */
const form = () => {
  const f = formFactory('/signin');

  f.fields.push(createEmailField());
  f.fields.push(createPasswordField());
  f.fields.push(fields.button(null, {
    label: 'Sign in',
    isStartButton: true
  }));

  return f;
};

const schema = {
  email: Joi.string().email().required(),
  password: Joi.string().required()
};

// Enter if empty, Check your if it's wrong
const applyErrorState = form => {
  if (form.errors.length) {
    return form;
  }

  // return form;
  return applyErrors(form, [{
    name: 'email',
    message: 'Check your email address'
  }, {
    name: 'password',
    message: 'Check your password'
  }]);
};

exports.signInForm = form;
exports.signInSchema = schema;
exports.signInApplyErrorState = applyErrorState;
