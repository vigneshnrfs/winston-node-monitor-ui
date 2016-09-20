'use strict';


var util = require('util'),
  winston = require('winston'),
  io = require('socket.io-client');

var Logger = winston.transports.NodeMonitorUI = function ({level = 'info', port = 3001, host = 'localhost'}) {
  //
  // Name this logger
  //
  this.name = 'NodeMonitorUILogger';

  //
  // Set the level from your options
  //
  this.level = level;

  //
  // Configure your storage backing as you see fit
  //

  this.port = port;
  this.host = host;
  this._state = 'NOT_INITIALIZED';
  this.socket = undefined;
  this._queue = [];
  this._MAX_QUEUE_LENGTH = 1000;


  this.formatLog = function (level, msg, meta) {
    return {
      level: level,
      msg: msg,
      meta: meta,
      timestamp: new Date()
    };
  };

};

//
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//
util.inherits(Logger, winston.Transport);

Logger.prototype.log = function (level, msg, meta, callback) {
  //
  // Store this message and metadata, maybe use some custom logic
  // then callback indicating success.
  //
  console.log('--->', level, msg, meta);


  if (this._state === 'connected') this.socket.emit('logs', this.formatLog(level, msg, meta));
  else if (this._state === 'NOT_INITIALIZED') this._connect();
  else this._enqueue(this.formatLog(level, msg, meta));

  callback(null, true);
};

Logger.prototype._connect = function () {

  this._state = 'INITIALIZING';

  this.socket = io(`${this.host}:${this.port}`);

  this.socket.on('connect', ()=> {
    this._state = 'connected';
    this._flushQueue();
  });

  this.socket.on('reconnect_error', () => {
    this._state = 'error';
  });

  this.socket.on('connect_timeout', () => {
    this._state = 'error';
  });

  this.socket.on('reconnect', () => {
    this._state = 'connected';
    this._flushQueue();
  })

};

Logger.prototype._enqueue = function (data) {

  this._queue.push(data);
  if (this._queue.length > this._MAX_QUEUE_LENGTH) this._queue.shift();

};


Logger.prototype._flushQueue = function(){

  if(this._state === 'connected' && this._queue.length>0){
    while(this._queue.length > 0){
      this.socket.emit('logs',this._queue.shift());
    }
  }
};
