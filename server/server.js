'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var cfenv = require('cfenv');

//var vcap_services = JSON.parse(process.env.VCAP_SERVICES)
//var hostname = vcap_services.cleardb[0].credentials.hostname
//var port = vcap_services.cleardb[0].credentials.port
//var username = vcap_services.cleardb[0].credentials.username
//var password = vcap_services.cleardb[0].credentials.password

// get datasource service configuration from CF
var appEnv = cfenv.getAppEnv();
var appService = appEnv.getService('training-db-service');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  //return app.listen(function() {
  return app.listen(appEnv.port, appEnv.bind, function() {
    app.emit('started');

    //var baseUrl = app.get('url').replace(/\/$/, '');
    //console.log('Web server listening at: %s', baseUrl);
    console.log('Web server listening at: %s', appEnv.url);

    if (appService != undefined) {
      var dsConfig = {
        "name": "pivotal",
        "connector": "mysql",  
        "host": appService.credentials.hostname,
        "port": appService.credentials.port,
        "database": appService.credentials.name,
        "username": appService.credentials.username,
        "password": appService.credentials.password
      }

      console.log('dsConfig: ', dsConfig);
      app.dataSource('pivotal', dsConfig);
    }

    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

/*var dsConfig = {
    "name": "pivotal",
    "connector": "mysql",  
    "host": '127.0.0.1',
    "port": 3306,
    "database": 'pivotal',
    "username": 'root',
    "password": 'xxx'
  }
console.log('dsConfig: ', dsConfig);
app.dataSource('pivotal', dsConfig);*/

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});