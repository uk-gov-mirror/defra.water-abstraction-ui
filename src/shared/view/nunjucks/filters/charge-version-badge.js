'use strict';

const titleCase = require('title-case');

const styles = {
  draft: 'void',
  approved: 'success',
  replaced: 'inactive',
  superseded: 'inactive',
  invalid: 'error',
  review: 'warning'
};

//  Map the backend statuses to the desired front-end labels from acceptance criteria.
//  Statuses are: 'Draft', 'Review', 'Approved', 'Replaced' - We will also keep invalid to accomodate errors and edge cases. TT 2020-08-28
const displayedTextTransformer = {
  current: 'approved',
  draft: 'draft',
  approved: 'approved',
  replaced: 'replaced',
  superseded: 'replaced',
  invalid: 'invalid',
  review: 'review'
};

/**
 * Gets badge object to render for charge version status
 */
const chargeVersionBadge = (chargeVersion, isLarge = false) => {
  const { status } = chargeVersion;
  let displayedLabel = displayedTextTransformer[status.toLowerCase()];
  return {
    text: titleCase(displayedLabel),
    status: styles[displayedLabel],
    ...isLarge && { size: 'large' }
  };
};

exports.chargeVersionBadge = chargeVersionBadge;
