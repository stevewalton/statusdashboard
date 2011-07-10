var os = require('os');
var fs = require('fs');
var path = require("path");
var logger = require('util');

exports.create = function() {
  var settings = {};

  var defaults = {
    title: 'Services Status Dashboard',
    hostname: '127.0.0.1',
    port: 8080,
    services: [],
    serviceInterval: 20000,
    serviceDelay: 500
  };

  settings['olivier'] = {
    port: 8080,
    services: [{
      name: 'couchdb', 
      label: 'Couchdb server @ local',
      check: 'http',
      host: '127.0.0.1', 
      port: '5984',
      path: '/'
    }, {
      name: 'bazoud.free.fr', 
      label: 'Olivier Bazoud blog: Index',
      check: 'http',
      host: 'bazoud.free.fr', 
      port: '80',
      path: '/'
    }, {
      name: 'bazoud.free.fr (Normal)',
      label: 'Olivier Bazoud blog: Normal',
      check: 'http',
      host: 'bazoud.free.fr',
      port: '80',
      path: '/test.php'
    }, {
      name: 'bazoud.free.fr (FixedValue: ok)',
      label: 'Olivier Bazoud blog: FixedValue ok',
      check: 'http',
      host: 'bazoud.free.fr',
      port: '80',
      path: '/test_ok.php',
      checkFixedValueResponse: {
        'ok': 'up',
        'ko': 'critical'
      }
    }, {
      name: 'bazoud.free.fr php (FixedValue: ko)',
      label: 'Olivier Bazoud blog: FixedValue: ko',
      check: 'http',
      host: 'bazoud.free.fr',
      port: '80',
      path: '/test_ko.php',
      checkFixedValueResponse: {
        'ok': 'up',
        'ko': 'critical'
      }
    }, {
      name: 'bazoud.free.fr php (RangeValues: 10)',
      label: 'Olivier Bazoud blog: RangeValues 10',
      check: 'http',
      host: 'bazoud.free.fr',
      port: '80',
      path: '/test10.php',
      checkRangeValuesResponse: [
        { 'status': 'up', 'min': 0, 'max': 10 },
        { 'status': 'critical', 'min': 10 }
      ]
    }, {
      name: 'redis', 
      label: 'Redis server @ local',
      check: 'tcp',
      host: '127.0.0.1', 
      port: '6379',
      cmd: 'PING\r\n',
      rcv: '+PONG\r\n'
    }, {
      name: 'FTP Local',
      label: 'Ftp @ local',
      check: 'ftp',
      host: 'localhost',
      port: '21',
      username: 'statusdashboard',
      password: 'statusdashboard'
    }, {
      name: 'PID file',
      label: 'Pid @ local',
      check: 'pidfile',
      pidfile: '/tmp/terminal.pid'
    }],
    serviceInterval: 5000,
    plugins : {
      irc : {
        enable: false,
        server: 'irc.freenode.net',
        nick: 'status',
        options: {
          debug: false,
          port: 8001,
          channels: ['#statusdashboard']
        }
      },
      twitter: {
        enable: false,
        consumer_key: "",
        consumer_secret: "",
        access_token_key: "",
        access_token_secret: ""
      },
      history: {
        enable: false,
        host: "127.0.0.1",
        port: 6379,
        namespace: "statusdashboard",
        options: {
        }
      }
    }
  };

  settings['nodester'] = {
    port: 10487,
    services: [{
      name: 'bazoud.free.fr', 
      label: 'Olivier Bazoud blog',
      check: 'http',
      host: 'bazoud.free.fr', 
      port: '80',
      path: '/',
      headers: {
        'Host': 'bazoud.free.fr'
      }
    }, {
      name: 'bazoud.free.fr', 
      label: 'Olivier Bazoud blog fail',
      check: 'http',
      host: 'bazoud.free.fr', 
      port: '80',
      path: '/test.php'
    }]
  };

  var mySettings = defaults;

  // logger.log("Dumping:\r\n" + JSON.stringify(mySettings));

  if (process.env.APP_ENV) {
    logger.log("Loading " + process.env.APP_ENV + " settings.");
    mySettings = merge(mySettings, settings[process.env.APP_ENV]);
  }

  // logger.log("Dumping:\r\n" + JSON.stringify(mySettings));

  if (process.env.APP_SETTINGS) {
    logger.log("Loading " + process.env.APP_SETTINGS + " configuration.");
    if (path.existsSync(process.env.APP_SETTINGS)) {
      eval(fs.readFileSync(process.env.APP_SETTINGS, encoding="UTF-8"));
      mySettings = merge(mySettings, appSettings);
    } else {
      logger.log("WARN: " + process.env.APP_SETTINGS + " does not exist or not a file.");
    }
  }

  // logger.log("Dumping:\r\n" + JSON.stringify(mySettings));

  return mySettings;
};

function merge(obj1, obj2) {
  for (var p in obj2) {
    try {
      if (typeof(obj2[p]) == 'object') {
        if (obj2[p].constructor == Array) {
          for (var i in obj1[p]) {
            for (var j in obj2[p]) {
              if (obj1[p][i].name == obj2[p][j].name) {
                obj1[p][i] = merge(obj1[p][i], obj2[p][j]);
              }
            }
          }
        } else {
          obj1[p] = merge(obj1[p], obj2[p]);
        }
      } else {
        obj1[p] = obj2[p];
      }
    } catch(e) {
      obj1[p] = obj2[p];
    }
  }
  return obj1;
}

