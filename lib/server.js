const Hapi = require('hapi');
const Boom = require('boom');
const conf = require('../config');

const server = new Hapi.Server({ load: conf.get('/server/load') });
const plugins = [require('../plugins/enforce-ssl'), require('bell'), require('hapi-auth-cookie')];
const port = conf.get('/server/port');
server.connection({ port: port });

server.register(plugins, function (/*err*/) {

  server.auth.strategy('google', 'bell', {
      provider: 'google',
      password: conf.get('/auth/session/password'),
      isSecure: conf.get('/auth/bell/google/isSecure'),
      forceHttps: conf.get('/auth/bell/google/isSecure'),
      // You'll need to go to https://console.developers.google.com and set up an application to get started
      // Once you create your app, fill out "APIs & auth >> Consent screen" and make sure to set the email field
      // Next, go to "APIs & auth >> Credentials and Create new Client ID
      // Select "web application" and set "AUTHORIZED JAVASCRIPT ORIGINS" and "AUTHORIZED REDIRECT URIS"
      // This will net you the clientId and the clientSecret needed.
      // Also be sure to pass the redirect_uri as well. It must be in the list of "AUTHORIZED REDIRECT URIS"
      clientId: conf.get('/auth/bell/google/clientId'),
      clientSecret: conf.get('/auth/bell/google/clientSecret')
  });

  server.auth.strategy('session', 'cookie', {
    password: conf.get('/auth/session/password'),
    cookie: conf.get('/auth/session/cookie'),
    redirectTo: '/bell/google',
    redirectOnTry: false,
    isSecure: conf.get('/auth/session/isSecure')
  });

  // Google Auth Callback
  const restrictedDomain = conf.get('/app/restrictedDomain');
  const restrictedDomainRegexp = new RegExp(`.+@${restrictedDomain}$`, 'i');

  server.route({
    method: 'GET',
    path: '/bell/google',
    config: {
      auth: 'google',
      handler: function (request, reply) {

        const email = request.auth.credentials.profile.email;
        const isPermitted = !!(email.match(restrictedDomainRegexp));

        request.auth.session.clear();

        if (!isPermitted) {
          return reply(Boom.unauthorized(`Our apologies, but this page is restricted to ${restrictedDomain} members only.`));
        } else {
          request.auth.session.set({ email: email });
          return reply.redirect('/');
        }
      }
    }
  });

  // Static Files
  server.route({
    method: 'GET',
    path: '/{param*}',
    config: {
      auth: 'session',
      handler: {
        directory: {
          path: 'public',
          listing: true
        }
      }
    }
  });
});

module.exports = server;
