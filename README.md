# winston-node-monitor-ui
Winston log transport for [node-monitor-ui](https://www.npmjs.com/package/node-monitor-ui). Allows you to stream the logs to the dashboard. 

## Installation

```sh
npm install winston-node-monitor-ui --save
```
## Usage
```
var winston = require('winston');
require('winston-node-monitor-ui');
winston.add(winston.transports.NodeMonitorUI, {
    port: 3001,
    level: 'info'
    });
```
- **port** is the http port on which the ui interface will be served. Defaults to 3001.
- **level** is the log level for winston.

    _Note:_ There is an optional config field **host** which defaults to _'localhost'_. This is present for future versions when node-monitor-ui supports cluster/multiple node processess. 
