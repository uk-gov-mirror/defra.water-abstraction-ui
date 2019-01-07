'use strict';

const { find, set } = require('lodash');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const { expect } = require('code');

const { getMainNav } = require('../../../src/lib/view/main-nav.js');

const getAuthenticatedRequest = (isInternal = false) => {
  return {
    view: {
      activeNavLink: 'view'
    },
    state: {
      sid: '00000000-0000-0000-0000-000000000000'
    },
    permissions: {
      licences: {
        read: true,
        edit: false
      },
      admin: {
        defra: isInternal
      },
      returns: {
        edit: false,
        submit: false
      },
      ar: {
        read: false,
        edit: false,
        approve: false
      }
    }
  };
};

const getPrimaryUserRequest = () => {
  const request = getAuthenticatedRequest();
  set(request, 'permissions.licences.edit', true);
  set(request, 'permissions.returns.submit', true);
  return request;
};

const getARUserRequest = () => {
  const request = getAuthenticatedRequest(true);
  set(request, 'permissions.ar.read', true);
  set(request, 'permissions.ar.edit', true);
  return request;
};

const getARApproverRequest = () => {
  const request = getARUserRequest();
  set(request, 'permissions.ar.approve', true);
  return request;
};

const getReturnsRequest = () => {
  const request = getAuthenticatedRequest(true);
  set(request, 'permissions.returns.edit', true);
  return request;
};

const getIds = links => links.map(link => link.id);

lab.experiment('getMainNav', () => {
  lab.test('It should not display any links if the user is not authenticated', async () => {
    const request = {};
    const links = getMainNav(request);
    expect(links.length).to.equal(0);
  });

  lab.test('It should set the active nav link flag', async () => {
    const request = getPrimaryUserRequest();
    const links = getMainNav(request);
    const link = find(links, { id: 'view' });
    expect(link.active).to.equal(true);
  });

  lab.test('Non-active links should have the active flag set to false', async () => {
    const request = getPrimaryUserRequest();
    const links = getMainNav(request);
    const flags = links.filter(link => (link.id !== 'view')).map(link => link.active);
    expect(flags).to.equal([false, false]);
  });

  lab.test('It should display correct links for external user', async () => {
    const request = getAuthenticatedRequest();
    const ids = getIds(getMainNav(request));
    expect(ids).to.equal(['view']);
  });

  lab.test('It should display correct links for external primary', async () => {
    const request = getPrimaryUserRequest();
    const ids = getIds(getMainNav(request));
    expect(ids).to.equal(['view', 'returns', 'manage']);
  });

  lab.test('It should display correct links for internal user', async () => {
    const request = getAuthenticatedRequest(true);
    const ids = getIds(getMainNav(request));
    expect(ids).to.equal(['view', 'notifications']);
  });

  lab.test('It should display correct links for AR user', async () => {
    const request = getARUserRequest();
    const ids = getIds(getMainNav(request));
    expect(ids).to.equal(['view', 'ar', 'notifications']);
  });

  lab.test('It should display correct links for AR approver', async () => {
    const request = getARApproverRequest();
    const ids = getIds(getMainNav(request));
    expect(ids).to.equal(['view', 'ar', 'notifications']);
  });

  lab.test('It should display correct links for WIRS/returns user', async () => {
    const request = getReturnsRequest();
    const ids = getIds(getMainNav(request));
    expect(ids).to.equal(['view', 'notifications', 'returns']);
  });
});
