const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const reportQueue = require('../queues/reportQueue');

// Create Bull Board UI
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullAdapter(reportQueue)],
  serverAdapter: serverAdapter,
});

module.exports = serverAdapter.getRouter();



