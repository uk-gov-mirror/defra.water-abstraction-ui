'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const { expect } = require('code');

const {
  date
} = require('../../../../../src/internal/lib/view-engine/filters/date');

lab.experiment('date Nunjucks filter', () => {
  lab.test('The default date format should be the GDS standard', async () => {
    const result = date('2018-12-14');
    expect(result).to.equal('14 December 2018');
  });

  lab.test('It should be possible to set a different date format', async () => {
    const result = date('2018-12-14', 'YY MM DD');
    expect(result).to.equal('18 12 14');
  });

  lab.test('It should accept a timestamp in ms', async () => {
    const result = date(1544779408000);
    expect(result).to.equal('14 December 2018');
  });

  lab.test('It should return null if an invalid date is supplied', async () => {
    const result = date('Some nonsense in here');
    expect(result).to.equal(null);
  });
});
