const info = require('../package.json');
const conf = require('../config');

exports.register = function (server, options, next) {

  const mapper = function (request, callback) {

    const proto = conf.get('/app/upstream/proto');
    const domain = conf.get('/app/upstream/domain');
    const username = conf.get('/app/upstream/auth/username');
    const password = conf.get('/app/upstream/auth/password');
    const basic = 'Basic ' + (new Buffer(username + ':' + password, 'utf8')).toString('base64');

    callback(null, `${proto}://${domain}${request.url.path}`, { authorization: basic });
  };


  server.route({
    method: '*',                            // all methods
    path: '/{path*}',                       // all routes prefixed with `/`
    config: { auth: 'session' },
    handler: {
      proxy: {
        passThrough: true,                  // forwards the headers sent from the client to the upstream service
        xforward: true,                     // sets the 'X-Forwarded-For', 'X-Forwarded-Port', 'X-Forwarded-Proto' headers
        timeout: conf.get('/http/timeout'), // number of milliseconds before aborting the upstream request
        mapUri: mapper
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: 'proxy',
  version: info.version,
  multiple: true
};
