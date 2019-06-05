/**
 * Contains functions to help with building a list of notifications that
 * can be sent by the current authenticated user
 */
const { isInternalReturns, isARApprover } = require('../../../lib/permissions');

/**
 * Create a simple notification object with name and URL path
 * @param {String} name
 * @param {String} path
 * @return {Object}
 */
const createNotificationType = (name, path, options = {}) => {
  const defaultOptions = {
    newWindow: false
  };
  return {
    name,
    path,
    options: Object.assign({}, defaultOptions, options)
  };
};

/**
 * Creates a notification list object given a row from the task config table
 * @param {Object} task - task config object
 * @return {Object} notification list object
 */
const createNotificationTypeFromTask = (task) => {
  const path = `/notifications/${task.task_config_id}?start=1`;
  const { name } = task.config;
  return createNotificationType(name, path);
};

/**
 * Gets a list of notifications that can be sent by the current user,
 * each with a name and URL path
 * @param {Array} tasks - tasks list retrieved from water service
 * @param {Object} permissions - permissions object for the current user
 * @return {Array} an array of notifications that can be sent
 */
const getNotificationsList = (tasks, request) => {
  const notifications = tasks.map(createNotificationTypeFromTask);

  if (isInternalReturns(request)) {
    notifications.push(createNotificationType('Returns: send invitations', '/returns-notifications/invitations'));
    notifications.push(createNotificationType('Returns: send paper forms', '/returns-notifications/forms'));
    notifications.push(createNotificationType('Returns: send reminders', '/returns-notifications/reminders'));
    notifications.push(createNotificationType('Returns: send final reminder', '/returns-notifications/final-reminder'));
  }

  return notifications;
};

/**
 * Gets a list of reports for the current user
 * @param {Object} permissions - permissions object for the current user
 * @return {Array}               array of reports the current user can view
 */
const getReportsList = (request) => {
  const reports = [
    createNotificationType('Notifications report', '/notifications/report'),
    createNotificationType('View service performance (opens in a new tab)', 'https://datastudio.google.com/embed/u/0/reporting/1EP0W_SJN-cEHSwNX1omO4wvWnMiMvcLt/page/lY4N', { newWindow: true })
  ];

  if (isARApprover(request)) {
    reports.push(createNotificationType('Abstraction reform report', '/digitise/report'));
  }

  if (isInternalReturns(request)) {
    reports.push(createNotificationType('Returns overview', '/returns-reports'));
  }

  return reports;
};

module.exports = {
  getNotificationsList,
  getReportsList
};
