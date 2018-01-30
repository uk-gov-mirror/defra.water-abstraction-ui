const Helpers = require('../lib/helpers')
const View = require('../lib/view')
const CRM = require('./connectors/crm')
const IDM = require('./connectors/idm')
const Water = require('./connectors/water')
const Permit = require('./connectors/permit')
const signIn = require('../lib/sign-in')

function getRoot(request, reply) {
  reply.file('./staticindex.html')
}

function getUpdatePassword(request, reply) {
  var viewContext = View.contextDefaults(request)
  if (!request.auth.credentials) {
    getSignin(request, reply)
  } else {
    viewContext.pageTitle = 'GOV.UK - change your password'
    return reply.view('water/update_password', viewContext)
  }
}

function validatePasswordRules(password) {
  var result = {
    hasValidationErrors: false
  }

  if (!/[A-Z]/.test(password)) {
    result.hasValidationErrors = true;
    result.passwordHasNoUpperCase = true;
  }

  if (!/[^a-zA-Z\d\s]/.test(password)) {
    result.hasValidationErrors = true;
    result.passwordHasNoSymbol = true;
  }

  if (password.length < 8) {
    result.hasValidationErrors = true;
    result.passwordTooShort = true;
  }

  return result;
}

function validatePassword(password, confirmPassword) {
  console.log('confirm password')
  console.log(password)
  console.log(confirmPassword)
  if (!password && !confirmPassword) {
    return {
      noPassword: true,
      noConfirmPassword: true
    }
  }

  if (!password) {
    return {
      noPassword: true,
    }
  }

  if (!confirmPassword) {
    return {
      noConfirmPassword: true,
    }
  }

  var passwordValidationFailures = validatePasswordRules(password)
  if (passwordValidationFailures.hasValidationErrors) {
    return passwordValidationFailures;
  }


  if (password != confirmPassword) {
    console.log('Passwords dont match!')
    console.log(password)
    console.log(confirmPassword)
    return {
      passwordsDontMatch: true
    }
  } else {
    console.log('Passwords  match!')
    console.log(password)
    console.log(confirmPassword)

  }

  return null;
}



/**
 * Reset password form handler for signed-in user
 * @todo consider Joi for password validation 
 * @param {String} request.payload.password - new password
 * @param {String} request.payload.confirmPassword - password again
 */
function postUpdatePassword(request, reply) {
  const {username} = request.auth.credentials;
  const {password, confirmPassword} = request.payload;

  const viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - change your password'

  try {
    const errors = validatePassword(password, confirmPassword);
    if(errors) {
      throw errors;
    }

    const {error, data} = IDM.updatePassword(username, password);
    if(error) {
      throw error;
    }

    return reply.redirect('password_updated');
  }
  catch(error) {
    viewContext.errors = error
    viewContext.debug.errors = error
    return reply.view('water/update_password', viewContext);
  }
}



function getResetPassword(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - reset your password'
  return reply.view('water/reset_password', viewContext)
}



function getResetPasswordCheckEmail(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - reset your password - check your email'
  return reply.view('water/reset_password_check_email', viewContext)
}

function getResetPasswordResendEmail(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - reset your password - resend email'
  return reply.view('water/reset_password_resend_email', viewContext)
}

function getResetPasswordResentEmail(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - reset your password - resent email'
  return reply.view('water/reset_password_resent_email', viewContext)
}

function getResetPasswordLink(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - reset your password - get link'
  return reply.view('water/reset_password_get_link', viewContext)
}

async function getResetPasswordChangePassword(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - update your password'
  viewContext.resetGuid = request.query.resetGuid;

  try {

    // Check for valid reset GUID
    const user = await IDM.getUserByResetGuid(request.query.resetGuid);
    if(!user) {
      throw {name : 'UserNotFoundError'};
    }

    if (request.query.forced) {
      // show forced reset message
      viewContext.forced = true
    }

    return reply.view('water/reset_password_change_password', viewContext)
  }
  catch(error) {
    return reply.redirect('/reset_password?flash=resetLinkExpired');
  }
}


function getCreatePassword(request, reply) {
  request.query.create = true;
  getResetPasswordChangePassword(request, reply);
}

function postCreatePassword(request, reply) {
  request.query.create = true;
  postResetPasswordChangePassword(request, reply);
}





function validateEmailAddress(emailAddress) {
  // Regex taken from Stack Overflow, we may want to validate this properly at some point
  var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (emailAddress === "" || !emailRegex.test(emailAddress)) {
    return {
      invalidEmailAddress: true
    }
  }

  return null
}

function resetPasswordImpl(request, reply, redirect, title, errorRedirect) {
  var errors = validateEmailAddress(request.payload.email_address);
  if (!errors) {
    IDM.resetPassword(request.payload.email_address).then((res) => {
      return reply.redirect(redirect)
    }).catch((err) => {
      //Aways show OK
      return reply.redirect(redirect)
    })
  } else {
    var viewContext = View.contextDefaults(request)
    console.log(errors)
    viewContext.pageTitle = title
    viewContext.errors = errors
    viewContext.payload = request.payload
    return reply.view(errorRedirect, viewContext)
  }
}

function postResetPassword(request, reply) {
  resetPasswordImpl(request, reply, 'reset_password_check_email', 'GOV.UK - reset your password', 'water/reset_password')
}

function postResetPasswordResendEmail(request, reply) {
  resetPasswordImpl(request, reply, 'reset_password_resent_email', 'GOV.UK - reset your password - resend email', 'water/reset_password_resend_email')
}

function postResetPasswordLink(request, reply) {
  var errors = validateEmailAddress(request.payload.email_address);
  if (!errors) {
    IDM.getPasswordResetLink(request.payload.email_address).then((data) => {
      data = JSON.parse(data)
      if (data.err) {
        var viewContext = View.contextDefaults(request)
        viewContext.pageTitle = 'Debug page'
        viewContext.errors = {
          noPasswordResetRequest: true
        }
        viewContext.payload = request.payload
        return reply.view('water/reset_password_get_link', viewContext)
      } else {
        return reply.redirect('reset_password_change_password' + '?resetGuid=' + data.reset_guid)
      }
    }).catch((err) => {
      var viewContext = View.contextDefaults(request)
      viewContext.pageTitle = 'Debug page'
      viewContext.errors = {
        noPasswordResetRequest: true
      }
      return reply.view('water/reset_password_get_link', viewContext)
    })

  } else {
    var viewContext = View.contextDefaults(request)
    viewContext.pageTitle = 'Debug page'
    viewContext.errors = errors
    viewContext.payload = request.payload
    return reply.view('water/reset_password_get_link', viewContext)
  }
}


async function postResetPasswordChangePassword(request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - update your password';

  try {
      // Check submitted password
      const errors = validatePassword(request.payload.password, request.payload.confirmPassword);
      if(errors) {
        throw errors;
      }

      // Find user in IDM
      const user = await IDM.getUserByResetGuid(request.payload.resetGuid);
      if(!user) {
        throw {name : 'UserNotFoundError'};
      }
      console.log('user', user);

      // Update password in IDM
      const {error} = await IDM.updatePasswordWithGuid(request.payload.resetGuid, request.payload.password);
      if(error) {
        throw error;
      }

      // Log user in
      const session = await signIn.auto(request, user.user_name);

      reply.redirect('/licences');

  }
  catch(error) {
    console.log(error);
    // User not found
    if(error.statusCode === 404) {
      return reply.redirect('/signin');
    }
    viewContext.errors = error;
    viewContext.resetGuid = request.payload.resetGuid;
    return reply.view('water/reset_password_change_password', viewContext);
  }

}




function fourOhFour(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Not Found'
  return reply.view('water/404', viewContext).code(404)
}

function getFeedback(request, reply) {
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Tell us what you think about this service'
  return reply.view('water/feedback', viewContext)
}

function getUpdatedPassword(request,reply){
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Password Updated'
  return reply.view('water/updated_password', viewContext)
}

module.exports = {
  getRoot: getRoot,
  getUpdatePassword: getUpdatePassword,
  postUpdatePassword: postUpdatePassword,
  getResetPassword: getResetPassword,
  postResetPassword: postResetPassword,
  getResetPasswordCheckEmail: getResetPasswordCheckEmail,
  getResetPasswordResendEmail: getResetPasswordResendEmail,
  postResetPasswordResendEmail: postResetPasswordResendEmail,
  getResetPasswordResentEmail: getResetPasswordResentEmail,
  getResetPasswordLink: getResetPasswordLink,
  postResetPasswordLink: postResetPasswordLink,
  getResetPasswordChangePassword: getResetPasswordChangePassword,
  postResetPasswordChangePassword: postResetPasswordChangePassword,
  getCreatePassword,
  postCreatePassword,
  fourOhFour: fourOhFour,
  getFeedback:getFeedback,
  getUpdatedPassword:getUpdatedPassword
}
