// Los servicios ya están exportados como instancias singleton
const stripeService = require('./stripeService');
const stripeWebhookService = require('./stripeWebhookService');
const appleReceiptService = require('./appleReceiptService');

module.exports = {
  stripeService,
  stripeWebhookService,
  appleReceiptService
};
