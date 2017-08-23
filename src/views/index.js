const handlebars = require('handlebars')


console.log('working dir for views')
console.log(__dirname)

const Helpers = require('../lib/helpers')
const DynamicView = require('../lib/dynamicview')

handlebars.registerHelper('equal', require('handlebars-helper-equal'))

handlebars.registerHelper('concat', function () {
  var arg = Array.prototype.slice.call(arguments, 0)
  arg.pop()
  return arg.join('')
})

handlebars.registerHelper('dynamicView', function () {
  /**
  The dynamicView helper loads javascript renderers from the views/partials/jsPartials directory
  **/
  var args = Array.prototype.slice.call(arguments, 0).pop()
  var requestedFunction=args.hash.viewType
  if (DynamicView[requestedFunction]){
  return `${DynamicView[requestedFunction].getContent(args)}`
} else {
  return `Error: Unknown component: ${requestedFunction}`
}

})

handlebars.registerHelper('stringify', function (variable) {
  var arg = JSON.stringify(variable)
  return arg
})

handlebars.registerHelper('parse', function (variable) {
  try {
    var arg = JSON.parse(variable)
  } catch (e) {
    return variable
  }

  return arg
})
handlebars.registerHelper('showhide', function () {
  var arg = Array.prototype.slice.call(arguments, 0)
  arg.pop()
  var htmlContent = ''
  htmlContent += ''
  htmlContent += '<details>'
  htmlContent += '<summary><span class="summary" tabindex="0">' + arg[0] + '</span></summary>'
  htmlContent += '<div class="panel panel-border-narrow">'
  htmlContent += '<h3 class="heading-small">' + arg[1] + '</h3>'
  htmlContent += arg[2]
  htmlContent += '</div>'
  htmlContent += '</details>'
  return htmlContent
})

handlebars.registerHelper('guid', function () {
  return Helpers.createGUID()
})

const Path = require('path')

const defaultContext = {
  assetPath: '/public/',
  topOfPage: 'Login Handler',
  head: '<link href="public/stylesheets/overrides.css" media="screen" rel="stylesheet" />',
  pageTitle: ' Generic Page',
  htmlLang: 'en',
  bodyClasses: 'some classes here',
  bodyStart: 'Body Start',
  skipLinkMessage: 'Skip to main content',
  cookieMessage: 'Cookie Message',
  headerClass: 'some classes here',
  homepageUrl: 'http://page/url',
  logoLinkTitle: 'Logo Link Title',
  globalHeaderText: 'GOV.UK',
  insideHeader: '',

  propositionHeader: '<div class="header-proposition"><div class="content"><nav id="proposition-menu"><a href="/" id="proposition-name">Water resource licensing service</a></nav></div></div>',
  afterHeader: '',
  footerTop: '',
  footerSupportLinks: '<ul><li><a href="/">Clear data</a></ul>',
  licenceMessage: '<p>All content is available under the <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Open Government Licence v3.0</a>, except where otherwise stated</p>',
  bodyEnd: ''
}
module.exports = {
  engines: {
    html: handlebars
  },
  relativeTo: __dirname,
  path: Path.join(__dirname, ''),
  layoutPath: Path.join(__dirname, 'govuk_template_mustache/layouts'),
  layout: 'govuk_template',
  partialsPath: Path.join(__dirname, 'partials/'),
  context: defaultContext
}
