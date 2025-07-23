'use strict';

/**
 * user-wallet router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::user-wallet.user-wallet', {
  config: {
    create: {
      auth: false,
    },
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
    update: {
      auth: false,
    },
    delete: {
      auth: false,
    },
  },
});