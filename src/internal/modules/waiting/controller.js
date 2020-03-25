'use strict';

const services = require('../../lib/connectors/services');
const { throwIfError } = require('@envage/hapi-pg-rest-api');
const { get } = require('lodash');
const Boom = require('@hapi/boom');
const moment = require('moment');
const { logger } = require('../../logger');
const path = require('path');

const getRedirectPath = (eventStatuses, ev) => {
  if (ev.status in eventStatuses) {
    return path.join(eventStatuses[ev.status], ev.event_id || ev.id);
  }
};

const getBillingTitle = (event, regions) => {
  const regionName = getRegionName(regions, event.metadata.batch.region_id);
  const subType = event.subtype === 'two_part_tariff' ? 'two-part tariff' : event.subtype;
  return `${regionName} ${subType} bill run`;
};

const getWaitingForBilling = async (request, h, event) => {
  const statusPaths = {
    complete: `/billing/batch/${event.metadata.batch.billing_batch_id}/summary?back=${request.query.back}`
  };

  if (statusPaths[event.status]) {
    return h.redirect(statusPaths[event.status]);
  }

  const { data: regions } = await services.water.regions.getRegions();

  const view = {
    ...request.view,
    pageTitle: getBillingTitle(event, regions),
    caption: moment(event.date_created).format('D MMM YYYY'),
    waitingType: 'billRun'
  };

  return h.view('nunjucks/waiting/index', view);
};

const getWaitingForNotifications = async (request, h, event) => {
  const path = getRedirectPath(
    { processed: '/batch-notifications/review' },
    event
  );

  if (path) {
    return h.redirect(path);
  }

  const view = {
    ...request.view,
    pageTitle: getNotificationsTitle(event),
    text: 'Please wait while the mailing list is assembled. This may take a few minutes. The letters will not be sent yet.',
    waitingType: 'returns'
  };

  return h.view('nunjucks/waiting/index', view);
};

const getNotificationsTitle = (ev) => {
  const name = get(ev, 'subtype');
  const config = {
    returnReminder: 'Send returns reminders',
    returnInvitation: 'Send returns invitations'
  };
  return config[name];
};

const getRegionName = (regions, regionId) => {
  const region = regions.find(region => region.regionId === regionId);
  return region.displayName;
};

const handlers = {
  notification: getWaitingForNotifications,
  'billing-batch': getWaitingForBilling
};

const getWaiting = async (request, h) => {
  const { eventId } = request.params;
  const { data: event, error } = await services.water.events.findOne(eventId);

  if (error) {
    const message = 'Unknown event type';
    logger.error(message, error, { params: event });
    throw new Error('Unknown event type');
  }
  throwIfError(error);

  if (event.status === 'error') {
    throw Boom.badImplementation('Errored event.');
  }

  return handlers[event.type](request, h, event);
};

exports.getWaiting = getWaiting;
