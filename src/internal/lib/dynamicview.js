const path = require('path');
const pathToTemplates = path.join(__dirname, '/../views/partials/jsPartials/');

require('fs').readdirSync(pathToTemplates).forEach(function (file) {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    var name = file.replace('.js', '');
    exports[name] = require(pathToTemplates + file);
  }
});
