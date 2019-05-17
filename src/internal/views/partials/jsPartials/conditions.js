function getContent () {
  var code = arguments[0].hash.viewData.code;
  var subCode = arguments[0].hash.viewData.subCode;
  var attributes = arguments[0].hash.viewData;
  var response;

  switch (code) {
    case 'CES':
      switch (subCode) {
        case 'FLOW':
          response = `<div class="sourceofsupplyq">CES FLOW:</div>`;
          response += `<div class="licenceAnswer">`;
          if (attributes.parameter1) {
            response += `Param1: ${attributes.parameter1}<br>`;
          }
          if (attributes.parameter2) {
            response += `Param2: ${attributes.parameter2}<br>`;
          }
          if (attributes.text) {
            response += `${attributes.text}<br>`;
          }
          response += `</div>`;
          break;
        default:
          response = `<div class="sourceofsupplyq">CES ${subCode}:</div>`;
          response += `<div class="licenceAnswer">`;
          if (attributes.parameter1) {
            response += `Param1: ${attributes.parameter1}<br>`;
          }
          if (attributes.parameter2) {
            response += `Param2: ${attributes.parameter2}<br>`;
          }
          if (attributes.text) {
            response += `${attributes.text}<br>`;
          }
          response += `</div>`;
      }
      break;
    default:
      if (!code) {
        response = '<div class="sourceofsupplyq">None</div><div class="licenceAnswer">No conditions defined</div>';
      } else {
        response = `<div class="sourceofsupplyq">${code} ${subCode}:</div>`;
        response += `<div class="licenceAnswer">`;
        if (attributes.parameter1) {
          response += `Param1: ${attributes.parameter1}<br>`;
        }
        if (attributes.parameter2) {
          response += `Param2: ${attributes.parameter2}<br>`;
        }
        if (attributes.text) {
          response += `${attributes.text}<br>`;
        }
        response += `</div>`;
      }
  }
  response += `<p></p>`;
  return response;
}

module.exports = {
  getContent
};
