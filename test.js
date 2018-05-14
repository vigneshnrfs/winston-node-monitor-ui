'use strict';

var winston = require('winston');
var expect = require('chai').expect;
require('./');

describe('winston-node-monitor-ui', () => {
  var logger;
  var io;

  before(() => {
    logger = new winston.Logger();
    io = require('socket.io')(3001);
  });

  after((done) => {
    io.close(done);
  });

  it('NodeMonitorUI', (done) => {
    const actual = [];
    const expected = [
      {
        level: 'info',
        meta: {
          foo: 'quu'
        },
        msg: 'foo'
      },
      {
        level: 'info',
        meta: {
          baz: 'qxx'
        },
        msg: 'bar'
      }
    ];

    io.on('connection', (socket) => {
      socket.on('logs', (log) => actual.push({level: log.level, meta: log.meta, msg: log.msg}));
      socket.on('disconnect', () => {
        expect(actual).to.deep.equal(expected);
        done();
      });
    });

    logger.add(winston.transports.NodeMonitorUI);

    logger.info('foo', {foo: 'quu'});
    logger.debug('skip');

    setTimeout(() => {
      logger.info('bar', {baz: 'qxx'});
      logger.remove(logger.transports.NodeMonitorUI);
    }, 500);
  });
});
